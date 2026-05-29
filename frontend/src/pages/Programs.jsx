// pages/Programs.jsx - Fetches courses from API
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FaLaptopCode,
  FaMicroscope,
  FaBriefcase,
  FaGlobeAmericas,
  FaUserGraduate,
  FaHeartbeat,
  FaArrowRight,
  FaClock,
  FaGraduationCap,
  FaCalendarAlt,
  FaCertificate,
  FaSearch,
  FaChartLine,
  FaHandsHelping,
  FaFilter,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import programsBg from "../images/programs-bg.jpg";
import axios from "../api/axios";

const Programs = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { scrollYProgress } = useScroll();

  // Fetch courses from API
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/courses/public");
      
      // Map API courses to program format
      const mappedPrograms = res.data.map((course, index) => ({
        id: course._id,
        icon: getProgramIcon(index),
        title: course.name,
        category: getProgramCategory(course.name),
        duration: "Flexible",
        degree: getProgramDegree(course.name),
        description: getProgramDescription(course.name),
        fullDescription: getProgramFullDescription(course.name),
        features: getProgramFeatures(course.name),
        careers: getProgramCareers(course.name),
        color: getProgramColor(index),
        bgColor: getProgramBgColor(index),
        iconColor: getProgramIconColor(index),
      }));
      
      setPrograms(mappedPrograms);
      setFilteredPrograms(mappedPrograms);
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Fallback to static data if API fails
      setPrograms(getFallbackPrograms());
      setFilteredPrograms(getFallbackPrograms());
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to map courses to program data
  const getProgramIcon = (index) => {
    const icons = [
      <FaHeartbeat />, <FaMicroscope />, <FaLaptopCode />, 
      <FaBriefcase />, <FaUserGraduate />, <FaGlobeAmericas />,
      <FaCertificate />, <FaGraduationCap />
    ];
    return icons[index % icons.length];
  };

  const getProgramCategory = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes("nursing") || name.includes("health") || name.includes("medical")) return "health";
    if (name.includes("science") || name.includes("biology") || name.includes("lab")) return "science";
    if (name.includes("computer") || name.includes("tech") || name.includes("it")) return "technology";
    if (name.includes("business") || name.includes("admin") || name.includes("management")) return "business";
    if (name.includes("education") || name.includes("teaching")) return "education";
    if (name.includes("international") || name.includes("relations")) return "humanities";
    return "health";
  };

  const getProgramDegree = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes("nursing")) return "BNSc";
    if (name.includes("public health")) return "BPH";
    if (name.includes("medical lab")) return "BMLS";
    if (name.includes("computer")) return "BSc";
    if (name.includes("business")) return "BBA";
    if (name.includes("education")) return "BEd";
    return "BSc";
  };

  const getProgramDescription = (courseName) => {
    const descriptions = {
      "Nursing": "Comprehensive nursing education with clinical rotations and hands-on training.",
      "Public Health": "Focus on community health, epidemiology, and health promotion strategies.",
      "Medical Laboratory": "Train in diagnostic techniques and laboratory management.",
      "Computer Science": "Explore AI, data science, and software engineering with modern labs.",
      "Business": "Learn leadership, entrepreneurship, and innovation through practical projects.",
    };
    
    for (const [key, desc] of Object.entries(descriptions)) {
      if (courseName.toLowerCase().includes(key.toLowerCase())) {
        return desc;
      }
    }
    return `Professional ${courseName} program designed for career success in the healthcare industry.`;
  };

  const getProgramFullDescription = (courseName) => {
    return `The ${courseName} program at Alveoly provides comprehensive education and practical training to prepare you for a successful career in healthcare. Our curriculum is designed by industry experts and updated regularly to meet current healthcare standards.`;
  };

  const getProgramFeatures = (courseName) => {
    const features = {
      "Nursing": ["Patient Care", "Pharmacology", "Clinical Practice", "Health Assessment"],
      "Public Health": ["Epidemiology", "Biostatistics", "Health Policy", "Community Health"],
      "Medical Laboratory": ["Clinical Chemistry", "Hematology", "Microbiology", "Immunology"],
      "Computer Science": ["AI & Machine Learning", "Data Science", "Software Engineering", "Cloud Computing"],
      "Business": ["Marketing", "Finance", "Entrepreneurship", "Strategic Management"],
    };
    
    for (const [key, feat] of Object.entries(features)) {
      if (courseName.toLowerCase().includes(key.toLowerCase())) {
        return feat;
      }
    }
    return ["Core Healthcare", "Clinical Skills", "Professional Development", "Research Methods"];
  };

  const getProgramCareers = (courseName) => {
    const careers = {
      "Nursing": ["Registered Nurse", "Clinical Nurse Specialist", "Nurse Educator", "Healthcare Manager"],
      "Public Health": ["Public Health Specialist", "Epidemiologist", "Health Policy Advisor", "Community Health Worker"],
      "Medical Laboratory": ["Medical Lab Scientist", "Lab Manager", "Research Associate", "Quality Control Specialist"],
    };
    
    for (const [key, car] of Object.entries(careers)) {
      if (courseName.toLowerCase().includes(key.toLowerCase())) {
        return car;
      }
    }
    return ["Healthcare Professional", "Clinical Specialist", "Healthcare Administrator", "Research Associate"];
  };

  const getProgramColor = (index) => {
    const colors = [
      "from-red-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-teal-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
    ];
    return colors[index % colors.length];
  };

  const getProgramBgColor = (index) => {
    const bgColors = [
      "bg-red-50", "bg-green-50", "bg-blue-50", "bg-purple-50",
      "bg-orange-50", "bg-indigo-50", "bg-teal-50", "bg-emerald-50",
    ];
    return bgColors[index % bgColors.length];
  };

  const getProgramIconColor = (index) => {
    const iconColors = [
      "text-red-600", "text-green-600", "text-blue-600", "text-purple-600",
      "text-orange-600", "text-indigo-600", "text-teal-600", "text-emerald-600",
    ];
    return iconColors[index % iconColors.length];
  };

  const getFallbackPrograms = () => {
    return [
      {
        id: 1,
        icon: <FaHeartbeat />,
        title: "Nursing Science",
        category: "health",
        duration: "4 Years",
        degree: "BNSc",
        description: "Comprehensive nursing education with clinical rotations and hands-on training.",
        fullDescription: "Our Nursing Science program offers rigorous training in patient care and clinical procedures.",
        features: ["Patient Care", "Pharmacology", "Clinical Practice", "Health Assessment"],
        careers: ["Registered Nurse", "Clinical Nurse Specialist", "Nurse Educator", "Healthcare Manager"],
        color: "from-red-500 to-pink-500",
        bgColor: "bg-red-50",
        iconColor: "text-red-600",
      },
      {
        id: 2,
        icon: <FaMicroscope />,
        title: "Medical Laboratory Science",
        category: "science",
        duration: "4 Years",
        degree: "BMLS",
        description: "Train in diagnostic techniques and laboratory management.",
        fullDescription: "This program trains students in diagnostic laboratory procedures and quality control.",
        features: ["Clinical Chemistry", "Hematology", "Microbiology", "Immunology"],
        careers: ["Medical Lab Scientist", "Lab Manager", "Research Associate", "Quality Control Specialist"],
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
      },
      {
        id: 3,
        icon: <FaCertificate />,
        title: "Public Health",
        category: "health",
        duration: "4 Years",
        degree: "BPH",
        description: "Focus on community health, epidemiology, and health promotion strategies.",
        fullDescription: "The Public Health program prepares students to address community health challenges.",
        features: ["Epidemiology", "Biostatistics", "Health Policy", "Community Health"],
        careers: ["Public Health Specialist", "Epidemiologist", "Health Policy Advisor", "Community Health Worker"],
        color: "from-teal-500 to-cyan-500",
        bgColor: "bg-teal-50",
        iconColor: "text-teal-600",
      },
    ];
  };

  useEffect(() => {
    let filtered = [...programs];
    
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(program => program.category === selectedCategory);
    }
    
    setFilteredPrograms(filtered);
  }, [searchTerm, selectedCategory, programs]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const categories = [
    { value: "all", label: "All Programs", color: "from-gray-600 to-gray-700" },
    { value: "health", label: "Health Sciences", color: "from-red-500 to-pink-500" },
    { value: "science", label: "Sciences", color: "from-green-500 to-emerald-500" },
    { value: "technology", label: "Technology", color: "from-blue-500 to-cyan-500" },
    { value: "business", label: "Business", color: "from-purple-500 to-pink-500" },
    { value: "humanities", label: "Humanities", color: "from-orange-500 to-red-500" },
    { value: "education", label: "Education", color: "from-indigo-500 to-purple-500" },
  ];

  const handleGetStarted = () => {
    navigate("/signup");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FaSpinner className="text-5xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading programs...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative min-h-[60vh] md:h-screen flex items-center justify-center bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${programsBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-0 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-4 md:mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white text-xs md:text-sm font-medium">Our Programs</span>
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Academic Excellence
            </span>
            <br />
            <span className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl">For Future Leaders</span>
          </motion.h1>

          <motion.p 
            className="text-sm sm:text-base md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto text-gray-200 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Discover world-class programs designed to prepare you for global success in health sciences, technology, business, and beyond.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={handleGetStarted}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm md:text-base" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="group bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Login
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer hidden sm:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </motion.div>
      </header>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: FaGraduationCap, value: programs.length + "+", label: "Degree Programs" },
              { icon: FaUserGraduate, value: "50+", label: "Expert Faculty" },
              { icon: FaChartLine, value: "98%", label: "Employment Rate" },
              { icon: FaHandsHelping, value: "1000+", label: "Active Students" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="text-2xl md:text-4xl mx-auto mb-2 md:mb-3 text-white/80" />
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1">{stat.value}</h3>
                <p className="text-xs md:text-sm text-white/90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="sticky top-16 md:top-20 z-40 py-4 md:py-6 px-4 md:px-6 bg-white shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <FaSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 rounded-xl text-gray-700 font-medium"
            >
              <FaFilter />
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {/* Category Filters */}
            <div className={`${showMobileFilters ? "flex" : "hidden"} lg:flex flex-wrap gap-2 md:gap-3 justify-center`}>
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg font-medium transition-all duration-300 text-xs md:text-sm ${
                    selectedCategory === category.value
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Programs Grid Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8 text-center">
            <p className="text-sm md:text-base text-gray-600">
              Showing <span className="font-bold text-blue-600">{filteredPrograms.length}</span> of {programs.length} programs
            </p>
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12 md:py-20 bg-white rounded-2xl shadow-lg px-4">
              <FaSearch className="text-5xl md:text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">No programs found</h3>
              <p className="text-sm md:text-base text-gray-500">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="mt-6 px-5 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {filteredPrograms.map((program) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group relative bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${program.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl md:rounded-2xl blur-xl -z-10`}></div>
                  
                  <div className="relative bg-white rounded-xl md:rounded-2xl overflow-hidden">
                    <div className={`bg-gradient-to-r ${program.color} p-4 md:p-6 text-white`}>
                      <div className="text-2xl md:text-4xl mb-2 md:mb-4">{program.icon}</div>
                      <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">{program.title}</h3>
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-white/90">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-xs" /> {program.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaGraduationCap className="text-xs" /> {program.degree}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 md:p-6">
                      <p className="text-gray-600 leading-relaxed mb-3 md:mb-4 text-sm md:text-base">{program.description}</p>
                      
                      <div className="mb-4 md:mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Key Areas:</h4>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {program.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${program.bgColor} ${program.iconColor} font-medium`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Get Started Button - Changed from Learn More */}
                      <button
                        onClick={handleGetStarted}
                        className={`w-full py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${program.bgColor} ${program.iconColor} hover:opacity-90 text-sm md:text-base`}
                      >
                        Get Started
                        <FaArrowRight className="text-xs md:text-sm group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Programs Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 md:mb-4">
              Why Choose Our Programs?
            </h2>
            <div className="w-16 md:w-24 h-1 bg-white mx-auto rounded-full"></div>
            <p className="mt-4 md:mt-6 text-sm md:text-lg text-white/80 max-w-3xl mx-auto px-4">
              We provide an exceptional learning experience that prepares you for real-world success
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[
              { icon: FaGraduationCap, title: "Accredited Programs", desc: "Internationally recognized degrees" },
              { icon: FaUserGraduate, title: "Expert Faculty", desc: "Learn from industry professionals" },
              { icon: FaCalendarAlt, title: "Flexible Learning", desc: "Study at your own pace" },
              { icon: FaCertificate, title: "Industry Certification", desc: "Gain valuable credentials" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white p-4 md:p-6"
              >
                <item.icon className="text-3xl md:text-4xl mx-auto mb-3 md:mb-4 text-white/80" />
                <h3 className="text-base md:text-xl font-semibold mb-1 md:mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-white/80">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 md:mb-8 px-4">
            Choose from our world-class programs and begin your path to success today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <button 
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Get Started Now
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/contact")}
              className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programs;