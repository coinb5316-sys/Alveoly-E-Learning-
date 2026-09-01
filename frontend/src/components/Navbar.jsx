// src/components/Navbar.jsx - UWorld Style with Login Modal
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  FaGoogle,
  FaGraduationCap,
  FaArrowRight,
  FaSpinner
} from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(loginForm);
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
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleAuth = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("No Google credential received");
      
      const result = await googleLogin(idToken);
      
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
    } catch (err) {
      console.error("Google login error:", err);
      toast.error(err.response?.data?.message || "Google login failed");
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

  // Navigation links inside hamburger menu
  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Blog", path: "/blog" },
    { name: "Admissions", path: "/admissions" },
    { name: "Contact", path: "/contact_us" },
    { name: "Pricing", path: "/pricing" },
    { name: "Help", path: "/help" },
    { name: "Forums", path: "/forums" },
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
          scrolled
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
                    scrolled ? "text-gray-800" : "text-white"
                  }`}
                >
                  <span className="text-[#00a3a1]">Alveoly</span>
                  <span className={scrolled ? "text-gray-600" : "text-gray-300"}>
                    E-Learning
                  </span>
                </h1>
                <p
                  className={`text-xs hidden sm:block transition-all duration-300 ${
                    scrolled ? "text-gray-500" : "text-white/70"
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
                  scrolled ? "text-gray-600 hover:text-[#00a3a1]" : "text-white/80 hover:text-white"
                }`}
                aria-label="Help"
              >
                <FaQuestionCircle className="text-xl md:text-2xl" />
              </button>

              {/* User Icon - Opens Login Modal */}
              <button
                onClick={() => setShowLoginModal(true)}
                className={`transition-colors duration-300 ${
                  scrolled ? "text-gray-600 hover:text-[#00a3a1]" : "text-white/80 hover:text-white"
                }`}
                aria-label="Login / Register"
              >
                <FaUser className="text-xl md:text-2xl" />
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => handleNavigate("/cart")}
                className={`transition-colors duration-300 ${
                  scrolled ? "text-gray-600 hover:text-[#00a3a1]" : "text-white/80 hover:text-white"
                }`}
                aria-label="Cart"
              >
                <FaShoppingBag className="text-xl md:text-2xl" />
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
                      scrolled ? "text-gray-800" : "text-white"
                    }`} 
                  />
                ) : (
                  <FaBars 
                    className={`text-2xl transition-colors duration-300 ${
                      scrolled ? "text-gray-800" : "text-white"
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
                  onClick={() => handleNavigate("/signup")}
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

      {/* ==================== LOGIN MODAL - UWORLD STYLE ==================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user ? "My Account" : "Welcome Back"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user ? `Signed in as ${user.name}` : "Sign in to continue"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
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
                // Login Form
                <div className="space-y-6">
                  {/* Google Login */}
                  <div>
                    {!googleLoading ? (
                      <div className="w-full">
                        <GoogleLogin
                          onSuccess={handleGoogleAuth}
                          onError={() => toast.error("Google login failed")}
                          theme="outline"
                          size="large"
                          text="signin_with"
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
                        Or continue with email
                      </span>
                    </div>
                  </div>

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
                      <Link
                        to="/forgot-password"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
                        onClick={() => setShowLoginModal(false)}
                      >
                        Forgot password?
                      </Link>
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

                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 transition"
                      onClick={() => setShowLoginModal(false)}
                    >
                      Create one
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;