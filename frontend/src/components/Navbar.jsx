// src/components/Navbar.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaQuestionCircle, 
  FaUser, 
  FaShoppingBag, 
  FaBars,
  FaTimes,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaUserGraduate,
  FaUserPlus,
  FaBuilding,
  FaBook,
  FaArrowRight,
  FaDollarSign,
  FaPhone,
  FaCheck,
  FaTimes as FaTimesIcon,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, user, logout, register } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    programId: "",
    courseId: "",
    userType: ""
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [showRegistrationSourceModal, setShowRegistrationSourceModal] = useState(false);
  const [registrationSource, setRegistrationSource] = useState("");
  const [registrationDetails, setRegistrationDetails] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [registeredUser, setRegisteredUser] = useState(null);

  // ========== Define isAuthPage ==========
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  // =======================================

  // Fetch programs for signup
  useEffect(() => {
    if (isSignup) {
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
    }
  }, [isSignup]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
    setShowLoginModal(false);
  };

  // ================= LOGIN HANDLER =================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(loginForm);
      
      // Check if user needs approval
      if (result.requiresApproval) {
        setShowApprovalModal(true);
        setApprovalMessage("Your account is pending approval. Please wait for admin approval.");
        setLoading(false);
        return;
      }
      
      // Check if user needs to select plan (non-alveoly students)
      if (result.requiresPlan) {
        navigate("/student/plans");
        toast.info("Please select a plan to continue");
        setShowLoginModal(false);
        setLoginForm({ email: "", password: "" });
        setLoading(false);
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
      setShowLoginModal(false);
      setLoginForm({ email: "", password: "" });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresApproval) {
        setShowApprovalModal(true);
        setApprovalMessage(err.response?.data?.message || "Your account is pending approval.");
      } else {
        toast.error(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= ALVEOLY STUDENT REGISTRATION =================
  const handleAlveolyRegistration = async (source, details) => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!signupForm.name || !signupForm.email || !signupForm.password) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }
      
      const payload = {
        name: signupForm.name.trim(),
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password,
        registrationSource: source || "other",
        registrationDetails: details || "",
        userType: "alveoly_student"
      };
      
      console.log("Sending Alveoly registration payload:", payload);
      
      const response = await API.post("/auth/register/alveoly", payload);
      
      if (response.data.success) {
        setRegisteredUser({ email: response.data.email, userId: response.data.userId });
        setApprovalMessage(response.data.message || "Registration submitted for approval!");
        setShowApprovalModal(true);
        setShowLoginModal(false);
        toast.success("Registration submitted for approval!");
        // Reset form
        setSignupForm({
          name: "",
          email: "",
          password: "",
          programId: "",
          courseId: "",
          userType: ""
        });
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Alveoly Registration error:", err);
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= NON-ALVEOLY STUDENT REGISTRATION =================
  const handleNonAlveolyRegistration = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!signupForm.name || !signupForm.email || !signupForm.password) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }
      
      const payload = {
        name: signupForm.name.trim(),
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password,
        userType: "non_alveoly_student"
      };
      
      console.log("Sending Non-Alveoly registration payload:", payload);
      
      const response = await API.post("/auth/register/non-alveoly", payload);
      
      if (response.data.success) {
        toast.success("Registration successful! Please login and select a plan.");
        setShowLoginModal(false);
        setSignupForm({
          name: "",
          email: "",
          password: "",
          programId: "",
          courseId: "",
          userType: ""
        });
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
      console.error("Non-Alveoly Registration error:", err);
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE SIGNUP SUBMIT =================
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!signupForm.userType) {
      toast.error("Please select your user type");
      return;
    }
    
    if (!signupForm.programId) {
      toast.error("Please select a program");
      return;
    }
    
    if (!signupForm.courseId) {
      toast.error("Please select a course");
      return;
    }
    
    // If Alveoly student, show registration source modal
    if (signupForm.userType === "alveoly_student") {
      setShowRegistrationSourceModal(true);
      return;
    }
    
    // Non-Alveoly student - direct registration
    await handleNonAlveolyRegistration();
  };

  // ================= REGISTRATION SOURCE HANDLER =================
  const handleRegistrationSourceSelect = (source) => {
    setRegistrationSource(source);
    
    if (source === "phone") {
      setShowRegistrationSourceModal(false);
      handleAlveolyRegistration("phone", "");
    } else {
      setShowRegistrationSourceModal(false);
      const details = prompt("Please provide details about how you registered with Alveoly (e.g., through a friend, social media, event, etc.):");
      if (details && details.trim()) {
        handleAlveolyRegistration("other", details.trim());
      } else {
        toast.error("Registration details are required");
        setShowRegistrationSourceModal(true);
      }
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
      
      // Check if user needs approval
      if (result.requiresApproval) {
        setShowApprovalModal(true);
        setApprovalMessage("Your account is pending approval. You will receive an email once approved.");
        setShowLoginModal(false);
        setGoogleLoading(false);
        setPendingGoogleCredential(null);
        return;
      }
      
      // Check if user needs to select plan (non-alveoly students)
      if (result.requiresPlan) {
        navigate("/student/plans");
        toast.info("Please select a plan to continue");
        setShowLoginModal(false);
        setGoogleLoading(false);
        setPendingGoogleCredential(null);
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
      setShowLoginModal(false);
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
    toast.error(err.response?.data?.message || "Google authentication failed");
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
      setShowRegistrationSourceModal(true);
    } else {
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
      setShowLoginModal(false);
      
      if (result.requiresApproval) {
        setShowApprovalModal(true);
        setApprovalMessage("Your account is pending approval. You will receive an email once approved.");
        setGoogleLoading(false);
        return;
      }
      
      // Check if user needs to select plan (non-alveoly students)
      if (result.requiresPlan) {
        navigate("/student/plans");
        toast.info("Please select a plan to continue");
        setGoogleLoading(false);
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
      toast.success("Account created successfully!");
    } catch (err) {
      console.error("Google signup with user type error:", err);
      toast.error(err.response?.data?.message || "Failed to complete signup");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Logged out successfully");
    setShowLoginModal(false);
  };

  const handleProgramChange = async (programId) => {
    setSignupForm({ ...signupForm, programId, courseId: "" });
    setCourses([]);
    
    if (programId && programId !== "") {
      try {
        setLoadingCourses(true);
        const res = await API.get(`/courses/public/program/${programId}`);
        const coursesData = Array.isArray(res.data) ? res.data : [];
        setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
        toast.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm({ ...signupForm, [name]: value });
  };

  // Navigation links inside hamburger menu
  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Blog", path: "/blog" },
    { name: "Admissions", path: "/admissions" },
    { name: "Contact", path: "/contact_us" },
    { name: "Pricing", path: "/pricing" },
    { name: "Help", path: "/contact_us" },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com/alveoly" },
    { icon: FaTwitter, href: "https://twitter.com/alveoly" },
    { icon: FaLinkedin, href: "https://linkedin.com/company/alveoly" },
    { icon: FaInstagram, href: "https://instagram.com/alveoly" },
    { icon: FaYoutube, href: "https://youtube.com/alveoly" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled || isAuthPage
            ? "bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-gray-100"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div
              onClick={() => handleNavigate("/")}
              className="cursor-pointer group flex items-center gap-3"
            >
              <img
                src={logo}
                alt="Alveoly Logo"
                className="h-10 w-10 object-contain rounded-lg transition-transform group-hover:scale-110"
              />
              <div>
                <h1
                  className={`text-xl md:text-2xl font-bold transition-all duration-300 ${
                    scrolled || isAuthPage ? "text-gray-800" : "text-white"
                  }`}
                >
                  <span className="text-[#00a3a1]">Alveoly</span>
                  <span className={scrolled || isAuthPage ? "text-gray-600" : "text-gray-300"}>
                    E-Learning
                  </span>
                </h1>
                <p
                  className={`text-xs hidden sm:block transition-all duration-300 ${
                    scrolled || isAuthPage ? "text-gray-500" : "text-white/70"
                  }`}
                >
                  Health & Sciences Academy
                </p>
              </div>
            </div>

            {/* Right Side - Icons */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Help Icon */}
              <button
                onClick={() => handleNavigate("/contact_us")}
                className={`transition-colors duration-300 ${
                  scrolled || isAuthPage ? "text-gray-600 hover:text-[#00a3a1]" : "text-white/80 hover:text-white"
                }`}
                aria-label="Help"
              >
                <FaQuestionCircle className="text-xl md:text-2xl" />
              </button>

              {/* User Icon - Opens Login Modal */}
              <button
                onClick={() => {
                  setIsSignup(false);
                  setShowLoginModal(true);
                }}
                className={`transition-colors duration-300 ${
                  scrolled || isAuthPage ? "text-gray-600 hover:text-[#00a3a1]" : "text-white/80 hover:text-white"
                }`}
                aria-label="Login / Register"
              >
                <FaUser className="text-xl md:text-2xl" />
              </button>

              {/* Pricing Icon - Direct link to pricing page */}
              <button
                onClick={() => handleNavigate("/pricing")}
                className={`transition-colors duration-300 ${
                  scrolled || isAuthPage ? "text-gray-600 hover:text-[#00a3a1]" : "text-white/80 hover:text-white"
                }`}
                aria-label="Pricing"
              >
                <FaDollarSign className="text-xl md:text-2xl" />
              </button>

              {/* Hamburger Menu */}
              <button
                className="relative w-10 h-10 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <FaTimes 
                    className={`text-2xl transition-colors duration-300 ${
                      scrolled || isAuthPage ? "text-gray-800" : "text-white"
                    }`} 
                  />
                ) : (
                  <FaBars 
                    className={`text-2xl transition-colors duration-300 ${
                      scrolled || isAuthPage ? "text-gray-800" : "text-white"
                    }`} 
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Full Screen Hamburger Menu */}
        <div
          className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ top: "70px" }}
        >
          <div className="flex flex-col h-full bg-white overflow-y-auto">
            <div className="flex-1 py-8">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavigate(link.path)}
                  className="w-full text-left px-8 py-4 text-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  {link.name}
                </button>
              ))}
              
              {/* Work with Us */}
              <div className="p-8 border-b border-gray-100">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate("/signup");
                  }}
                  className="w-full bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Work with Us
                </button>
              </div>

              {/* Social Media Links */}
              <div className="p-8">
                <p className="text-sm font-semibold text-gray-600 mb-4">Connect With Us</p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#00a3a1] transition-colors"
                    >
                      <social.icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-8 text-center border-t border-gray-200">
              <p className="text-sm text-gray-600">© 2024 Alveoly Academy</p>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMenuOpen(false)}
            style={{ top: "70px" }}
          />
        )}
      </nav>

      {/* ==================== LOGIN/SIGNUP MODAL - UWORLD STYLE ==================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {isSignup ? (
                    <FaUserPlus className="text-white text-lg" />
                  ) : (
                    <FaUser className="text-white text-lg" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user ? "My Account" : isSignup ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user ? `Signed in as ${user.name}` : isSignup ? "Join Alveoly today" : "Sign in to continue"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setIsSignup(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {user ? (
                // If user is already logged in
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      navigate("/student/dashboard");
                    }}
                    className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                // Login/Signup Forms
                <div className="space-y-6">
                  {/* Toggle between Login and Signup */}
                  <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                    <button
                      onClick={() => setIsSignup(false)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        !isSignup
                          ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setIsSignup(true)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isSignup
                          ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Google Auth */}
                  <div>
                    {!googleLoading ? (
                      <div className="w-full">
                        <GoogleLogin
                          onSuccess={handleGoogleAuth}
                          onError={() => toast.error("Google authentication failed")}
                          theme="outline"
                          size="large"
                          text={isSignup ? "signup_with" : "signin_with"}
                          shape="rectangular"
                          logo_alignment="center"
                          width="100%"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 w-full py-3 border rounded-xl bg-gray-50 dark:bg-gray-800">
                        <FaSpinner className="animate-spin text-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Connecting...</span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">
                        Or {isSignup ? "sign up" : "continue"} with email
                      </span>
                    </div>
                  </div>

                  {isSignup ? (
                    // SIGNUP FORM
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={signupForm.name}
                          onChange={handleSignupChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all"
                        />
                      </div>

                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email Address"
                          value={signupForm.email}
                          onChange={handleSignupChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all"
                        />
                      </div>

                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Password"
                          value={signupForm.password}
                          onChange={handleSignupChange}
                          required
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {/* User Type Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Are you an Alveoly Student?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSignupForm({ ...signupForm, userType: "alveoly_student" })}
                            className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                              signupForm.userType === "alveoly_student"
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                            }`}
                          >
                            <FaUserGraduate className={signupForm.userType === "alveoly_student" ? "text-indigo-600" : "text-gray-400"} />
                            <span className={signupForm.userType === "alveoly_student" ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-600 dark:text-gray-400"}>
                              Alveoly Student
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSignupForm({ ...signupForm, userType: "non_alveoly_student" })}
                            className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                              signupForm.userType === "non_alveoly_student"
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                            }`}
                          >
                            <FaUserPlus className={signupForm.userType === "non_alveoly_student" ? "text-indigo-600" : "text-gray-400"} />
                            <span className={signupForm.userType === "non_alveoly_student" ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-600 dark:text-gray-400"}>
                              Non-Alveoly Student
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Program Selection */}
                      <div className="relative">
                        <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <select
                          name="programId"
                          value={signupForm.programId}
                          onChange={(e) => handleProgramChange(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer text-sm transition-all"
                          disabled={loadingPrograms}
                        >
                          <option value="">
                            {loadingPrograms ? "Loading programs..." : "Select Your Program"}
                          </option>
                          {programs.map((program) => (
                            <option key={program._id} value={program._id}>
                              {program.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Course Selection */}
                      {signupForm.programId && (
                        <div className="relative">
                          <FaBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <select
                            name="courseId"
                            value={signupForm.courseId}
                            onChange={handleSignupChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer text-sm transition-all"
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
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || loadingPrograms || programs.length === 0 || !signupForm.courseId || !signupForm.userType}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-indigo-500/25"
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
                  ) : (
                    // LOGIN FORM
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all"
                        />
                      </div>

                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          required
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowLoginModal(false);
                            navigate("/forgot-password");
                          }}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-indigo-500/25"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <FaSpinner className="animate-spin" />
                            Signing In...
                          </span>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </form>
                  )}

                  {isSignup ? (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignup(false)}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 transition"
                      >
                        Sign In
                      </button>
                    </p>
                  ) : (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignup(true)}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 transition"
                      >
                        Create one
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== USER TYPE MODAL - FOR GOOGLE SIGNUP ==================== */}
      {showUserTypeModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Alveoly!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Please select your user type to continue
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setSelectedUserType("alveoly_student")}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                  selectedUserType === "alveoly_student"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">
                  <FaUserGraduate />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Alveoly Student</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">I am currently enrolled at Alveoly</p>
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
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl">
                  <FaUserPlus />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Non-Alveoly Student</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">I am not currently enrolled at Alveoly</p>
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

      {/* ==================== REGISTRATION SOURCE MODAL ==================== */}
      {showRegistrationSourceModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Source</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
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
                  <h3 className="font-semibold text-gray-900 dark:text-white">Yes</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">I registered through 0549556116</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowRegistrationSourceModal(false);
                  const details = prompt("Please provide details about how you registered with Alveoly (e.g., through a friend, social media, event, etc.):");
                  if (details && details.trim()) {
                    handleRegistrationSourceSelect("other");
                  } else {
                    toast.error("Registration details are required");
                    setShowRegistrationSourceModal(true);
                  }
                }}
                className="w-full p-4 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xl">
                  <FaTimesIcon />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">No</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">I registered through another channel</p>
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
              This helps us verify your student status and streamline your registration.
            </p>
          </motion.div>
        </div>
      )}

      {/* ==================== APPROVAL MODAL ==================== */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Pending Approval</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
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
                  setShowLoginModal(false);
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
    </>
  );
};

export default Navbar;