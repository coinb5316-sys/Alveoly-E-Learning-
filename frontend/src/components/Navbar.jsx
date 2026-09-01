// src/components/Navbar.jsx - UWorld Style with Icons
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // <-- FIXED: Added useLocation
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
  FaYoutube
} from "react-icons/fa";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <-- Now this works because useLocation is imported
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
  };

  // All navigation links - inside hamburger menu
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

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-gray-100"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo - Left Side */}
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

          {/* Right Side - Icons (like UWorld) */}
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

            {/* User Icon - Login/Register */}
            <button
              onClick={() => handleNavigate("/login")}
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

            {/* Hamburger Menu - Always visible */}
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

      {/* Full Screen Hamburger Menu - Same on desktop and mobile */}
      <div
        className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "70px" }}
      >
        <div className="flex flex-col h-full bg-white overflow-y-auto">
          <div className="flex-1 py-8">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className="w-full text-left px-8 py-4 text-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                {link.name}
              </button>
            ))}
            
            {/* Work with Us / Get Started */}
            <div className="p-8 border-b border-gray-100">
              <button
                onClick={() => handleNavigate("/signup")}
                className="w-full bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Work with Us
              </button>
            </div>

            {/* Social Media Links - Like UWorld */}
            <div className="p-8">
              <p className="text-sm font-semibold text-gray-600 mb-4">Connect With Us</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[#00a3a1] transition-colors">
                  <FaFacebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#00a3a1] transition-colors">
                  <FaTwitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#00a3a1] transition-colors">
                  <FaLinkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#00a3a1] transition-colors">
                  <FaInstagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#00a3a1] transition-colors">
                  <FaYoutube className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Footer */}
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
  );
};

export default Navbar;