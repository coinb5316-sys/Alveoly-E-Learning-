import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FaChartLine,
  FaCheckCircle,
  FaBookOpen,
  FaClock,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  }));

  // ================= RECENT (UNCHANGED) =================
  const recentActivity = attempts.slice(0, 5);

  // ================= PERFORMANCE COLOR (UNCHANGED) =================
  const getPerformanceColor = (p) => {
    if (p >= 80) return "text-green-600 dark:text-green-400";
    if (p >= 50) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  // ================= AI PREDICTION (UNCHANGED) =================
  const trend = attempts.length >= 2
    ? attempts[0].percentage - attempts[attempts.length - 1].percentage
    : 0;

  const predictedScore = stats.averageScore + (trend > 0 ? 5 : trend < 0 ? -5 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4">
            <FaChartLine className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Learning Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
            Student Progress
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
            Track your learning journey with detailed analytics and AI-powered insights
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Premium Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-10">
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
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

          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <FaBookOpen className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Trials Taken</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.examsTaken}</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
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

          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Best Score</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.bestScore}%</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <FaClock className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Study Time</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatTime(stats.studyHours)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Prediction & AI Feedback Row */}
        <div className="grid gap-6 lg:grid-cols-2 mb-10">
          {/* Performance Prediction */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">🔮</div>
                <h2 className="text-lg font-semibold">Performance Prediction</h2>
              </div>
              <p className="text-5xl font-bold mb-3">{Math.round(predictedScore)}%</p>
              <p className="text-white/80 text-sm">
                {trend > 0
                  ? "📈 You are improving! Keep up the great work!"
                  : trend < 0
                  ? "⚠️ Performance is dropping. Focus more on weak areas."
                  : "📊 Stable performance. Aim for improvement!"}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                <span>Based on {attempts.length} completed trials</span>
              </div>
            </div>
          </div>

          {/* AI Feedback - EXACTLY as original logic */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">🤖</div>
                <h2 className="text-lg font-semibold">AI Coach Feedback</h2>
              </div>
              {aiLoading && (
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing your performance...</span>
                </div>
              )}
              {!aiLoading && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-sm leading-relaxed">
                  {aiInsight}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FaChartLine className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Performance Trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your progress over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FaBookOpen className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subject Mastery</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Progress by subject</p>
            </div>
          </div>
          <div className="space-y-5">
            {subjects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📚</div>
                <p className="text-slate-500 dark:text-slate-400">No subject data yet. Complete some trials to see your progress!</p>
              </div>
            )}
            {subjects.map((subject, index) => (
              <div key={index} className="group">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{subject.name}</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{subject.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700 group-hover:opacity-80"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your latest trial attempts</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = "/student/trials"}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>

          {recentActivity.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-slate-500 dark:text-slate-400">No activity yet. Start practicing to see your progress!</p>
            </div>
          )}

          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 flex items-center justify-center">
                    <FaBookOpen className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{a.subjectId?.name || "Subject"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getPerformanceColor(a.percentage)}`}>
                    {a.percentage}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Score: {a.score}/{a.totalQuestions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            AI Coach Active • {attempts.length} Completed Trials • {stats.bestScore}% Best Score
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;