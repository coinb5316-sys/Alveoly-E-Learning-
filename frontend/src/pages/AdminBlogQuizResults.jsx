// src/pages/AdminBlogQuizResults.jsx
import React, { useState, useEffect } from "react";
import { 
  FaSpinner, FaSearch, FaFilter, FaEye, FaDownload, 
  FaChartLine, FaUserGraduate, FaCheckCircle, FaTimesCircle,
  FaCalendarAlt, FaTrophy, FaClock, FaTimes, FaFileExcel,
  FaBlog, FaQuestionCircle, FaBrain
} from "react-icons/fa";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const AdminBlogQuizResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchQuizResults();
    fetchBlogs();
  }, []);

  const fetchQuizResults = async () => {
    try {
      setLoading(true);
      const res = await API.get("/blogs/quiz-results");
      setResults(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error("Error fetching quiz results:", err);
      toast.error("Failed to load quiz results");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      const blogsWithQuizzes = res.data.blogs.filter(blog => blog.hasQuiz === true);
      setBlogs(blogsWithQuizzes);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  const calculateStats = (data) => {
    const totalAttempts = data.length;
    const passedCount = data.filter(r => r.passed === true).length;
    const failedCount = data.filter(r => r.passed === false).length;
    const averageScore = data.length > 0 
      ? Math.round(data.reduce((sum, r) => sum + (r.percentage || 0), 0) / data.length) 
      : 0;
    
    setStats({ totalAttempts, passedCount, failedCount, averageScore });
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          result.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          result.blogTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlog = selectedBlog === "all" || result.blogId === selectedBlog;
    const matchesStatus = selectedStatus === "all" || 
                          (selectedStatus === "passed" && result.passed === true) ||
                          (selectedStatus === "failed" && result.passed === false);
    return matchesSearch && matchesBlog && matchesStatus;
  });

  const getStatusBadge = (passed) => {
    return passed ? (
      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs flex items-center gap-1">
        <FaCheckCircle className="text-xs" /> Passed
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs flex items-center gap-1">
        <FaTimesCircle className="text-xs" /> Failed
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ["User Name", "Email", "Blog Post", "Score", "Percentage", "Status", "Date"];
    const csvData = filteredResults.map(r => [
      r.userName,
      r.userEmail || "N/A",
      r.blogTitle,
      `${r.score}/${r.totalQuestions}`,
      `${r.percentage}%`,
      r.passed ? "Passed" : "Failed",
      formatDate(r.completedAt)
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blog_quiz_results_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Quiz results exported successfully!");
  };

  const viewResultDetails = (result) => {
    setSelectedResult(result);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Blog Quiz Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage student quiz attempts from blog posts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            disabled={filteredResults.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <FaFileExcel /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
              </div>
              <FaBrain className="text-3xl text-purple-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{stats.passedCount}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Passed</p>
              </div>
              <FaTrophy className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{stats.failedCount}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Failed</p>
              </div>
              <FaTimesCircle className="text-3xl text-red-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.averageScore}%</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Avg. Score</p>
              </div>
              <FaChartLine className="text-3xl text-purple-500 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by user name, email, or blog post..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-12 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base"
          />
        </div>
        
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <FaFilter /> Filters
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden sm:flex flex-wrap gap-3">
        <select
          value={selectedBlog}
          onChange={(e) => setSelectedBlog(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Blog Posts</option>
          {blogs.map(blog => (
            <option key={blog._id} value={blog._id}>{blog.title}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Status</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Mobile Filters Dropdown */}
      {mobileFiltersOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900 dark:text-white">Filters</span>
            <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500">
              <FaTimes />
            </button>
          </div>
          <select
            value={selectedBlog}
            onChange={(e) => setSelectedBlog(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Blog Posts</option>
            {blogs.map(blog => (
              <option key={blog._id} value={blog._id}>{blog.title.substring(0, 30)}...</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      )}

      {/* Results Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="text-3xl md:text-4xl text-blue-600 animate-spin" />
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <FaQuestionCircle className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No quiz results found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">User</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Blog Post</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Score</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Percentage</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Date</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{result.userName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{result.userEmail || "No email"}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaBlog className="text-blue-500 text-xs" />
                          <span className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">
                            {result.blogTitle}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {result.score}/{result.totalQuestions}
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${getScoreColor(result.percentage)}`}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(result.passed)}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(result.completedAt)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => viewResultDetails(result)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredResults.map((result, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{result.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{result.userEmail || "No email"}</p>
                  </div>
                  {getStatusBadge(result.passed)}
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <FaBlog className="text-blue-500" />
                    <span className="line-clamp-1">{result.blogTitle}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Score</p>
                    <p className="font-medium text-gray-900 dark:text-white">{result.score}/{result.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Percentage</p>
                    <p className={`font-semibold ${getScoreColor(result.percentage)}`}>{result.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{formatDate(result.completedAt)}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => viewResultDetails(result)}
                    className="w-full py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <FaEye /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Result Details Modal */}
      {showDetailsModal && selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaBrain className="text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Result Details</h2>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedResult.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedResult.userEmail || "Not provided"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Blog Post</p>
                    <Link to={`/blog/${selectedResult.blogSlug}`} target="_blank" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {selectedResult.blogTitle}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Score Info */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quiz Score</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedResult.score}/{selectedResult.totalQuestions}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Percentage</p>
                    <p className={`text-2xl font-bold ${getScoreColor(selectedResult.percentage)}`}>
                      {selectedResult.percentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                    <div>{getStatusBadge(selectedResult.passed)}</div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Passing Score</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedResult.passingScore}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedResult.completedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Questions Breakdown */}
              {selectedResult.answers && selectedResult.answers.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaQuestionCircle className="text-blue-500" />
                    Question Breakdown
                  </h3>
                  <div className="space-y-3">
                    {selectedResult.answers.map((answer, idx) => (
                      <div key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            Question {idx + 1}: {answer.question}
                          </p>
                          {answer.isCorrect ? (
                            <FaCheckCircle className="text-green-500 flex-shrink-0 ml-2" />
                          ) : (
                            <FaTimesCircle className="text-red-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Your answer: <span className="font-medium">{answer.userAnswer}</span>
                        </p>
                        {!answer.isCorrect && answer.correctAnswer && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Correct answer: {answer.correctAnswer}
                          </p>
                        )}
                        {answer.explanation && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            💡 {answer.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setShowDetailsModal(false)}
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

export default AdminBlogQuizResults;