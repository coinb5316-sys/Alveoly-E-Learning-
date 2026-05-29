// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaStethoscope, FaTimes, FaBars } from "react-icons/fa";
import logo from "../assets/logo.png"; // Make sure you have this logo image

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set active link based on current path
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
    { name: "Programs", path: "/programs" },
    { name: "Blog", path: "/blog" },
    { name: "Admissions", path: "/admissions" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${scrolled 
          ? "bg-white/95 backdrop-blur-lg shadow-lg py-3" 
          : "bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 py-5"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo with Image */}
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
              <h1 className={`
                text-xl md:text-2xl font-bold transition-all duration-300
                ${scrolled ? "text-gray-800" : "text-white"}
              `}>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Alveoly
                </span>
                <span className={scrolled ? "text-gray-600" : "text-gray-200"}>
                  E-Learning
                </span>
              </h1>
              <p className={`
                text-xs hidden sm:block transition-all duration-300
                ${scrolled ? "text-gray-500" : "text-blue-200"}
              `}>
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
                  className={`
                    relative px-4 py-2 rounded-lg font-medium transition-all duration-300
                    ${scrolled 
                      ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" 
                      : "text-white hover:text-blue-200 hover:bg-white/10"
                    }
                    ${activeLink === link.path 
                      ? scrolled 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-blue-200 bg-white/20"
                      : ""
                    }
                    group
                  `}
                >
                  {link.name}
                  {activeLink === link.path && (
                    <span className={`
                      absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full
                      ${scrolled ? "bg-blue-600" : "bg-blue-300"}
                    `}></span>
                  )}
                </button>
              </li>
            ))}
            <li className="ml-4 flex gap-2">
              <button
                onClick={() => handleNavigate("/login")}
                className={`
                  px-5 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105
                  ${scrolled
                    ? "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    : "bg-transparent border-2 border-white text-white hover:bg-white/10"
                  }
                `}
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate("/signup")}
                className={`
                  px-5 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105
                  ${scrolled
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg"
                    : "bg-white text-blue-700 hover:bg-gray-100 shadow-lg"
                  }
                `}
              >
                Get Started
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
                className={`
                  absolute h-0.5 w-6 transform transition-all duration-300
                  ${scrolled ? "bg-gray-800" : "bg-white"}
                  ${menuOpen ? "rotate-45 translate-y-0" : "-translate-y-2"}
                `}
              ></span>
              <span
                className={`
                  absolute h-0.5 w-6 transform transition-all duration-300
                  ${scrolled ? "bg-gray-800" : "bg-white"}
                  ${menuOpen ? "opacity-0" : "opacity-100"}
                `}
              ></span>
              <span
                className={`
                  absolute h-0.5 w-6 transform transition-all duration-300
                  ${scrolled ? "bg-gray-800" : "bg-white"}
                  ${menuOpen ? "-rotate-45 translate-y-0" : "translate-y-2"}
                `}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`
          md:hidden fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ top: "70px" }}
      >
        <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex-1 overflow-y-auto py-8">
            {navLinks.map((link, index) => (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`
                  w-full text-left px-8 py-4 text-lg font-medium transition-all duration-300
                  border-b border-gray-200
                  ${activeLink === link.path
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-700 hover:bg-blue-100"
                  }
                `}
              >
                {link.name}
              </button>
            ))}
            <div className="p-8 space-y-3">
              <button
                onClick={() => handleNavigate("/login")}
                className="w-full border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-50"
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate("/signup")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
          
          {/* Mobile Footer */}
          <div className="p-8 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © 2024 Alveoly E-Learning Academy
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Health & Sciences Education
            </p>
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