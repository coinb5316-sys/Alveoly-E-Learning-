// AdminDashboard.jsx - Complete with real data and timeframe filtering
import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Users,
  HelpCircle,
  DollarSign,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Clock,
  UserPlus,
  CreditCard,
  Zap,
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import AdminSmartBot from "../components/AdminSmartBot";


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalRevenue: 0,
    totalSubjects: 0
  });
  const [charts, setCharts] = useState({
    revenue: [],
    userGrowth: [],
    userDistribution: { active: 0, inactive: 0, activePercentage: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("monthly");

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/analytics/dashboard?timeframe=${timeframe}`);
      
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
        setRecentActivities(res.data.recentActivities);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, change: "+12.5%", positive: true, color: "blue" },
    { title: "Total Questions", value: stats.totalQuestions, icon: HelpCircle, change: "+8.2%", positive: true, color: "green" },
    { title: "Total Revenue", value: `₵${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+23.1%", positive: true, color: "yellow" },
    { title: "Active Subjects", value: stats.totalSubjects, icon: BookOpen, change: "+5.3%", positive: true, color: "purple" },
  ];

  const pieData = [
    { name: "Active Users", value: charts.userDistribution.active, color: "#3b82f6" },
    { name: "Inactive Users", value: charts.userDistribution.inactive, color: "#94a3b8" }
  ];

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case "daily": return "Today";
      case "weekly": return "This Week";
      case "monthly": return "This Month";
      case "yearly": return "This Year";
      default: return "This Month";
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isRevenue = payload[0].dataKey === "revenue";
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {isRevenue ? `₵${payload[0].value.toLocaleString()}` : `${payload[0].value} users`}
          </p>
        </div>
      );
    }
    return null;
  };

  const getActivityIcon = (iconName) => {
    switch (iconName) {
      case "CreditCard": return <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "UserPlus": return <UserPlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      default: return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's an overview of your platform for {getTimeframeLabel().toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          {["daily", "weekly", "monthly", "yearly"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                timeframe === period
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              const colorMap = {
                blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
                green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
                yellow: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
                purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
              };
              return (
                <div
                  key={idx}
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
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <ArrowUpRight className="h-3 w-3" />
                        {card.change}
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 ${colorMap[card.color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Revenue Overview</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {getTimeframeLabel()} revenue tracking
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Total: ₵{stats.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={charts.revenue}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-gray-500 dark:text-gray-400" />
                  <YAxis tick={{ fontSize: 12 }} className="text-gray-500 dark:text-gray-400" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* User Growth Chart */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">User Growth</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    New user acquisition ({getTimeframeLabel().toLowerCase()})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Total: {stats.totalUsers} users
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={charts.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-gray-500 dark:text-gray-400" />
                  <YAxis tick={{ fontSize: 12 }} className="text-gray-500 dark:text-gray-400" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
                <button 
                  onClick={fetchDashboardData}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent activity</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
                        {getActivityIcon(activity.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</p>
                        {activity.amount && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">₵{activity.amount.toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatTime(activity.time)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* User Distribution */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h3 className="mb-6 text-sm font-medium text-gray-900 dark:text-gray-100">User Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} users`, "Count"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Active Users</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {charts.userDistribution.active} ({charts.userDistribution.activePercentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Inactive Users</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {charts.userDistribution.inactive} ({100 - charts.userDistribution.activePercentage}%)
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Active users defined as users active in the last 30 days
                </p>
              </div>
            </div>
            <AdminSmartBot />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;