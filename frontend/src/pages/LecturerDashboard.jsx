// LecturerDashboard.jsx - COMPLETE UPDATED (Fully Scrollable)
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Users,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
  Loader2,
  ChevronRight,
  Star,
  FileText,
  Video,
  ClipboardList,
  Download,
  Filter,
  Search,
  ChevronDown,
  Sparkles,
  GraduationCap,
  MessageSquare,
  Settings,
  RefreshCw,
  Crown
} from "lucide-react";
import toast from "react-hot-toast";

const LecturerDashboard = () => {
  const [stats, setStats] = useState({
    totalContent: 0,
    publishedContent: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    pendingGrading: 0,
    averageScore: 0,
    totalStudents: 0
  });
  const [recentContent, setRecentContent] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("weekly");
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch content stats
      const contentRes = await axios.get("/content/lecturer");
      const contents = contentRes.data || [];
      
      const totalContent = contents.length;
      const publishedContent = contents.filter(c => c.isPublished).length;
      const recentContentData = contents.slice(0, 5);
      
      // Fetch attempts stats
      let attempts = [];
      let gradingStats = { pending: 0, total: 0 };
      
      try {
        const attemptsRes = await axios.get("/grading/pending");
        if (attemptsRes.data && attemptsRes.data.submissions) {
          attempts = attemptsRes.data.submissions || [];
          gradingStats = attemptsRes.data.stats || { total: 0, pendingGrading: 0 };
        }
      } catch (err) {
        try {
          const altRes = await axios.get("/lecturer/attempts");
          if (altRes.data && altRes.data.attempts) {
            attempts = altRes.data.attempts || [];
          }
        } catch (altErr) {
          console.log("No attempts endpoint available");
        }
      }
      
      const totalAttempts = attempts.length;
      const completedAttempts = attempts.filter(a => a.status === "completed" || a.isGraded).length;
      const pendingGrading = gradingStats.pendingGrading || attempts.filter(a => !a.isGraded && a.status === "completed").length;
      
      let averageScore = 0;
      const gradedAttempts = attempts.filter(a => a.percentage && a.percentage > 0);
      if (gradedAttempts.length > 0) {
        averageScore = Math.round(gradedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / gradedAttempts.length);
      }
      
      // Fetch students count
      let totalStudents = 0;
      try {
        const studentsRes = await axios.get("/lecturer/students");
        if (studentsRes.data && studentsRes.data.students) {
          totalStudents = studentsRes.data.students.length;
        }
      } catch (err) {
        console.log("Students endpoint not available");
      }
      
      // Set recent attempts
      const recentAttemptsData = attempts.slice(0, 10).map(a => ({
        _id: a._id,
        studentName: a.studentName || a.userName || "Student",
        contentTitle: a.lessonTitle || a.contentTitle || "Quiz",
        percentage: a.percentage || 0,
        isPassed: a.isPassed || false,
        isGraded: a.isGraded || false,
        status: a.status || "pending",
        submittedAt: a.submittedAt || a.completedAt
      }));
      
      setStats({
        totalContent,
        publishedContent,
        totalAttempts,
        completedAttempts,
        pendingGrading,
        averageScore,
        totalStudents
      });
      
      setRecentContent(recentContentData);
      setRecentAttempts(recentAttemptsData);
      
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard data");
      setStats({
        totalContent: 0,
        publishedContent: 0,
        totalAttempts: 0,
        completedAttempts: 0,
        pendingGrading: 0,
        averageScore: 0,
        totalStudents: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success("Dashboard refreshed!");
  };

  const timeframeOptions = [
    { value: "daily", label: "Today" },
    { value: "weekly", label: "This Week" },
    { value: "monthly", label: "This Month" },
    { value: "all", label: "All Time" }
  ];

  const getTimeframeLabel = () => {
    const found = timeframeOptions.find(t => t.value === timeframe);
    return found ? found.label : "This Week";
  };

  const statCards = [
    { 
      title: "Total Content", 
      value: stats.totalContent, 
      subtext: `${stats.publishedContent} published`,
      icon: BookOpen, 
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      link: "/lecturer/content"
    },
    { 
      title: "Student Attempts", 
      value: stats.totalAttempts, 
      subtext: `${stats.completedAttempts} completed`,
      icon: Users, 
      color: "green",
      gradient: "from-green-500 to-emerald-600",
      link: "/lecturer/attempts"
    },
    { 
      title: "Avg. Score", 
      value: `${Math.round(stats.averageScore)}%`, 
      subtext: "across all assessments",
      icon: TrendingUp, 
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      link: "/lecturer/results"
    },
    { 
      title: "Pending Grading", 
      value: stats.pendingGrading, 
      subtext: "awaiting review",
      icon: Clock, 
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      link: "/lecturer/grading"
    },
  ];

  const getContentIcon = (type) => {
    switch(type) {
      case "video": return <Video className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      case "image": return <FileQuestion className="h-4 w-4" />;
      case "quiz": return <Star className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (attempt) => {
    if (attempt.isGraded) {
      if (attempt.isPassed) {
        return { icon: <CheckCircle className="h-3 w-3" />, text: "Passed", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" };
      }
      return { icon: <XCircle className="h-3 w-3" />, text: "Failed", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" };
    }
    return { icon: <Clock className="h-3 w-3" />, text: "Pending", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Refresh */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between sticky top-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm -mx-4 px-4 py-3 md:-mx-6 md:px-6 border-b border-gray-200/50 dark:border-gray-800/50">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Dashboard</span>
            <span className="text-xs font-normal bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Lecturer
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your courses, create content, and track student progress
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <Calendar className="h-4 w-4" />
              {getTimeframeLabel()}
              <ChevronDown className={`h-4 w-4 transition-transform ${showTimeframeDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showTimeframeDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                {timeframeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeframe(option.value);
                      setShowTimeframeDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      timeframe === option.value
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/lecturer/content/create"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Content
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const colorMap = {
            blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
            green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
            purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
            orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
          };
          return (
            <Link
              key={idx}
              to={card.link}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-6 transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {card.title}
                  </p>
                  <p className="mt-1 md:mt-2 text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {card.subtext}
                  </p>
                </div>
                <div className={`rounded-lg p-2 md:p-3 flex-shrink-0 ${colorMap[card.color]}`}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Create Content", icon: FileText, path: "/lecturer/content/create", color: "blue" },
            { label: "Create Quiz", icon: Star, path: "/lecturer/content/create?type=quiz", color: "purple" },
            { label: "Student Performance", icon: BarChart3, path: "/lecturer/attempts", color: "green" },
            { label: "Grade Submissions", icon: MessageSquare, path: "/lecturer/grading", color: "orange", badge: stats.pendingGrading > 0 ? stats.pendingGrading : null },
          ].map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className="group p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${action.color}-50 dark:bg-${action.color}-950/30 text-${action.color}-600 dark:text-${action.color}-400 flex-shrink-0`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                    {action.label}
                  </p>
                </div>
                {action.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full animate-pulse flex-shrink-0">
                    {action.badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Content & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Content */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Recent Content
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Your latest created materials
                </p>
              </div>
              <Link to="/lecturer/content" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex-shrink-0">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
            {recentContent.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No content created yet</p>
                <Link to="/lecturer/content/create" className="text-sm text-blue-600 mt-2 inline-block">
                  Create your first content →
                </Link>
              </div>
            ) : (
              recentContent.map((content) => (
                <div key={content._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${content.type === 'video' ? 'bg-blue-50 dark:bg-blue-950/30' : content.type === 'quiz' ? 'bg-purple-50 dark:bg-purple-950/30' : content.type === 'pdf' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-green-50 dark:bg-green-950/30'}`}>
                        {getContentIcon(content.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{content.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{content.type}</span>
                          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                          <span className={`text-xs ${content.isPublished ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {content.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/lecturer/content/edit/${content._id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                      <Edit className="h-3.5 w-3.5 text-gray-500" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Recent Submissions
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Latest student activity
                </p>
              </div>
              <Link to="/lecturer/attempts" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex-shrink-0">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
            {recentAttempts.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
                <p className="text-xs text-gray-400 mt-1">Student attempts will appear here</p>
              </div>
            ) : (
              recentAttempts.map((attempt) => {
                const status = getStatusBadge(attempt);
                return (
                  <div key={attempt._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{attempt.studentName || "Student"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{attempt.contentTitle || "Quiz"}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.icon} {status.text}
                          </span>
                          {attempt.percentage > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Score: {Math.round(attempt.percentage)}%
                            </span>
                          )}
                        </div>
                      </div>
                      {!attempt.isGraded ? (
                        <Link
                          to={`/lecturer/grading/${attempt._id}`}
                          className="px-3 py-1.5 text-xs bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg transition-colors flex-shrink-0"
                        >
                          Grade
                        </Link>
                      ) : (
                        <Link
                          to={`/lecturer/results`}
                          className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex-shrink-0"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Performance Overview
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Key metrics at a glance
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/lecturer/content" className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors group">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">{stats.totalContent}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Content</p>
          </Link>
          <Link to="/lecturer/students" className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors group">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">{stats.totalStudents}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active Students</p>
          </Link>
          <Link to="/lecturer/attempts" className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors group">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{stats.totalAttempts}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Attempts</p>
          </Link>
          <Link to="/lecturer/results" className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors group">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{stats.completedAttempts}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</p>
          </Link>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
};

export default LecturerDashboard;