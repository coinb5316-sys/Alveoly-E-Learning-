// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap, FaBook } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const SignupPage = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    courseId: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await API.get("/courses");
        // Ensure we're setting an array even if response is unexpected
        const coursesData = Array.isArray(res.data) ? res.data : [];
        setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses([]); // Set empty array on error
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId) {
      alert("Please select a course");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/student/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
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
      if (res.requiresCourse) {
        navigate("/select-course");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Google signup failed");
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
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12 text-white flex flex-col justify-center">
                <FaGraduationCap className="text-4xl md:text-5xl mb-6" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Your Journey</h2>
                <p className="text-blue-100 mb-6 text-sm md:text-base">
                  Join thousands of students pursuing excellence in health sciences.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-xs md:text-sm">Access to expert tutors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-xs md:text-sm">Practical learning resources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-xs md:text-sm">Career guidance & mentorship</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Signup Form */}
              <div className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-500 mb-6 text-sm md:text-base">Start learning today</p>

                {/* Google Signup */}
                <div className="mb-6">
                  {!googleLoading ? (
                    <GoogleLogin
                      onSuccess={handleGoogleAuth}
                      onError={() => alert("Google signup failed")}
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
                    <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Password"
                      className="w-full pl-10 pr-12 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 md:top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="relative">
                    <FaBook className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <select
                      name="courseId"
                      value={form.courseId}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm md:text-base"
                      disabled={loadingCourses}
                    >
                      <option value="">
                        {loadingCourses ? "Loading courses..." : "Select Your Course"}
                      </option>
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <option key={course._id || course.id} value={course._id || course.id}>
                            {course.name || course.title}
                          </option>
                        ))
                      ) : (
                        !loadingCourses && (
                          <option value="" disabled>No courses available</option>
                        )
                      )}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || loadingCourses}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 text-sm md:text-base"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <p className="mt-6 text-center text-gray-600 text-sm md:text-base">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
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