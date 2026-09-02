// AdminQuestions.jsx - Professional Grouped Layout
import { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaLock,
  FaUnlockAlt,
  FaSpinner,
  FaBook,
  FaGraduationCap,
  FaQuestionCircle,
  FaList,
  FaCheck,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaCopy,
  FaLayerGroup,
  FaChevronDown,
  FaChevronUp,
  FaFolderOpen,
  FaFileAlt,
  FaPlusCircle,
} from "react-icons/fa";
import axios from "../api/axios";
import initializeSocket, { getSocket } from "../config/socket";

const AdminQuestions = () => {
  const [socket, setSocket] = useState(null);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});

  // Question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    options: ["", ""],
    correctAnswer: "",
    rationale: "",
    type: "exam",
    examTime: "",
    isExamLocked: false,
    courseId: "",
    subjectId: "",
  });

  // Multi-select state
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showMultiAssign, setShowMultiAssign] = useState(false);
  const [multiAssignTargets, setMultiAssignTargets] = useState({
    courseIds: [],
    subjectIds: [],
  });

  // Stats
  const totalQuestions = questions.length;
  const examQuestions = questions.filter(q => q.type === "exam").length;
  const trialQuestions = questions.filter(q => q.type === "trial").length;
  const uniqueSubjects = new Set(questions.map(q => q.subjectId)).size;

  useEffect(() => {
    const newSocket = initializeSocket();
    setSocket(newSocket);

    fetchCourses();
    fetchSubjects();
    fetchQuestions();

    newSocket.on("question:created", (q) => setQuestions((prev) => [q, ...prev]));
    newSocket.on("question:updated", (q) =>
      setQuestions((prev) => prev.map((item) => (item._id === q._id ? q : item)))
    );
    newSocket.on("question:deleted", (_id) =>
      setQuestions((prev) => prev.filter((q) => q._id !== _id))
    );

    return () => {
      newSocket.off("question:created");
      newSocket.off("question:updated");
      newSocket.off("question:deleted");
    };
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchSubjects = async (courseId = "") => {
    try {
      let url = "/subjects";
      if (courseId) url = `/subjects?course=${courseId}`;
      const res = await axios.get(url);
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course?.name || "Unknown Course";
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const getSubjectsForCourse = (courseId) => {
    const uniqueSubjectIds = new Set();
    const result = [];
    subjects.forEach(s => {
      const subjectCourseId = s.courseId?._id?.toString() || s.courseId?.toString() || s.courseId;
      if (subjectCourseId === courseId && !uniqueSubjectIds.has(s._id)) {
        uniqueSubjectIds.add(s._id);
        result.push(s);
      }
    });
    return result;
  };

  const getQuestionsForCourse = (courseId) => {
    return questions.filter(q => q.courseId === courseId);
  };

  const getQuestionsForSubject = (courseId, subjectId) => {
    return questions.filter(q => q.courseId === courseId && q.subjectId === subjectId);
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions, correctAnswer: "" });
  };

  const resetForm = () => {
    setFormData({
      question: "",
      options: ["", ""],
      correctAnswer: "",
      rationale: "",
      type: "exam",
      examTime: "",
      isExamLocked: false,
      courseId: "",
      subjectId: "",
    });
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  const handleSubmitQuestion = async () => {
    if (!formData.question.trim()) {
      alert("Please enter a question");
      return;
    }
    if (formData.options.some(opt => !opt.trim())) {
      alert("Please fill all options");
      return;
    }
    if (!formData.correctAnswer) {
      alert("Please select the correct answer");
      return;
    }
    if (!formData.courseId || !formData.subjectId) {
      alert("Please select a course and subject");
      return;
    }
    if (formData.type === "exam" && !formData.examTime) {
      alert("Please select exam duration");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        rationale: formData.rationale,
        type: formData.type,
        examTime: formData.type === "exam" ? formData.examTime : "",
        isExamLocked: formData.type === "exam" ? formData.isExamLocked : false,
        courseId: formData.courseId,
        subjectId: formData.subjectId,
      };

      if (editingQuestion) {
        await axios.put(`/questions/${editingQuestion._id}`, payload);
        toast.success("Question updated successfully!");
      } else {
        await axios.post("/questions", payload);
        toast.success("Question added successfully!");
      }

      resetForm();
      fetchQuestions();
    } catch (err) {
      console.error("Error saving question:", err);
      alert("Failed to save question: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`/questions/${questionId}`);
      toast.success("Question deleted successfully!");
      fetchQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Failed to delete question");
    }
  };

  const handleEditQuestion = (question) => {
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      rationale: question.rationale || "",
      type: question.type,
      examTime: question.examTime || "",
      isExamLocked: question.isExamLocked || false,
      courseId: question.courseId,
      subjectId: question.subjectId,
    });
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const toggleQuestionSelection = (qId) => {
    setSelectedQuestions(prev =>
      prev.includes(qId)
        ? prev.filter(id => id !== qId)
        : [...prev, qId]
    );
  };

  const selectAllQuestions = (questionIds) => {
    const allSelected = questionIds.every(id => selectedQuestions.includes(id));
    if (allSelected) {
      setSelectedQuestions(prev => prev.filter(id => !questionIds.includes(id)));
    } else {
      const newSelection = [...selectedQuestions];
      questionIds.forEach(id => {
        if (!newSelection.includes(id)) newSelection.push(id);
      });
      setSelectedQuestions(newSelection);
    }
  };

  const handleMultiAssign = async () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question to assign");
      return;
    }

    const { courseIds, subjectIds } = multiAssignTargets;
    if (courseIds.length === 0 || subjectIds.length === 0) {
      alert("Please select at least one course and one subject");
      return;
    }

    try {
      setLoading(true);
      const totalAssignments = selectedQuestions.length * courseIds.length * subjectIds.length;
      if (totalAssignments > 200) {
        if (!window.confirm(`This will create ${totalAssignments} new question assignments. Are you sure?`)) {
          setLoading(false);
          return;
        }
      }

      const assignments = [];
      for (const courseId of courseIds) {
        for (const subjectId of subjectIds) {
          const subject = subjects.find(s => s._id === subjectId);
          if (subject) {
            const subjectCourseId = subject.courseId?._id?.toString() || subject.courseId?.toString() || subject.courseId;
            if (subjectCourseId === courseId) {
              for (const qId of selectedQuestions) {
                const original = questions.find(q => q._id === qId);
                if (original) {
                  assignments.push({
                    courseId: courseId,
                    subjectId: subjectId,
                    type: original.type,
                    examTime: original.examTime || "",
                    isExamLocked: original.isExamLocked || false,
                    question: original.question,
                    options: original.options,
                    correctAnswer: original.correctAnswer,
                    rationale: original.rationale,
                  });
                }
              }
            }
          }
        }
      }

      if (assignments.length === 0) {
        alert("No valid course-subject combinations found");
        setLoading(false);
        return;
      }

      await axios.post("/questions/bulk", { questions: assignments });
      toast.success(`✅ Successfully assigned ${assignments.length} questions!`);
      
      setSelectedQuestions([]);
      setMultiAssignTargets({ courseIds: [], subjectIds: [] });
      setShowMultiAssign(false);
      fetchQuestions();
    } catch (err) {
      console.error("Error in multi-assign:", err);
      alert("Failed to assign questions: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filtered courses based on search
  const filteredCourses = courses.filter(course => {
    const courseQuestions = getQuestionsForCourse(course._id);
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const courseMatch = course.name.toLowerCase().includes(searchLower);
      const questionMatch = courseQuestions.some(q => 
        q.question.toLowerCase().includes(searchLower) ||
        q.options.some(opt => opt.toLowerCase().includes(searchLower))
      );
      return courseMatch || questionMatch;
    }
    return courseQuestions.length > 0;
  });

  const examTimes = Array.from({ length: 14 }, (_, i) => (i + 1) * 15);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Question Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize and manage exam questions grouped by course and subject
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <FaQuestionCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {totalQuestions} questions
            </span>
          </div>
          {selectedQuestions.length > 0 && (
            <button
              onClick={() => setShowMultiAssign(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              <FaLayerGroup className="h-4 w-4" />
              Assign {selectedQuestions.length} to Multiple
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowQuestionForm(!showQuestionForm);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <FaPlus className="h-4 w-4" />
            Add Question
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {totalQuestions}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <FaQuestionCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Exam Questions</p>
              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
                {examQuestions}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
              <FaClock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trial Questions</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
                {trialQuestions}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subjects Covered</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
                {uniqueSubjects}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <FaBook className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search questions, courses, or subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {editingQuestion ? <FaEdit className="h-5 w-5 text-blue-500" /> : <FaPlus className="h-5 w-5 text-blue-500" />}
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Course & Subject Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Course *
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => {
                      const courseId = e.target.value;
                      setFormData({ ...formData, courseId, subjectId: "" });
                      fetchSubjects(courseId);
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    disabled={!formData.courseId}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  >
                    <option value="">Select Subject</option>
                    {formData.courseId &&
                      getSubjectsForCourse(formData.courseId).map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="trial"
                      checked={formData.type === "trial"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Trial (Practice)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="exam"
                      checked={formData.type === "exam"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Exam (Timed)</span>
                  </label>
                </div>
              </div>

              {/* Exam Settings */}
              {formData.type === "exam" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Exam Duration (minutes)
                    </label>
                    <select
                      value={formData.examTime}
                      onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Duration</option>
                      {examTimes.map((t) => (
                        <option key={t} value={t}>
                          {t} minutes
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.isExamLocked}
                        onChange={(e) => setFormData({ ...formData, isExamLocked: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      Lock Exam (prevent retake)
                    </label>
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Answer Options *
                </label>
                <div className="space-y-2">
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <input
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      />
                      {formData.options.length > 2 && (
                        <button
                          onClick={() => removeOption(i)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <FaTimes className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addOption}
                  className="mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FaPlus className="h-4 w-4" />
                  Add Option
                </button>
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correct Answer *
                </label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select correct answer</option>
                  {formData.options.map((_, i) => (
                    <option key={i} value={String.fromCharCode(65 + i)}>
                      {String.fromCharCode(65 + i)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rationale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rationale (Explanation)
                </label>
                <textarea
                  value={formData.rationale}
                  onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                  placeholder="Explain why this answer is correct..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuestion}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingQuestion ? <FaSave className="h-4 w-4" /> : <FaPlus className="h-4 w-4" />}
                      {editingQuestion ? "Update Question" : "Add Question"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Assign Modal */}
      {showMultiAssign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FaLayerGroup className="h-5 w-5 text-purple-500" />
                Assign Questions to Multiple Courses/Subjects
              </h2>
              <button
                onClick={() => setShowMultiAssign(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Questions ({selectedQuestions.length})
                </label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {selectedQuestions.map(qId => {
                    const q = questions.find(q => q._id === qId);
                    return q ? (
                      <div key={qId} className="text-sm text-gray-600 dark:text-gray-400 py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        {q.question.substring(0, 80)}...
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Courses to Assign To
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {courses.map(c => (
                    <label key={c._id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={multiAssignTargets.courseIds.includes(c._id)}
                        onChange={(e) => {
                          const current = multiAssignTargets.courseIds;
                          const newSelection = e.target.checked
                            ? [...current, c._id]
                            : current.filter(id => id !== c._id);
                          setMultiAssignTargets({ ...multiAssignTargets, courseIds: newSelection });
                          if (newSelection.length > 0) {
                            const availableSubjects = getSubjectsForCourses(newSelection);
                            const subjectIds = availableSubjects.map(s => s._id);
                            setMultiAssignTargets(prev => ({ ...prev, subjectIds }));
                          } else {
                            setMultiAssignTargets(prev => ({ ...prev, subjectIds: [] }));
                          }
                        }}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Subjects to Assign To
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getSubjectsForCourses(multiAssignTargets.courseIds).map(s => (
                    <label key={s._id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={multiAssignTargets.subjectIds.includes(s._id)}
                        onChange={(e) => {
                          const current = multiAssignTargets.subjectIds;
                          const newSelection = e.target.checked
                            ? [...current, s._id]
                            : current.filter(id => id !== s._id);
                          setMultiAssignTargets({ ...multiAssignTargets, subjectIds: newSelection });
                        }}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{s.name}</span>
                    </label>
                  ))}
                  {getSubjectsForCourses(multiAssignTargets.courseIds).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2 text-center py-2">
                      Select courses first to see available subjects
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  <FaExclamationCircle className="inline h-4 w-4 mr-1" />
                  This will create copies of the selected questions for each combination of selected courses and subjects.
                  {multiAssignTargets.courseIds.length > 0 && multiAssignTargets.subjectIds.length > 0 && (
                    <span className="font-medium">
                      {" "}Total: {selectedQuestions.length * multiAssignTargets.courseIds.length * multiAssignTargets.subjectIds.length} new questions will be created.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowMultiAssign(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMultiAssign}
                  disabled={loading || multiAssignTargets.courseIds.length === 0 || multiAssignTargets.subjectIds.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FaLayerGroup className="h-4 w-4" />
                      Assign Questions
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions by Course and Subject */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
            <div className="flex flex-col items-center">
              <FaFolderOpen className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? "No questions match your search" : "No questions found"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Add your first question using the 'Add Question' button above"}
              </p>
            </div>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const courseQuestions = getQuestionsForCourse(course._id);
            const isCourseExpanded = expandedCourses[course._id];
            const subjectList = getSubjectsForCourse(course._id);
            const allQuestionIds = courseQuestions.map(q => q._id);
            const allSelected = allQuestionIds.every(id => selectedQuestions.includes(id));

            return (
              <div
                key={course._id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Course Header */}
                <div
                  className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors"
                  onClick={() => toggleCourse(course._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                        <FaGraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {course.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {courseQuestions.length} questions • {subjectList.length} subjects
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, courseId: course._id, subjectId: "" });
                          setShowQuestionForm(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <FaPlus className="h-3 w-3" />
                        Add
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllQuestions(allQuestionIds);
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <FaCheck className="h-3 w-3" />
                        {allSelected ? "Deselect" : "Select All"}
                      </button>
                      {isCourseExpanded ? (
                        <FaChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FaChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                {isCourseExpanded && (
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {subjectList.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        No subjects found for this course
                      </div>
                    ) : (
                      subjectList.map((subject) => {
                        const subjectQuestions = getQuestionsForSubject(course._id, subject._id);
                        const isSubjectExpanded = expandedSubjects[subject._id];

                        return (
                          <div key={subject._id}>
                            {/* Subject Header */}
                            <div
                              className="px-6 py-3 bg-gray-50 dark:bg-gray-800/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
                              onClick={() => toggleSubject(subject._id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                  <FaBook className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                    {subject.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {subjectQuestions.length} questions
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormData({ 
                                      ...formData, 
                                      courseId: course._id, 
                                      subjectId: subject._id 
                                    });
                                    setShowQuestionForm(true);
                                  }}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <FaPlus className="h-3 w-3" />
                                  Add
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const questionIds = subjectQuestions.map(q => q._id);
                                    selectAllQuestions(questionIds);
                                  }}
                                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  <FaCheck className="h-3 w-3" />
                                  {subjectQuestions.every(q => selectedQuestions.includes(q._id)) ? "Deselect" : "Select All"}
                                </button>
                                {isSubjectExpanded ? (
                                  <FaChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <FaChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Subject Questions */}
                            {isSubjectExpanded && (
                              <div className="px-6 py-3 bg-white dark:bg-gray-900">
                                {subjectQuestions.length === 0 ? (
                                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    No questions in this subject
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {subjectQuestions.map((q) => (
                                      <div
                                        key={q._id}
                                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                                          selectedQuestions.includes(q._id)
                                            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <input
                                            type="checkbox"
                                            checked={selectedQuestions.includes(q._id)}
                                            onChange={() => toggleQuestionSelection(q._id)}
                                            className="w-4 h-4 mt-1 text-blue-600 rounded"
                                          />
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                q.type === "exam" 
                                                  ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400"
                                                  : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                                              }`}>
                                                {q.type === "exam" ? "📝 Exam" : "🎯 Trial"}
                                              </span>
                                              {q.type === "exam" && q.examTime && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                                  <FaClock className="h-3 w-3" />
                                                  {q.examTime} min
                                                </span>
                                              )}
                                              {q.isExamLocked && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center gap-1">
                                                  <FaLock className="h-3 w-3" />
                                                  Locked
                                                </span>
                                              )}
                                            </div>

                                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                              {q.question}
                                            </p>

                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                                              {q.options.map((opt, i) => {
                                                const isCorrect = String.fromCharCode(65 + i) === q.correctAnswer;
                                                return (
                                                  <p key={i} className={`text-sm ${
                                                    isCorrect 
                                                      ? "text-green-600 dark:text-green-400 font-medium" 
                                                      : "text-gray-600 dark:text-gray-400"
                                                  }`}>
                                                    {String.fromCharCode(65 + i)}. {opt}
                                                    {isCorrect && " ✓"}
                                                  </p>
                                                );
                                              })}
                                            </div>

                                            {q.rationale && (
                                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                                                <strong>💡 Rationale:</strong> {q.rationale}
                                              </p>
                                            )}
                                          </div>

                                          <div className="flex gap-1 ml-2">
                                            <button
                                              onClick={() => handleEditQuestion(q)}
                                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                                              title="Edit Question"
                                            >
                                              <FaEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteQuestion(q._id)}
                                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                                              title="Delete Question"
                                            >
                                              <FaTrash className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminQuestions;