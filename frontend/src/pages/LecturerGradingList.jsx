// pages/lecturer/LecturerGradingList.jsx - Add visibility refresh
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Calendar,
  Eye,
  Star,
  ChevronDown,
  TrendingUp,
  Award,
  RefreshCw
} from "lucide-react";

const LecturerGradingList = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendingGrading: 0,
    graded: 0,
    averageScore: 0,
    passRate: 0
  });
  const [filter, setFilter] = useState({ status: "", search: "" });
  const [showFilters, setShowFilters] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/grading/pending";
      if (filter.status) url += `?status=${filter.status}`;
      
      const res = await axios.get(url);
      setSubmissions(res.data.submissions || []);
      setStats(res.data.stats || { total: 0, pendingGrading: 0, graded: 0, averageScore: 0, passRate: 0 });
    } catch (err) {
      console.error("Error fetching submissions:", err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [filter.status]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Refresh when page becomes visible again (after returning from grading)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSubmissions();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchSubmissions]);

  const handleGradeClick = (submissionId) => {
    navigate(`/lecturer/grading/${submissionId}`);
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.studentName?.toLowerCase().includes(filter.search.toLowerCase()) ||
    sub.studentEmail?.toLowerCase().includes(filter.search.toLowerCase()) ||
    sub.lessonTitle?.toLowerCase().includes(filter.search.toLowerCase())
  );

  const getStatusBadge = (submission) => {
    if (!submission.isGraded) {
      return { icon: <Clock className="h-3 w-3" />, text: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400" };
    }
    if (submission.isPassed) {
      return { icon: <CheckCircle className="h-3 w-3" />, text: "Passed", color: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" };
    }
    return { icon: <XCircle className="h-3 w-3" />, text: "Failed", color: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Grade Assignments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and grade student submissions
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Grading</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingGrading}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Graded</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.graded}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.averageScore}%</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pass Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.passRate}%</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
              <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by student name, email, or lesson..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="">All Submissions</option>
              <option value="pending">Pending Grading</option>
              <option value="graded">Already Graded</option>
            </select>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-gray-500 dark:text-gray-400 border-b">
                <th className="px-6 py-4 text-left font-medium">Student</th>
                <th className="px-6 py-4 text-left font-medium">Lesson</th>
                <th className="px-6 py-4 text-left font-medium">Score</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Submitted</th>
                <th className="px-6 py-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No submissions found
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const status = getStatusBadge(sub);
                  return (
                    <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{sub.studentName || "Unknown"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{sub.studentEmail || "No email"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{sub.lessonTitle || "N/A"}</td>
                      <td className="px-6 py-4">
                        {sub.isGraded ? (
                          <span className="font-medium text-gray-900 dark:text-gray-100">{sub.score} / {sub.totalPoints}</span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon} {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleGradeClick(sub._id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Grade Now
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LecturerGradingList;