// StudentDashboard.jsx - Updated with Program support
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
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PaystackPayment from "../pages/PaystackPayment";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    examsTaken: 0,
    averagePerformance: 0,
  });
  const [myPlans, setMyPlans] = useState({});
  const [now, setNow] = useState(new Date());

  // Timer for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch student data (includes program and course)
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await API.get("/auth/me");
        console.log("Student data:", res.data); // Debug log
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
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
      subtitle: "Practice questions",
    },
    {
      title: "Exams Taken",
      value: stats.examsTaken,
      icon: CheckCircle,
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
          alert("No course assigned yet. Please contact admin.");
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
          alert("No course assigned yet. Please contact admin.");
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

  return (
    <div className="space-y-6">
      {/* Welcome Header - Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
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
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
      </div>

      {/* Stats Grid - Includes Program and Course */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
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
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${colorMap[card.color]}`}>
                  <Icon className="h-5 w-5" />
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
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Program Card */}
                {programName && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Program</p>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Course</p>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
          <p className="text-amber-700 dark:text-amber-500 text-sm">
            Please contact an administrator to assign you to a program and course.
          </p>
        </div>
      )}

      {/* Subscription Plans */}
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

              return (
                <div
                  key={plan._id}
                  className={`relative rounded-xl border transition-all duration-300 bg-white dark:bg-gray-900 ${
                    status === "active"
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

                  {status === "active" && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    </div>
                  )}

                  {status === "expired" && (
                    <div className="absolute top-4 right-4">
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

                    {status === "active" && timeLeft && (
                      <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                          ⏳ {timeLeft}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Included Subjects:
                      </p>
                      {plan.subjects?.map((subject) => (
                        <div key={subject._id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          {subject.name}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      disabled={status === "active"}
                      className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                        status === "active"
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          : status === "expired"
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                          : "bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg"
                      }`}
                    >
                      {status === "active"
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

      {/* Payment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md relative shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
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
    </div>
  );
};

export default StudentDashboard;