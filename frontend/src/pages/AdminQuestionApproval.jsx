// pages/admin/AdminQuestionApproval.jsx - FIXED WITH CORRECT STATS
import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaHourglassHalf,
  FaEye,
  FaBan,
  FaUserGraduate,
  FaBook,
  FaGraduationCap,
  FaClock,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const AdminQuestionApproval = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState({ courseId: "", subjectId: "", search: "" });
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ 
    pending: 0, 
    approved: 0, 
    rejected: 0, 
    total: 0 
  });

  useEffect(() => {
    fetchQuestions();
    fetchCourses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, filter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // Fetch ALL questions with status pending, approved, rejected
      const res = await axios.get("/questions/pending-with-stats");
      setQuestions(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (questionsData) => {
    setStats({
      pending: questionsData.filter(q => q.status === "pending").length,
      approved: questionsData.filter(q => q.status === "approved").length,
      rejected: questionsData.filter(q => q.status === "rejected").length,
      total: questionsData.length,
    });
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];
    
    if (filter.courseId) {
      filtered = filtered.filter(q => {
        const qCourseId = typeof q.courseId === 'object' ? q.courseId?._id : q.courseId;
        return qCourseId === filter.courseId;
      });
    }
    
    if (filter.subjectId) {
      filtered = filtered.filter(q => {
        const qSubjectId = typeof q.subjectId === 'object' ? q.subjectId?._id : q.subjectId;
        return qSubjectId === filter.subjectId;
      });
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchLower) ||
        q.createdBy?.name?.toLowerCase().includes(searchLower) ||
        q.createdBy?.email?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredQuestions(filtered);
  };

  const handleApprove = async (questionId) => {
    setProcessingId(questionId);
    try {
      await axios.post(`/questions/${questionId}/approve`);
      toast.success("Question approved successfully!");
      await fetchQuestions(); // Refresh to update stats
    } catch (err) {
      console.error("Error approving question:", err);
      toast.error(err.response?.data?.message || "Failed to approve question");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setProcessingId(selectedQuestion?._id);
    try {
      await axios.post(`/questions/${selectedQuestion._id}/reject`, { 
        rejectionReason 
      });
      toast.success("Question rejected successfully");
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedQuestion(null);
      await fetchQuestions(); // Refresh to update stats
    } catch (err) {
      console.error("Error rejecting question:", err);
      toast.error(err.response?.data?.message || "Failed to reject question");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (question) => {
    setSelectedQuestion(question);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Helper function to get display name from ID object
  const getDisplayName = (item) => {
    if (!item) return "N/A";
    if (typeof item === 'object' && item.name) return item.name;
    if (typeof item === 'string') return item;
    return "N/A";
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "pending":
        return { icon: <FaHourglassHalf className="h-3 w-3" />, text: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400" };
      case "approved":
        return { icon: <FaCheckCircle className="h-3 w-3" />, text: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" };
      case "rejected":
        return { icon: <FaBan className="h-3 w-3" />, text: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" };
      default:
        return { icon: <FaQuestionCircle className="h-3 w-3" />, text: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  const getTypeBadge = (type) => {
    return type === "exam" 
      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
      : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Question Approval
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and approve exam questions submitted by lecturers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <FaHourglassHalf className="h-3 w-3" />
              {stats.pending} Pending
            </span>
          </div>
          <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <FaCheck className="h-3 w-3" />
              {stats.approved} Approved
            </span>
          </div>
          <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <FaTimes className="h-3 w-3" />
              {stats.rejected} Rejected
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview - UPDATED with correct counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
              <FaHourglassHalf className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {stats.approved}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
              <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {stats.rejected}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
              <FaBan className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
              <FaEye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

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
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by question or lecturer..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filter.courseId}
              onChange={(e) => setFilter({ ...filter, courseId: e.target.value, subjectId: "" })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
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
              {subjects
                .filter(s => s.courseId === filter.courseId)
                .map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Questions List - Show ALL questions with status filter tabs */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Questions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Review and manage questions submitted by lecturers
              </p>
            </div>
            {/* Status filter buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter({ ...filter, statusFilter: "all" })}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter.statusFilter === "all" || !filter.statusFilter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter({ ...filter, statusFilter: "pending" })}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter.statusFilter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter({ ...filter, statusFilter: "approved" })}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter.statusFilter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilter({ ...filter, statusFilter: "rejected" })}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter.statusFilter === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaCheckCircle className="h-12 w-12 text-green-300 dark:text-green-700 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No questions found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {filter.statusFilter === "pending" 
                  ? "All questions have been reviewed" 
                  : "No questions match your filters"}
              </p>
            </div>
          ) : (
            filteredQuestions
              .filter(q => {
                if (filter.statusFilter === "all" || !filter.statusFilter) return true;
                return q.status === filter.statusFilter;
              })
              .map((q) => {
                const status = getStatusBadge(q.status);
                const isPending = q.status === "pending";
                
                return (
                  <div key={q._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Header badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${status.color}`}>
                            {status.icon}
                            {status.text}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadge(q.type)}`}>
                            {q.type === "exam" ? "📝 Exam" : "📖 Practice"}
                          </span>
                          {q.type === "exam" && q.examTime && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center gap-1">
                              <FaClock className="h-3 w-3" />
                              {q.examTime} min
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FaUserGraduate className="h-3 w-3" />
                            {getDisplayName(q.createdBy)}
                          </span>
                        </div>

                        {/* Question text */}
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          {q.question}
                        </h4>

                        {/* Options */}
                        <div className="space-y-1.5 mb-3">
                          {q.options.map((opt, i) => {
                            const isCorrect = String.fromCharCode(65 + i) === q.correctAnswer;
                            return (
                              <p key={i} className={`text-sm ${isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                                {String.fromCharCode(65 + i)}. {opt}
                                {isCorrect && " ✓ (Correct Answer)"}
                              </p>
                            );
                          })}
                        </div>

                        {/* Rationale */}
                        {q.rationale && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">📖 Rationale:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{q.rationale}</p>
                          </div>
                        )}

                        {/* Course/Subject info */}
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaBook className="h-3 w-3" />
                            Subject: {getDisplayName(q.subjectId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaGraduationCap className="h-3 w-3" />
                            Course: {getDisplayName(q.courseId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="h-3 w-3" />
                            Submitted: {q.submittedForApprovalAt ? new Date(q.submittedForApprovalAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>

                        {/* Rejection reason if rejected */}
                        {q.rejectionReason && q.status === "rejected" && (
                          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">❌ Rejection Reason:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{q.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {isPending && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleApprove(q._id)}
                            disabled={processingId === q._id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center gap-2"
                          >
                            {processingId === q._id ? (
                              <FaSpinner className="h-4 w-4 animate-spin" />
                            ) : (
                              <FaCheckCircle className="h-4 w-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(q)}
                            disabled={processingId === q._id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center gap-2"
                          >
                            <FaTimesCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Reject Question
              </h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FaTimesCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Question: <span className="font-medium text-gray-900 dark:text-gray-100">{selectedQuestion.question}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Explain why this question is being rejected..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                This reason will be sent to the lecturer
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedQuestion._id}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {processingId === selectedQuestion._id ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaBan className="h-4 w-4" />
                )}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionApproval;