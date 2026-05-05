// StudentProgress.jsx - Professional styling with dark mode (AI removed)
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Target,
  Zap,
  Calendar,
  BarChart3,
  CheckCircle,
  LineChart,
  Activity,
  Star,
  Medal,
  Flame,
  Brain,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Loader2,
  ChevronRight
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const StudentProgress = () => {
  const [attempts, setAttempts] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/trial/progress");
        setAttempts(res.data.attempts || []);
        setStatsData(res.data.stats || {});
      } catch (err) {
        console.error("Progress fetch error:", err);
        toast.error("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const formatTime = (seconds = 0) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + "h " : ""}${mins > 0 ? mins + "m " : ""}${secs}s`;
  };

  const stats = {
    coursesCompleted: 1,
    totalCourses: 1,
    examsTaken: statsData?.totalAttempts || 0,
    averageScore: statsData?.averageScore || 0,
    studyHours: statsData?.totalTime || 0,
    bestScore: statsData?.bestScore || 0,
  };

  const subjectMap = {};
  attempts.forEach((a) => {
    const key = a.subjectId?._id || "unknown";
    if (!subjectMap[key]) {
      subjectMap[key] = {
        name: a.subjectId?.name || "Unknown Subject",
        total: 0,
        score: 0,
        attempts: 0
      };
    }
    subjectMap[key].total += 1;
    subjectMap[key].score += a.percentage;
    subjectMap[key].attempts += 1;
  });

  const subjects = Object.values(subjectMap).map((s) => ({
    name: s.name,
    progress: Math.round(s.score / s.total),
    attempts: s.attempts,
    bestScore: Math.max(...attempts.filter(a => a.subjectId?._id === s.name || a.subjectId?.name === s.name).map(a => a.percentage), 0)
  }));

  const chartData = attempts.slice().reverse().map((a, i) => ({
    name: `${new Date(a.createdAt).toLocaleDateString()}`,
    percentage: a.percentage,
    score: a.score,
    fullDate: a.createdAt
  }));

  const recentActivity = attempts.slice(0, 5);

  const getPerformanceColor = (p) => {
    if (p >= 80) return "text-green-600 dark:text-green-400";
    if (p >= 60) return "text-blue-600 dark:text-blue-400";
    if (p >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceBg = (p) => {
    if (p >= 80) return "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400";
    if (p >= 60) return "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400";
    if (p >= 50) return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400";
    return "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400";
  };

  const getProgressBarColor = (p) => {
    if (p >= 80) return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (p >= 60) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    if (p >= 50) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    return "bg-gradient-to-r from-red-500 to-rose-500";
  };

  const pieData = [
    { name: "Passed", value: attempts.filter(a => a.percentage >= 70).length, color: "#10b981" },
    { name: "Failed", value: attempts.filter(a => a.percentage < 70).length, color: "#ef4444" }
  ];

  const trend = attempts.length >= 2
    ? (attempts[0]?.percentage || 0) - (attempts[attempts.length - 1]?.percentage || 0)
    : 0;

  const predictedScore = Math.min(100, Math.max(0, stats.averageScore + (trend > 0 ? 5 : trend < 0 ? -5 : 0)));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Performance Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track your learning progress and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {attempts.length} Attempts
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Course Progress</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.coursesCompleted}/{stats.totalCourses}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.coursesCompleted / stats.totalCourses) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trials Taken</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.examsTaken}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                <p className={`mt-2 text-2xl font-bold ${getPerformanceColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Best Score</p>
                <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.bestScore}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Study Time</p>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTime(stats.studyHours)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Prediction & Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance Prediction Card */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium">Performance Prediction</span>
              </div>
              <p className="text-4xl font-bold mb-2">{predictedScore}%</p>
              <p className="text-blue-100 text-sm">
                {trend > 0
                  ? "📈 Great improvement! Keep up the momentum!"
                  : trend < 0
                  ? "⚠️ Your performance needs attention. Focus on weak areas."
                  : "📊 Consistent performance. Aim higher!"}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-1">
                  {trend > 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-300" />
                  ) : trend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-300" />
                  ) : (
                    <Activity className="h-4 w-4 text-blue-300" />
                  )}
                </div>
                <span className="text-xs text-blue-100">
                  Based on your last {attempts.length} attempts
                </span>
              </div>
            </div>
          </div>

          {/* Pass/Fail Distribution */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Pass/Fail Distribution
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Passed: {pieData[0].value}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Failed: {pieData[1].value}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-500" />
                Performance Trend
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your progress over time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Score %</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Progress */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                Subject Performance
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your progress by subject</p>
            </div>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No subject data available yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Complete some trials to see your progress</p>
            </div>
          ) : (
            <div className="space-y-5">
              {subjects.map((subject, index) => (
                <div key={index} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({subject.attempts} attempts)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${getPerformanceColor(subject.progress)}`}>
                        {subject.progress}%
                      </span>
                      {subject.bestScore > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Best: {subject.bestScore}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`${getProgressBarColor(subject.progress)} h-2.5 rounded-full transition-all duration-500 group-hover:opacity-80`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Recent Activity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your latest trial attempts</p>
            </div>
            <button
              onClick={() => window.location.href = "/student/trials"}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start practicing to see your activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const date = new Date(activity.createdAt);
                const isRecent = index === 0;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      isRecent ? 'bg-blue-50/30 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getPerformanceBg(activity.percentage)}`}>
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {activity.subjectId?.name || "Unknown Subject"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getPerformanceColor(activity.percentage)}`}>
                        {activity.percentage}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Score: {activity.score}/{activity.totalQuestions}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Motivational Quote Section */}
        {attempts.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white" />
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white" />
            </div>
            <div className="relative z-10">
              <Medal className="h-8 w-8 mx-auto mb-3" />
              <p className="text-lg font-medium">
                {stats.averageScore >= 80
                  ? "🌟 Outstanding! You're on fire! Keep up the excellent work!"
                  : stats.averageScore >= 60
                  ? "💪 Great progress! With consistent effort, you'll reach excellence!"
                  : stats.averageScore >= 40
                  ? "📚 You're making progress! Focus on weak areas to improve faster."
                  : "🎯 Every expert was once a beginner. Keep practicing, you've got this!"}
              </p>
              <p className="text-sm text-white/80 mt-2">
                {attempts.length} complete{attempts.length !== 1 ? 'd' : ''} trial{attempts.length !== 1 ? 's' : ''} • {stats.bestScore}% best score
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;