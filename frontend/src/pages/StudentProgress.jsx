// StudentProgress.jsx - Professional with AI Integration & Dark/Light Mode
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Target,
  Activity,
  LineChart,
  PieChart,
  Calendar,
  ChevronRight,
  Medal,
  Brain,
  Sparkles,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Loader2,
  Zap,
  Star,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Rocket,
  Shield,
  Crown
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from "recharts";

const StudentProgress = () => {
  const [attempts, setAttempts] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // AI States
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);

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

    const fetchAIInsights = async () => {
      try {
        setAiLoading(true);
        // Fetch AI insights
        const insightRes = await axios.get("/ai/insights");
        setAiInsight(insightRes.data.insight);
        
        // Fetch AI recommendations
        const recRes = await axios.get("/ai/recommendations");
        setAiRecommendations(recRes.data.recommendations || []);
        
        // Fetch AI study plan
        const planRes = await axios.get("/ai/study-plan");
        setStudyPlan(planRes.data.plan);
      } catch (err) {
        console.error("AI insights error:", err);
        setAiInsight("AI feedback not available at the moment.");
      } finally {
        setAiLoading(false);
      }
    };

    fetchProgress();
    fetchAIInsights();
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
    name: new Date(a.createdAt).toLocaleDateString(),
    percentage: a.percentage,
    score: a.score,
    fullDate: a.createdAt
  }));

  const recentActivity = attempts.slice(0, 5);

  const getPerformanceColor = (p) => {
    if (p >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (p >= 60) return "text-blue-600 dark:text-blue-400";
    if (p >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getPerformanceBg = (p) => {
    if (p >= 80) return "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
    if (p >= 60) return "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400";
    if (p >= 50) return "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
    return "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400";
  };

  const getProgressBarColor = (p) => {
    if (p >= 80) return "bg-gradient-to-r from-emerald-500 to-teal-500";
    if (p >= 60) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    if (p >= 50) return "bg-gradient-to-r from-amber-500 to-orange-500";
    return "bg-gradient-to-r from-rose-500 to-pink-500";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <Brain className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Analyzing your performance data...</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">AI is preparing your insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header with AI Badge */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Performance Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI-powered insights to accelerate your learning journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {attempts.length} Completed Trials
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-200 dark:border-amber-800/30">
              <Brain className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                AI Coach Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Premium Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: BookOpen, label: "Course Progress", value: `${stats.coursesCompleted}/${stats.totalCourses}`, color: "blue", sub: "Complete" },
            { icon: Target, label: "Trials Taken", value: stats.examsTaken, color: "purple", sub: "Attempts" },
            { icon: TrendingUp, label: "Average Score", value: `${stats.averageScore}%`, color: "emerald", trend: true },
            { icon: Award, label: "Best Score", value: `${stats.bestScore}%`, color: "amber", sub: "Peak Performance" },
            { icon: Clock, label: "Study Time", value: formatTime(stats.studyHours), color: "orange", sub: "Total Focus" }
          ].map((stat, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-950/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  {stat.trend && stats.averageScore > 0 && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${stats.averageScore >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {stats.averageScore >= 60 ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stats.averageScore >= 60 ? 'Improving' : 'Needs Focus'}
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                {stat.sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights Section - Premium */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* AI Coach Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide">AI COACH</span>
                </div>
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
              </div>
              
              {aiLoading ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm opacity-80">Analyzing your performance...</p>
                  </div>
                  <div className="h-20 bg-white/10 rounded-xl animate-pulse" />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-3">Personalized Feedback</h3>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-sm leading-relaxed">
                    {aiInsight || "Complete more trials to receive personalized AI coaching insights tailored to your learning pattern."}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
                    <Shield className="h-3 w-3" />
                    <span>Powered by advanced learning algorithms</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Performance Prediction */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-6 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-sm font-semibold tracking-wide text-amber-400">PERFORMANCE PREDICTION</span>
              </div>
              <p className="text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {predictedScore}%
              </p>
              <p className="text-blue-200 text-sm mb-4">
                {trend > 0
                  ? "📈 Exceptional progress! You're outperforming expectations!"
                  : trend < 0
                  ? "⚠️ Performance decline detected. AI suggests focused review sessions."
                  : "📊 Maintaining steady performance. Ready for the next challenge!"}
              </p>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>Next target: {Math.min(100, predictedScore + 5)}%</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Based on {attempts.length} attempts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-500" />
                Performance Analytics
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your progress over time with AI trend analysis</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                {trend > 0 ? `+${Math.abs(trend).toFixed(1)}% Improvement` : trend < 0 ? `${trend.toFixed(1)}% Decline` : 'Stable Trend'}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
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
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recommendations Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">AI Recommendations</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Personalized suggestions to boost your performance</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {aiRecommendations.length > 0 ? aiRecommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/30">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{rec.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{rec.description}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Complete more trials to receive personalized AI recommendations</p>
              </div>
            )}
          </div>
        </div>

        {/* Subject Performance & Distribution */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Subject Progress */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Subject Mastery</h3>
            </div>
            
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No subject data available</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Complete trials to see your progress</p>
              </div>
            ) : (
              <div className="space-y-5">
                {subjects.map((subject, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">{subject.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{subject.attempts} attempts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${getPerformanceColor(subject.progress)}`}>
                          {subject.progress}%
                        </span>
                        {subject.bestScore > 0 && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Best: {subject.bestScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`${getProgressBarColor(subject.progress)} h-2 rounded-full transition-all duration-700 group-hover:opacity-80`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pass/Fail Distribution */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-purple-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Performance Distribution</h3>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Passed: {pieData[0].value}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Failed: {pieData[1].value}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Recent Activity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your latest trial performances</p>
            </div>
            <button
              onClick={() => window.location.href = "/student/trials"}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Start practicing to see your activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const date = new Date(activity.createdAt);
                const isRecent = index === 0;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.01] ${
                      isRecent ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getPerformanceBg(activity.percentage)}`}>
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {activity.subjectId?.name || "Unknown Subject"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {date.toLocaleDateString()} • {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getPerformanceColor(activity.percentage)}`}>
                        {activity.percentage}%
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Score: {activity.score}/{activity.totalQuestions}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Motivational Quote with AI Touch */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold tracking-wide">AI MOTIVATION</span>
            </div>
            <p className="text-xl md:text-2xl font-bold mb-3">
              {stats.averageScore >= 80
                ? "🌟 Exceptional! You're in the top tier! Keep pushing boundaries!"
                : stats.averageScore >= 60
                ? "💪 Strong progress! Consistency is your superpower!"
                : stats.averageScore >= 40
                ? "📚 Every step counts! AI suggests focusing on weak areas daily."
                : "🎯 Your journey starts here! Every master was once a beginner."}
            </p>
            <p className="text-white/80 text-sm">
              {attempts.length} completed trial{attempts.length !== 1 ? 's' : ''} • {stats.bestScore}% peak performance • AI tracking your growth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;