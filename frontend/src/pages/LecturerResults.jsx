// pages/lecturer/LecturerResults.jsx - FULLY FIXED WITH DARK MODE SUPPORT
import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  TrendingUp, Users, Award, Star, Calendar, Download,
  Loader2, Filter, ChevronDown, Activity, Zap, Eye,
  Trash2, RotateCcw, X, CheckCircle, XCircle, FileText,
  Search
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const LecturerResults = () => {
  const [examResults, setExamResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchExamResults();
    fetchAssignedResources();
  }, [selectedCourse, selectedSubject]);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedSubject) params.subjectId = selectedSubject;
      
      const res = await axios.get("/lecturer/exam-results", { params });
      setExamResults(res.data);
      calculateAnalytics(res.data);
    } catch (err) {
      console.error("Fetch exam results error:", err);
      toast.error("Failed to fetch exam results");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedResources = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        axios.get("/lecturer/assigned-courses"),
        axios.get("/lecturer/assigned-subjects"),
      ]);
      
      if (coursesRes.data.success) setCourses(coursesRes.data.courses || []);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.subjects || []);
    } catch (err) {
      console.error("Error fetching assigned resources:", err);
    }
  };

  const calculateAnalytics = (results) => {
    const totalAttempts = results.length;
    const passedCount = results.filter(r => r.result === "pass").length;
    const averageScore = totalAttempts > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalAttempts) 
      : 0;
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
    
    const subjectPerformance = {};
    results.forEach(r => {
      const subjectName = r.subjectName || "Unknown";
      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = { total: 0, sum: 0, count: 0 };
      }
      subjectPerformance[subjectName].sum += (r.percentage || 0);
      subjectPerformance[subjectName].count++;
      subjectPerformance[subjectName].total = Math.round(subjectPerformance[subjectName].sum / subjectPerformance[subjectName].count);
    });
    
    const contentPerformance = Object.entries(subjectPerformance).map(([name, data]) => ({
      title: name,
      averageScore: data.total
    }));
    
    const performanceDistribution = [
      { name: "Excellent (90%+)", value: results.filter(r => r.percentage >= 90).length },
      { name: "Good (70-89%)", value: results.filter(r => r.percentage >= 70 && r.percentage < 90).length },
      { name: "Average (50-69%)", value: results.filter(r => r.percentage >= 50 && r.percentage < 70).length },
      { name: "Poor (<50%)", value: results.filter(r => r.percentage < 50).length }
    ];
    
    const studentMap = new Map();
    results.forEach(r => {
      const studentId = r.userId?._id || r.userId;
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentName: r.userName || r.userId?.name,
          studentEmail: r.userEmail || r.userId?.email,
          totalScore: 0,
          count: 0
        });
      }
      const student = studentMap.get(studentId);
      student.totalScore += (r.percentage || 0);
      student.count++;
    });
    
    const studentPerformance = Array.from(studentMap.values()).map(s => ({
      studentName: s.studentName,
      studentEmail: s.studentEmail,
      averageScore: Math.round(s.totalScore / s.count),
      totalAttempts: s.count
    })).sort((a, b) => b.averageScore - a.averageScore);
    
    setAnalytics({
      totalStudents: studentMap.size,
      totalContent: subjects.length,
      averageScore,
      passRate,
      contentPerformance,
      performanceDistribution,
      studentPerformance
    });
  };

  const handleAllowResit = async (attemptId) => {
    try {
      await axios.patch(`/lecturer/exam-attempt/${attemptId}/resit`);
      toast.success("Resit permission granted");
      setExamResults(prev =>
        prev.map(r => (r._id === attemptId ? { ...r, resitAllowed: true } : r))
      );
    } catch (err) {
      toast.error("Failed to allow resit");
    }
  };

  const handleDelete = async (attemptId) => {
    if (!window.confirm("Are you sure you want to delete this exam attempt? This action cannot be undone.")) return;
    try {
      await axios.delete(`/lecturer/exam-attempt/${attemptId}`);
      toast.success("Exam attempt deleted successfully");
      setExamResults(prev => prev.filter(r => r._id !== attemptId));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const viewDetails = async (attemptId) => {
    try {
      const res = await axios.get(`/lecturer/exam-attempt/${attemptId}/details`);
      setSelectedResult(res.data);
      setShowDetails(true);
    } catch (err) {
      toast.error("Failed to load details");
    }
  };

  const exportReport = () => {
    if (!examResults.length) return;
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats: analytics,
      results: examResults.map(r => ({
        student: r.userName,
        course: r.courseName,
        subject: r.subjectName,
        score: `${r.score}/${r.totalQuestions}`,
        percentage: `${r.percentage}%`,
        result: r.result,
        submittedAt: new Date(r.submittedAt).toLocaleDateString()
      }))
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `lecturer_exam_results_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    toast.success("Report exported successfully");
  };

  const filteredResults = examResults.filter(result => {
    const matchesSearch = searchTerm === "" || 
      (result.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (result.courseName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (result.subjectName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const PIE_COLORS = {
    'Excellent (90%+)': '#22c55e',
    'Good (70-89%)': '#3b82f6',
    'Average (50-69%)': '#eab308',
    'Poor (<50%)': '#ef4444'
  };

  const getPieColor = (name) => PIE_COLORS[name] || '#8884d8';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Custom Tooltip for charts with dark mode support
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label || payload[0]?.payload?.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Value: <span className="font-bold text-gray-900 dark:text-gray-100">{payload[0]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Pie Tooltip
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = analytics?.performanceDistribution?.reduce((sum, item) => sum + item.value, 0) || 0;
      const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Count: <span className="font-bold text-gray-900 dark:text-gray-100">{payload[0].value}</span> students
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: <span className="font-bold text-gray-900 dark:text-gray-100">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-gray-700 dark:text-gray-300">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Results & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive performance insights and student exam tracking</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportReport}
            disabled={!examResults.length}
            className="px-3 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Students</p>
              <p className="text-2xl font-bold">{analytics?.totalStudents || 0}</p>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Exam Attempts</p>
              <p className="text-2xl font-bold">{examResults.length}</p>
            </div>
            <FileText className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Average Score</p>
              <p className="text-2xl font-bold">{analytics?.averageScore || 0}%</p>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pass Rate</p>
              <p className="text-2xl font-bold">{analytics?.passRate || 0}%</p>
            </div>
            <Zap className="h-8 w-8 opacity-80" />
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
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                <select 
                  value={selectedCourse} 
                  onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSubject(""); }} 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedCourse}
                >
                  <option value="">All Subjects</option>
                  {subjects
                    .filter(s => s.courseId?._id === selectedCourse || s.courseId === selectedCourse)
                    .map(subject => (
                      <option key={subject._id} value={subject._id}>{subject.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search by student, course, or subject..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => { setSelectedCourse(""); setSelectedSubject(""); setSearchTerm(""); }} 
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Subject Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.contentPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="title" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                domain={[0, 100]}
                tickLine={{ stroke: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="averageScore" fill="#3b82f6" name="Avg Score (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Student Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={analytics?.performanceDistribution || []} 
                cx="50%" 
                cy="50%" 
                labelLine={true} 
                label={({ name, percent }) => { 
                  const pct = (percent * 100).toFixed(0); 
                  return pct > 5 ? `${pct}%` : ''; 
                }} 
                outerRadius={90} 
                dataKey="value" 
                nameKey="name"
              >
                {(analytics?.performanceDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPieColor(entry.name)} stroke="#1f2937" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Students Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Performing Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Average Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {analytics?.studentPerformance?.slice(0, 5).map((student, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.studentName || "N/A"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{student.studentEmail || ""}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{student.averageScore}%</span>
                      <div className="flex-1 max-w-24">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${student.averageScore}%` }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.totalAttempts} attempts</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <Star className="h-3 w-3" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Table */}
      {examResults.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Student Exam Results</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Detailed exam attempts and performance metrics</p>
          </div>
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
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{result.userName || "N/A"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{result.userEmail || ""}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{result.courseName || "N/A"}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{result.subjectName || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">{result.score}/{result.totalQuestions || "?"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              result.percentage >= 70 ? 'bg-green-500' : 
                              result.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${result.percentage}%` }} 
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{result.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {result.result === "pass" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                          <CheckCircle className="h-3 w-3" /> Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">
                          <XCircle className="h-3 w-3" /> Fail
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {result.resitAllowed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
                          <RotateCcw className="h-3 w-3" /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleAllowResit(result._id)} 
                          disabled={result.resitAllowed} 
                          className={`p-1.5 rounded-lg transition-colors ${
                            result.resitAllowed 
                              ? "text-gray-400 cursor-not-allowed" 
                              : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                          }`}
                          title="Allow Resit"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(result._id)} 
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => viewDetails(result._id)} 
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="px-3 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="px-3 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && examResults.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center bg-white dark:bg-gray-900">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Exam Results Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {searchTerm || selectedCourse || selectedSubject 
                ? "No results match your search criteria" 
                : "No exam attempts have been recorded for your assigned subjects yet"}
            </p>
          </div>
        </div>
      )}

      {/* Details Modal - Dark Mode Ready */}
      {showDetails && selectedResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Exam Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedResult.userName} • {selectedResult.subjectName}
                </p>
              </div>
              <button 
                onClick={() => setShowDetails(false)} 
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedResult.score}/{selectedResult.totalQuestions}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(selectedResult.percentage)}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Result</p>
                  <p className={`text-xl font-bold ${selectedResult.result === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedResult.result === 'pass' ? 'Passed' : 'Failed'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(selectedResult.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Questions Section */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Question Details</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {selectedResult.questionResults?.map((qr, idx) => (
                  <div 
                    key={idx} 
                    className={`border rounded-xl p-4 ${
                      qr.isCorrect 
                        ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20' 
                        : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {qr.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          {idx + 1}. {qr.questionText}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Student's answer: 
                          <span className={qr.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {' '}{qr.userAnswer || 'None'}
                          </span>
                        </p>
                        {!qr.isCorrect && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Correct answer: {qr.correctAnswer}
                          </p>
                        )}
                        {qr.rationale && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            💡 {qr.rationale}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <button 
                onClick={() => setShowDetails(false)} 
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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

export default LecturerResults;