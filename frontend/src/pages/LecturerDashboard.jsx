// LecturerDashboard.jsx - FIXED with proper API endpoints
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
  Settings
} from "lucide-react";

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
  const [timeframe, setTimeframe] = useState("weekly");

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch content stats - using existing endpoint
      const contentRes = await axios.get("/content/lecturer");
      const contents = contentRes.data || [];
      
      const totalContent = contents.length;
      const publishedContent = contents.filter(c => c.isPublished).length;
      const recentContentData = contents.slice(0, 5);
      
      // Fetch attempts stats - using grading endpoint
      let attempts = [];
      let gradingStats = { pending: 0, total: 0 };
      
      try {
        const attemptsRes = await axios.get("/grading/pending");
        if (attemptsRes.data && attemptsRes.data.submissions) {
          attempts = attemptsRes.data.submissions || [];
          gradingStats = attemptsRes.data.stats || { total: 0, pendingGrading: 0 };
        }
      } catch (err) {
        console.log("Grading endpoint not available, trying alternate...");
        // Try alternate endpoint
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
      
      // Fetch students count - using existing endpoint
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
      // Set default values on error
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
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Lecturer Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your courses, create content, and track student progress
          </p>
        </div>
        <Link
          to="/lecturer/content/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Create Content
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {card.subtext}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${colorMap[card.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Create Content", icon: FileText, path: "/lecturer/content/create", color: "blue" },
          { label: "Create Quiz", icon: Star, path: "/lecturer/content/create?type=quiz", color: "purple" },
          { label: "Student Performance", icon: BarChart3, path: "/lecturer/attempts", color: "green" },
          { label: "Grade Submissions", icon: MessageSquare, path: "/lecturer/grading", color: "orange", badge: stats.pendingGrading > 0 ? stats.pendingGrading : null },
        ].map((action, idx) => (
          <Link
            key={idx}
            to={action.path}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-transparent hover:shadow-md transition-all group"
          >
            <div className={`p-2 rounded-lg bg-${action.color}-50 dark:bg-${action.color}-950/30 text-${action.color}-600 dark:text-${action.color}-400`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
              {action.label}
            </span>
            {action.badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full animate-pulse">
                {action.badge}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>

      {/* Recent Content & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Content */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Recent Content
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your latest created materials
                </p>
              </div>
              <Link to="/lecturer/content" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${content.type === 'video' ? 'bg-blue-50 dark:bg-blue-950/30' : content.type === 'quiz' ? 'bg-purple-50 dark:bg-purple-950/30' : content.type === 'pdf' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-green-50 dark:bg-green-950/30'}`}>
                        {getContentIcon(content.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{content.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{content.type}</span>
                          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                          <span className={`text-xs ${content.isPublished ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {content.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link to={`/lecturer/content/edit/${content._id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Edit className="h-3.5 w-3.5 text-gray-500" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Recent Submissions
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Latest student activity
                </p>
              </div>
              <Link to="/lecturer/attempts" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{attempt.studentName || "Student"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{attempt.contentTitle || "Quiz"}</p>
                        <div className="flex items-center gap-2 mt-2">
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
                      {!attempt.isGraded && (
                        <Link
                          to={`/lecturer/grading/${attempt._id}`}
                          className="px-3 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                        >
                          Grade
                        </Link>
                      )}
                      {attempt.isGraded && (
                        <Link
                          to={`/lecturer/results`}
                          className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
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
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Performance Overview
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Key metrics at a glance
            </p>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800"
          >
            <option value="weekly">Last 7 days</option>
            <option value="monthly">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/lecturer/content" className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalContent}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Content</p>
          </Link>
          <Link to="/lecturer/students" className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalStudents}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active Students</p>
          </Link>
          <Link to="/lecturer/attempts" className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalAttempts}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Attempts</p>
          </Link>
          <Link to="/lecturer/results" className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.completedAttempts}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;