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
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import programsBg from "../images/programs-bg.jpg";

const Programs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { scrollYProgress } = useScroll();

  const programs = [
    {
      id: 1,
      icon: <FaLaptopCode />,
      title: "Computer Science",
      category: "technology",
      duration: "4 Years",
      degree: "BSc",
      description: "Explore AI, data science, and software engineering with modern labs and expert faculty.",
      fullDescription: "Our Computer Science program provides a strong foundation in computing principles, programming, and software development.",
      features: ["AI & Machine Learning", "Data Science", "Software Engineering", "Cloud Computing"],
      careers: ["Software Developer", "Data Scientist", "AI Engineer", "Cloud Architect"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: 2,
      icon: <FaMicroscope />,
      title: "Biological Sciences",
      category: "science",
      duration: "4 Years",
      degree: "BSc",
      description: "Hands-on research experience with world-class equipment and professional mentorship.",
      fullDescription: "The Biological Sciences program offers comprehensive training in molecular biology, genetics, and biotechnology.",
      features: ["Molecular Biology", "Genetics", "Biotechnology", "Environmental Science"],
      careers: ["Research Scientist", "Biotechnologist", "Lab Manager", "Clinical Researcher"],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: 3,
      icon: <FaBriefcase />,
      title: "Business Administration",
      category: "business",
      duration: "4 Years",
      degree: "BBA",
      description: "Learn leadership, entrepreneurship, and innovation through practical industry projects.",
      fullDescription: "Our Business Administration program develops strategic thinkers and innovative leaders.",
      features: ["Marketing", "Finance", "Entrepreneurship", "Strategic Management"],
      careers: ["Business Analyst", "Marketing Manager", "Entrepreneur", "Consultant"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      id: 4,
      icon: <FaGlobeAmericas />,
      title: "International Relations",
      category: "humanities",
      duration: "4 Years",
      degree: "BA",
      description: "Gain insights into global politics, diplomacy, and international development.",
      fullDescription: "The International Relations program prepares students for careers in diplomacy and global affairs.",
      features: ["Global Governance", "Diplomacy", "International Law", "Conflict Resolution"],
      careers: ["Diplomat", "Policy Analyst", "NGO Director", "International Consultant"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      id: 5,
      icon: <FaUserGraduate />,
      title: "Education",
      category: "education",
      duration: "4 Years",
      degree: "BEd",
      description: "Train to become an inspiring educator with 21st-century teaching methodologies.",
      fullDescription: "Our Education program prepares future educators with innovative teaching methods.",
      features: ["Curriculum Design", "Educational Psychology", "EdTech", "Special Education"],
      careers: ["Teacher", "Curriculum Developer", "Education Consultant", "School Administrator"],
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      id: 6,
      icon: <FaHeartbeat />,
      title: "Health Sciences",
      category: "health",
      duration: "4 Years",
      degree: "BSc",
      description: "Study healthcare innovation, nursing, and clinical science with professional guidance.",
      fullDescription: "The Health Sciences program provides comprehensive education in healthcare systems.",
      features: ["Public Health", "Nursing", "Clinical Research", "Healthcare Management"],
      careers: ["Healthcare Administrator", "Public Health Officer", "Clinical Coordinator", "Health Educator"],
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      id: 7,
      icon: <FaGraduationCap />,
      title: "Nursing Science",
      category: "health",
      duration: "4 Years",
      degree: "BNSc",
      description: "Comprehensive nursing education with clinical rotations and hands-on training.",
      fullDescription: "Our Nursing Science program offers rigorous training in patient care and clinical procedures.",
      features: ["Patient Care", "Pharmacology", "Clinical Practice", "Health Assessment"],
      careers: ["Registered Nurse", "Clinical Nurse Specialist", "Nurse Educator", "Healthcare Manager"],
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      id: 8,
      icon: <FaCertificate />,
      title: "Public Health",
      category: "health",
      duration: "4 Years",
      degree: "BPH",
      description: "Focus on community health, epidemiology, and health promotion strategies.",
      fullDescription: "The Public Health program prepares students to address community health challenges.",
      features: ["Epidemiology", "Biostatistics", "Health Policy", "Community Health"],
      careers: ["Public Health Specialist", "Epidemiologist", "Health Policy Advisor", "Community Health Worker"],
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      id: 9,
      icon: <FaMicroscope />,
      title: "Medical Laboratory Science",
      category: "science",
      duration: "4 Years",
      degree: "BMLS",
      description: "Train in diagnostic techniques and laboratory management.",
      fullDescription: "This program trains students in diagnostic laboratory procedures and quality control.",
      features: ["Clinical Chemistry", "Hematology", "Microbiology", "Immunology"],
      careers: ["Medical Lab Scientist", "Lab Manager", "Research Associate", "Quality Control Specialist"],
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  ];

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
  }, [searchTerm, selectedCategory]);

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Reduced height for mobile */}
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
              onClick={() => navigate("/signup")}
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

        {/* Scroll Indicator - Hidden on mobile */}
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

      {/* Stats Section - Responsive grid */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: FaGraduationCap, value: "9+", label: "Degree Programs" },
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

      {/* Search and Filter Section - Mobile optimized */}
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

            {/* Category Filters - Desktop always visible, Mobile toggled */}
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

                      <button
                        onClick={() => navigate(`/programs/${program.id}`)}
                        className={`w-full py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${program.bgColor} ${program.iconColor} hover:opacity-90 text-sm md:text-base`}
                      >
                        Learn More
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
              onClick={() => navigate("/signup")}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Apply Now
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/contact")}
              className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Contact Admissions
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programs;