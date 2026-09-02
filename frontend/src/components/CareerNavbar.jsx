// src/components/CareerNavbar.jsx - Dedicated Navbar for Career Section (Multi-page)
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

const CareerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links as separate pages (matching UWorld structure)
  const navLinks = [
    { name: "What We Do", path: "/careers/what-we-do" },
    { name: "Life at Alveoly", path: "/careers/life-at-alveoly" },
    { name: "Benefits", path: "/careers/benefits" },
    { name: "Jobs", path: "/careers/jobs" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  // Determine if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-sm py-3 border-b border-gray-100" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div
              onClick={() => handleNavigate("/careers")}
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

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isActive(link.path)
                      ? "text-[#00a3a1] border-b-2 border-[#00a3a1] pb-1"
                      : scrolled
                      ? "text-gray-700 hover:text-[#00a3a1]"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side - Hamburger Menu */}
            <button
              className="relative w-10 h-10 focus:outline-none md:hidden"
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
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-white md:hidden"
            style={{ top: "70px" }}
          >
            <div className="flex flex-col h-full bg-white overflow-y-auto p-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`w-full text-left py-4 text-lg font-medium transition-colors border-b border-gray-100 ${
                    isActive(link.path)
                      ? "text-[#00a3a1]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Visit Main Site
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CareerNavbar;