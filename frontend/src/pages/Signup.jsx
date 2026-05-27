// src/pages/SignupPage.jsx - Complete working version with course selection
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaGraduationCap, 
  FaBuilding,
  FaBook,
  FaSpinner
} from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const SignupPage = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    programId: "",
    courseId: "",
  });

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const res = await API.get("/programs/public");
        const activePrograms = (res.data || []).filter(p => p.isActive !== false);
        setPrograms(activePrograms);
      } catch (err) {
        console.error("Error fetching programs:", err);
        toast.error("Failed to load programs");
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch courses when program changes
  const handleProgramChange = async (programId) => {
    setForm({ ...form, programId, courseId: "" });
    if (programId) {
      try {
        setLoadingCourses(true);
        const res = await API.get(`/courses/program/${programId}`);
        setCourses(res.data || []);
        if (res.data.length === 0) {
          toast.warning("No courses available for this program.");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    } else {
      setCourses([]);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.programId) {
      toast.error("Please select a program");
      return;
    }
    
    if (!form.courseId) {
      toast.error("Please select a course");
      return;
    }
    
    setLoading(true);
    try {
      const result = await register(form);
      toast.success("Account created successfully!");
      navigate("/student/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("No Google credential received");
      const result = await googleLogin(idToken);
      navigate("/student/dashboard");
      toast.success("Google signup successful!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Google signup failed");
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
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Your Journey</h2>
                <p className="text-indigo-100 mb-6 text-sm md:text-base">
                  Join thousands of students pursuing excellence in health sciences.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                    <span className="text-xs md:text-sm">Access to expert tutors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                    <span className="text-xs md:text-sm">Practical learning resources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                    <span className="text-xs md:text-sm">Career guidance & mentorship</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Signup Form */}
              <div className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm md:text-base">Start learning today</p>

                {/* Google Signup */}
                <div className="mb-6">
                  {!googleLoading ? (
                    <div className="w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleAuth}
                        onError={() => toast.error("Google signup failed")}
                        useOneTap
                        theme="outline"
                        size="large"
                        text="signup_with"
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
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">Or sign up with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-slate-400 text-sm md:text-base" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm md:text-base transition-all"
                    />
                  </div>

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

                  {/* Program Selection */}
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-3 text-slate-400 text-sm md:text-base" />
                    <select
                      name="programId"
                      value={form.programId}
                      onChange={(e) => handleProgramChange(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none cursor-pointer text-sm md:text-base transition-all"
                      disabled={loadingPrograms}
                    >
                      <option value="">
                        {loadingPrograms ? "Loading programs..." : "Select Your Program"}
                      </option>
                      {programs.map((program) => (
                        <option key={program._id} value={program._id}>
                          {program.name} {program.code ? `(${program.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course Selection */}
                  {form.programId && (
                    <div className="relative">
                      <FaBook className="absolute left-3 top-3 text-slate-400 text-sm md:text-base" />
                      <select
                        name="courseId"
                        value={form.courseId}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 md:py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none cursor-pointer text-sm md:text-base transition-all"
                        disabled={loadingCourses}
                      >
                        <option value="">
                          {loadingCourses ? "Loading courses..." : "Select Your Course"}
                        </option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                      {courses.length === 0 && !loadingCourses && form.programId && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          No courses available for this program. Please contact admin.
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || loadingPrograms || programs.length === 0 || !form.courseId}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 text-sm md:text-base shadow-lg shadow-indigo-500/25"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  Already have an account?{" "}
                  <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 transition">
                    Login
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

export default SignupPage;