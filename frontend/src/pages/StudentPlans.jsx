// StudentPlans.jsx - Professional styling with dark mode
import { useEffect, useState } from "react";
import API from "../api/axios";
import PaystackPayment from "../pages/PaystackPayment";
import {
  Check,
  Clock,
  AlertTriangle,
  Crown,
  Zap,
  Star,
  Sparkles,
  CheckCircle,
  Loader2,
  CreditCard,
  Calendar,
  TrendingUp,
  Shield,
  Gift,
  X
} from "lucide-react";

const StudentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [myPlans, setMyPlans] = useState({});
  const [now, setNow] = useState(Date.now());
  const [hoveredPlan, setHoveredPlan] = useState(null);

  // ================= LIVE TIMER =================
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ================= FETCH PLANS =================
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

  // ================= FETCH USER PAYMENTS =================
  useEffect(() => {
    const fetchMyPayments = async () => {
      try {
        const res = await API.get("/payments/mine");
        const planMap = {};
        res.data
          .filter((p) => p.status === "success" && p.planId)
          .forEach((p) => {
            const existing = planMap[p.planId];
            if (!existing || new Date(p.expiresAt) > new Date(existing)) {
              planMap[p.planId] = p.expiresAt;
            }
          });
        setMyPlans(planMap);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyPayments();
  }, []);

  // ================= STATUS =================
  const getPlanStatus = (planId) => {
    const expiry = myPlans[planId];
    if (!expiry) return "none";
    return new Date(expiry).getTime() > now ? "active" : "expired";
  };

  // ================= COUNTDOWN =================
  const getTimeLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // ================= PROGRESS =================
  const getProgress = (expiresAt, duration, unit) => {
    if (!expiresAt) return 0;
    const end = new Date(expiresAt).getTime();
    const totalDurationMs = convertToMs(duration, unit);
    const start = end - totalDurationMs;
    const progress = ((now - start) / totalDurationMs) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const convertToMs = (value, unit) => {
    const map = {
      minutes: 60000,
      hours: 3600000,
      days: 86400000,
      weeks: 604800000,
      months: 2592000000,
    };
    return value * (map[unit] || map.days);
  };

  // Stats
  const activePlans = Object.values(myPlans).filter(expiry => new Date(expiry).getTime() > now).length;
  const totalSubjects = plans.reduce((acc, plan) => acc + (plan.subjects?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Subscription Plans
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose the perfect plan to unlock premium content and accelerate your learning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Active: {activePlans}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {plans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Available Plans</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {plans.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Crown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Subscriptions</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
                  {activePlans}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Subjects Available</p>
                <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
                  {totalSubjects}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Money Saved</p>
                <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
                  Up to 30%
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                <Gift className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingPlans && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">Loading plans...</p>
        </div>
      )}

      {/* Plans Grid */}
      {!loadingPlans && plans.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Crown className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Plans Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Subscription plans will appear here once they're added by the administrator.
            </p>
          </div>
        </div>
      )}

      {!loadingPlans && plans.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            const status = getPlanStatus(plan._id);
            const expiry = myPlans[plan._id];
            const timeLeft = getTimeLeft(expiry);
            const progress = getProgress(expiry, plan.duration, plan.durationUnit);
            const isHovered = hoveredPlan === plan._id;

            return (
              <div
                key={plan._id}
                onMouseEnter={() => setHoveredPlan(plan._id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative rounded-xl transition-all duration-300 overflow-hidden ${
                  status === "active"
                    ? "border-green-500 shadow-lg shadow-green-500/10 bg-white dark:bg-gray-900"
                    : status === "expired"
                    ? "border-red-400 bg-gray-50 dark:bg-gray-800/30"
                    : isPopular
                    ? "border-blue-500 shadow-xl scale-105 bg-white dark:bg-gray-900"
                    : "border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-900"
                } border`}
              >
                {/* Popular Badge */}
                {isPopular && status !== "active" && status !== "expired" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-4 right-4 z-10">
                  {status === "active" && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-full shadow-lg">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  )}
                  {status === "expired" && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-full shadow-lg">
                      <AlertTriangle className="h-3 w-3" />
                      Expired
                    </span>
                  )}
                </div>

                <div className="p-6 relative z-10">
                  {/* Plan Icon and Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${
                      status === "active"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : isPopular
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : "bg-gradient-to-r from-gray-500 to-gray-600"
                    }`}>
                      {status === "active" ? (
                        <Shield className="h-6 w-6 text-white" />
                      ) : isPopular ? (
                        <Crown className="h-6 w-6 text-white" />
                      ) : (
                        <Zap className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {plan.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                          ₵{plan.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          /{plan.duration} {plan.durationUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>{plan.duration} {plan.durationUnit} access</span>
                  </div>

                  {/* Countdown Timer */}
                  {status === "active" && timeLeft && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Time Remaining</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{timeLeft}</span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expired Message */}
                  {status === "expired" && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <p className="text-xs text-red-600 dark:text-red-400 text-center">
                        Your plan has expired. Renew to continue accessing premium content.
                      </p>
                    </div>
                  )}

                  {/* Subjects List */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Included Subjects
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {plan.subjects?.map((subject, idx) => (
                        <div key={subject._id} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            {subject.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={status === "active"}
                    onClick={() => setSelectedPlan(plan)}
                    className={`mt-6 w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      status === "active"
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        : status === "expired"
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25"
                        : isPopular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg"
                    }`}
                  >
                    {status === "active" ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Currently Active
                      </>
                    ) : status === "expired" ? (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Renew Plan
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Get Started
                      </>
                    )}
                  </button>

                  {/* Savings Indicator */}
                  {isPopular && status !== "active" && status !== "expired" && (
                    <div className="mt-3 text-center">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        🎯 Best value for money
                      </span>
                    </div>
                  )}
                </div>

                {/* Gradient border effect for active plans */}
                {status === "active" && (
                  <div className="absolute inset-0 border-2 border-green-500 rounded-xl pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Features Section */}
      {!loadingPlans && plans.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            All Plans Include
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Full subject access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">24/7 access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                <Shield className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Secure payment</span>
            </div>
          </div>
        </div>
      )}

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
                <div className="inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mb-3">
                  <Crown className="h-8 w-8 text-white" />
                </div>
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

export default StudentPlans;