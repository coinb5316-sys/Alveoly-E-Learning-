// AdminExamResults.jsx - Professional styling with dark mode
import { useEffect, useState } from "react";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Trash2,
  RotateCcw,
  Eye,
  FileText,
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download
} from "lucide-react";

const AdminExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [filters, setFilters] = useState({
    courseId: "",
    subjectId: "",
    userId: "",
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.userId) params.userId = filters.userId;

      const res = await axios.get("/admin/exam-results", { params });
      setResults(res.data);
    } catch (err) {
      console.error("Fetch results failed", err);
      toast.error("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDelete = async (attemptId) => {
    if (!window.confirm("Are you sure you want to delete this exam attempt? This action cannot be undone.")) return;
    try {
      await axios.delete(`/admin/exam-attempt/${attemptId}`);
      toast.success("Exam attempt deleted successfully");
      setResults((prev) => prev.filter((r) => r._id !== attemptId));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleResit = async (attemptId) => {
    try {
      await axios.patch(`/admin/exam-attempt/${attemptId}/resit`);
      toast.success("Resit permission granted");
      setResults((prev) =>
        prev.map((r) => (r._id === attemptId ? { ...r, resitAllowed: true } : r))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to allow resit");
    }
  };

  const handleFilter = () => {
    fetchResults();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ courseId: "", subjectId: "", userId: "" });
    setSearchTerm("");
  };

  const viewDetails = async (attemptId) => {
    try {
      const res = await axios.get(`/admin/exam-attempt/${attemptId}/details`);
      setSelectedResult(res.data);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    }
  };

  // Filter results based on search
  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === "" || 
      (result.userId?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (result.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (result.courseId?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (result.subjectId?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalAttempts = results.length;
  const passedCount = results.filter(r => r.result === "pass").length;
  const failedCount = results.filter(r => r.result === "fail").length;
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length) 
    : 0;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Exam Results Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor student performance, manage attempts and resits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalAttempts} Attempts
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {totalAttempts}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
                {passedCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
                {failedCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
                {averageScore}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters & Search</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Course Name or ID"
                value={filters.courseId}
                onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Subject Name or ID"
                value={filters.subjectId}
                onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Student Name or ID"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by student or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">Loading results...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredResults.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Exam Results Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {searchTerm || filters.courseId || filters.subjectId || filters.userId
                ? "No results match your search criteria"
                : "No exam attempts have been recorded yet"}
            </p>
            {(searchTerm || filters.courseId || filters.subjectId || filters.userId) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && filteredResults.length > 0 && (
        <div className="hidden lg:block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-left font-medium">Student</th>
                  <th className="px-6 py-4 text-left font-medium">Course</th>
                  <th className="px-6 py-4 text-left font-medium">Subject</th>
                  <th className="px-6 py-4 text-left font-medium">Score</th>
                  <th className="px-6 py-4 text-left font-medium">%</th>
                  <th className="px-6 py-4 text-left font-medium">Result</th>
                  <th className="px-6 py-4 text-left font-medium">Resit</th>
                  <th className="px-6 py-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {result.userId?.name || result.userName || "User Deleted"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {result.courseId?.name || result.courseName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {result.subjectId?.name || result.subjectName || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {result.score}/{result.totalQuestions || "?"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${result.percentage >= 70 ? 'bg-green-500' : result.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {result.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {result.result === "pass" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-medium">
                          <CheckCircle className="h-3 w-3" />
                          Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-medium">
                          <XCircle className="h-3 w-3" />
                          Fail
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {result.resitAllowed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-medium">
                          <RotateCcw className="h-3 w-3" />
                          Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium">
                          <XCircle className="h-3 w-3" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleResit(result._id)}
                          disabled={result.resitAllowed}
                          className={`p-1.5 rounded-lg transition-colors ${
                            result.resitAllowed
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                          }`}
                          title="Allow Resit"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(result._id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Attempt"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => viewDetails(result._id)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && filteredResults.length > 0 && (
        <div className="lg:hidden space-y-4">
          {paginatedResults.map((result) => (
            <div key={result._id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {result.userId?.name || result.userName || "User Deleted"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {result.courseId?.name || result.courseName || "N/A"} • {result.subjectId?.name || result.subjectName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleResit(result._id)}
                    disabled={result.resitAllowed}
                    className={`p-2 rounded-lg ${
                      result.resitAllowed
                        ? "text-gray-400"
                        : "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                    }`}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(result._id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => viewDetails(result._id)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {result.score}/{result.totalQuestions || "?"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{result.percentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Result</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    result.result === "pass"
                      ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                  }`}>
                    {result.result === "pass" ? "Pass" : "Fail"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Resit</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    result.resitAllowed
                      ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}>
                    {result.resitAllowed ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${result.percentage >= 70 ? 'bg-green-500' : result.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${result.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{result.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredResults.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl animate-scaleIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Exam Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Detailed breakdown of student performance
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedResult.userId?.name || selectedResult.userName}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Course & Subject</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedResult.courseId?.name || selectedResult.courseName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedResult.subjectId?.name || selectedResult.subjectName}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                  <p className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                    {selectedResult.score}/{selectedResult.totalQuestions}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedResult.percentage}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(selectedResult.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(selectedResult.submittedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Result Badge */}
              <div className="mb-6 p-4 rounded-xl text-center">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
                  selectedResult.result === "pass"
                    ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                }`}>
                  {selectedResult.result === "pass" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="font-semibold">
                    {selectedResult.result === "pass" ? "Passed" : "Failed"}
                  </span>
                </div>
              </div>

              {/* Questions Section */}
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Question Details</h3>
              <div className="space-y-3">
                {selectedResult.questionResults?.map((qr, idx) => (
                  <div key={idx} className={`border rounded-xl p-4 ${
                    qr.isCorrect
                      ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20"
                      : "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {qr.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {idx + 1}. {qr.questionText}
                        </p>
                        <div className="space-y-1 ml-4">
                          <p className="text-sm">
                            Student's answer:
                            <span className={qr.isCorrect ? 'text-green-600 dark:text-green-400 ml-1' : 'text-red-600 dark:text-red-400 ml-1'}>
                              {qr.userAnswer ? `${qr.userAnswer}` : 'None'}
                              {qr.userAnswerText && ` - "${qr.userAnswerText}"`}
                            </span>
                          </p>
                          {!qr.isCorrect && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Correct answer: "{qr.correctAnswer}"
                            </p>
                          )}
                        </div>
                        {qr.rationale && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            💡 {qr.rationale}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamResults;