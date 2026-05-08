// pages/lecturer/LecturerAttempts.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import { 
  Eye, Search, Filter, Loader2, Users, Clock, 
  CheckCircle, XCircle, AlertCircle, Calendar,
  Download, ChevronDown, TrendingUp, FileText,
  Star, ClipboardList, BookOpen
} from "lucide-react";

const LecturerAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", status: "", search: "" });
  const [stats, setStats] = useState({ totalAttempts: 0, completedAttempts: 0, averageScore: 0, passRate: 0 });

  useEffect(() => {
    fetchAttempts();
  }, [filter]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.type) params.append("type", filter.type);
      if (filter.status) params.append("status", filter.status);
      if (filter.search) params.append("search", filter.search);
      
      const res = await axios.get(`/api/lecturer/attempts?${params.toString()}`);
      if (res.data.success) {
        setAttempts(res.data.attempts);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Fetch attempts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (attempt) => {
    if (attempt.status === "completed") {
      return attempt.isPassed ? 
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <CheckCircle className="h-3 w-3" /> Passed
        </span> :
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          <XCircle className="h-3 w-3" /> Failed
        </span>;
    }
    return attempt.status === "in-progress" ?
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
        <Clock className="h-3 w-3" /> In Progress
      </span> :
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600">
        <AlertCircle className="h-3 w-3" /> Pending
      </span>;
  };

  const getTypeIcon = (type) => {
    const icons = {
      exam: <ClipboardList className="h-4 w-4" />,
      practice: <Star className="h-4 w-4" />,
      assignment: <FileText className="h-4 w-4" />,
      lesson: <BookOpen className="h-4 w-4" />
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Student Submissions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and grade student attempts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalAttempts}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Attempts</p>
        </div>
        <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedAttempts}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
        </div>
        <div className="rounded-xl bg-purple-50 dark:bg-purple-950/20 p-4">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.averageScore}%</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Average Score</p>
        </div>
        <div className="rounded-xl bg-orange-50 dark:bg-orange-950/20 p-4">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.passRate}%</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Pass Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or content..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Types</option>
            <option value="exam">Exams</option>
            <option value="practice">Practice</option>
            <option value="assignment">Assignments</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending Grading</option>
          </select>
        </div>
        <button
          onClick={fetchAttempts}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Attempts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt._id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {getTypeIcon(attempt.contentType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {attempt.studentName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {attempt.contentTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {getStatusBadge(attempt)}
                    {attempt.percentage > 0 && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {Math.round(attempt.percentage)}%
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString()}
                    </span>
                    {attempt.attemptNumber > 1 && (
                      <span className="text-xs text-gray-500">
                        Attempt #{attempt.attemptNumber}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/lecturer/attempts/${attempt._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {attempt.status === "completed" && !attempt.lecturerFeedback ? "Grade" : "Review"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerAttempts;