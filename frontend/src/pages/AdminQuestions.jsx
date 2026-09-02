// AdminQuestions.jsx - Professional Grouped Layout (Complete)
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
  const [filter, setFilter] = useState({ courseId: "", subjectId: "" });
  const [showFilters, setShowFilters] = useState(false);

  // Multi-assignment state
  const [showMultiAssign, setShowMultiAssign] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [multiAssignTargets, setMultiAssignTargets] = useState({
    courseIds: [],
    subjectIds: []
  });
  const [isMultiAssigning, setIsMultiAssigning] = useState(false);

  // Wizard State
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    courseId: "",
    subjectId: "",
    type: "exam",
    examTime: "",
    isExamLocked: false,
    multiCourseMode: false,
    multiSubjectMode: false,
    selectedCourseIds: [],
    selectedSubjectIds: []
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

  // Grouped questions state
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const examTimes = Array.from({ length: 14 }, (_, i) => (i + 1) * 15);

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
      console.log("Subjects fetched:", res.data?.length || 0);
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

  const filteredSubjects = (courseId) => {
    if (!courseId || !subjects.length) return [];
    
    return subjects.filter((s) => {
      const subjectCourseId = s.courseId?._id?.toString() || s.courseId?.toString() || s.courseId;
      return subjectCourseId === courseId;
    });
  };

  const getSubjectsForCourses = (courseIds) => {
    if (!courseIds || !courseIds.length || !subjects.length) return [];
    const subjectSet = new Set();
    const result = [];
    subjects.forEach(s => {
      const subjectCourseId = s.courseId?._id?.toString() || s.courseId?.toString() || s.courseId;
      if (courseIds.includes(subjectCourseId) && !subjectSet.has(s._id)) {
        subjectSet.add(s._id);
        result.push(s);
      }
    });
    return result;
  };

  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value });
    if (field === "courseId") {
      setConfig({ ...config, courseId: value, subjectId: "" });
      fetchSubjects(value);
    }
  };

  const handleMultiCourseToggle = (courseId) => {
    const current = config.selectedCourseIds || [];
    const newSelection = current.includes(courseId)
      ? current.filter(id => id !== courseId)
      : [...current, courseId];
    setConfig({ ...config, selectedCourseIds: newSelection });
    
    if (newSelection.length > 0) {
      const availableSubjects = getSubjectsForCourses(newSelection);
      const subjectIds = availableSubjects.map(s => s._id);
      setConfig(prev => ({ ...prev, selectedSubjectIds: subjectIds }));
    } else {
      setConfig(prev => ({ ...prev, selectedSubjectIds: [] }));
    }
  };

  const handleMultiSubjectToggle = (subjectId) => {
    const current = config.selectedSubjectIds || [];
    const newSelection = current.includes(subjectId)
      ? current.filter(id => id !== subjectId)
      : [...current, subjectId];
    setConfig({ ...config, selectedSubjectIds: newSelection });
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

    let targetCourseIds = [];
    let targetSubjectIds = [];

    if (config.multiCourseMode && config.selectedCourseIds.length > 0) {
      targetCourseIds = config.selectedCourseIds;
      targetSubjectIds = config.selectedSubjectIds || [];
    } else {
      targetCourseIds = [config.courseId];
      targetSubjectIds = [config.subjectId];
    }

    if (targetCourseIds.length === 0) {
      alert("Please select at least one course");
      return;
    }

    if (targetSubjectIds.length === 0) {
      alert("Please select at least one subject");
      return;
    }

    setLoading(true);
    try {
      const totalQuestions = questionList.length;
      const totalTargets = targetCourseIds.length * targetSubjectIds.length;
      const totalToCreate = totalQuestions * totalTargets;

      if (totalToCreate > 100) {
        if (!window.confirm(`This will create ${totalToCreate} questions across ${totalTargets} combinations. Are you sure?`)) {
          setLoading(false);
          return;
        }
      }

      const questionsToSubmit = [];
      
      for (const courseId of targetCourseIds) {
        for (const subjectId of targetSubjectIds) {
          const subject = subjects.find(s => s._id === subjectId);
          if (subject) {
            const subjectCourseId = subject.courseId?._id?.toString() || subject.courseId?.toString() || subject.courseId;
            if (subjectCourseId === courseId) {
              for (const q of questionList) {
                questionsToSubmit.push({
                  courseId: courseId,
                  subjectId: subjectId,
                  type: config.type,
                  examTime: config.type === "exam" ? config.examTime : "",
                  isExamLocked: config.type === "exam" ? config.isExamLocked : false,
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  rationale: q.rationale,
                });
              }
            }
          }
        }
      }

      if (questionsToSubmit.length === 0) {
        alert("No valid course-subject combinations found");
        setLoading(false);
        return;
      }

      await axios.post("/questions/bulk", { questions: questionsToSubmit });

      alert(`✅ Successfully added ${questionsToSubmit.length} questions across ${targetCourseIds.length} course(s) and ${targetSubjectIds.length} subject(s)!`);
      
      setQuestionList([]);
      setStep(1);
      setConfig({
        courseId: "",
        subjectId: "",
        type: "exam",
        examTime: "",
        isExamLocked: false,
        multiCourseMode: false,
        multiSubjectMode: false,
        selectedCourseIds: [],
        selectedSubjectIds: []
      });
      setCurrentQuestion({
        question: "",
        options: ["", ""],
        correctAnswer: "",
        rationale: "",
      });
      fetchQuestions();
    } catch (err) {
      console.error("Error submitting questions:", err);
      alert("Failed to submit questions: " + (err.response?.data?.message || err.message));
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
      multiCourseMode: false,
      multiSubjectMode: false,
      selectedCourseIds: [],
      selectedSubjectIds: []
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
      console.error("Error deleting question:", err);
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

    setIsMultiAssigning(true);
    try {
      const totalAssignments = selectedQuestions.length * courseIds.length * subjectIds.length;
      if (totalAssignments > 200) {
        if (!window.confirm(`This will create ${totalAssignments} new question assignments. Are you sure?`)) {
          setIsMultiAssigning(false);
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
        setIsMultiAssigning(false);
        return;
      }

      await axios.post("/questions/bulk", { questions: assignments });
      alert(`✅ Successfully assigned ${assignments.length} questions across ${courseIds.length} course(s) and ${subjectIds.length} subject(s)!`);
      
      setSelectedQuestions([]);
      setMultiAssignTargets({ courseIds: [], subjectIds: [] });
      setShowMultiAssign(false);
      fetchQuestions();
    } catch (err) {
      console.error("Error in multi-assign:", err);
      alert("Failed to assign questions: " + (err.response?.data?.message || err.message));
    } finally {
      setIsMultiAssigning(false);
    }
  };

  const toggleQuestionSelection = (qId) => {
    setSelectedQuestions(prev =>
      prev.includes(qId)
        ? prev.filter(id => id !== qId)
        : [...prev, qId]
    );
  };

  const selectAllQuestions = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q._id));
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      (!filter.courseId || q.courseId === filter.courseId) &&
      (!filter.subjectId || q.subjectId === filter.subjectId)
  );

  // ================= GROUPED VIEW FUNCTIONS =================
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

  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course?.name || "Unknown Course";
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const getSubjectsForCourseGroup = (courseId) => {
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

  // Filtered courses based on search
  const filteredCoursesForGroup = courses.filter(course => {
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

  // Stats
  const totalQuestions = questions.length;
  const examQuestions = questions.filter(q => q.type === "exam").length;
  const trialQuestions = questions.filter(q => q.type === "trial").length;
  const uniqueSubjects = new Set(questions.map(q => q.subjectId)).size;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Question Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, manage and organize exam questions with multi-course/subject assignment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <FaQuestionCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {questions.length} questions
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
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                setConfig({ 
                  courseId: "", 
                  subjectId: "", 
                  type: "exam", 
                  examTime: "", 
                  isExamLocked: false,
                  multiCourseMode: false,
                  multiSubjectMode: false,
                  selectedCourseIds: [],
                  selectedSubjectIds: []
                });
                setQuestionList([]);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <FaPlus className="h-4 w-4" />
              Add New Questions
            </button>

            {selectedQuestions.length > 0 && (
              <button
                onClick={() => setShowMultiAssign(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <FaLayerGroup className="h-4 w-4" />
                Assign to Multiple ({selectedQuestions.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Multi-Assign Modal */}
      {showMultiAssign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
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
                  disabled={isMultiAssigning || multiAssignTargets.courseIds.length === 0 || multiAssignTargets.subjectIds.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {isMultiAssigning ? (
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

      {/* Wizard Steps - KEPT COMPLETE */}
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
            {/* Step 1: Configuration - KEPT COMPLETE */}
            {step === 1 && (
              <div className="max-w-3xl mx-auto space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Exam Configuration
                </h3>
                
                {/* Multi-Assign Toggle */}
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.multiCourseMode}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setConfig({ 
                          ...config, 
                          multiCourseMode: checked,
                          multiSubjectMode: checked,
                          selectedCourseIds: checked ? [] : [],
                          selectedSubjectIds: checked ? [] : []
                        });
                      }}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Enable Multi-Course/Subject Assignment
                    </span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/50 px-2 py-1 rounded">
                      Beta
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-8">
                    Create these questions once and assign them to multiple courses and subjects simultaneously
                  </p>
                </div>

                {!config.multiCourseMode ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Courses
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {courses.map((c) => (
                          <label key={c._id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(config.selectedCourseIds || []).includes(c._id)}
                              onChange={() => handleMultiCourseToggle(c._id)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                          </label>
                        ))}
                        {courses.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2 text-center py-2">
                            No courses available
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Selected: {(config.selectedCourseIds || []).length} course(s)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Subjects for Selected Courses
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {getSubjectsForCourses(config.selectedCourseIds || []).map((s) => (
                          <label key={s._id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(config.selectedSubjectIds || []).includes(s._id)}
                              onChange={() => handleMultiSubjectToggle(s._id)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{s.name}</span>
                          </label>
                        ))}
                        {getSubjectsForCourses(config.selectedCourseIds || []).length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2 text-center py-2">
                            Select courses first to see available subjects
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Selected: {(config.selectedSubjectIds || []).length} subject(s)
                      </p>
                    </div>

                    {(config.selectedCourseIds || []).length > 0 && (config.selectedSubjectIds || []).length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                        <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                          <FaCheckCircle className="h-4 w-4" />
                          Questions will be created for {questionList.length} question(s) × {(config.selectedCourseIds || []).length} course(s) × {(config.selectedSubjectIds || []).length} subject(s) = 
                          <strong> {questionList.length * (config.selectedCourseIds || []).length * (config.selectedSubjectIds || []).length} total questions</strong>
                        </p>
                      </div>
                    )}
                  </>
                )}

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
                      if (config.multiCourseMode) {
                        if (!config.selectedCourseIds || config.selectedCourseIds.length === 0) {
                          alert("Please select at least one course");
                          return;
                        }
                        if (!config.selectedSubjectIds || config.selectedSubjectIds.length === 0) {
                          alert("Please select at least one subject");
                          return;
                        }
                      } else {
                        if (!config.courseId || !config.subjectId) {
                          alert("Please select course and subject");
                          return;
                        }
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

            {/* Step 2: Add Questions - KEPT COMPLETE */}
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

                  {config.multiCourseMode && (config.selectedCourseIds || []).length > 0 && (config.selectedSubjectIds || []).length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mt-2">
                      <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                        <FaCopy className="h-3 w-3" />
                        Each question will be added to {config.selectedCourseIds.length} course(s) × {config.selectedSubjectIds.length} subject(s)
                      </p>
                    </div>
                  )}
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

            {/* Step 3: Review & Submit - KEPT COMPLETE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Configuration Summary</h3>
                  
                  {!config.multiCourseMode ? (
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
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Courses ({config.selectedCourseIds?.length || 0})</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {config.selectedCourseIds?.map(id => {
                            const course = courses.find(c => c._id === id);
                            return course ? (
                              <span key={id} className="px-2 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded text-xs">
                                {course.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Subjects ({config.selectedSubjectIds?.length || 0})</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {config.selectedSubjectIds?.map(id => {
                            const subject = subjects.find(s => s._id === id);
                            return subject ? (
                              <span key={id} className="px-2 py-1 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded text-xs">
                                {subject.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Type</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{config.type}</p>
                      </div>
                      {config.type === "exam" && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{config.examTime} minutes</p>
                        </div>
                      )}
                    </div>
                  )}
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

      {/* ================= GROUPED EXISTING QUESTIONS LIST ================= */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Existing Questions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Browse questions grouped by course and subject</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48 md:w-64"
              />
            </div>
            {filteredQuestions.length > 0 && (
              <button
                onClick={selectAllQuestions}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                {selectedQuestions.length === filteredQuestions.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaQuestionCircle className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No questions found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first question using the wizard above</p>
            </div>
          ) : (
            // Group questions by course
            filteredCoursesForGroup.map((course) => {
              const courseQuestions = getQuestionsForCourse(course._id);
              const isCourseExpanded = expandedCourses[course._id];
              const subjectList = getSubjectsForCourseGroup(course._id);
              const allQuestionIds = courseQuestions.map(q => q._id);
              const allSelected = allQuestionIds.every(id => selectedQuestions.includes(id));

              return (
                <div key={course._id} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                  {/* Course Header */}
                  <div
                    className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between"
                    onClick={() => toggleCourse(course._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                        <FaGraduationCap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {course.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {courseQuestions.length} questions • {subjectList.length} subjects
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilter({ ...filter, courseId: course._id, subjectId: "" });
                          setStep(1);
                          setConfig({ 
                            ...config, 
                            courseId: course._id, 
                            subjectId: "",
                            multiCourseMode: false
                          });
                          setQuestionList([]);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <FaPlus className="h-3 w-3" />
                        Add
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllQuestions();
                        }}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <FaCheck className="h-3 w-3" />
                        {allSelected ? "Deselect" : "Select All"}
                      </button>
                      {isCourseExpanded ? (
                        <FaChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Course Content - Subjects */}
                  {isCourseExpanded && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {subjectList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
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
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-800/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
                                onClick={() => toggleSubject(subject._id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                    <FaBook className="h-3 w-3 text-white" />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                      {subject.name}
                                    </h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {subjectQuestions.length} questions
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFilter({ ...filter, courseId: course._id, subjectId: subject._id });
                                      setStep(1);
                                      setConfig({ 
                                        ...config, 
                                        courseId: course._id, 
                                        subjectId: subject._id,
                                        multiCourseMode: false
                                      });
                                      setQuestionList([]);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                  >
                                    <FaPlus className="h-2.5 w-2.5" />
                                    Add
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const questionIds = subjectQuestions.map(q => q._id);
                                      const allSubjectSelected = questionIds.every(id => selectedQuestions.includes(id));
                                      if (allSubjectSelected) {
                                        setSelectedQuestions(prev => prev.filter(id => !questionIds.includes(id)));
                                      } else {
                                        const newSelection = [...selectedQuestions];
                                        questionIds.forEach(id => {
                                          if (!newSelection.includes(id)) newSelection.push(id);
                                        });
                                        setSelectedQuestions(newSelection);
                                      }
                                    }}
                                    className="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                                  >
                                    <FaCheck className="h-2.5 w-2.5" />
                                    {subjectQuestions.every(q => selectedQuestions.includes(q._id)) ? "Deselect" : "Select All"}
                                  </button>
                                  {isSubjectExpanded ? (
                                    <FaChevronUp className="h-3 w-3 text-gray-400" />
                                  ) : (
                                    <FaChevronDown className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                              </div>

                              {/* Subject Questions */}
                              {isSubjectExpanded && (
                                <div className="px-4 py-3 bg-white dark:bg-gray-900">
                                  {subjectQuestions.length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-gray-400 py-2 text-sm">
                                      No questions in this subject
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {subjectQuestions.map((q) => {
                                        const isSelected = selectedQuestions.includes(q._id);
                                        return (
                                          <div
                                            key={q._id}
                                            className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                                              isSelected
                                                ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                            }`}
                                          >
                                            <div className="flex items-start gap-3">
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleQuestionSelection(q._id)}
                                                className="w-4 h-4 mt-1 text-blue-600 rounded"
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
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

                                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium break-words">
                                                  {q.question}
                                                </p>

                                                <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                                                  {q.options.map((opt, i) => {
                                                    const isCorrect = String.fromCharCode(65 + i) === q.correctAnswer;
                                                    return (
                                                      <p key={i} className={`text-xs ${
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
                                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded">
                                                    <strong>💡 Rationale:</strong> {q.rationale}
                                                  </p>
                                                )}
                                              </div>

                                              <div className="flex gap-1 flex-shrink-0">
                                                <button
                                                  onClick={() => handleEditExisting(q)}
                                                  className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded transition-colors"
                                                  title="Edit Question"
                                                >
                                                  <FaEdit className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteExisting(q._id)}
                                                  className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50 rounded transition-colors"
                                                  title="Delete Question"
                                                >
                                                  <FaTrash className="h-3.5 w-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
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
    </div>
  );
};

export default AdminQuestions;