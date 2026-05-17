import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";
import { FaEnvelope, FaArrowRight, FaCheckCircle, FaSpinner } from "react-icons/fa";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize EmailJS once
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY2;
    if (publicKey) {
      emailjs.init(publicKey);
    } else {
      console.error("EmailJS PUBLIC KEY is missing in .env");
      setError("Email service configuration error");
    }
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // Call backend
      const res = await API.post("/auth/forgot-password", { email });

      const { email: userEmail, name, resetLink } = res.data;

      // Validate response
      if (!userEmail || !resetLink) {
        throw new Error("Failed to generate reset email data");
      }

      // Validate ENV variables
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID2;
      const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID2;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY2;

      if (!serviceID || !templateID || !publicKey) {
        throw new Error("Email service not configured properly");
      }

      // Send email
      await emailjs.send(
        serviceID,
        templateID,
        {
          to_email: userEmail,
          name: name || "User",
          reset_link: resetLink,
          current_year: new Date().getFullYear(),
        },
        publicKey
      );

      setSent(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              {/* Left Side - Branding */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 md:p-10 lg:p-12 text-white flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <FaEnvelope className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4">
                    Forgot Password?
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm md:text-base leading-relaxed">
                    Don't worry! We'll help you reset your password and get back to learning.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {[
                    "Enter your registered email",
                    "Receive reset link via email",
                    "Create a new secure password",
                  ].map((text, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-300 rounded-full flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm text-blue-100">
                        {text}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right Side - Form */}
              <div className="p-6 sm:p-8 md:p-10 lg:p-12">
                {!sent ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Reset Password
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                          placeholder="Email Address"
                          required
                          disabled={loading}
                          className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-blue-500/25"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Reset Link</span>
                            <FaArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Remember your password?{" "}
                      <button
                        onClick={() => navigate("/login")}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Back to Login
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 sm:py-8"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <FaCheckCircle className="text-3xl sm:text-4xl text-green-500" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      Email Sent! 🎉
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400 mb-3 sm:mb-4 break-all text-sm sm:text-base">
                      {email}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-4 sm:mb-6">
                      Please check your inbox (and spam folder).
                    </p>
                    <button
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm sm:text-base"
                    >
                      Return to Login
                      <FaArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;