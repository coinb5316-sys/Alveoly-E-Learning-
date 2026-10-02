// pages/StudentPlans.jsx - COMPLETE FIXED VERSION (Server-Verified Rate + FA6)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCrown,
  FaCheck,
  FaSpinner,
  FaClock,
  FaCalendarDays,
  FaRocket,
  FaUnlock,
  FaLock,
  FaCircleCheck,
  FaTriangleExclamation,
  FaTag,
  FaArrowsRotate,
  FaDollarSign,
  FaCediSign,
} from "react-icons/fa6";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import PaystackPayment from "../components/PaystackPayment";

// ================= CONSTANTS =================
const FALLBACK_USD_TO_GHS = 11.74;
const MIN_REASONABLE_RATE = 5.0;
const MAX_REASONABLE_RATE = 30.0;

const StudentPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [userPlanExpiry, setUserPlanExpiry] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ================= EXCHANGE RATE STATE =================
  const [exchangeRate, setExchangeRate] = useState(null);
  const [exchangeRateLoading, setExchangeRateLoading] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchUserPlan();
    fetchExchangeRate();

    // Refresh exchange rate every 30 minutes
    const interval = setInterval(fetchExchangeRate, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ================= FETCH EXCHANGE RATE (FIXED) =================
  const fetchExchangeRate = async () => {
    try {
      setExchangeRateLoading(true);
      setExchangeRateError(null);

      // Removed frankfurter.app (doesn't support GHS)
      // Reordered: open.er-api.com first (most reliable for African currencies)
      const apis = [
        {
          url: "https://open.er-api.com/v6/latest/USD",
          extract: (data) => data?.rates?.GHS,
        },
        {
          url: "https://api.exchangerate-api.com/v4/latest/USD",
          extract: (data) => data?.rates?.GHS,
        },
      ];

      let rate = null;
      let failedApis = [];

      for (const api of apis) {
        try {
          const response = await fetch(api.url);
          if (!response.ok) {
            failedApis.push(`${api.url} (HTTP ${response.status})`);
            continue;
          }
          const data = await response.json();
          const extractedRate = api.extract(data);

          console.log(`📡 ${api.url} → GHS = ${extractedRate}`);

          // Range validation — reject garbage values
          if (
            extractedRate &&
            extractedRate >= MIN_REASONABLE_RATE &&
            extractedRate <= MAX_REASONABLE_RATE
          ) {
            rate = extractedRate;
            break;
          } else if (extractedRate) {
            failedApis.push(`${api.url} (rate ${extractedRate} out of range)`);
          } else {
            failedApis.push(`${api.url} (no GHS in response)`);
          }
        } catch (err) {
          failedApis.push(`${api.url} (${err.message})`);
          continue;
        }
      }

      if (rate) {
        setExchangeRate(rate);
        setLastUpdated(new Date().toLocaleString());
        console.log(`✅ Exchange rate loaded: 1 USD = ${rate} GHS`);
      } else {
        console.warn(
          `⚠️ All exchange rate APIs failed. Failed: ${failedApis.join(", ")}. Using fallback ${FALLBACK_USD_TO_GHS}`
        );
        setExchangeRate(FALLBACK_USD_TO_GHS);
        setExchangeRateError("Using fallback rate - live rate unavailable");
      }
    } catch (err) {
      console.error("❌ Exchange rate fetch error:", err);
      setExchangeRate(FALLBACK_USD_TO_GHS);
      setExchangeRateError("Using fallback rate - live rate unavailable");
    } finally {
      setExchangeRateLoading(false);
    }
  };

  // ================= CURRENCY CONVERSION =================
  const convertToGHS = (usdAmount) => {
    if (!exchangeRate || usdAmount === 0 || usdAmount === "0") return 0;
    const amount = parseFloat(usdAmount);
    if (isNaN(amount)) return 0;
    return (amount * exchangeRate).toFixed(2);
  };

  // Format currency for display
  const formatUSD = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  const formatGHS = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "GH₵0.00";
    return `GH₵${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/plans/public");
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const res = await API.get("/auth/me");
      if (res.data.planId) {
        setUserPlan(res.data.planId);
        setUserPlanExpiry(res.data.planExpiryDate);
        setIsSubscribed(res.data.isPlanActive);
      }
    } catch (err) {
      console.error("Error fetching user plan:", err);
    }
  };

  const getDurationLabel = (duration, unit) => {
    const units = {
      day: "Day",
      week: "Week",
      month: "Month",
      year: "Year",
    };
    return `${duration} ${units[unit] || unit}${duration > 1 ? "s" : ""}`;
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment successful! Your plan is now active.");
    setSelectedPlan(null);
    fetchUserPlan();
    fetchPlans();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return "Less than an hour remaining";
  };

  // Check if user has access to free plan content
  const hasFreeAccess = user?.planId?.isFree || user?.planId?.freeAccess;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaCrown className="h-10 w-10 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Subscription Plans
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Choose a plan that fits your learning needs. Get access to premium
            content, practice questions, and expert resources.
          </p>

          {/* Exchange Rate Banner */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <button
              onClick={fetchExchangeRate}
              disabled={exchangeRateLoading}
              className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Refresh exchange rate"
            >
              <FaArrowsRotate
                className={`h-3.5 w-3.5 text-gray-500 dark:text-gray-400 ${
                  exchangeRateLoading ? "animate-spin" : ""
                }`}
              />
            </button>
            {exchangeRate ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  1 USD = {exchangeRate.toFixed(2)} GHS
                </span>
                {lastUpdated && (
                  <span className="text-gray-400 dark:text-gray-500 text-xs hidden sm:inline">
                    • Updated {lastUpdated}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-500">
                Loading exchange rate...
              </span>
            )}
            {exchangeRateError && (
              <span className="text-amber-500 text-xs ml-2">
                ⚠ {exchangeRateError}
              </span>
            )}
          </div>
        </div>

        {/* Current Subscription Status */}
        {userPlan && (
          <div
            className={`rounded-xl border p-6 ${
              isSubscribed
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20"
                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${
                    isSubscribed
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {isSubscribed ? (
                    <FaCircleCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <FaTriangleExclamation className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current Plan
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userPlan.title}
                  </p>
                  {isSubscribed && userPlanExpiry && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getTimeLeft(userPlanExpiry)}
                    </p>
                  )}
                  {isSubscribed && userPlanExpiry && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Expires: {formatDate(userPlanExpiry)}
                    </p>
                  )}
                  {!isSubscribed && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Your plan has expired. Please renew to continue access.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Show current plan price */}
                {userPlan && !userPlan.isFree && !userPlan.freeAccess && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Plan Price
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {formatUSD(userPlan.price)}
                      {exchangeRate && (
                        <span className="text-xs text-gray-500 ml-1">
                          (≈ {formatGHS(convertToGHS(userPlan.price))})
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {hasFreeAccess && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    Free Access
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="h-8 w-8 text-yellow-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 mt-3">
              Loading plans...
            </p>
          </div>
        )}

        {/* No Plans */}
        {!loading && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <FaRocket className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No plans available at the moment
            </p>
          </div>
        )}

        {/* Plans Grid */}
        {!loading && plans.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const isPopular = index === 1 && !plan.isFree;
              const isCurrentPlan = userPlan?._id === plan._id;
              const isFreePlan = plan.isFree || plan.freeAccess;
              const priceInGHS = convertToGHS(plan.price);

              return (
                <div
                  key={plan._id}
                  className={`relative rounded-xl border transition-all duration-300 ${
                    isCurrentPlan
                      ? "border-yellow-500 shadow-lg shadow-yellow-500/20 bg-yellow-50 dark:bg-yellow-950/20"
                      : isPopular
                      ? "border-blue-500 shadow-lg bg-white dark:bg-gray-900"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg"
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full shadow-lg">
                        Current Plan
                      </span>
                    </div>
                  )}

                  {/* Plan Content */}
                  <div className="p-6">
                    {/* Plan Type */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {isFreePlan ? (
                          <FaTag className="h-5 w-5 text-green-500" />
                        ) : (
                          <FaCrown className="h-5 w-5 text-yellow-500" />
                        )}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {plan.title}
                        </h3>
                      </div>
                      {isFreePlan && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                          Free
                        </span>
                      )}
                    </div>

                    {/* Price with GHS Conversion */}
                    <div className="mb-4">
                      {isFreePlan ? (
                        <div>
                          <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                            Free
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            No payment required
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                              {formatUSD(plan.price)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              /{getDurationLabel(plan.duration, plan.durationUnit)}
                            </span>
                          </div>
                          {/* GHS Price - Prominent Display */}
                          {exchangeRate && priceInGHS > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                                <FaCediSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                  {formatGHS(priceInGHS)}
                                </span>
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                at {exchangeRate.toFixed(2)} GHS/USD
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <FaCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Access Info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {plan.unlocksAllContent || plan.accessLevel === "full" ? (
                        <>
                          <FaUnlock className="h-3 w-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">
                            Full Access
                          </span>
                        </>
                      ) : (
                        <>
                          <FaLock className="h-3 w-3 text-yellow-500" />
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Limited Access
                          </span>
                        </>
                      )}
                    </div>

                    {/* Subjects/Courses/Programs count */}
                    {(plan.subjects?.length > 0 ||
                      plan.courses?.length > 0 ||
                      plan.programs?.length > 0) && (
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {plan.subjects?.length > 0 && (
                          <span>{plan.subjects.length} Subjects</span>
                        )}
                        {plan.courses?.length > 0 && (
                          <span>{plan.courses.length} Courses</span>
                        )}
                        {plan.programs?.length > 0 && (
                          <span>{plan.programs.length} Programs</span>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                      >
                        Currently Active
                      </button>
                    ) : isFreePlan ? (
                      <button
                        onClick={() => {
                          // Assign free plan directly
                          API.post("/auth/assign-plan", {
                            userId: user._id,
                            planId: plan._id,
                          })
                            .then(() => {
                              toast.success("Free plan assigned successfully!");
                              fetchUserPlan();
                              fetchPlans();
                            })
                            .catch((err) => {
                              toast.error("Failed to assign free plan");
                            });
                        }}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25"
                      >
                        Get Free Access
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlanSelect(plan)}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-yellow-500/25"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Choose Plan
                          {exchangeRate && priceInGHS > 0 && (
                            <span className="text-xs opacity-90">
                              ({formatGHS(priceInGHS)})
                            </span>
                          )}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Price Display with Conversion */}
                <div className="text-center mb-6">
                  <div className="flex flex-col items-center gap-1">
                    {/* USD Price */}
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {formatUSD(selectedPlan.price)}
                    </p>

                    {/* GHS Conversion - Prominent */}
                    {exchangeRate && (
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <FaCediSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          <span className="text-lg font-bold text-green-700 dark:text-green-400">
                            {formatGHS(convertToGHS(selectedPlan.price))}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Exchange rate: 1 USD = {exchangeRate.toFixed(2)} GHS
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {getDurationLabel(
                        selectedPlan.duration,
                        selectedPlan.durationUnit
                      )}{" "}
                      access
                    </p>

                    {selectedPlan.features && selectedPlan.features.length > 0 && (
                      <div className="mt-4 text-left space-y-1 w-full">
                        {selectedPlan.features.slice(0, 3).map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <FaCheck className="h-3 w-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info - Shows both currencies */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Amount (USD)
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatUSD(selectedPlan.price)}
                    </span>
                  </div>
                  {exchangeRate && (
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        Amount (GHS)
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatGHS(convertToGHS(selectedPlan.price))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Paystack Payment */}
                <PaystackPayment
                  plan={selectedPlan}
                  exchangeRate={exchangeRate}
                  amountInGHS={convertToGHS(selectedPlan.price)}
                  onSuccess={() => {
                    handlePaymentSuccess();
                    setSelectedPlan(null);
                  }}
                />

                {/* Secure Payment Note */}
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                  Secure payment powered by Paystack • You will be charged in GHS
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPlans;