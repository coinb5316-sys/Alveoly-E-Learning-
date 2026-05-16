// pages/lecturer/LecturerExams.jsx
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
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
  FaPaperPlane,
  FaHourglassHalf,
  FaCheckDouble,
  FaBan
} from "react-icons/fa";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const LecturerExams = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState({ courseId: "", subjectId: "", status: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("create"); // create, my_exams

  // Wizard State
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    courseId: "",
    subjectId: "",
    type: "exam",
    examTime: "",
    isExamLocked: false,
  });

  // Questions State
  const [questionList, setQuestionList] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingExistingQuestion, setEditingExistingQuestion] = useState(null); // For editing existing questions

  // Current question form
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", ""],
    correctAnswer: "",
    rationale: "",
  });

  const examTimes = Array.from({ length: 14 }, (_, i) => (i + 1) * 15);

  // Fetch assigned courses and subjects
  useEffect(() => {
    fetchAssignedResources();
    fetchMyQuestions();
  }, []);

  const fetchAssignedResources = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        axios.get("/lecturer/assigned-courses"),
        axios.get("/lecturer/assigned-subjects"),
      ]);
      
      if (coursesRes.data.success) {
        setAssignedCourses(coursesRes.data.courses || []);
      }
      if (subjectsRes.data.success) {
        setAssignedSubjects(subjectsRes.data.subjects || []);
      }
    } catch (err) {
      console.error("Error fetching assigned resources:", err);
      toast.error("Failed to fetch assigned courses and subjects");
    }
  };

  const fetchMyQuestions = async () => {
    try {
      const res = await axios.get("/questions/lecturer/my");
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching my questions:", err);
      toast.error("Failed to fetch your exam questions");
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value });
    if (field === "courseId") {
      setConfig({ ...config, courseId: value, subjectId: "" });
    }
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion({ ...currentQuestion, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    if (currentQuestion.options.length >= 6) {
      toast.error("Maximum 6 options allowed");
      return;
    }
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""],
    });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions, correctAnswer: "" });
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
      toast.error("Please select the correct answer");
      return;
    }

    if (editingQuestionId !== null) {
      const updatedList = questionList.map(q =>
        q.tempId === editingQuestionId
          ? { ...currentQuestion, tempId: editingQuestionId }
          : q
      );
      setQuestionList(updatedList);
      toast.success("Question updated!");
      setEditingQuestionId(null);
    } else {
      setQuestionList([
        ...questionList,
        { ...currentQuestion, tempId: Date.now() },
      ]);
      toast.success("Question added!");
    }

    setCurrentQuestion({
      question: "",
      options: ["", ""],
      correctAnswer: "",
      rationale: "",
    });
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questionList[index]);
    setEditingQuestionId(questionList[index].tempId);
    setCurrentQuestionIndex(index);
  };

  const deleteQuestion = (index) => {
    if (window.confirm("Delete this question?")) {
      const newList = questionList.filter((_, i) => i !== index);
      setQuestionList(newList);
      if (currentQuestionIndex >= newList.length) {
        setCurrentQuestionIndex(Math.max(0, newList.length - 1));
      }
      toast.success("Question deleted");
    }
  };

  // NEW: Edit existing approved/rejected question
  const editExistingQuestion = (question) => {
    // Load question data into the creator
    setConfig({
      courseId: question.courseId?._id || question.courseId,
      subjectId: question.subjectId?._id || question.subjectId,
      type: question.type,
      examTime: question.examTime || "",
      isExamLocked: question.isLocked || false,
    });
    
    setQuestionList([{
      _id: question._id, // Keep ID for update
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      rationale: question.rationale || "",
      tempId: Date.now(),
    }]);
    
    setEditingExistingQuestion(question);
    setActiveTab("create");
    setStep(2);
    toast.success("Question loaded for editing. Make changes and resubmit.");
  };

  const submitForApproval = async () => {
    if (questionList.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setSubmitting(true);
    try {
      const questionsToSubmit = questionList.map(q => ({
        courseId: config.courseId,
        subjectId: config.subjectId,
        type: config.type,
        examTime: config.type === "exam" ? config.examTime : 0,
        isLocked: config.type === "exam" ? config.isExamLocked : false,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale,
        status: "pending",
        source: "lecturer",
        ...(q._id && { _id: q._id }), // Include ID if updating existing
      }));

      if (editingExistingQuestion) {
        // Update existing question
        await axios.put(`/questions/lecturer/${editingExistingQuestion._id}`, {
          ...questionsToSubmit[0],
          status: "pending", // Reset to pending for re-approval
        });
        toast.success(`✅ Question updated and resubmitted for admin approval!`);
      } else {
        // Create new questions
        await axios.post("/questions/lecturer/bulk", { questions: questionsToSubmit });
        toast.success(`✅ ${questionList.length} questions submitted for admin approval!`);
      }
      
      // Reset form
      setQuestionList([]);
      setStep(1);
      setConfig({
        courseId: "",
        subjectId: "",
        type: "exam",
        examTime: "",
        isExamLocked: false,
      });
      setCurrentQuestion({
        question: "",
        options: ["", ""],
        correctAnswer: "",
        rationale: "",
      });
      setEditingExistingQuestion(null);
      
      // Refresh my questions list
      fetchMyQuestions();
      setActiveTab("my_exams");
    } catch (err) {
      console.error("Error submitting questions:", err);
      toast.error(err.response?.data?.message || "Failed to submit questions");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMyQuestion = async (questionId) => {
    if (!window.confirm("Delete this question? This action cannot be undone.")) return;
    try {
      await axios.delete(`/questions/lecturer/${questionId}`);
      toast.success("Question deleted successfully");
      fetchMyQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error(err.response?.data?.message || "Failed to delete question");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "approved":
        return { icon: <FaCheckCircle className="h-3 w-3" />, text: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" };
      case "pending":
        return { icon: <FaHourglassHalf className="h-3 w-3" />, text: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400" };
      case "rejected":
        return { icon: <FaBan className="h-3 w-3" />, text: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" };
      case "draft":
        return { icon: <FaEdit className="h-3 w-3" />, text: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
      default:
        return { icon: <FaQuestionCircle className="h-3 w-3" />, text: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      (!filter.courseId || (q.courseId?._id === filter.courseId || q.courseId === filter.courseId)) &&
      (!filter.subjectId || (q.subjectId?._id === filter.subjectId || q.subjectId === filter.subjectId)) &&
      (!filter.status || q.status === filter.status)
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Exam Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create exams and practice questions for your students (requires admin approval)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <span className="text-sm text-green-600 dark:text-green-400">
              {assignedSubjects.length} Subjects Assigned
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-6">
          <button
            onClick={() => {
              setActiveTab("create");
              setEditingExistingQuestion(null);
              setQuestionList([]);
              setStep(1);
            }}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "create"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <FaPlus className="inline h-4 w-4 mr-2" />
            Create Exam
          </button>
          <button
            onClick={() => setActiveTab("my_exams")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "my_exams"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <FaList className="inline h-4 w-4 mr-2" />
            My Exams
            {questions.filter(q => q.status === "pending").length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                {questions.filter(q => q.status === "pending").length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Create Exam Tab */}
      {activeTab === "create" && (
        <>
          {/* Stats Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Questions Created</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {questionList.length}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Exam Type</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 capitalize">
                    {config.type}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                  <FaGraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {questionList.length > 0 ? "Ready" : "Empty"}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {questionList.reduce((sum, q) => sum + 1, 0)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Wizard Steps */}
          {(step === 1 || step === 2 || step === 3) && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              {/* Step Indicator */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                          step >= s 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" 
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}>
                          {step > s ? <FaCheck className="h-4 w-4" /> : s}
                        </div>
                        <span className={`ml-2 text-sm font-medium ${
                          step >= s 
                            ? "text-gray-900 dark:text-gray-100" 
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {s === 1 ? "Configure" : s === 2 ? "Add Questions" : "Submit for Approval"}
                        </span>
                        {s < 3 && (
                          <div className="w-12 h-px bg-gray-200 dark:bg-gray-700 mx-4 hidden sm:block" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {questionList.length} questions added
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Configuration */}
                {step === 1 && (
                  <div className="max-w-2xl mx-auto space-y-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {editingExistingQuestion ? "Edit Exam Configuration" : "Exam Configuration"}
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Course
                      </label>
                      <select
                        value={config.courseId}
                        onChange={(e) => handleConfigChange("courseId", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="">Select Course</option>
                        {assignedCourses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Subject
                      </label>
                      <select
                        value={config.subjectId}
                        onChange={(e) => handleConfigChange("subjectId", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                        disabled={!config.courseId}
                      >
                        <option value="">Select Subject</option>
                        {assignedSubjects
                          .filter(s => s.courseId?._id === config.courseId || s.courseId === config.courseId)
                          .map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Question Type
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="trial"
                            checked={config.type === "trial"}
                            onChange={(e) => handleConfigChange("type", e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Practice (Trial)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="exam"
                            checked={config.type === "exam"}
                            onChange={(e) => handleConfigChange("type", e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Exam (Timed)</span>
                        </label>
                      </div>
                    </div>

                    {config.type === "exam" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Exam Duration (minutes)
                          </label>
                          <select
                            value={config.examTime}
                            onChange={(e) => handleConfigChange("examTime", e.target.value)}
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

                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={config.isExamLocked}
                            onChange={(e) => handleConfigChange("isExamLocked", e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          Lock Exam (prevent retake after completion)
                        </label>
                      </>
                    )}

                    <div className="flex justify-between pt-4">
                      {editingExistingQuestion && (
                        <button
                          onClick={() => {
                            setEditingExistingQuestion(null);
                            setQuestionList([]);
                            setStep(1);
                            setConfig({
                              courseId: "",
                              subjectId: "",
                              type: "exam",
                              examTime: "",
                              isExamLocked: false,
                            });
                          }}
                          className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <FaArrowLeft className="h-4 w-4" />
                          Cancel Edit
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (!config.courseId || !config.subjectId) {
                            toast.error("Please select course and subject");
                            return;
                          }
                          if (config.type === "exam" && !config.examTime) {
                            toast.error("Please select exam duration");
                            return;
                          }
                          setStep(2);
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                      >
                        Next: Add Questions
                        <FaArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Add Questions */}
                {step === 2 && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Question Form */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {editingQuestionId !== null ? "Edit Question" : "Add New Question"}
                      </h3>
                      
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => handleQuestionChange("question", e.target.value)}
                        placeholder="Enter your question here..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      />

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Answer Options
                        </label>
                        {currentQuestion.options.map((opt, i) => (
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
                            {currentQuestion.options.length > 2 && (
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
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FaPlus className="h-4 w-4" />
                        Add Option
                      </button>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Correct Answer
                        </label>
                        <select
                          value={currentQuestion.correctAnswer}
                          onChange={(e) => handleQuestionChange("correctAnswer", e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                          <option value="">Select correct answer</option>
                          {currentQuestion.options.map((_, i) => (
                            <option key={i} value={String.fromCharCode(65 + i)}>
                              {String.fromCharCode(65 + i)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Rationale (Explanation)
                        </label>
                        <textarea
                          value={currentQuestion.rationale}
                          onChange={(e) => handleQuestionChange("rationale", e.target.value)}
                          placeholder="Explain why this answer is correct..."
                          rows={2}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={addOrUpdateQuestion}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25"
                        >
                          {editingQuestionId !== null ? "Update Question" : "Add Question"}
                        </button>
                        
                        {editingQuestionId !== null && (
                          <button
                            onClick={() => {
                              setEditingQuestionId(null);
                              setCurrentQuestion({
                                question: "",
                                options: ["", ""],
                                correctAnswer: "",
                                rationale: "",
                              });
                            }}
                            className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question List Preview */}
                    <div className="border-l border-gray-200 dark:border-gray-800 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <FaList className="h-4 w-4 text-blue-500" />
                        Question List ({questionList.length})
                      </h3>
                      
                      {questionList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <FaQuestionCircle className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">No questions added yet</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first question using the form</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {questionList.map((q, idx) => (
                            <div key={idx} className="group p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                                      Q{idx + 1}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Answer: {q.correctAnswer}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                                    {q.question}
                                  </p>
                                  {q.rationale && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                      <span className="font-medium">Rationale:</span> {q.rationale}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => editQuestion(idx)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded transition-colors"
                                  >
                                    <FaEdit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(idx)}
                                    className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50 rounded transition-colors"
                                  >
                                    <FaTrash className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Submit for Approval */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <FaPaperPlane className="h-5 w-5 text-blue-500" />
                        {editingExistingQuestion ? "Resubmit for Admin Approval" : "Submit for Admin Approval"}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Course</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {assignedCourses.find(c => c._id === config.courseId)?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Subject</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {assignedSubjects.find(s => s._id === config.subjectId)?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Type</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{config.type}</p>
                        </div>
                        {config.type === "exam" && (
                          <>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Duration</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{config.examTime} minutes</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Locked</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{config.isExamLocked ? "Yes" : "No"}</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                          <FaExclamationCircle className="h-4 w-4" />
                          {editingExistingQuestion 
                            ? "Your updated question will need admin approval again."
                            : "Once submitted, an admin will review your questions. You'll be notified when they are approved or rejected."}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Questions Summary ({questionList.length})</h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {questionList.map((q, idx) => (
                          <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                                  Q{idx + 1}
                                </span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{q.question}</p>
                              </div>
                              <button
                                onClick={() => {
                                  setStep(2);
                                  editQuestion(idx);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => setStep(2)}
                        className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FaArrowLeft className="h-4 w-4" />
                        Back to Edit
                      </button>
                      <button
                        onClick={submitForApproval}
                        disabled={submitting || questionList.length === 0}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="h-4 w-4" />
                            {editingExistingQuestion ? "Resubmit for Approval" : `Submit ${questionList.length} Questions for Approval`}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation buttons for step 2 */}
                {step === 2 && (
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <FaArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (questionList.length === 0) {
                          toast.error("Please add at least one question");
                          return;
                        }
                        setStep(3);
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                    >
                      Review & Submit for Approval
                      <FaArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* My Exams Tab */}
      {activeTab === "my_exams" && (
        <>
          {/* Filters */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <FaFilter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>
            
            {showFilters && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={filter.courseId}
                  onChange={(e) => setFilter({ ...filter, courseId: e.target.value, subjectId: "" })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <option value="">All Courses</option>
                  {assignedCourses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={filter.subjectId}
                  onChange={(e) => setFilter({ ...filter, subjectId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={!filter.courseId}
                >
                  <option value="">All Subjects</option>
                  {assignedSubjects
                    .filter(s => s.courseId?._id === filter.courseId || s.courseId === filter.courseId)
                    .map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                </select>

                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Exam Questions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Questions you've created. Pending questions need admin approval.
              </p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FaQuestionCircle className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No questions found</p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Your First Exam
                  </button>
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const status = getStatusBadge(q.status);
                  const subject = assignedSubjects.find(s => s._id === (q.subjectId?._id || q.subjectId));
                  const course = assignedCourses.find(c => c._id === (q.courseId?._id || q.courseId));
                  return (
                    <div key={q._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${status.color}`}>
                              {status.icon}
                              {status.text}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              q.type === "exam" 
                                ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400"
                                : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                            }`}>
                              {q.type === "exam" ? "Exam" : "Practice"}
                            </span>
                            {q.type === "exam" && q.examTime && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                <FaClock className="h-3 w-3" />
                                {q.examTime} min
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {subject?.name || "N/A"} • {course?.name || "N/A"}
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 font-medium">
                            {q.question}
                          </p>
                          <div className="mt-2 space-y-0.5">
                            {q.options.map((opt, i) => {
                              const isCorrect = String.fromCharCode(65 + i) === q.correctAnswer;
                              return (
                                <p key={i} className={`text-xs ${isCorrect ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                                  {String.fromCharCode(65 + i)}. {opt}
                                  {isCorrect && " ✓"}
                                </p>
                              );
                            })}
                          </div>
                          {q.rationale && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              <span className="font-medium">Why:</span> {q.rationale}
                            </p>
                          )}
                          {q.rejectionReason && q.status === "rejected" && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                              <span className="font-medium">Rejection reason:</span> {q.rejectionReason}
                            </p>
                          )}
                        </div>
                        {/* EDIT AND DELETE BUTTONS TOGETHER */}
                        <div className="flex gap-2 ml-4">
                          {/* Edit button - appears for rejected or pending questions that can be edited */}
                          {(q.status === "rejected" || q.status === "pending") && (
                            <button
                              onClick={() => editExistingQuestion(q)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                              title="Edit Question"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          )}
                          {/* Delete button */}
                          <button
                            onClick={() => deleteMyQuestion(q._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Delete Question"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LecturerExams;