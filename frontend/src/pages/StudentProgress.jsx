import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FaChartLine,
  FaCheckCircle,
  FaBookOpen,
  FaClock,
  FaTrophy,
  FaBrain,
  FaFire,
  FaRocket,
  FaStar,
  FaMedal,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

const StudentProgress = () => {
  // 🔥 STATES (UNCHANGED)
  const [attempts, setAttempts] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 AI STATES (UNCHANGED)
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ================= FETCH (UNCHANGED) =================
  useEffect(() => {
    const fetchProgress = async () => {
      try {
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

    // 🔥 AI FETCH (UNCHANGED)
    const fetchAIInsight = async () => {
      try {
        setAiLoading(true);
        const res = await axios.get("/ai/insights");
        setAiInsight(res.data.insight);
      } catch (err) {
        console.error("AI Insight error:", err);
        setAiInsight("AI feedback not available.");
      } finally {
        setAiLoading(false);
      }
    };

    fetchProgress();
    fetchAIInsight();
  }, []);

  // ================= TIME FORMAT (UNCHANGED) =================
  const formatTime = (seconds = 0) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + "h " : ""}${mins > 0 ? mins + "m " : ""}${secs}s`;
  };

  // ================= STATS (UNCHANGED) =================
  const stats = {
    coursesCompleted: 1,
    totalCourses: 1,
    examsTaken: statsData?.totalAttempts || 0,
    averageScore: statsData?.averageScore || 0,
    studyHours: statsData?.totalTime || 0,
    bestScore: statsData?.bestScore || 0,
  };

  // ================= SUBJECT PROGRESS (UNCHANGED) =================
  const subjectMap = {};
  attempts.forEach((a) => {
    const key = a.subjectId?._id || "unknown";
    if (!subjectMap[key]) {
      subjectMap[key] = {
        name: a.subjectId?.name || "Unknown",
        total: 0,
        score: 0,
      };
    }
    subjectMap[key].total += 1;
    subjectMap[key].score += a.percentage;
  });

  const subjects = Object.values(subjectMap).map((s) => ({
    name: s.name,
    progress: Math.round(s.score / s.total),
  }));

  // ================= CHART (UNCHANGED) =================
  const chartData = attempts.slice().reverse().map((a, i) => ({
    name: `Trial ${i + 1}`,
    percentage: a.percentage,
    date: new Date(a.createdAt).toLocaleDateString(),
  }));

  // ================= RECENT (UNCHANGED) =================
  const recentActivity = attempts.slice(0, 5);

  // ================= PERFORMANCE COLOR (UNCHANGED) =================
  const getPerformanceColor = (p) => {
    if (p >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (p >= 50) return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };

  const getPerformanceBg = (p) => {
    if (p >= 80) return "bg-emerald-100 dark:bg-emerald-950/30";
    if (p >= 50) return "bg-amber-100 dark:bg-amber-950/30";
    return "bg-rose-100 dark:bg-rose-950/30";
  };

  const getPerformanceBadge = (p) => {
    if (p >= 90) return { text: "Outstanding", icon: FaCrown, color: "text-yellow-500" };
    if (p >= 80) return { text: "Excellent", icon: FaStar, color: "text-emerald-500" };
    if (p >= 70) return { text: "Very Good", icon: FaTrophy, color: "text-blue-500" };
    if (p >= 60) return { text: "Good", icon: FaMedal, color: "text-purple-500" };
    if (p >= 50) return { text: "Satisfactory", icon: FaCheckCircle, color: "text-amber-500" };
    return { text: "Needs Improvement", icon: FaFire, color: "text-rose-500" };
  };

  // ================= AI PREDICTION (UNCHANGED) =================
  const trend = attempts.length >= 2
    ? attempts[0].percentage - attempts[attempts.length - 1].percentage
    : 0;

  const predictedScore = stats.averageScore + (trend > 0 ? 5 : trend < 0 ? -5 : 0);
  const clampedPredictedScore = Math.min(100, Math.max(0, Math.round(predictedScore)));

  const performanceBadge = getPerformanceBadge(stats.averageScore);
  const PerformanceIcon = performanceBadge.icon;

  // Calculate achievement level
  const getAchievementLevel = () => {
    if (stats.averageScore >= 85) return { level: "Master", icon: FaCrown, color: "from-yellow-500 to-amber-500" };
    if (stats.averageScore >= 70) return { level: "Advanced", icon: FaRocket, color: "from-blue-500 to-cyan-500" };
    if (stats.averageScore >= 50) return { level: "Intermediate", icon: FaStar, color: "from-purple-500 to-pink-500" };
    return { level: "Beginner", icon: FaBrain, color: "from-emerald-500 to-teal-500" };
  };

  const achievement = getAchievementLevel();
  const AchievementIcon = achievement.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            borderRadius: "16px",
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Hero Header - Premium */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm">
            <FaChartLine className="text-blue-600 dark:text-blue-400 text-sm" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Learning Analytics Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
            Student Progress
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            Track your learning journey with detailed analytics and AI-powered insights
          </p>
        </div>

        {/* Loading State - Premium */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaBrain className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Analyzing your performance data...</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">AI is preparing your insights</p>
          </div>
        )}

        {/* Stats Grid - Premium Cards with Glassmorphism */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-10">
          {/* Course Progress */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Course Progress</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.coursesCompleted}/{stats.totalCourses}
                </p>
              </div>
            </div>
          </div>

          {/* Trials Taken */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaBookOpen className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Trials Taken</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.examsTaken}</p>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Average Score</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
              </div>
            </div>
          </div>

          {/* Best Score */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaTrophy className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Best Score</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.bestScore}%</p>
              </div>
            </div>
          </div>

          {/* Study Time */}
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaClock className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Study Time</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatTime(stats.studyHours)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Banner */}
        <div className={`mb-10 rounded-2xl bg-gradient-to-r ${achievement.color} p-6 text-white shadow-xl`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <AchievementIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Current Achievement Level</p>
                <p className="text-2xl font-bold">{achievement.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-white/70 text-xs">Trials Completed</p>
                <p className="text-2xl font-bold">{attempts.length}</p>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <p className="text-white/70 text-xs">Best Performance</p>
                <p className="text-2xl font-bold">{stats.bestScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Prediction & AI Feedback Row - Premium */}
        <div className="grid gap-6 lg:grid-cols-2 mb-10">
          {/* Performance Prediction - Enhanced */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🔮</div>
                  <h2 className="text-lg font-semibold">AI Performance Prediction</h2>
                </div>
                <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  Next Target
                </div>
              </div>
              <p className="text-6xl font-bold mb-3">{clampedPredictedScore}%</p>
              <p className="text-white/80 text-base mb-4">
                {trend > 0
                  ? "📈 You are improving! Keep up the great work!"
                  : trend < 0
                  ? "⚠️ Performance is dropping. Focus more on weak areas."
                  : "📊 Stable performance. Aim for improvement!"}
              </p>
              <div className="flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <FaRocket className="w-3 h-3" />
                  <span>Target: {Math.min(100, clampedPredictedScore + 10)}%</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <div className="flex items-center gap-1">
                  <FaCalendarAlt className="w-3 h-3" />
                  <span>Based on {attempts.length} trials</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Feedback - Premium Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <FaBrain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">AI Coach Feedback</h2>
                  <p className="text-white/60 text-xs">Personalized learning insights</p>
                </div>
              </div>
              {aiLoading && (
                <div className="flex items-center gap-2 text-white/80 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Analyzing your performance...</span>
                </div>
              )}
              {!aiLoading && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-sm leading-relaxed">
                  <div className="flex items-start gap-2">
                    <FaStar className="text-amber-300 mt-0.5 flex-shrink-0" />
                    <p>{aiInsight || "Complete more trials to receive personalized AI coaching insights tailored to your learning pattern."}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Chart - Premium */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-10 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <FaChartLine className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Performance Trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your progress over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#1e293b", fontWeight: "bold" }}
              />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#performanceGradient)"
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#2563eb" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Progress - Premium */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-10 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <FaBookOpen className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subject Mastery</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Progress breakdown by subject</p>
            </div>
          </div>
          <div className="space-y-5">
            {subjects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-slate-500 dark:text-slate-400 text-lg">No subject data yet.</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Complete some trials to see your progress!</p>
              </div>
            )}
            {subjects.map((subject, index) => (
              <div key={index} className="group">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{subject.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{subject.progress}%</span>
                    {subject.progress >= 80 && <FaStar className="text-amber-500 text-xs" />}
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                  <div
                    className={`bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 group-hover:opacity-80 group-hover:scale-x-[1.02] origin-left`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity - Premium Timeline */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <FaFire className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your latest trial attempts</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = "/student/trials"}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
            >
              View All Trials →
            </button>
          </div>

          {recentActivity.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-slate-500 dark:text-slate-400 text-lg">No activity yet.</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Start practicing to see your progress!</p>
            </div>
          )}

          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const date = new Date(a.createdAt);
              const isRecent = i === 0;
              return (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                    isRecent 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800" 
                      : "bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getPerformanceBg(a.percentage)} flex items-center justify-center`}>
                      <FaBookOpen className={`text-xl ${getPerformanceColor(a.percentage)}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{a.subjectId?.name || "Subject"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <FaCalendarAlt className="text-xs text-slate-400" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getPerformanceColor(a.percentage)}`}>
                      {a.percentage}%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Score: {a.score}/{a.totalQuestions}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Footer - Premium */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/50 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              AI Coach Active
            </span>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {attempts.length} Completed Trials
            </span>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              🏆 {stats.bestScore}% Best Score
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for Crown icon
const FaCrown = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" />
  </svg>
);

export default StudentProgress;