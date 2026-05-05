// AdminQuestions.jsx - Professional styling with dark mode support
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
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
  FaChevronRight
} from "react-icons/fa";
import axios from "../api/axios";

const socket = io("http://localhost:5000");

const AdminQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState({ courseId: "", subjectId: "" });
  const [showFilters, setShowFilters] = useState(false);

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

  // Current question form
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", ""],
    correctAnswer: "",
    rationale: "",
  });

  const examTimes = Array.from({ length: 14 }, (_, i) => (i + 1) * 15);

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
    fetchQuestions();

    socket.on("question:created", (q) => setQuestions((prev) => [q, ...prev]));
    socket.on("question:updated", (q) =>
      setQuestions((prev) => prev.map((item) => (item._id === q._id ? q : item)))
    );
    socket.on("question:deleted", (_id) =>
      setQuestions((prev) => prev.filter((q) => q._id !== _id))
    );

    return () => {
      socket.off("question:created");
      socket.off("question:updated");
      socket.off("question:deleted");
    };
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async (courseId = "") => {
    try {
      let url = "/subjects";
      if (courseId) url = `/subjects?course=${courseId}`;
      const res = await axios.get(url);
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubjects = (courseId) =>
    subjects.filter((s) => s.courseId?.toString() === courseId);

  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value });
    if (field === "courseId") {
      setConfig({ ...config, courseId: value, subjectId: "" });
      fetchSubjects(value);
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
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""],
    });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions, correctAnswer: "" });
  };

  const addOrUpdateQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert("Please fill all options");
      return;
    }
    if (!currentQuestion.correctAnswer) {
      alert("Please select the correct answer");
      return;
    }

    if (editingQuestionId !== null) {
      const updatedList = questionList.map(q =>
        q.tempId === editingQuestionId
          ? { ...currentQuestion, tempId: editingQuestionId }
          : q
      );
      setQuestionList(updatedList);
      setEditingQuestionId(null);
    } else {
      setQuestionList([
        ...questionList,
        { ...currentQuestion, tempId: Date.now() },
      ]);
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
    }
  };

  const handleSubmitAll = async () => {
    if (questionList.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setLoading(true);
    try {
      const questionsToSubmit = questionList.map(q => ({
        courseId: config.courseId,
        subjectId: config.subjectId,
        type: config.type,
        examTime: config.type === "exam" ? config.examTime : "",
        isExamLocked: config.type === "exam" ? config.isExamLocked : false,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale,
      }));

      await axios.post("/questions/bulk", { questions: questionsToSubmit });

      alert(`Successfully added ${questionList.length} questions!`);
      
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
      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Failed to submit questions");
    } finally {
      setLoading(false);
    }
  };

  const handleEditExisting = (q) => {
    setConfig({
      courseId: q.courseId,
      subjectId: q.subjectId,
      type: q.type,
      examTime: q.examTime || "",
      isExamLocked: q.isExamLocked || false,
    });
    setQuestionList([{
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      rationale: q.rationale,
      tempId: q._id,
      _id: q._id
    }]);
    setEditingQuestionId(q._id);
    setCurrentQuestion({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      rationale: q.rationale,
    });
    setStep(2);
  };

  const handleDeleteExisting = async (_id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`/questions/${_id}`);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      (!filter.courseId || q.courseId === filter.courseId) &&
      (!filter.subjectId || q.subjectId === filter.subjectId)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Question Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, manage and organize exam questions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <FaQuestionCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {questions.length} questions
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {questions.length}
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {questions.filter(q => q.type === "exam").length}
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {questions.filter(q => q.type === "trial").length}
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {new Set(questions.map(q => q.subjectId)).size}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <FaBook className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <FaFilter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
            {showFilters ? <FaChevronLeft className="h-3 w-3" /> : <FaChevronRight className="h-3 w-3" />}
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              value={filter.courseId}
              onChange={(e) => setFilter({ ...filter, courseId: e.target.value, subjectId: "" })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filter.subjectId}
              onChange={(e) => setFilter({ ...filter, subjectId: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              disabled={!filter.courseId}
            >
              <option value="">All Subjects</option>
              {filter.courseId &&
                filteredSubjects(filter.courseId).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>

            <button
              onClick={() => {
                setStep(1);
                setConfig({ courseId: "", subjectId: "", type: "exam", examTime: "", isExamLocked: false });
                setQuestionList([]);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <FaPlus className="h-4 w-4" />
              Add New Questions
            </button>
          </div>
        )}
      </div>

      {/* Wizard Steps */}
      {(step === 1 || step === 2 || step === 3) && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
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
                      {s === 1 ? "Configure" : s === 2 ? "Add Questions" : "Review"}
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
                  Exam Configuration
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
                    {courses.map((c) => (
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
                    {config.courseId &&
                      filteredSubjects(config.courseId).map((s) => (
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
                      <span className="text-sm text-gray-700 dark:text-gray-300">Trial (Practice)</span>
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

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      if (!config.courseId || !config.subjectId) {
                        alert("Please select course and subject");
                        return;
                      }
                      if (config.type === "exam" && !config.examTime) {
                        alert("Please select exam duration");
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

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Configuration Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Course</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{courses.find(c => c._id === config.courseId)?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Subject</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{subjects.find(s => s._id === config.subjectId)?.name}</p>
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
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Questions Preview ({questionList.length})</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {questionList.map((q, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {idx + 1}. {q.question}
                            </h4>
                            <div className="space-y-1 ml-4">
                              {q.options.map((opt, i) => {
                                const isCorrect = String.fromCharCode(65 + i) === q.correctAnswer;
                                return (
                                  <p key={i} className={`text-sm ${isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                                    {String.fromCharCode(65 + i)}. {opt}
                                    {isCorrect && " ✓"}
                                  </p>
                                );
                              })}
                            </div>
                            {q.rationale && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                <strong>Rationale:</strong> {q.rationale}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setStep(2);
                              editQuestion(idx);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          >
                            <FaEdit className="h-4 w-4" />
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
                    onClick={handleSubmitAll}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit {questionList.length} Questions
                        <FaCheck className="h-4 w-4" />
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
                      alert("Please add at least one question");
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  Review & Submit
                  <FaArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing Questions List */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Existing Questions</h3>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaQuestionCircle className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No questions found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first question using the form above</p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const subject = subjects.find(s => s._id === q.subjectId);
              return (
                <div key={q._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          q.type === "exam" 
                            ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400"
                            : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                        }`}>
                          {q.type === "exam" ? "Exam" : "Trial"}
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
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {subject?.name || "N/A"}
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
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditExisting(q)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                        title="Edit Question"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExisting(q._id)}
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
    </div>
  );
};

export default AdminQuestions;