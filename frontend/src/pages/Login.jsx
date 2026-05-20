// src/pages/Login.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Check for redirect after login
  useEffect(() => {
    const redirectUrl = localStorage.getItem("redirectAfterLogin");
    if (redirectUrl) {
      localStorage.removeItem("redirectAfterLogin");
      // Don't auto-redirect here, wait for login
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      
      // Check for saved redirect URL
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
        return;
      }
      
      // Default redirect based on role
      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "lecturer") {
        navigate("/lecturer");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("No Google credential received");
      
      const res = await googleLogin(idToken);
      const userRole = res.user?.role;
      
      console.log("Google login user:", res.user);
      
      // Check for saved redirect URL
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
        return;
      }
      
      // Default redirect based on role
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "lecturer") {
        navigate("/lecturer");
      } else if (res.requiresCourse) {
        navigate("/select-program");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert(err.response?.data?.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
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
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 text-white flex flex-col justify-center">
                <FaGraduationCap className="text-5xl mb-6" />
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-blue-100 mb-6">
                  Continue your journey towards excellence in health sciences education.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm">Access to 100+ programs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm">Expert mentorship</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm">24/7 learning support</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
                <p className="text-gray-500 mb-6">Access your account</p>

                {/* Google Login */}
                <div className="mb-6">
                  {!googleLoading ? (
                    <GoogleLogin
                      onSuccess={handleGoogleAuth}
                      onError={() => alert("Google login failed")}
                      useOneTap
                    />
                  ) : (
                    <div className="text-center text-gray-500">Connecting...</div>
                  )}
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LoginPage;