// src/pages/Login.jsx - WITH USER TYPE SELECTION FOR GOOGLE LOGIN
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap, FaSpinner, FaUserGraduate, FaUserPlus } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("");
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectUrl = localStorage.getItem("redirectAfterLogin");
    if (redirectUrl) {
      localStorage.removeItem("redirectAfterLogin");
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form);
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
        return;
      }
      if (result.user?.role === "admin") {
        navigate("/admin");
      } else if (result.user?.role === "lecturer") {
        navigate("/lecturer");
      } else if (result.requiresProgram) {
        navigate("/select-program");
      } else {
        navigate("/student/dashboard");
      }
      toast.success("Login successful!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("No Google credential received");
      
      // Store the credential for later use
      setPendingGoogleCredential(idToken);
      
      // First, try to login with Google to check if user exists
      try {
        const result = await googleLogin(idToken);
        console.log("Google login result:", result);
        
        // If user already exists, proceed normally
        const redirectUrl = localStorage.getItem("redirectAfterLogin");
        if (redirectUrl) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectUrl);
          return;
        }
        
        if (result.user?.role === "admin") {
          navigate("/admin");
        } else if (result.user?.role === "lecturer") {
          navigate("/lecturer");
        } else if (result.requiresProgram) {
          navigate("/select-program");
        } else {
          navigate("/student/dashboard");
        }
        toast.success("Login successful!");
        setPendingGoogleCredential(null);
      } catch (err) {
        // If user doesn't exist (404 or specific error), show user type modal
        if (err.response?.status === 404 || 
            err.response?.data?.message?.includes("not found") ||
            err.response?.data?.message?.includes("User not found")) {
          setShowUserTypeModal(true);
          setGoogleLoading(false);
        } else {
          // Re-throw other errors
          throw err;
        }
      }
    } catch (err) {
      console.error("Google login error:", err);
      toast.error(err.response?.data?.message || "Google login failed");
      setGoogleLoading(false);
      setPendingGoogleCredential(null);
    }
  };

  const handleUserTypeSelection = async () => {
    if (!selectedUserType) {
      toast.error("Please select your user type");
      return;
    }
    
    try {
      setGoogleLoading(true);
      // Login again with userType
      const result = await googleLogin(pendingGoogleCredential, selectedUserType);
      console.log("Google login with user type result:", result);
      
      setShowUserTypeModal(false);
      setPendingGoogleCredential(null);
      setSelectedUserType("");
      
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
        return;
      }
      
      if (result.user?.role === "admin") {
        navigate("/admin");
      } else if (result.user?.role === "lecturer") {
        navigate("/lecturer");
      } else if (result.requiresProgram) {
        navigate("/select-program");
      } else {
        navigate("/student/dashboard");
      }
      toast.success("Login successful!");
    } catch (err) {
      console.error("Google login with user type error:", err);
      toast.error(err.response?.data?.message || "Failed to complete login");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster position="top-right" />
      <Navbar />
      
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="grid md:grid-cols-2">
              {/* Left Side - Branding */}
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white flex flex-col justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                  <FaGraduationCap className="text-3xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-indigo-100 mb-6">
                  Continue your journey towards excellence in health sciences education.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                    <span className="text-sm">Access to 100+ programs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                    <span className="text-sm">Expert mentorship</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                    <span className="text-sm">24/7 learning support</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Login</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Access your account</p>

                {/* Google Login */}
                <div className="mb-6">
                  {!googleLoading ? (
                    <div className="w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleAuth}
                        onError={() => toast.error("Google login failed")}
                        useOneTap
                        theme="outline"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                        logo_alignment="center"
                        width="100%"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full py-3 border rounded-lg bg-gray-50 dark:bg-slate-800">
                      <FaSpinner className="animate-spin text-indigo-600" />
                      <span className="text-gray-600 dark:text-gray-400">Connecting...</span>
                    </div>
                  )}
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-slate-400 text-sm md:text-base" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm md:text-base transition-all"
                    />
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-slate-400 text-sm md:text-base" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Password"
                      className="w-full pl-10 pr-12 py-2 md:py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm md:text-base transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 md:top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <Link to="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-indigo-500/25"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <p className="mt-6 text-center text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 transition">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Type Selection Modal - For New Google Users */}
      <AnimatePresence>
        {showUserTypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center mx-auto mb-4">
                  <FaUserGraduate className="text-3xl text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to Alveoly!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  Please select your user type to continue
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setSelectedUserType("alveoly_student")}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                    selectedUserType === "alveoly_student"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">
                    <FaUserGraduate />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Alveoly Student</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">I am currently enrolled at Alveoly</p>
                  </div>
                  {selectedUserType === "alveoly_student" && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">✓</div>
                  )}
                </button>

                <button
                  onClick={() => setSelectedUserType("non_alveoly_student")}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                    selectedUserType === "non_alveoly_student"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl">
                    <FaUserPlus />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Non-Alveoly Student</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">I am not currently enrolled at Alveoly</p>
                  </div>
                  {selectedUserType === "non_alveoly_student" && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">✓</div>
                  )}
                </button>
              </div>

              <button
                onClick={handleUserTypeSelection}
                disabled={!selectedUserType || googleLoading}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {googleLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default LoginPage;