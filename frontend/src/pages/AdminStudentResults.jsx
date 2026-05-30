// src/pages/AdminStudentResults.jsx
import React, { useState, useEffect } from "react";
import { 
  FaSpinner, FaSearch, FaFilter, FaEye, FaDownload, 
  FaChartLine, FaUserGraduate, FaCheckCircle, FaTimesCircle,
  FaCalendarAlt, FaAward, FaTrophy, FaClock, FaTimes,
  FaFileExcel, FaPrint
} from "react-icons/fa";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const AdminStudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchResults();
    fetchCourses();
    fetchSubjects();
    fetchStats();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await API.get("/results/admin/all");
      setResults(res.data);
    } catch (err) {
      console.error("Error fetching results:", err);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/results/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          result.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || result.courseId === selectedCourse;
    const matchesSubject = selectedSubject === "all" || result.subjectId === selectedSubject;
    const matchesStatus = selectedStatus === "all" || 
                          (selectedStatus === "passed" && result.score >= (result.passingScore || 50)) ||
                          (selectedStatus === "failed" && result.score < (result.passingScore || 50));
    return matchesSearch && matchesCourse && matchesSubject && matchesStatus;
  });

  const getStatusBadge = (score, passingScore = 50) => {
    const passed = score >= passingScore;
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
      day: 'numeric'
    });
  };

  const exportToCSV = () => {
    const headers = ["Student Name", "Email", "Course", "Subject", "Score", "Status", "Date"];
    const csvData = filteredResults.map(r => [
      r.studentName,
      r.studentEmail,
      r.courseName || "N/A",
      r.subjectName || "N/A",
      `${r.score}%`,
      r.score >= (r.passingScore || 50) ? "Passed" : "Failed",
      formatDate(r.completedAt)
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_results_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported successfully!");
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Student Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage student exam and quiz results
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
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts || 0}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
              </div>
              <FaUserGraduate className="text-3xl text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{stats.passedCount || 0}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Passed</p>
              </div>
              <FaTrophy className="text-3xl text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{stats.failedCount || 0}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Failed</p>
              </div>
              <FaTimesCircle className="text-3xl text-red-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.averageScore || 0}%</p>
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
            placeholder="Search by student name or email..."
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
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Courses</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>{course.name}</option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject._id} value={subject._id}>{subject.name}</option>
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
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
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
          <FaUserGraduate className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No results found</p>
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
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Student</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Course</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Subject</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Score</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Date</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{result.studentName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{result.studentEmail}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{result.courseName || "N/A"}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{result.subjectName || "N/A"}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(result.score, result.passingScore)}</td>
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
            {filteredResults.map((result) => (
              <div key={result._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{result.studentName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{result.studentEmail}</p>
                  </div>
                  {getStatusBadge(result.score, result.passingScore)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Course:</span>
                    <span className="text-gray-900 dark:text-white">{result.courseName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                    <span className="text-gray-900 dark:text-white">{result.subjectName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Score:</span>
                    <span className={`font-semibold ${getScoreColor(result.score)}`}>{result.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <span className="text-gray-600 dark:text-gray-400">{formatDate(result.completedAt)}</span>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Result Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedResult.studentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedResult.studentEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Course</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedResult.courseName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Subject</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedResult.subjectName || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Score Info */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Score Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(selectedResult.score)}`}>{selectedResult.score}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                    <div>{getStatusBadge(selectedResult.score, selectedResult.passingScore)}</div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Passing Score</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedResult.passingScore || 50}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedResult.completedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Questions Breakdown */}
              {selectedResult.answers && selectedResult.answers.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Question Breakdown</h3>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentResults;