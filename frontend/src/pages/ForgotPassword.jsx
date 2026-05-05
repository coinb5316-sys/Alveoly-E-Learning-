import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import forgotIllustration from "../assets/forgot-password.png";
import API from "../api/axios";
import { FaEnvelope, FaArrowRight, FaCheckCircle } from "react-icons/fa";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize EmailJS once
  useEffect(() => {
    if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY2) {
      emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY2);
    } else {
      console.error("EmailJS PUBLIC KEY is missing in .env");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return alert("Please enter your email");
    }

    try {
      setLoading(true);

      // Call backend
      const res = await API.post("/auth/forgot-password", { email });

      console.log("BACKEND RESPONSE:", res.data);

      const { email: userEmail, name, resetLink } = res.data;

      // Validate response
      if (!userEmail || !resetLink) {
        console.error("Invalid backend response:", res.data);
        throw new Error("Failed to generate reset email data");
      }

      // Validate ENV variables
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID2;
      const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID2;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY2;

      if (!serviceID || !templateID || !publicKey) {
        console.error("Missing EmailJS ENV variables");
        throw new Error("Email service not configured properly");
      }

      // Send email
      const result = await emailjs.send(
        serviceID,
        templateID,
        {
          to_email: userEmail,
          name: name || "User",
          reset_link: resetLink,
        },
        publicKey
      );

      console.log("EMAILJS SUCCESS:", result);

      setSent(true);
    } catch (err) {
      console.error("EMAIL ERROR FULL:", err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              {/* Left Side - Branding */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12 text-white flex flex-col justify-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <FaEnvelope className="text-3xl text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Forgot Password?</h2>
                  <p className="text-blue-100 mb-6 text-sm md:text-base">
                    Don't worry! We'll help you reset your password and get back to learning.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm text-blue-100">Enter your registered email</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm text-blue-100">Receive reset link via email</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm text-blue-100">Create a new secure password</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="p-8 md:p-12">
                {!sent ? (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-gray-500 mb-6 text-sm md:text-base">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Reset Link
                            <FaArrowRight />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                      Remember your password?{" "}
                      <button
                        onClick={() => navigate("/login")}
                        className="text-blue-600 font-semibold hover:text-blue-700"
                      >
                        Back to Login
                      </button>
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaCheckCircle className="text-4xl text-green-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Email Sent! 🎉</h2>
                    <p className="text-gray-600 mb-2">We've sent a password reset link to:</p>
                    <p className="font-semibold text-blue-600 mb-4 break-all">{email}</p>
                    <p className="text-sm text-gray-500 mb-6">Please check your inbox (and spam folder).</p>
                    <button
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                    >
                      Return to Login
                      <FaArrowRight />
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