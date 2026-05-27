// pages/lecturer/LecturerProgressSelect.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowRight,
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  ChevronRight,
  Star,
  Activity,
  BarChart3,
  UserCheck,
  UserX,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";

const LecturerProgressSelect = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [stats, setStats] = useState({ total: 0, withAttempts: 0, avgScore: 0 });

  useEffect(() => {
    fetchAssignedResources();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsWithPerformance();
    }
  }, [selectedCourse, selectedSubject, search]);

  const fetchAssignedResources = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        axios.get("/lecturer/assigned-courses"),
        axios.get("/lecturer/assigned-subjects"),
      ]);
      
      if (coursesRes.data.success) {
        setCourses(coursesRes.data.courses || []);
        if (coursesRes.data.courses.length > 0 && !selectedCourse) {
          setSelectedCourse(coursesRes.data.courses[0]._id);
        }
      }
      if (subjectsRes.data.success) {
        setSubjects(subjectsRes.data.subjects || []);
        if (subjectsRes.data.subjects.length > 0 && !selectedSubject) {
          setSelectedSubject(subjectsRes.data.subjects[0]._id);
        }
      }
    } catch (err) {
      console.error("Error fetching assigned resources:", err);
      toast.error("Failed to fetch assigned courses and subjects");
    }
  };

  const fetchStudentsWithPerformance = async () => {
  setLoading(true);
  try {
    // Use the dedicated lecturer endpoint instead of /users/students
    const studentsRes = await axios.get("/lecturer/my-students-list");
    
    if (!studentsRes.data.success) {
      setStudents([]);
      setStats({ total: 0, withAttempts: 0, avgScore: 0 });
      setLoading(false);
      return;
    }
    
    let allCourseStudents = studentsRes.data.students || [];
    
    // Filter by selected course if needed
    if (selectedCourse) {
      allCourseStudents = allCourseStudents.filter(s => 
        s.courseId?._id === selectedCourse || s.courseId === selectedCourse
      );
    }
    
    if (!selectedSubject) {
      const formattedStudents = allCourseStudents.map(student => ({
        _id: student._id,
        name: student.name,
        email: student.email,
        courseName: student.courseName,
        totalAttempts: 0,
        averageScore: 0,
        passedAttempts: 0,
        hasAttempts: false
      }));
      
      setStudents(formattedStudents);
      setStats({ 
        total: formattedStudents.length, 
        withAttempts: 0, 
        avgScore: 0 
      });
      setLoading(false);
      return;
    }
    
    // Fetch performance data for the selected subject
    const perfRes = await axios.get(`/lecturer/performance/subject/${selectedSubject}`);
    const attempts = perfRes.data.attempts || [];
    
    // Create a map of student performance
    const performanceMap = new Map();
    
    attempts.forEach(attempt => {
      const studentId = attempt.userId?._id || attempt.userId;
      if (!studentId) return;
      
      if (!performanceMap.has(studentId)) {
        performanceMap.set(studentId, {
          totalScore: 0,
          passedCount: 0,
          count: 0
        });
      }
      const perf = performanceMap.get(studentId);
      perf.totalScore += (attempt.percentage || 0);
      if (attempt.isPassed) perf.passedCount++;
      perf.count++;
    });
    
    const studentsWithData = allCourseStudents.map(student => {
      const perf = performanceMap.get(student._id);
      
      if (perf && perf.count > 0) {
        return {
          ...student,
          totalAttempts: perf.count,
          averageScore: Math.round(perf.totalScore / perf.count),
          passedAttempts: perf.passedCount,
          hasAttempts: true
        };
      } else {
        return {
          ...student,
          totalAttempts: 0,
          averageScore: 0,
          passedAttempts: 0,
          hasAttempts: false
        };
      }
    });
    
    let filtered = studentsWithData;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower)
      );
    }
    
    filtered.sort((a, b) => a.name?.localeCompare(b.name));
    
    const studentsWithAttempts = studentsWithData.filter(s => s.hasAttempts);
    const avgScore = studentsWithAttempts.length > 0
      ? Math.round(studentsWithAttempts.reduce((sum, s) => sum + s.averageScore, 0) / studentsWithAttempts.length)
      : 0;
    
    setStudents(filtered);
    setStats({
      total: studentsWithData.length,
      withAttempts: studentsWithAttempts.length,
      avgScore
    });
    
  } catch (err) {
    console.error("Error fetching students:", err);
    toast.error("Failed to fetch student data");
    setStudents([]);
    setStats({ total: 0, withAttempts: 0, avgScore: 0 });
  } finally {
    setLoading(false);
  }
};

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
    if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
    return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30";
  };

  const getScoreRingColor = (score) => {
    if (score >= 80) return "stroke-emerald-500 dark:stroke-emerald-400";
    if (score >= 60) return "stroke-amber-500 dark:stroke-amber-400";
    return "stroke-rose-500 dark:stroke-rose-400";
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return "bg-emerald-500 dark:bg-emerald-400";
    if (score >= 60) return "bg-amber-500 dark:bg-amber-400";
    return "bg-rose-500 dark:bg-rose-400";
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="mt-6 text-gray-500 dark:text-gray-400 font-medium">Loading student data...</p>
        </div>
      </div>
    );
  }

  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section - Reduced padding */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span className="text-white/90 text-sm font-semibold tracking-wide uppercase">Performance Analytics</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Student Progress Dashboard
              </h1>
              <p className="text-base text-white/90 max-w-2xl">
                Gain deep insights into student performance, track learning analytics, 
                and identify opportunities for intervention.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <Sparkles className="h-10 w-10 text-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Increased top margin for more spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12">
        {/* Filter Card - Added more margin top */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Filters</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Course
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Subject
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!selectedCourse}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                  >
                    <option value="">Select a subject</option>
                    {subjects
                      .filter(s => s.courseId?._id === selectedCourse || s.courseId === selectedCourse)
                      .map(subject => (
                        <option key={subject._id} value={subject._id}>{subject.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only show when filters are selected */}
        {selectedSubject && selectedCourse && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-2xl shadow-lg p-6 text-white group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Users className="h-8 w-8 opacity-90" />
                  <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Enrolled</span>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.total}</p>
                <p className="text-sm opacity-90">Total Students Enrolled</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-2xl shadow-lg p-6 text-white group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Activity className="h-8 w-8 opacity-90" />
                  <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.withAttempts}</p>
                <p className="text-sm opacity-90">Students with Attempts</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-2xl shadow-lg p-6 text-white group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Award className="h-8 w-8 opacity-90" />
                  <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Average</span>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.avgScore}%</p>
                <p className="text-sm opacity-90">Average Performance Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Subject Context Banner - Only when subject selected */}
        {selectedSubject && selectedSubjectObj && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Currently analyzing</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedSubjectObj.name}</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  {stats.withAttempts} active learners
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Students Grid */}
        {!selectedCourse ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-6">
              <GraduationCap className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Course Selected</h3>
            <p className="text-gray-500 dark:text-gray-400">Please select a course from the filter above to view student progress</p>
          </div>
        ) : !selectedSubject ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-6">
              <BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Subject Selected</h3>
            <p className="text-gray-500 dark:text-gray-400">Please select a subject to view student performance data</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-6">
              <UserX className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Students Found</h3>
            <p className="text-gray-500 dark:text-gray-400">No students are currently enrolled in this course</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{students.length}</span> of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span> students
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Active learners</span>
                <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 ml-2"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Inactive</span>
              </div>
            </div>

            {/* Student Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <div
                  key={student._id}
                  onClick={() => navigate(`/lecturer/students/${student._id}/progress?subject=${selectedSubject}`)}
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  {/* Gradient Border Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ padding: '2px', margin: '-2px', zIndex: 0 }}></div>
                  
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-bold text-lg">
                              {student.name?.charAt(0) || "S"}
                            </span>
                          </div>
                          {student.hasAttempts && (
                            <div className="absolute -top-1 -right-1">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900"></div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {student.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{student.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Course Info */}
                    {student.courseName && (
                      <div className="mb-4 inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <GraduationCap className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{student.courseName}</span>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {student.hasAttempts ? (
                      <div className="space-y-3">
                        {/* Score Circle */}
                        <div className="flex items-center justify-between">
                          <div className="relative inline-flex items-center justify-center">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="#e5e7eb"
                                strokeWidth="4"
                                fill="none"
                                className="dark:stroke-gray-700"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${(student.averageScore / 100) * 175.9} 175.9`}
                                className={getScoreRingColor(student.averageScore)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">{student.averageScore}%</span>
                            </div>
                          </div>
                          <div className="flex-1 ml-3 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Attempts</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{student.totalAttempts}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Passed</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{student.passedAttempts}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Failed</span>
                              <span className="font-semibold text-rose-600 dark:text-rose-400">{student.totalAttempts - student.passedAttempts}</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Performance</span>
                            <span className={`font-medium ${getScoreColor(student.averageScore)}`}>
                              {student.averageScore}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(student.averageScore)}`}
                              style={{ width: `${student.averageScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                        <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No attempts recorded yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Student hasn't started this subject</p>
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <button className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-center gap-2 group/btn">
                        View Full Analytics
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LecturerProgressSelect;