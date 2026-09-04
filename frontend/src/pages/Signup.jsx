// SignupPage.jsx - Updated with full registration flow
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaGraduationCap, 
  FaBuilding,
  FaBook,
  FaSpinner,
  FaUserGraduate,
  FaUserPlus,
  FaPhone,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
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
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showRegistrationSourceModal, setShowRegistrationSourceModal] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [registrationSource, setRegistrationSource] = useState("");
  const [registrationDetails, setRegistrationDetails] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    programId: "",
    courseId: "",
    userType: "",
  });
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

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

  const handleProgramChange = async (programId) => {
    setForm({ ...form, programId, courseId: "" });
    setCourses([]);
    
    if (programId && programId !== "") {
      try {
        setLoadingCourses(true);
        const res = await API.get(`/courses/public/program/${programId}`);
        const coursesData = Array.isArray(res.data) ? res.data : [];
        setCourses(coursesData);
        if (coursesData.length === 0) {
          toast.warning("No courses available for this program. Please contact admin.");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        toast.error("Failed to load courses. Please try again.");
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type);
    setForm({ ...form, userType: type });
    
    if (type === "alveoly_student") {
      setShowUserTypeModal(false);
      setShowRegistrationSourceModal(true);
    } else if (type === "non_alveoly_student") {
      setShowUserTypeModal(false);
      // Non-alveoly students go directly to registration
      handleNonAlveolyRegistration();
    }
  };

  // ================= REGISTRATION SOURCE MODAL =================
  const handleRegistrationSourceSelect = async (source) => {
    setRegistrationSource(source);
    
    if (source === "phone") {
      // User registered through phone
      setShowRegistrationSourceModal(false);
      
      // Proceed with registration for Alveoly student
      await handleAlveolyRegistration("phone", "");
    } else {
      // User registered through other means - show details textbox
      setShowRegistrationSourceModal(false);
      // Open a prompt for details
      const details = prompt("Please provide details about how you registered with Alveoly (e.g., through a friend, social media, event, etc.):");
      if (details) {
        await handleAlveolyRegistration("other", details);
      } else {
        toast.error("Registration details are required");
        // Reopen the modal
        setShowRegistrationSourceModal(true);
      }
    }
  };

  // ================= ALVEOLY STUDENT REGISTRATION =================
  const handleAlveolyRegistration = async (source, details) => {
    try {
      setLoading(true);
      
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        registrationSource: source,
        registrationDetails: details || "",
        userType: "alveoly_student"
      };
      
      const response = await API.post("/auth/register/alveoly", payload);
      
      if (response.data.success) {
        setRegisteredUser({ email: response.data.email, userId: response.data.userId });
        setApprovalMessage(response.data.message);
        setShowApprovalModal(true);
        toast.success("Registration submitted for approval!");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= NON-ALVEOLY STUDENT REGISTRATION =================
  const handleNonAlveolyRegistration = async () => {
    try {
      setLoading(true);
      
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        userType: "non_alveoly_student"
      };
      
      const response = await API.post("/auth/register/non-alveoly", payload);
      
      if (response.data.success) {
        setRegisteredUser({ email: response.data.email, userId: response.data.userId });
        toast.success("Registration successful! Please login and select a plan.");
        
        // Navigate to login
        navigate("/login", { 
          state: { 
            message: "Registration successful! Please login to continue.",
            email: response.data.email 
          } 
        });
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE GOOGLE AUTH =================
  const handleGoogleAuth = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("No Google credential received");
      
      setPendingGoogleCredential(idToken);
      
      try {
        const result = await googleLogin(idToken);
        console.log("Google login result:", result);
        
        if (result.user?.role === "admin") {
          navigate("/admin");
        } else if (result.user?.role === "lecturer") {
          navigate("/lecturer");
        } else if (result.requiresApproval) {
          setShowApprovalModal(true);
          setApprovalMessage("Your account is pending approval. You will receive an email once approved.");
        } else if (result.requiresProgram) {
          navigate("/select-program");
        } else if (result.requiresPlan) {
          navigate("/student/plans");
        } else {
          navigate("/student/dashboard");
        }
        toast.success("Login successful!");
        setPendingGoogleCredential(null);
      } catch (err) {
        if (err.response?.status === 404 && err.response?.data?.requiresUserType) {
          setShowUserTypeModal(true);
          setGoogleLoading(false);
        } else if (err.response?.status === 403 && err.response?.data?.requiresApproval) {
          setShowApprovalModal(true);
          setApprovalMessage(err.response?.data?.message || "Your account is pending approval.");
          setGoogleLoading(false);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Google auth error:", err);
      toast.error(err.response?.data?.message || "Google signup failed");
      setGoogleLoading(false);
      setPendingGoogleCredential(null);
    }
  };

  // ================= COMPLETE GOOGLE SIGNUP WITH USER TYPE =================
  const handleGoogleSignupWithType = async () => {
    if (!selectedUserType) {
      toast.error("Please select your user type");
      return;
    }
    
    setShowUserTypeModal(false);
    
    if (selectedUserType === "alveoly_student") {
      // Show registration source modal
      setShowRegistrationSourceModal(true);
    } else {
      // Non-alveoly - proceed with signup
      await handleGoogleSignupComplete(selectedUserType, "none", "");
    }
  };

  const handleGoogleSignupComplete = async (userType, source, details) => {
    try {
      setGoogleLoading(true);
      
      const payload = {
        idToken: pendingGoogleCredential,
        userType: userType
      };
      
      if (userType === "alveoly_student") {
        payload.registrationSource = source;
        payload.registrationDetails = details || "";
      }
      
      const result = await googleLogin(payload.idToken, payload.userType, payload.registrationSource, payload.registrationDetails);
      
      setShowRegistrationSourceModal(false);
      setPendingGoogleCredential(null);
      setSelectedUserType("");
      
      if (result.requiresApproval) {
        setShowApprovalModal(true);
        setApprovalMessage("Your account is pending approval. You will receive an email once approved.");
        setGoogleLoading(false);
        return;
      }
      
      if (result.user?.role === "admin") {
        navigate("/admin");
      } else if (result.user?.role === "lecturer") {
        navigate("/lecturer");
      } else if (result.requiresProgram) {
        navigate("/select-program");
      } else if (result.requiresPlan) {
        navigate("/student/plans");
      } else {
        navigate("/student/dashboard");
      }
      toast.success("Account created successfully!");
    } catch (err) {
      console.error("Google signup with user type error:", err);
      toast.error(err.response?.data?.message || "Failed to complete signup");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ================= HANDLE REGISTRATION SOURCE SUBMISSION =================
  const handleRegistrationSourceSubmit = (source) => {
    if (source === "phone") {
      handleRegistrationSourceSelect("phone");
    } else {
      setShowRegistrationSourceModal(false);
      const details = prompt("Please provide details about how you registered with Alveoly:");
      if (details && details.trim()) {
        handleRegistrationSourceSelect("other", details);
      } else {
        toast.error("Registration details are required");
        setShowRegistrationSourceModal(true);
      }
    }
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.userType) {
      toast.error("Please select your user type");
      return;
    }
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a3a] via-[#1a2a4a] to-[#0a1a3a]">
      <Toaster position="top-right" />
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800"
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

                  {/* User Type Selection - Email Signup */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Are you an Alveoly Student?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleUserTypeSelect("alveoly_student")}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                          form.userType === "alveoly_student"
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        <FaUserGraduate className={form.userType === "alveoly_student" ? "text-indigo-600" : "text-slate-400"} />
                        <span className={form.userType === "alveoly_student" ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-slate-600 dark:text-slate-400"}>
                          Alveoly Student
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUserTypeSelect("non_alveoly_student")}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                          form.userType === "non_alveoly_student"
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        <FaUserPlus className={form.userType === "non_alveoly_student" ? "text-indigo-600" : "text-slate-400"} />
                        <span className={form.userType === "non_alveoly_student" ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-slate-600 dark:text-slate-400"}>
                          Non-Alveoly Student
                        </span>
                      </button>
                    </div>
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
                    disabled={loading || loadingPrograms || programs.length === 0 || !form.courseId || !form.userType}
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

      {/* ================= USER TYPE SELECTION MODAL ================= */}
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
                  onClick={() => handleUserTypeSelect("alveoly_student")}
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
                  onClick={() => handleUserTypeSelect("non_alveoly_student")}
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
                onClick={handleGoogleSignupWithType}
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

      {/* ================= REGISTRATION SOURCE MODAL ================= */}
      <AnimatePresence>
        {showRegistrationSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center mx-auto mb-4">
                  <FaPhone className="text-3xl text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Source</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  Did you register through <strong>0549556116</strong>?
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleRegistrationSourceSelect("phone")}
                  className="w-full p-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">
                    <FaCheck />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Yes</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">I registered through 0549556116</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowRegistrationSourceModal(false);
                    const details = prompt("Please provide details about how you registered with Alveoly (e.g., through a friend, social media, event, etc.):");
                    if (details && details.trim()) {
                      handleRegistrationSourceSelect("other", details);
                    } else {
                      toast.error("Registration details are required");
                      setShowRegistrationSourceModal(true);
                    }
                  }}
                  className="w-full p-4 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xl">
                    <FaTimes />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-white">No</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">I registered through another channel</p>
                  </div>
                </button>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
                This helps us verify your student status and streamline your registration.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= APPROVAL MODAL ================= */}
      <AnimatePresence>
        {showApprovalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 flex items-center justify-center mx-auto mb-4">
                  <FaClock className="text-3xl text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Account Pending Approval</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  {approvalMessage || "Your account is pending admin approval."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                        What happens next?
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        An admin will review your account. You will receive an email with your approval token once approved.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    navigate("/login");
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Go to Login
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

export default SignupPage;