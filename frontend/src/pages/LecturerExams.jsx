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
  FaBan,
  FaCopy,
  FaLayerGroup
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

  // Multi-assignment state for existing questions
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
  const [submitting, setSubmitting] = useState(false);
  const [editingExistingQuestion, setEditingExistingQuestion] = useState(null);

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

  // Get subjects for multiple course selection
  const getSubjectsForCourses = (courseIds) => {
    if (!courseIds || !courseIds.length || !assignedSubjects.length) return [];
    const subjectSet = new Set();
    const result = [];
    assignedSubjects.forEach(s => {
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
    }
  };

  const handleMultiCourseToggle = (courseId) => {
    const current = config.selectedCourseIds || [];
    const newSelection = current.includes(courseId)
      ? current.filter(id => id !== courseId)
      : [...current, courseId];
    setConfig({ ...config, selectedCourseIds: newSelection });
    
    // Auto-select subjects for selected courses
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

  const editExistingQuestion = (question) => {
    setConfig({
      courseId: question.courseId?._id || question.courseId,
      subjectId: question.subjectId?._id || question.subjectId,
      type: question.type,
      examTime: question.examTime || "",
      isExamLocked: question.isLocked || false,
      multiCourseMode: false,
      multiSubjectMode: false,
      selectedCourseIds: [],
      selectedSubjectIds: []
    });
    
    setQuestionList([{
      _id: question._id,
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

    // Determine which courses and subjects to submit to
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
      toast.error("Please select at least one course");
      return;
    }

    if (targetSubjectIds.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    setSubmitting(true);
    try {
      const totalQuestions = questionList.length;
      const totalTargets = targetCourseIds.length * targetSubjectIds.length;
      const totalToCreate = totalQuestions * totalTargets;

      if (totalToCreate > 100) {
        if (!window.confirm(`This will create ${totalToCreate} questions across ${totalTargets} combinations. Are you sure?`)) {
          setSubmitting(false);
          return;
        }
      }

      const questionsToSubmit = [];
      
      // For each course and subject combination
      for (const courseId of targetCourseIds) {
        for (const subjectId of targetSubjectIds) {
          // Check if subject belongs to this course
          const subject = assignedSubjects.find(s => s._id === subjectId);
          if (subject) {
            const subjectCourseId = subject.courseId?._id?.toString() || subject.courseId?.toString() || subject.courseId;
            if (subjectCourseId === courseId) {
              // Add all questions for this combination
              for (const q of questionList) {
                questionsToSubmit.push({
                  courseId: courseId,
                  subjectId: subjectId,
                  type: config.type,
                  examTime: config.type === "exam" ? config.examTime : 0,
                  isLocked: config.type === "exam" ? config.isExamLocked : false,
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  rationale: q.rationale,
                  status: "pending",
                  source: "lecturer",
                  ...(q._id && { _id: q._id }),
                });
              }
            }
          }
        }
      }

      if (questionsToSubmit.length === 0) {
        toast.error("No valid course-subject combinations found");
        setSubmitting(false);
        return;
      }

      if (editingExistingQuestion) {
        // Update existing question - only update the specific question, not bulk
        await axios.put(`/questions/lecturer/${editingExistingQuestion._id}`, {
          ...questionsToSubmit[0],
          status: "pending",
        });
        toast.success(`✅ Question updated and resubmitted for admin approval!`);
      } else {
        await axios.post("/questions/lecturer/bulk", { questions: questionsToSubmit });
        toast.success(`✅ ${questionsToSubmit.length} questions submitted for admin approval across ${targetCourseIds.length} course(s) and ${targetSubjectIds.length} subject(s)!`);
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
      setEditingExistingQuestion(null);
      
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

  // Multi-assign existing questions to multiple courses/subjects
  const handleMultiAssign = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question to assign");
      return;
    }

    const { courseIds, subjectIds } = multiAssignTargets;
    if (courseIds.length === 0 || subjectIds.length === 0) {
      toast.error("Please select at least one course and one subject");
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
          const subject = assignedSubjects.find(s => s._id === subjectId);
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
                    examTime: original.examTime || 0,
                    isLocked: original.isLocked || false,
                    question: original.question,
                    options: original.options,
                    correctAnswer: original.correctAnswer,
                    rationale: original.rationale || "",
                    status: "pending",
                    source: "lecturer",
                  });
                }
              }
            }
          }
        }
      }

      if (assignments.length === 0) {
        toast.error("No valid course-subject combinations found");
        setIsMultiAssigning(false);
        return;
      }

      await axios.post("/questions/lecturer/bulk", { questions: assignments });
      toast.success(`✅ ${assignments.length} questions assigned across ${courseIds.length} course(s) and ${subjectIds.length} subject(s)!`);
      
      setSelectedQuestions([]);
      setMultiAssignTargets({ courseIds: [], subjectIds: [] });
      setShowMultiAssign(false);
      fetchMyQuestions();
    } catch (err) {
      console.error("Error in multi-assign:", err);
      toast.error(err.response?.data?.message || "Failed to assign questions");
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

  // Get courses for selected questions (only show courses that the lecturer is assigned to)
  const getAvailableCoursesForMultiAssign = () => {
    // Only show courses that the lecturer has assigned to them
    return assignedCourses;
  };

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
                  {getAvailableCoursesForMultiAssign().map(c => (
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
                  <div className="max-w-3xl mx-auto space-y-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {editingExistingQuestion ? "Edit Exam Configuration" : "Exam Configuration"}
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
                      // Single mode - original behavior
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
                      </>
                    ) : (
                      // Multi mode - select multiple courses and subjects
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Courses
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                            {assignedCourses.map((c) => (
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
                            {assignedCourses.length === 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2 text-center py-2">
                                No courses assigned to you
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
                              Questions will be created for {questionList.length || 0} question(s) × {(config.selectedCourseIds || []).length} course(s) × {(config.selectedSubjectIds || []).length} subject(s) = 
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
                              multiCourseMode: false,
                              multiSubjectMode: false,
                              selectedCourseIds: [],
                              selectedSubjectIds: []
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
                          if (config.multiCourseMode) {
                            if (!config.selectedCourseIds || config.selectedCourseIds.length === 0) {
                              toast.error("Please select at least one course");
                              return;
                            }
                            if (!config.selectedSubjectIds || config.selectedSubjectIds.length === 0) {
                              toast.error("Please select at least one subject");
                              return;
                            }
                          } else {
                            if (!config.courseId || !config.subjectId) {
                              toast.error("Please select course and subject");
                              return;
                            }
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

                {/* Step 3: Submit for Approval */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <FaPaperPlane className="h-5 w-5 text-blue-500" />
                        {editingExistingQuestion ? "Resubmit for Admin Approval" : "Submit for Admin Approval"}
                      </h3>
                      
                      {!config.multiCourseMode ? (
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
                      ) : (
                        <div className="space-y-3 text-sm mb-4">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Courses ({config.selectedCourseIds?.length || 0})</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {config.selectedCourseIds?.map(id => {
                                const course = assignedCourses.find(c => c._id === id);
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
                                const subject = assignedSubjects.find(s => s._id === id);
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
                          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 mt-2">
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              Total questions to create: {questionList.length} × {config.selectedCourseIds?.length || 0} × {config.selectedSubjectIds?.length || 0} = <strong>{questionList.length * (config.selectedCourseIds?.length || 0) * (config.selectedSubjectIds?.length || 0)}</strong>
                            </p>
                          </div>
                        </div>
                      )}
                      
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
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Exam Questions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Questions you've created. Pending questions need admin approval.
                </p>
              </div>
              {filteredQuestions.length > 0 && (
                <button
                  onClick={selectAllQuestions}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedQuestions.length === filteredQuestions.length ? "Deselect All" : "Select All"}
                </button>
              )}
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
                  const isSelected = selectedQuestions.includes(q._id);
                  return (
                    <div key={q._id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleQuestionSelection(q._id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
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
                        <div className="flex gap-2 ml-4">
                          {(q.status === "rejected" || q.status === "pending") && (
                            <button
                              onClick={() => editExistingQuestion(q)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                              title="Edit Question"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          )}
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