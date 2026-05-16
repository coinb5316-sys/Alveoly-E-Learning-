// pages/lecturer/LecturerStudentProgress.jsx - BILLION DOLLAR PROFESSIONAL EDITION
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  BookOpen,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Zap,
  Loader2,
  Download,
  Eye,
  Activity,
  Brain,
  LineChart as LineChartIcon,
  Layers,
  Medal,
  Flame,
  Trophy,
  GraduationCap,
  AlertCircle,
  FileText,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Star,
  User,
  School,
  BarChart,
  LineChart as LineChartIcon2,
  PieChart,
  TrendingDown,
  Globe,
  Shield,
  Zap as ZapIcon,
  Crown,
  Gem,
  Rocket
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Legend,
  Area,
  AreaChart,
  Cell
} from "recharts";

const LecturerStudentProgress = () => {
  const { studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [hasAnyData, setHasAnyData] = useState(false);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    passedCount: 0,
    failedCount: 0,
    bestScore: 0,
    worstScore: 0,
    totalTimeSpent: 0,
    streakCount: 0,
    improvementRate: 0,
  });

  const queryParams = new URLSearchParams(location.search);
  const subjectFromUrl = queryParams.get("subject");

  useEffect(() => {
    if (!studentId) {
      toast.error("No student selected. Please select a student from the students list.");
      navigate("/lecturer/students");
      return;
    }
    
    if (subjectFromUrl) {
      setSelectedSubject(subjectFromUrl);
    }
    
    fetchAssignedResources();
  }, [studentId]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentData();
      fetchStudentProgress();
    }
  }, [studentId, selectedSubject, selectedCourse]);

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
      }
    } catch (err) {
      console.error("Error fetching assigned resources:", err);
      toast.error("Failed to fetch assigned courses and subjects");
    }
  };

  const fetchStudentData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCourse) params.append("courseId", selectedCourse);
      
      const studentsRes = await axios.get(`/users/students?${params.toString()}`);
      const allStudents = studentsRes.data || [];
      const foundStudent = allStudents.find(s => s._id === studentId);
      
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        toast.error("Student not found");
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      toast.error("Failed to load student data");
    }
  };

  const fetchStudentProgress = async () => {
    setLoading(true);
    try {
      if (!selectedSubject) {
        setHasAnyData(false);
        setAttempts([]);
        setStats({
          totalAttempts: 0,
          averageScore: 0,
          passedCount: 0,
          failedCount: 0,
          bestScore: 0,
          worstScore: 0,
          totalTimeSpent: 0,
          streakCount: 0,
          improvementRate: 0,
        });
        setLoading(false);
        return;
      }
      
      const perfRes = await axios.get(`/lesson-quiz/subject/${selectedSubject}/performance`);
      const allAttempts = perfRes.data.attempts || [];
      
      const studentAttempts = allAttempts.filter(attempt => {
        const attemptStudentId = attempt.userId?._id || attempt.userId;
        return attemptStudentId === studentId;
      });
      
      const formattedAttempts = studentAttempts.map(attempt => ({
        _id: attempt._id,
        title: attempt.lessonId?.title || "Quiz",
        type: "quiz",
        score: attempt.score || 0,
        totalPoints: attempt.totalPoints || 0,
        percentage: attempt.percentage || 0,
        isPassed: attempt.isPassed || false,
        submittedAt: attempt.completedAt || attempt.submittedAt,
        subjectName: subjects.find(s => s._id === selectedSubject)?.name || "Unknown",
        subjectId: selectedSubject
      }));
      
      const hasValidData = formattedAttempts.length > 0;
      setHasAnyData(hasValidData);
      setAttempts(formattedAttempts);
      
      if (hasValidData) {
        calculateStats(formattedAttempts);
      } else {
        setStats({
          totalAttempts: 0,
          averageScore: 0,
          passedCount: 0,
          failedCount: 0,
          bestScore: 0,
          worstScore: 0,
          totalTimeSpent: 0,
          streakCount: 0,
          improvementRate: 0,
        });
      }
      
    } catch (err) {
      console.error("Error fetching progress:", err);
      toast.error("Failed to load student progress");
      setHasAnyData(false);
      setAttempts([]);
      setStats({
        totalAttempts: 0,
        averageScore: 0,
        passedCount: 0,
        failedCount: 0,
        bestScore: 0,
        worstScore: 0,
        totalTimeSpent: 0,
        streakCount: 0,
        improvementRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attemptsList) => {
    const totalAttempts = attemptsList.length;
    
    let averageScore = 0;
    let passedCount = 0;
    let failedCount = 0;
    let bestScore = 0;
    let worstScore = 0;
    let totalTimeSpent = 0;
    let streakCount = 0;
    let improvementRate = 0;
    
    if (totalAttempts > 0) {
      averageScore = Math.round(attemptsList.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts);
      passedCount = attemptsList.filter(a => a.isPassed).length;
      failedCount = totalAttempts - passedCount;
      bestScore = Math.max(...attemptsList.map(a => a.percentage || 0));
      worstScore = Math.min(...attemptsList.map(a => a.percentage || 0));
      totalTimeSpent = Math.round(attemptsList.length * 15);
      
      let currentStreak = 0;
      for (let i = attemptsList.length - 1; i >= 0; i--) {
        if (attemptsList[i].isPassed) {
          currentStreak++;
        } else {
          break;
        }
      }
      streakCount = currentStreak;
      
      if (attemptsList.length >= 2) {
        const firstHalf = attemptsList.slice(0, Math.floor(attemptsList.length / 2)).reduce((sum, a) => sum + (a.percentage || 0), 0) / Math.floor(attemptsList.length / 2);
        const secondHalf = attemptsList.slice(-Math.floor(attemptsList.length / 2)).reduce((sum, a) => sum + (a.percentage || 0), 0) / Math.floor(attemptsList.length / 2);
        improvementRate = Math.round(secondHalf - firstHalf);
      }
    }
    
    setStats({
      totalAttempts,
      averageScore,
      passedCount,
      failedCount,
      bestScore,
      worstScore,
      totalTimeSpent,
      streakCount,
      improvementRate,
    });
  };

  const performanceTrendData = attempts.map((attempt, index) => ({
    attempt: index + 1,
    score: attempt.percentage || 0,
    passed: attempt.isPassed ? attempt.percentage : null,
  }));

  const scoreDistribution = [
    { range: "90-100%", count: attempts.filter(a => a.percentage >= 90).length, color: "#22c55e" },
    { range: "80-89%", count: attempts.filter(a => a.percentage >= 80 && a.percentage < 90).length, color: "#3b82f6" },
    { range: "70-79%", count: attempts.filter(a => a.percentage >= 70 && a.percentage < 80).length, color: "#8b5cf6" },
    { range: "60-69%", count: attempts.filter(a => a.percentage >= 60 && a.percentage < 70).length, color: "#eab308" },
    { range: "50-59%", count: attempts.filter(a => a.percentage >= 50 && a.percentage < 60).length, color: "#f97316" },
    { range: "<50%", count: attempts.filter(a => a.percentage < 50 && a.percentage > 0).length, color: "#ef4444" }
  ];

  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);

  // Helper function to get score color
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium">Loading student analytics...</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster position="top-right" />
        
        {/* Header with Glassmorphism */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/lecturer/students")}
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-all duration-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">Back to Students</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/20 dark:border-indigo-800/30">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Student Analytics</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Performance Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Comprehensive tracking and learning insights</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
              </div>
              
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedCourse}
                  className="appearance-none px-4 py-2.5 pr-10 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Select Subject</option>
                  {subjects
                    .filter(s => s.courseId?._id === selectedCourse || s.courseId === selectedCourse)
                    .map(subject => (
                      <option key={subject._id} value={subject._id}>{subject.name}</option>
                    ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
              </div>
              
              <button 
                onClick={() => fetchStudentProgress()}
                className="group px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student Profile Card - Premium Glass Card */}
        {student && (
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
              <div className="relative px-6 py-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl ring-4 ring-white/50 dark:ring-slate-800/50">
                      <span className="text-white text-4xl font-bold">
                        {student.name?.charAt(0) || "S"}
                      </span>
                    </div>
                    {hasAnyData && (
                      <div className="absolute -top-2 -right-2">
                        <div className="relative">
                          <div className="w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></div>
                          <div className="absolute inset-0 w-5 h-5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
                      {hasAnyData && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full">
                          Active Learner
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        Joined {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-center shadow-lg">
                      <p className="text-3xl font-bold text-white">{stats.totalAttempts}</p>
                      <p className="text-xs text-white/80">Total Attempts</p>
                    </div>
                    <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-center shadow-lg">
                      <p className="text-3xl font-bold text-white">{stats.averageScore}%</p>
                      <p className="text-xs text-white/80">Avg Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty States */}
        {(!selectedCourse || !selectedSubject) && !loading && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
                <School className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Select a Subject</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Please select a course and subject from the filters above to view student progress.
              </p>
            </div>
          </div>
        )}

        {selectedCourse && selectedSubject && !hasAnyData && !loading && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 to-orange-400 dark:from-amber-700 dark:to-orange-700 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 flex items-center justify-center">
                <FileText className="h-12 w-12 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Activity Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                This student hasn't completed any quizzes or exams for <span className="font-medium text-indigo-600 dark:text-indigo-400">{selectedSubjectObj?.name}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Main Dashboard - Only when data exists */}
        {hasAnyData && !loading && (
          <>
            {/* Subject Context Banner */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-800/30 rounded-xl p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Currently Viewing</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedSubjectObj?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active Performance</span>
                    </div>
                    <div className="px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {stats.totalAttempts} Total Attempts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Average Score Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Target className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-bold">{stats.averageScore}%</span>
                  </div>
                  <p className="text-sm text-white/80 mb-2">Average Score</p>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${stats.averageScore}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Pass/Fail Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{stats.passedCount}</span>
                      <span className="text-white/50 text-lg">/</span>
                      <span className="text-2xl font-bold">{stats.failedCount}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mb-2">Passed / Failed</p>
                  <div className="flex gap-1 h-1.5">
                    <div className="h-full bg-white rounded-full flex-1" style={{ width: `${(stats.passedCount / stats.totalAttempts) * 100}%` }}></div>
                    <div className="h-full bg-white/30 rounded-full flex-1" style={{ width: `${(stats.failedCount / stats.totalAttempts) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Flame className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-bold">{stats.streakCount}</span>
                  </div>
                  <p className="text-sm text-white/80">Current Streak</p>
                  <p className="text-xs text-white/60 mt-1">Consecutive passes</p>
                </div>
              </div>

              {/* Improvement Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <span className={`text-3xl font-bold ${stats.improvementRate >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {stats.improvementRate > 0 ? `+${stats.improvementRate}` : stats.improvementRate}%
                    </span>
                  </div>
                  <p className="text-sm text-white/80">Improvement Rate</p>
                  <p className="text-xs text-white/60 mt-1">Recent performance trend</p>
                </div>
              </div>
            </div>

            {/* Premium Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
              <nav className="flex gap-1">
                {[
                  { id: "overview", label: "Overview", icon: BarChart3, color: "indigo" },
                  { id: "performance", label: "Performance", icon: Activity, color: "emerald" },
                  { id: "details", label: "Details", icon: Eye, color: "purple" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-300 rounded-t-xl ${
                      activeTab === tab.id
                        ? `text-${tab.color}-600 dark:text-${tab.color}-400 bg-gradient-to-t from-${tab.color}-50/50 to-transparent dark:from-${tab.color}-950/20`
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                  >
                    <tab.icon className={`h-4 w-4 transition-all duration-300 ${activeTab === tab.id ? `text-${tab.color}-500` : ""}`} />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 rounded-full`}></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Performance Trend Chart */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        Performance Trend
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Score</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Passed</span>
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={performanceTrendData}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                        <XAxis dataKey="attempt" tick={{ fill: '#6b7280' }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => [`${value}%`, 'Score']}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGradient)" name="Score" />
                        <Line type="monotone" dataKey="passed" stroke="#22c55e" strokeWidth={2} dot={{ r: 6, fill: '#22c55e', strokeWidth: 2 }} name="Passed" connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                        <PieChartIcon className="h-4 w-4 text-white" />
                      </div>
                      Score Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <ReBarChart data={scoreDistribution} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                        <XAxis type="number" tick={{ fill: '#6b7280' }} />
                        <YAxis dataKey="range" type="category" width={80} tick={{ fill: '#6b7280' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                          {scoreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab Content */}
            {activeTab === "performance" && (
              <div className="space-y-8">
                {/* Secondary Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-200/50 dark:border-emerald-800/30 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Best Score</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.bestScore}%</p>
                      </div>
                      <Trophy className="h-8 w-8 text-emerald-500 opacity-50" />
                    </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 to-red-500/10 dark:from-rose-500/5 dark:to-red-500/5 border border-rose-200/50 dark:border-rose-800/30 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Worst Score</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.worstScore}%</p>
                      </div>
                      <Target className="h-8 w-8 text-rose-500 opacity-50" />
                    </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-500/5 dark:to-indigo-500/5 border border-purple-200/50 dark:border-purple-800/30 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Time</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTimeSpent} min</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-500 opacity-50" />
                    </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-200/50 dark:border-amber-800/30 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Total Attempts</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalAttempts}</p>
                      </div>
                      <Medal className="h-8 w-8 text-amber-500 opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Attempts Timeline */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      Attempts Timeline
                    </h3>
                    <div className="space-y-4">
                      {attempts.slice().reverse().map((attempt, idx) => (
                        <div key={idx} className="group/item relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300">
                            <div className="flex-shrink-0 w-14 text-center">
                              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">#{attempts.length - idx}</div>
                              <div className="text-xs text-slate-400">{attempt.type}</div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{attempt.title}</p>
                                  <p className="text-xs text-slate-500">{attempt.subjectName}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-slate-600">{attempt.score}/{attempt.totalPoints}</span>
                                    <span className={`text-sm font-bold ${attempt.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      ({Math.round(attempt.percentage)}%)
                                    </span>
                                  </div>
                                  {attempt.isPassed ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-rose-500" />
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-700 ${attempt.isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                  style={{ width: `${attempt.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-xs text-slate-400 whitespace-nowrap">
                              {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab Content */}
            {activeTab === "details" && (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Title</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Score</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Percentage</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Result</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {attempts.map((attempt, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-200 group">
                            <td className="px-6 py-4">
                              <span className="font-medium text-slate-900 dark:text-white">{attempt.title}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{attempt.score}/{attempt.totalPoints}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${getScoreBgColor(attempt.percentage)}`}
                                    style={{ width: `${attempt.percentage}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium ${getScoreColor(attempt.percentage)}`}>
                                  {Math.round(attempt.percentage)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {attempt.isPassed ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Passed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> Failed
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LecturerStudentProgress;