// pages/admin/PerformanceDashboard.jsx - Professional styling with dark mode
import { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ChartLine,
  Users,
  BookOpen,
  Trophy,
  Download,
  RotateCcw,
  Eye,
  X,
  CheckCircle,
  Trash2,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  Clock
} from "lucide-react";

const PerformanceDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchAllStudents();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSubjects(selectedCourse);
      setSelectedSubject("");
      setSelectedStudent("");
      setPerformance(null);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedSubject) {
      fetchPerformanceData();
    }
  }, [selectedSubject, selectedStudent]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to fetch courses");
    }
  };

  const fetchSubjects = async (courseId) => {
    try {
      const res = await axios.get(`/subjects?course=${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      toast.error("Failed to fetch subjects");
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get("/users/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchPerformanceData = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    setPerformance(null);
    
    try {
      let res;
      if (selectedStudent) {
        res = await axios.get(`/lesson-quiz/student/${selectedStudent}/progress`);
      } else {
        res = await axios.get(`/lesson-quiz/subject/${selectedSubject}/performance`);
      }
      setPerformance(res.data);
    } catch (err) {
      console.error("Error fetching performance:", err);
      const errorMsg = err.response?.data?.message || "Failed to fetch performance data";
      toast.error(errorMsg);
      setPerformance({ attempts: [], stats: { averageScore: 0, passRate: 0, totalAttempts: 0, completedLessons: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleAllowRetake = async (attemptId, studentName, lessonTitle) => {
    if (!window.confirm(`Allow ${studentName} to retake "${lessonTitle}"? The new result will replace the old one.`)) {
      return;
    }
    
    try {
      await axios.post(`/lesson-quiz/allow-retake/${attemptId}`);
      toast.success(`Retake permission granted for ${studentName}`);
      await fetchPerformanceData();
    } catch (err) {
      console.error("Error allowing retake:", err);
      toast.error(err.response?.data?.message || "Failed to allow retake");
    }
  };

  const handleDeleteAttempt = async (attemptId, studentName, lessonTitle) => {
    if (!window.confirm(`Are you sure you want to DELETE this attempt for ${studentName} - "${lessonTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await axios.delete(`/lesson-quiz/attempt/${attemptId}`);
      toast.success(`Successfully deleted attempt for ${studentName}`);
      await fetchPerformanceData();
    } catch (err) {
      console.error("Error deleting attempt:", err);
      toast.error(err.response?.data?.message || "Failed to delete attempt");
    }
  };

  const viewAttemptDetails = (attempt) => {
    setSelectedAttempt(attempt);
    setShowDetailsModal(true);
  };

  const exportReport = () => {
    if (!performance) return;
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      subject: subjects.find(s => s._id === selectedSubject)?.name || "N/A",
      course: courses.find(c => c._id === selectedCourse)?.name || "N/A",
      student: selectedStudent ? students.find(s => s._id === selectedStudent)?.name : "All Students",
      stats: performance.stats,
      attempts: performance.attempts?.map(a => ({
        student: a.userName,
        email: a.userEmail,
        lesson: a.lessonId?.title || "N/A",
        score: `${a.score}/${a.totalPoints}`,
        percentage: `${Math.round(a.percentage)}%`,
        status: a.isPassed ? "Passed" : "Failed",
        date: a.completedAt ? new Date(a.completedAt).toLocaleDateString() : "N/A",
      })),
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `performance_report_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    toast.success("Report exported successfully");
  };

  const filteredAttempts = performance?.attempts?.filter(attempt => 
    attempt.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.lessonId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedSubjectName = subjects.find(s => s._id === selectedSubject)?.name || "";
  const selectedCourseName = courses.find(c => c._id === selectedCourse)?.name || "";
  const selectedStudentName = students.find(s => s._id === selectedStudent)?.name || "";

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Performance Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track student performance, quiz results, and learning analytics
          </p>
          {selectedSubjectName && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <BookOpen className="h-4 w-4" />
              <span>{selectedCourseName}</span>
              <span>•</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{selectedSubjectName}</span>
              {selectedStudentName && (
                <>
                  <span>•</span>
                  <span>Student: {selectedStudentName}</span>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={exportReport}
          disabled={!performance || !performance.attempts?.length}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                disabled={!selectedCourse}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student (Optional)
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                disabled={!selectedSubject}
              >
                <option value="">All Students</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">Loading performance data...</p>
        </div>
      )}

      {/* No Selection State */}
      {!selectedSubject && !loading && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <ChartLine className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Data Selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Select a course and subject to view performance analytics
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {performance && !loading && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(performance.stats?.averageScore || 0)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pass Rate</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(performance.stats?.passRate || 0)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {performance.stats?.totalAttempts || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lessons Completed</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {performance.stats?.completedLessons || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by student name, email, or lesson..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4 text-left font-medium">Student</th>
                    <th className="px-6 py-4 text-left font-medium">Lesson</th>
                    <th className="px-6 py-4 text-left font-medium">Score</th>
                    <th className="px-6 py-4 text-left font-medium">Percentage</th>
                    <th className="px-6 py-4 text-left font-medium">Status</th>
                    <th className="px-6 py-4 text-left font-medium">Date</th>
                    <th className="px-6 py-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredAttempts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No attempts found matching your search
                      </td>
                    </tr>
                  ) : (
                    filteredAttempts.map((attempt, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{attempt.userName || "Unknown"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{attempt.userEmail || "No email"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 dark:text-gray-100">{attempt.lessonId?.title || "N/A"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{attempt.score || 0} / {attempt.totalPoints || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${attempt.percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(attempt.percentage || 0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {attempt.isPassed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-medium">
                              <CheckCircle className="h-3 w-3" />
                              Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-medium">
                              <X className="h-3 w-3" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewAttemptDetails(attempt)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAllowRetake(attempt._id, attempt.userName, attempt.lessonId?.title)}
                              className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-colors"
                              title="Allow Retake"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAttempt(attempt._id, attempt.userName, attempt.lessonId?.title)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete Attempt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredAttempts.length === 0 ? (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No attempts found matching your search</p>
              </div>
            ) : (
              filteredAttempts.map((attempt, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{attempt.userName || "Unknown"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{attempt.userEmail || "No email"}</p>
                    </div>
                    {attempt.isPassed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-medium">
                        <X className="h-3 w-3" />
                        Failed
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lesson</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{attempt.lessonId?.title || "N/A"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{attempt.score || 0} / {attempt.totalPoints || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{Math.round(attempt.percentage || 0)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewAttemptDetails(attempt)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAllowRetake(attempt._id, attempt.userName, attempt.lessonId?.title)}
                        className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAttempt(attempt._id, attempt.userName, attempt.lessonId?.title)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Attempt Details Modal */}
      {showDetailsModal && selectedAttempt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto animate-scaleIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quiz Attempt Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedAttempt.userName} • {selectedAttempt.lessonId?.title || "Unknown Lesson"}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedAttempt.score || 0} / {selectedAttempt.totalPoints || 0}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{Math.round(selectedAttempt.percentage || 0)}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`text-xl font-bold ${selectedAttempt.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAttempt.isPassed ? 'Passed' : 'Failed'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed On</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {selectedAttempt.completedAt ? new Date(selectedAttempt.completedAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>

              {/* Questions Section */}
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Question Answers</h3>
              <div className="space-y-3">
                {selectedAttempt.questions?.map((q, idx) => (
                  <div key={idx} className={`border rounded-xl p-4 ${q.isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20' : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'}`}>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{idx + 1}. {q.questionText || "No question text"}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        Student's answer: 
                        <span className={q.isCorrect ? 'text-green-600 dark:text-green-400 font-medium ml-1' : 'text-red-600 dark:text-red-400 font-medium ml-1'}>
                          {q.selected || "None"}. {q.selectedText || 'No answer'}
                        </span>
                      </p>
                      {!q.isCorrect && (
                        <p className="text-green-600 dark:text-green-400">
                          Correct answer: {q.correct || "Unknown"}. {q.correctText || ""}
                        </p>
                      )}
                      {q.rationale && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          💡 {q.rationale}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleAllowRetake(selectedAttempt._id, selectedAttempt.userName, selectedAttempt.lessonId?.title);
                }}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Allow Retake
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleDeleteAttempt(selectedAttempt._id, selectedAttempt.userName, selectedAttempt.lessonId?.title);
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Attempt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;