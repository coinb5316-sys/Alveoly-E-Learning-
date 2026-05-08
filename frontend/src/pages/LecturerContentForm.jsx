// LecturerContentForm.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import {
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  FileText,
  Clock,
  Target,
  Lock,
  Eye,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from "lucide-react";

const LecturerContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultType = queryParams.get("type") || "lesson";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    type: defaultType,
    description: "",
    courseId: "",
    subjectId: "",
    content: "",
    questions: [],
    timerMinutes: 0,
    passMark: 70,
    maxAttempts: 1,
    isLocked: false,
    orderIndex: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourses();
    if (id) fetchContent();
  }, [id]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Fetch courses error:", err);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/lecturer/content/${id}`);
      if (res.data.success) {
        setFormData(res.data.content);
      }
    } catch (err) {
      console.error("Fetch content error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (courseId) => {
    if (!courseId) return;
    try {
      const res = await axios.get(`/api/subjects?courseId=${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Fetch subjects error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value
    }));
    if (name === "courseId") {
      setFormData(prev => ({ ...prev, subjectId: "" }));
      fetchSubjects(value);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          points: 1,
          rationale: "",
          type: "multiple-choice"
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.courseId) newErrors.courseId = "Course is required";
    if (!formData.subjectId) newErrors.subjectId = "Subject is required";
    
    if (formData.type !== "lesson" && formData.questions.length === 0) {
      newErrors.questions = "At least one question is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      if (id) {
        await axios.put(`/api/lecturer/content/${id}`, formData);
      } else {
        await axios.post("/api/lecturer/content", formData);
      }
      navigate("/lecturer/content");
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {id ? "Edit Content" : `Create New ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in the details below to create engaging content for your students
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/lecturer/content")}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Content"}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter content title"
              className={`w-full px-4 py-2 rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe what students will learn"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.courseId ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.subjectId ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Settings */}
      {formData.type !== "lesson" && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Assessment Settings</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="inline h-3 w-3 mr-1" />
                Timer (minutes)
              </label>
              <input
                type="number"
                name="timerMinutes"
                value={formData.timerMinutes}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">0 = No time limit</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Target className="inline h-3 w-3 mr-1" />
                Pass Mark (%)
              </label>
              <input
                type="number"
                name="passMark"
                value={formData.passMark}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Attempts
              </label>
              <input
                type="number"
                name="maxAttempts"
                value={formData.maxAttempts}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Questions Section */}
      {formData.type !== "lesson" && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add Question
            </button>
          </div>
          {errors.questions && <p className="text-xs text-red-500 mb-4">{errors.questions}</p>}
          
          <div className="space-y-6">
            {formData.questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Question {qIndex + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                    placeholder="Enter your question"
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Options</label>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <span className="w-6 text-sm font-medium text-gray-500">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Correct Answer
                      </label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(qIndex, "correctAnswer", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <option value="">Select correct answer</option>
                        {question.options.map((_, optIndex) => (
                          <option key={optIndex} value={String.fromCharCode(65 + optIndex)}>
                            {String.fromCharCode(65 + optIndex)} - {question.options[optIndex] || `Option ${String.fromCharCode(65 + optIndex)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(qIndex, "points", parseInt(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Rationale/Explanation (Optional)
                    </label>
                    <textarea
                      value={question.rationale}
                      onChange={(e) => handleQuestionChange(qIndex, "rationale", e.target.value)}
                      placeholder="Explain why this answer is correct"
                      rows="2"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {formData.questions.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No questions added yet</p>
              <button
                type="button"
                onClick={addQuestion}
                className="text-blue-600 text-sm mt-2"
              >
                Add your first question
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lesson Content */}
      {formData.type === "lesson" && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Lesson Content</h2>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="15"
            placeholder="Write your lesson content here. You can use HTML for formatting..."
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-sm"
          />
        </div>
      )}
    </form>
  );
};

export default LecturerContentForm;