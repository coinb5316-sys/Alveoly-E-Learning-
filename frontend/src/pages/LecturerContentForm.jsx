// LecturerContentForm.jsx - COMPLETE FIXED VERSION with Program support
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  Video,
  Image,
  File,
  X,
  Upload,
  DollarSign,
  Clock,
  Loader2,
  Eye,
  Save,
  BookOpen,
  GraduationCap,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  ArrowLeft,
  Building
} from "lucide-react";

// Quiz Editor Component (Keep as is - it's working)
const QuizEditor = ({ content, onClose, onSave, refreshContents }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(content?.quizTimerMinutes || 0);
  const [passMark, setPassMark] = useState(content?.quizPassMark || 70);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    rationale: "",
    points: 1,
  });

  useEffect(() => {
    if (content?._id) {
      fetchExistingQuestions();
    }
  }, [content]);

  const fetchExistingQuestions = async () => {
    try {
      const res = await axios.get(`/lesson-quiz/lesson/${content._id}`);
      if (res.data && res.data.length) {
        setQuestions(res.data);
        if (res.data[0]?.timerMinutes) {
          setTimerMinutes(res.data[0].timerMinutes);
        }
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to fetch existing questions");
    }
  };

  const resetForm = () => {
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      rationale: "",
      points: 1,
    });
    setEditingIndex(null);
  };

  const handleEditQuestion = (index) => {
    const questionToEdit = questions[index];
    setCurrentQuestion({
      question: questionToEdit.question,
      options: [...questionToEdit.options],
      correctAnswer: questionToEdit.correctAnswer,
      rationale: questionToEdit.rationale || "",
      points: questionToEdit.points || 1,
    });
    setEditingIndex(index);
    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const addOrUpdateQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast.error("Please fill all options");
      return;
    }
    if (!currentQuestion.correctAnswer) {
      toast.error("Please select correct answer");
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = {
        ...updatedQuestions[editingIndex],
        question: currentQuestion.question,
        options: [...currentQuestion.options],
        correctAnswer: currentQuestion.correctAnswer,
        rationale: currentQuestion.rationale,
        points: currentQuestion.points,
      };
      setQuestions(updatedQuestions);
      toast.success("Question updated successfully!");
    } else {
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
      toast.success("Question added successfully!");
    }
    
    resetForm();
  };

  const removeQuestion = (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((_, i) => i !== index));
      if (editingIndex === index) {
        resetForm();
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
      toast.success("Question deleted");
    }
  };

  const saveQuiz = async () => {
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setLoading(true);
    try {
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale || "",
        points: q.points || 1,
      }));

      await axios.put(`/content/${content._id}`, {
        title: content.title,
        quizTimerMinutes: timerMinutes,
        quizPassMark: passMark,
      });

      await axios.post("/lesson-quiz/save", {
        lessonId: content._id,
        questions: formattedQuestions,
        timerMinutes: timerMinutes,
      });

      toast.success(`✅ Saved ${questions.length} questions for "${content.title}"!`);
      onSave?.();
      if (refreshContents) refreshContents();
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quiz Editor: {content?.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {questions.length} question(s) | Total Points: {totalPoints}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quiz Settings */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Quiz Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timer (minutes)
                </label>
                <select
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="0">No timer</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pass Mark (%)
                </label>
                <input
                  type="number"
                  value={passMark}
                  onChange={(e) => setPassMark(Math.min(100, Math.max(0, parseInt(e.target.value) || 70)))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Question Form */}
          <div id="question-form" className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              {editingIndex !== null ? <Edit className="h-5 w-5 text-yellow-500" /> : <Plus className="h-5 w-5 text-blue-500" />}
              {editingIndex !== null ? "Edit Question" : "Add New Question"}
            </h3>
            
            <textarea
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              placeholder="Enter your question here..."
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none mb-3"
            />

            <div className="space-y-2 mb-3">
              {currentQuestion.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="flex-shrink-0 w-10 h-11 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold text-gray-600 dark:text-gray-400">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...currentQuestion.options];
                      newOpts[idx] = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, options: newOpts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <select
                value={currentQuestion.correctAnswer}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Correct Answer</option>
                {currentQuestion.options.map((_, idx) => (
                  <option key={idx} value={String.fromCharCode(65 + idx)}>
                    {String.fromCharCode(65 + idx)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                placeholder="Points"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                min="1"
              />
            </div>

            <textarea
              value={currentQuestion.rationale}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, rationale: e.target.value })}
              placeholder="Rationale (explanation for correct answer)"
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none mb-3"
            />

            <div className="flex gap-3">
              <button
                onClick={addOrUpdateQuestion}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  editingIndex !== null 
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700" 
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                } text-white shadow-lg`}
              >
                {editingIndex !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingIndex !== null ? "Update Question" : "Add Question"}
              </button>
              
              {editingIndex !== null && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Questions List</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Points: {totalPoints}</span>
            </div>
            
            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No questions added yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first question above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{idx + 1}.</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{q.question}</span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                            {q.points || 1} pt{(q.points || 1) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {q.options.map((opt, i) => (
                            <p key={i} className={`text-sm ${String.fromCharCode(65 + i) === q.correctAnswer ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-600 dark:text-gray-400"}`}>
                              {String.fromCharCode(65 + i)}. {opt}
                              {String.fromCharCode(65 + i) === q.correctAnswer && " ✓"}
                            </p>
                          ))}
                        </div>
                        {q.rationale && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-6 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                            💡 {q.rationale}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditQuestion(idx)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeQuestion(idx)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all">
            Cancel
          </button>
          <button
            onClick={saveQuiz}
            disabled={loading || questions.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Saving..." : `Save Quiz (${questions.length} questions)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main LecturerContentForm Component - FIXED with Program support
const LecturerContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [user, setUser] = useState(null);
  const [contentData, setContentData] = useState(null);

  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
  });

  const [form, setForm] = useState({
    title: "",
    type: "video",
    linkType: "subject",
    programId: "",
    courseId: "",
    subjectId: "",
    isPaid: false,
    price: "",
    thumbnail: null,
  });

  // Get current user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch courses and subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, coursesRes, subjectsRes] = await Promise.all([
          axios.get("/programs"),
          axios.get("/courses"),
          axios.get("/subjects"),
        ]);
        setPrograms(programsRes.data);
        setCourses(coursesRes.data);
        setSubjects(subjectsRes.data);
        
        // Get lecturer's assigned subjects
        if (user && user.role === "lecturer" && user.lecturerInfo?.assignedSubjects) {
          const assigned = subjectsRes.data.filter(subject => 
            user.lecturerInfo.assignedSubjects.includes(subject._id)
          );
          setAssignedSubjects(assigned);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to fetch courses and subjects");
      }
    };
    fetchData();
  }, [user]);

  // Fetch content for editing
  useEffect(() => {
    if (isEditing && id) {
      fetchContentForEdit();
    }
  }, [id, isEditing]);

  const fetchContentForEdit = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`/content/${id}`);
      const content = res.data;
      setContentData(content);
      
      setForm({
        title: content.title,
        type: content.type,
        linkType: content.subjectId ? "subject" : "course",
        programId: content.courseId?.programId?._id || content.courseId?.programId || "",
        courseId: content.courseId?._id || content.courseId || "",
        subjectId: content.subjectId?._id || content.subjectId || "",
        isPaid: content.isPaid,
        price: content.price || "",
        thumbnail: null,
      });
      
      // Load filtered courses for the program
      if (content.courseId?.programId) {
        const programId = content.courseId.programId._id || content.courseId.programId;
        await handleProgramChange(programId);
      }
      
      if (content.type === "quiz") {
        setSelectedLesson(content);
      }
      
    } catch (err) {
      console.error("Error fetching content:", err);
      toast.error("Failed to load content for editing");
      navigate("/lecturer/content");
    } finally {
      setFetching(false);
    }
  };

  // Handle program change - fetch courses for selected program
  const handleProgramChange = async (programId) => {
    setForm(prev => ({ ...prev, programId, courseId: "", subjectId: "" }));
    if (programId) {
      try {
        const res = await axios.get(`/courses/program/${programId}`);
        setFilteredCourses(res.data || []);
      } catch (err) {
        console.error("Error fetching courses by program:", err);
        setFilteredCourses([]);
      }
    } else {
      setFilteredCourses([]);
    }
  };

  // Handle course change - update available subjects
  const handleCourseChange = async (courseId) => {
    setForm(prev => ({ ...prev, courseId, subjectId: "" }));
    // Refresh subjects list based on selected course
    try {
      const res = await axios.get(`/subjects?course=${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects for course:", err);
    }
  };

  const handleUpload = async () => {
    if (!form.title) {
      toast.error("Please enter a title");
      return;
    }

    if (form.linkType === "subject" && !form.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    
    if (form.linkType === "course" && !form.courseId) {
      toast.error("Please select a course");
      return;
    }

    if (form.type !== "quiz" && !file && !isEditing) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    
    if (file && form.type !== "quiz") {
      formData.append("file", file);
    }
    
    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

    if (form.linkType === "subject") {
      formData.append("subjectId", form.subjectId);
      const selectedSubject = subjects.find(s => s._id === form.subjectId);
      if (selectedSubject && selectedSubject.courseId) {
        // Extract the actual ID string, not the object
        const courseIdValue = selectedSubject.courseId._id || selectedSubject.courseId;
        formData.append("courseId", courseIdValue);
      } else {
        toast.error("Selected subject is not associated with a course");
        setLoading(false);
        return;
      }
    } else {
      // Extract the actual ID string for course
      const courseIdValue = form.courseId._id || form.courseId;
      formData.append("courseId", courseIdValue);
    }

    formData.append("isPaid", form.isPaid);
    formData.append("price", form.price);

    if (form.type === "quiz") {
      formData.append("quizTimerMinutes", "0");
      formData.append("quizPassMark", "70");
    }

    try {
      let res;
      if (isEditing) {
        res = await axios.put(`/content/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Content updated successfully");
      } else {
        res = await axios.post("/content/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Uploaded successfully");
      }

      if (form.type === "quiz" && res.data) {
        setSelectedLesson(res.data);
        setShowQuizEditor(true);
      } else {
        navigate("/lecturer/content");
      }

      if (!isEditing) {
        resetForm();
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (!isEditing) {
      setForm({
        title: "",
        type: "video",
        linkType: "subject",
        programId: "",
        courseId: "",
        subjectId: "",
        isPaid: false,
        price: "",
        thumbnail: null,
      });
      setFile(null);
      setFilteredCourses([]);
    }
  };

  const closeViewer = () => {
    setViewer({ open: false, type: "", url: "", title: "" });
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/lecturer/content")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {isEditing ? "Edit Content" : "Create Learning Content"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditing ? "Update your existing content" : "Upload videos, PDFs, images, and create quizzes for your assigned subjects"}
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Content" : "Upload New Content"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? "Update your existing content" : "Share learning materials with your students"}
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              placeholder="Enter content title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              disabled={isEditing}
            >
              <option value="video">🎥 Video</option>
              <option value="image">🖼 Image</option>
              <option value="pdf">📄 PDF</option>
              <option value="quiz">📝 Quiz</option>
            </select>

            <select
              value={form.linkType}
              onChange={(e) => setForm({ ...form, linkType: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="subject">Attach to Subject</option>
              <option value="course">Attach to Course</option>
            </select>
          </div>

          {/* Program Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.programId}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Program</option>
                  {programs.filter(p => p.isActive !== false).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.code ? `(${p.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Selection - Filtered by Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  disabled={!form.programId}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Course</option>
                  {filteredCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          {form.linkType === "subject" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Subject</option>
                  {(assignedSubjects.length > 0 ? assignedSubjects : subjects)
                    .filter(s => !form.courseId || s.courseId === form.courseId)
                    .map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                </select>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.isPaid}
                onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Premium Content
            </label>
            {form.isPaid && (
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="pl-10 pr-4 py-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            )}
          </div>

          {form.type !== "quiz" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content File {!isEditing && "*"}
                </label>
                <input
                  type="file"
                  accept="video/*,image/*,application/pdf"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile) {
                      const maxSize = form.type === 'video' ? 100 * 1024 * 1024 : 
                                     form.type === 'pdf' ? 50 * 1024 * 1024 : 
                                     10 * 1024 * 1024;
                      if (selectedFile.size > maxSize) {
                        toast.error(`${form.type.toUpperCase()} file too large! Maximum ${maxSize / (1024 * 1024)}MB`);
                        e.target.value = null;
                        return;
                      }
                      setFile(selectedFile);
                    }
                  }}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
                {isEditing && contentData?.fileUrl && (
                  <p className="text-xs text-gray-500 mt-1">Current file: {contentData.fileUrl?.split('/').pop()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thumbnail (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
                      toast.error("Thumbnail too large! Maximum size is 5MB");
                      e.target.value = null;
                      return;
                    }
                    setForm({ ...form, thumbnail: selectedFile });
                  }}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}

          {form.type === "quiz" && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                    {isEditing ? "Edit Quiz Content" : "Quiz Content"}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-0.5">
                    {isEditing ? "Update the quiz title and settings" : "After creating the quiz, you'll be able to add questions, set timer, and configure pass mark."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {loading ? "Processing..." : (isEditing ? "Update Content" : "Upload Content")}
            </button>
            <button
              onClick={() => navigate("/lecturer/content")}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Editor Modal */}
      {showQuizEditor && selectedLesson && (
        <QuizEditor
          content={selectedLesson}
          onClose={() => {
            setShowQuizEditor(false);
            setSelectedLesson(null);
            navigate("/lecturer/content");
          }}
          onSave={() => {}}
          refreshContents={() => {}}
        />
      )}
    </div>
  );
};

export default LecturerContentForm;