// StudentDashboard.jsx - Fully Scrollable with Professional Design
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertCircle,
  Zap,
  Award,
  Calendar,
  Star,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Shield,
  Crown,
  Loader2,
  CreditCard,
  X,
  Building,
  GraduationCap,
  Ban,
  Lock,
  RefreshCw,
  Trophy,
  Users,
  MessageCircle,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PaystackPayment from "../pages/PaystackPayment";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    examsTaken: 0,
    averagePerformance: 0,
    subjectsCompleted: 0,
  });
  const [myPlans, setMyPlans] = useState({});
  const [now, setNow] = useState(new Date());
  const [isPlanDeactivated, setIsPlanDeactivated] = useState(false);
  const [planStatusMessage, setPlanStatusMessage] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);

  // Timer for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch student data
  const fetchStudent = async () => {
    try {
      const res = await API.get("/auth/me");
      console.log("Student data:", res.data);
      setStudent(res.data);
      
      if (res.data.planDeactivatedByAdmin) {
        setIsPlanDeactivated(true);
        setPlanStatusMessage("Your plan has been deactivated by an administrator.");
      } else if (!res.data.isPlanActive && res.data.planId) {
        setIsPlanDeactivated(false);
        setPlanStatusMessage("Your plan has expired. Please renew to continue accessing premium content.");
      } else if (!res.data.planId) {
        setPlanStatusMessage("You don't have an active plan. Subscribe to unlock premium content.");
      } else {
        setIsPlanDeactivated(false);
        setPlanStatusMessage("Your plan is active!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStudent();
      setLoading(false);
    };
    loadData();
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/student/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.get("/plans");
        setPlans(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Fetch payments
  useEffect(() => {
    const fetchMyPayments = async () => {
      try {
        const res = await API.get("/payments/mine");
        const map = {};
        res.data
          .filter((p) => p.status === "success" && p.planId)
          .forEach((p) => {
            const existing = map[p.planId];
            if (!existing || new Date(p.expiresAt) > new Date(existing)) {
              map[p.planId] = p.expiresAt;
            }
          });
        setMyPlans(map);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyPayments();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStudent();
    setRefreshing(false);
    toast.success("Dashboard refreshed!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Get program and course info
  const programId = student?.programId?._id || student?.programId || null;
  const programName = student?.programId?.name || null;
  const courseId = student?.courseId?._id || student?.courseId || null;
  const courseName = student?.courseId?.name || null;

  const getPlanStatus = (planId) => {
    const expiry = myPlans[planId];
    if (!expiry) return "none";
    return new Date(expiry) > now ? "active" : "expired";
  };

  const getTimeLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - now;
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    return `${mins}m remaining`;
  };

  const statCards = [
    {
      title: "Program",
      value: programName || "Not Assigned",
      icon: Building,
      color: "indigo",
      subtitle: programName ? "Your academic program" : "Contact admin",
    },
    {
      title: "Course",
      value: courseName || "Not Assigned",
      icon: GraduationCap,
      color: "blue",
      subtitle: courseName ? "Your current course" : "Contact admin",
    },
    {
      title: "Questions Solved",
      value: stats.totalQuestions,
      icon: ClipboardList,
      color: "green",
      subtitle: "Practice questions completed",
    },
    {
      title: "Exams Taken",
      value: stats.examsTaken,
      icon: Trophy,
      color: "purple",
      subtitle: "Completed exams",
    },
    {
      title: "Avg. Performance",
      value: `${stats.averagePerformance}%`,
      icon: TrendingUp,
      color: "yellow",
      subtitle: "Overall score",
    },
  ];

  const quickActions = [
    {
      title: "Browse Subjects",
      description: "Access all subjects under your course",
      icon: BookOpen,
      color: "blue",
      onClick: () => {
        if (!courseId) {
          toast.error("No course assigned yet. Please contact admin.");
          return;
        }
        navigate(`/student/subjects?course=${courseId}`);
      },
    },
    {
      title: "Practice Mode",
      description: "Start trial tests or exam mode",
      icon: Target,
      color: "green",
      onClick: () => {
        if (!courseId) {
          toast.error("No course assigned yet. Please contact admin.");
          return;
        }
        navigate(`/student/subjects?course=${courseId}`);
      },
    },
    {
      title: "View Progress",
      description: "Track your learning journey",
      icon: BarChart3,
      color: "purple",
      onClick: () => navigate("/student/progress"),
    },
    {
      title: "Payment History",
      description: "Manage subscriptions & history",
      icon: CreditCard,
      color: "orange",
      onClick: () => navigate("/student/payments"),
    },
  ];

  const hasPremiumAccess = student?.isPlanActive && !student?.planDeactivatedByAdmin;

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Refresh */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between sticky top-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm -mx-4 px-4 py-3 md:-mx-6 md:px-6 border-b border-gray-200/50 dark:border-gray-800/50">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Dashboard
            {hasPremiumAccess && (
              <span className="text-xs font-normal bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's your learning overview
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Welcome Header - Premium */}
      <div className={`relative overflow-hidden rounded-2xl p-6 md:p-8 text-white ${
        isPlanDeactivated 
          ? "bg-gradient-to-r from-red-600 via-red-700 to-red-800"
          : student?.isPlanActive 
            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
            : "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800"
      }`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium">Learning Path</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {student?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-indigo-100 max-w-md">
            {programName 
              ? `Program: ${programName}`
              : "Ready to start your learning journey?"}
          </p>
          {courseName && (
            <p className="text-indigo-100 text-sm mt-1 opacity-80">
              Course: {courseName}
            </p>
          )}
          
          {/* Plan Status Message */}
          {planStatusMessage && (
            <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              isPlanDeactivated 
                ? "bg-red-500/30 text-red-100"
                : student?.isPlanActive 
                  ? "bg-green-500/30 text-green-100"
                  : "bg-yellow-500/30 text-yellow-100"
            }`}>
              {isPlanDeactivated ? (
                <Ban className="h-4 w-4" />
              ) : student?.isPlanActive ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {planStatusMessage}
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const colorMap = {
            indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
            blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
            green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
            purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
            yellow: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
          };
          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-6 transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {card.title}
                  </p>
                  <p className="mt-1 md:mt-2 text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {card.value}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 truncate">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`rounded-lg p-2 md:p-3 flex-shrink-0 ${colorMap[card.color]}`}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            const colorMap = {
              blue: "from-blue-500 to-blue-600",
              green: "from-green-500 to-green-600",
              purple: "from-purple-500 to-purple-600",
              orange: "from-orange-500 to-orange-600",
            };
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className="group text-left p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorMap[action.color]} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Get started
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* My Program & Course Section */}
      {(programName || courseName) && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-500" />
            My Enrollment
          </h2>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                {/* Program Card */}
                {programName && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Program</p>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {programName}
                        </h3>
                      </div>
                    </div>
                    {student?.programId?.code && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Code: {student.programId.code}
                      </p>
                    )}
                  </div>
                )}

                {/* Course Card */}
                {courseName && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Course</p>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {courseName}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/student/subjects?course=${courseId}`)}
                      className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      View Subjects
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Enrollment Message */}
      {!programName && !courseName && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-2">
            No Program Assigned Yet
          </h3>
          <p className="text-amber-700 dark:text-amber-500 text-sm max-w-md mx-auto">
            Please contact an administrator to assign you to a program and course.
          </p>
        </div>
      )}

      {/* Subscription Plans */}
      {!isPlanDeactivated && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscription Plans
          </h2>

          {loadingPlans ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const status = getPlanStatus(plan._id);
                const expiry = myPlans[plan._id];
                const timeLeft = getTimeLeft(expiry);
                const isPopular = index === 1;
                const isCurrentPlan = student?.planId?._id === plan._id;

                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-xl border transition-all duration-300 bg-white dark:bg-gray-900 ${
                      status === "active" && isCurrentPlan
                        ? "border-green-500 shadow-lg shadow-green-500/10"
                        : status === "expired"
                        ? "border-red-400"
                        : isPopular
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200 dark:border-gray-800 hover:shadow-lg"
                    }`}
                  >
                    {isPopular && status !== "active" && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {status === "active" && isCurrentPlan && (
                      <div className="absolute top-3 right-3">
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      </div>
                    )}

                    {status === "expired" && (
                      <div className="absolute top-3 right-3">
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-full">
                          <AlertCircle className="h-3 w-3" />
                          Expired
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {plan.title}
                      </h3>
                      <div className="mb-4">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                          ₵{plan.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          /{plan.duration} {plan.durationUnit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Clock className="h-4 w-4" />
                        {plan.duration} {plan.durationUnit} access
                      </div>

                      {status === "active" && timeLeft && isCurrentPlan && (
                        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                            ⏳ {timeLeft}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 mb-6 max-h-32 overflow-y-auto">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Included Subjects:
                        </p>
                        {plan.subjects?.slice(0, 4).map((subject) => (
                          <div key={subject._id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            <span className="truncate">{subject.name}</span>
                          </div>
                        ))}
                        {plan.subjects?.length > 4 && (
                          <p className="text-xs text-gray-400">+{plan.subjects.length - 4} more</p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedPlan(plan)}
                        disabled={status === "active" && isCurrentPlan}
                        className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                          status === "active" && isCurrentPlan
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : status === "expired"
                            ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25"
                            : "bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg"
                        }`}
                      >
                        {status === "active" && isCurrentPlan
                          ? "Currently Active"
                          : status === "expired"
                          ? "Renew Plan"
                          : "Choose Plan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Deactivated Plan Message */}
      {isPlanDeactivated && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <Ban className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
            Plan Deactivated
          </h3>
          <p className="text-red-700 dark:text-red-500 text-sm max-w-md mx-auto">
            Your plan has been deactivated by an administrator. Please contact support for more information.
          </p>
          <button
            onClick={() => navigate("/student/payments")}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            View Payment History
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md relative shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedPlan.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Complete payment to unlock access
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ₵{selectedPlan.price}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedPlan.duration} {selectedPlan.durationUnit} access
                </p>
              </div>
              <PaystackPayment plan={selectedPlan} onSuccess={() => setSelectedPlan(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
};

export default StudentDashboard;