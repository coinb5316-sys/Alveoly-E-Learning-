// src/pages/Pricing.jsx - Public Pricing/Cart Page
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Zap,
  Star,
  CheckCircle,
  Loader2,
  CreditCard,
  Clock,
  Sparkles,
  Shield,
  TrendingUp,
  BookOpen,
  ChevronRight,
  X,
  User,
  Lock
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cartItems, getCartCount } = useCart();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState(null);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await API.get("/payments/plans/public");
        setPlans(res.data || []);
      } catch (err) {
        console.error("Error fetching plans:", err);
        toast.error("Failed to load plans");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleAddToCart = (plan) => {
    // Check if user is logged in
    if (!user) {
      setPendingPlanId(plan._id);
      setShowLoginPrompt(true);
      return;
    }

    // Check if plan is already in cart
    const existingInCart = cartItems.some(item => item.id === plan._id && item.type === "plan");
    if (existingInCart) {
      toast.info(`${plan.title} is already in your cart`);
      return;
    }

    addToCart({
      id: plan._id,
      type: "plan",
      name: plan.title,
      price: plan.price,
      quantity: 1,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      subjects: plan.subjects || [],
    });
    
    toast.success(`Added ${plan.title} to cart`);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    navigate("/cart");
  };

  const handleLoginRedirect = () => {
    localStorage.setItem("redirectAfterLogin", "/pricing");
    if (pendingPlanId) {
      localStorage.setItem("pendingPlanId", pendingPlanId);
    }
    navigate("/login");
    setShowLoginPrompt(false);
  };

  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 font-['Inter',sans-serif]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4">
            <Crown className="text-blue-600 dark:text-blue-400 text-sm h-4 w-4" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Subscription Plans</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Choose Your Learning Path
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Select the perfect plan to unlock premium content and accelerate your learning journey
          </p>
          
          {/* Cart Summary Button */}
          {cartCount > 0 && (
            <button
              onClick={handleProceedToCheckout}
              className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <span className="relative">
                <CreditCard className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </span>
              Proceed to Checkout ({cartCount} item{cartCount !== 1 ? 's' : ''})
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading plans...</p>
          </div>
        )}

        {/* Plans Grid */}
        {!loading && plans.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Plans Available</h3>
            <p className="text-gray-500 dark:text-gray-400">Subscription plans will be available soon.</p>
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const isPopular = plan.isPopular || index === 1;
              const isHovered = hoveredPlan === plan._id;
              const isInCart = cartItems.some(item => item.id === plan._id && item.type === "plan");

              return (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredPlan(plan._id)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`relative rounded-2xl transition-all duration-300 overflow-hidden ${
                    isPopular
                      ? "border-2 border-blue-500 shadow-xl shadow-blue-500/20 scale-105 bg-white dark:bg-gray-900"
                      : "border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-900"
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <span className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
                        <Star className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isPopular
                          ? "bg-gradient-to-br from-blue-500 to-purple-600"
                          : "bg-gradient-to-br from-gray-500 to-gray-600"
                      }`}>
                        {isPopular ? (
                          <Crown className="h-6 w-6 text-white" />
                        ) : (
                          <Zap className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {plan.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
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
                      <Clock className="h-4 w-4" />
                      <span>{plan.duration} {plan.durationUnit} access</span>
                    </div>

                    {/* Subjects Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <BookOpen className="h-4 w-4" />
                      <span>{plan.subjectCount || 0} subjects included</span>
                    </div>

                    {/* Subjects List */}
                    {plan.subjects && plan.subjects.length > 0 && (
                      <div className="mb-4 max-h-32 overflow-y-auto">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Included Subjects
                        </p>
                        <div className="space-y-1">
                          {plan.subjects.slice(0, 5).map((subject, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400 truncate">
                                {typeof subject === 'object' ? subject.name : subject}
                              </span>
                            </div>
                          ))}
                          {plan.subjects.length > 5 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              +{plan.subjects.length - 5} more subjects
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddToCart(plan)}
                        disabled={isInCart}
                        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          isInCart
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : isPopular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                            : "bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white"
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Add to Cart
                          </>
                        )}
                      </button>
                      
                      {isInCart && (
                        <button
                          onClick={() => navigate("/cart")}
                          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View Cart →
                        </button>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Shield className="h-3.5 w-3.5" />
                          <span>Secure payment</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Progress tracking</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>24/7 access</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Premium content</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All plans include full access to selected subjects. Cancel anytime.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Secure payment powered by Paystack
          </p>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login Required</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Please login or create an account to add items to your cart and checkout.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Login / Sign Up
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    setPendingPlanId(null);
                  }}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all"
                >
                  Continue Browsing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Pricing;