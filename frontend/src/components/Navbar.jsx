// src/components/Navbar.jsx - UWorld Professional Style
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaStethoscope } from "react-icons/fa";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Products", path: "/programs" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-gray-100"
          : "bg-[#0a1a3a] py-5"
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
                  scrolled ? "text-gray-500" : "text-blue-200"
                }`}
              >
                Health & Sciences Academy
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <button
                  onClick={() => handleNavigate(link.path)}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    scrolled
                      ? "text-gray-600 hover:text-[#00a3a1] hover:bg-gray-50"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  } ${
                    activeLink === link.path
                      ? scrolled
                        ? "text-[#00a3a1] bg-gray-50"
                        : "text-white bg-white/20"
                      : ""
                  } group`}
                >
                  {link.name}
                  {activeLink === link.path && (
                    <span
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full ${
                        scrolled ? "bg-[#00a3a1]" : "bg-[#00a3a1]"
                      }`}
                    ></span>
                  )}
                </button>
              </li>
            ))}
            <li className="ml-4 flex gap-2">
              <button
                onClick={() => handleNavigate("/login")}
                className={`px-5 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  scrolled
                    ? "border-2 border-[#00a3a1] text-[#00a3a1] hover:bg-[#00a3a1] hover:text-white"
                    : "bg-transparent border-2 border-white text-white hover:bg-white/10"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate("/signup")}
                className={`px-5 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  scrolled
                    ? "bg-[#00a3a1] text-white hover:bg-[#008b89] shadow-md hover:shadow-lg"
                    : "bg-white text-[#0a1a3a] hover:bg-gray-100 shadow-lg"
                }`}
              >
                Try it Free
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6">
              <span
                className={`absolute h-0.5 w-6 transform transition-all duration-300 ${
                  scrolled ? "bg-gray-800" : "bg-white"
                } ${menuOpen ? "rotate-45 translate-y-0" : "-translate-y-2"}`}
              ></span>
              <span
                className={`absolute h-0.5 w-6 transform transition-all duration-300 ${
                  scrolled ? "bg-gray-800" : "bg-white"
                } ${menuOpen ? "opacity-0" : "opacity-100"}`}
              ></span>
              <span
                className={`absolute h-0.5 w-6 transform transition-all duration-300 ${
                  scrolled ? "bg-gray-800" : "bg-white"
                } ${menuOpen ? "-rotate-45 translate-y-0" : "translate-y-2"}`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "70px" }}
      >
        <div className="flex flex-col h-full bg-white">
          <div className="flex-1 overflow-y-auto py-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`w-full text-left px-8 py-4 text-lg font-medium transition-all duration-300 border-b border-gray-100 ${
                  activeLink === link.path
                    ? "text-[#00a3a1] bg-gray-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="p-8 space-y-3">
              <button
                onClick={() => handleNavigate("/login")}
                className="w-full border-2 border-[#00a3a1] text-[#00a3a1] px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-[#00a3a1] hover:text-white"
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate("/signup")}
                className="w-full bg-[#00a3a1] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Try it Free
              </button>
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
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMenuOpen(false)}
          style={{ top: "70px" }}
        />
      )}
    </nav>
  );
};

export default Navbar;