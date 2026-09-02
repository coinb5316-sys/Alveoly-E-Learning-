// HomePage.jsx - UWorld Professional Style with WhatsApp Chat
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import kalveoBg from "../images/kalveo-bg.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";
import SmartChatBot from "../components/SmartChatBot";

import {
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaGraduationCap,
  FaChartLine,
  FaClock,
  FaHandsHelping,
  FaQuoteRight,
  FaSpinner,
  FaAward,
  FaRocket,
  FaVideo,
  FaUserMd,
  FaLaptopMedical,
  FaFlask,
  FaStethoscope,
  FaMicroscope,
  FaGlobeAfrica,
  FaBriefcase,
  FaChalkboardTeacher,
  FaBuilding,
  FaBook,
  FaTimes,
  FaChevronRight,
  FaChevronDown,
  FaSearch,
  FaFilter,
  FaWhatsapp,
} from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  const [counterStarted, setCounterStarted] = useState(false);
  const statsRef = useRef(null);
  
  const [userInfo, setUserInfo] = useState({
    userId: null,
    userName: "Guest"
  });

  // State for testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState(null);

  // State for products modal
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedCourses, setExpandedCourses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Counters for stats
  const [counters, setCounters] = useState({
    partnerships: 0,
    students: 0,
    employment: 0,
    programs: 0,
  });

  // WhatsApp state
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);
  const [isWhatsAppHovered, setIsWhatsAppHovered] = useState(false);

  // Fetch user info from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setUserInfo({
          userId: userData._id || userData.id,
          userName: userData.name || userData.email?.split('@')[0] || "Student"
        });
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Fetch approved testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoadingTestimonials(true);
        const response = await API.get("/testimonials");
        const approvedTestimonials = response.data.filter(t => t.status === "approved");
        const formattedTestimonials = approvedTestimonials.map(t => ({
          _id: t._id,
          name: t.name,
          role: t.course || "Student",
          content: t.feedback,
          rating: t.rating,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0a1a3a&color=fff`,
          createdAt: t.createdAt
        }));
        setTestimonials(formattedTestimonials);
        setTestimonialsError(null);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setTestimonialsError("Failed to load testimonials");
        setTestimonials([
          {
            name: "Dr. Sarah Johnson",
            role: "Head of Nursing Department",
            content: "Alveoly has transformed how we deliver nursing education. The platform is intuitive and comprehensive.",
            rating: 5,
            image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0a1a3a&color=fff",
          },
          {
            name: "Prof. Michael Amoah",
            role: "Medical Sciences Lecturer",
            content: "The quality of content and teaching methodology at Alveoly is exceptional. Highly recommended!",
            rating: 5,
            image: "https://ui-avatars.com/api/?name=Michael+Amoah&background=0a1a3a&color=fff",
          },
          {
            name: "Jason K.",
            role: "NCLEX Student",
            content: "Alveoly's NCLEX test prep offers more rationales and diagrams for each answer... This is more than any other test prep I have used.",
            rating: 5,
            image: "https://ui-avatars.com/api/?name=Jason+K&background=0a1a3a&color=fff",
          },
        ]);
      } finally {
        setLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Fetch products data for modal
  const fetchProductsData = async () => {
    try {
      setLoadingProducts(true);
      const [programsRes, coursesRes, subjectsRes] = await Promise.all([
        API.get("/programs/public"),
        API.get("/courses/public"),
        API.get("/subjects/public"),
      ]);
      
      setPrograms(programsRes.data || []);
      setCourses(coursesRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (err) {
      console.error("Error fetching products data:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const openProductsModal = () => {
    setShowProductsModal(true);
    fetchProductsData();
    setExpandedPrograms({});
    setExpandedCourses({});
    setSearchTerm("");
  };

  const toggleProgram = (programId) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Get courses for a program
  const getCoursesForProgram = (programId) => {
    return courses.filter(course => 
      course.programId?._id === programId || course.programId === programId
    );
  };

  // Get subjects for a course
  const getSubjectsForCourse = (courseId) => {
    return subjects.filter(subject => 
      subject.courseId?._id === courseId || subject.courseId === courseId
    );
  };

  // Filter programs based on search
  const filteredPrograms = programs.filter(program => 
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (program.code && program.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Intersection Observer for counters
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !counterStarted) {
          setCounterStarted(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [counterStarted]);

  const animateCounters = () => {
    const targets = { partnerships: 50, students: 15000, employment: 98, programs: 100 };
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCounters({
          partnerships: Math.floor((targets.partnerships * currentStep) / steps),
          students: Math.floor((targets.students * currentStep) / steps),
          employment: Math.floor((targets.employment * currentStep) / steps),
          programs: Math.floor((targets.programs * currentStep) / steps),
        });
      } else {
        setCounters(targets);
        clearInterval(interval);
      }
    }, stepTime);
  };

  const displayTestimonials = testimonials.slice(0, 3);

  // WhatsApp handler
 const handleWhatsAppClick = () => {
  // Remove spaces and the + sign
  const phoneNumber = "233549556116"; // Ghana country code (233) + your number without the leading 0
  const message = encodeURIComponent(
    "Hello! I'm interested in learning more about Alveoly E-Learning Academy. Can you help me?"
  );
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};
  // Product data matching UWorld's professional structure
  const productCategories = [
    {
      title: "Medical",
      subtitle: "Making the dream to practice medicine a reality",
      icon: FaUserMd,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
      hoverColor: "hover:border-blue-300",
      link: "/programs?category=medical"
    },
    {
      title: "Nursing",
      subtitle: "Guiding your success from classroom to clinical",
      icon: FaLaptopMedical,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-700",
      hoverColor: "hover:border-teal-300",
      link: "/programs?category=nursing"
    },
    {
      title: "Public Health",
      subtitle: "Protecting communities and advancing population health",
      icon: FaUsers,
      bgColor: "bg-green-50",
      iconColor: "text-green-700",
      hoverColor: "hover:border-green-300",
      link: "/programs?category=public-health"
    },
    {
      title: "Allied Health",
      subtitle: "Empowering professionals in diagnostics and therapy",
      icon: FaMicroscope,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-700",
      hoverColor: "hover:border-purple-300",
      link: "/programs?category=allied-health"
    },
    {
      title: "Pharmacy",
      subtitle: "Preparing the next generation of pharmacists for success",
      icon: FaFlask,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-700",
      hoverColor: "hover:border-amber-300",
      link: "/programs?category=pharmacy"
    },
    {
      title: "Clinical Research",
      subtitle: "Taking your preparation for clinical trials to the next level",
      icon: FaStethoscope,
      bgColor: "bg-rose-50",
      iconColor: "text-rose-700",
      hoverColor: "hover:border-rose-300",
      link: "/programs?category=clinical-research"
    },
  ];

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] overflow-x-hidden">
      <Navbar />

      {/* ==================== HERO SECTION ==================== */}
      <header className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${kalveoBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a3a]/90 via-[#0a1a3a]/80 to-[#0a1a3a]/90" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white text-sm font-medium">Trusted by 15,000+ Students</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                <span className="text-[#00a3a1]">Alveoly</span> E-Learning
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Academy of Health & Sciences
              </h2>

              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg leading-relaxed">
                Discover the tools that students and professionals rely on when exam results really count.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate("/signup")}
                  className="group bg-[#00a3a1] hover:bg-[#008b89] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Try it Free
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={openProductsModal}
                  className="bg-transparent border-2 border-[#00a3a1] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#00a3a1] hover:text-white transition-all duration-300"
                >
                  View Products
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {["SJ", "MA", "EM", "JD"].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <FaStar key={i} className="text-sm" />)}
                  </div>
                  <p className="text-gray-300 text-sm">Rated 4.9/5 by students</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Stats Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Practice Questions", value: "2,500+" },
                    { label: "Pass Rate", value: "98%" },
                    { label: "Video Explanations", value: "500+" },
                    { label: "Active Users", value: "15,000+" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer hidden sm:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </motion.div>
      </header>

      {/* ==================== PRODUCT CATEGORIES SECTION ==================== */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Test Prep for Healthcare & Sciences
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Expert-designed resources for every step of your educational journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={openProductsModal}
                className={`group ${category.bgColor} border-2 border-transparent rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${category.hoverColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-white shadow-sm ${category.iconColor}`}>
                    <category.icon className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0a1a3a] group-hover:text-[#00a3a1] transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {category.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== AWARDS & TRUST SECTION ==================== */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0a1a3a] mb-8 tracking-tight">
            Awards & Recognition
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { number: "15,000+", label: "Active Learners" },
              { number: "98%", label: "Pass Rate" },
              { number: "4.9/5", label: "Average Rating" },
              { number: "50+", label: "Institutional Partners" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-extrabold text-[#00a3a1]">{stat.number}</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATS SECTION WITH COUNTERS ==================== */}
      <section ref={statsRef} className="py-16 bg-[#0a1a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FaGlobeAfrica, label: "International Partnerships", value: counters.partnerships, suffix: "+" },
              { icon: FaUsers, label: "Active Students", value: counters.students.toLocaleString(), suffix: "+" },
              { icon: FaBriefcase, label: "Employment Rate", value: counters.employment, suffix: "%" },
              { icon: FaGraduationCap, label: "Programs Offered", value: counters.programs, suffix: "+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={counterStarted ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="text-3xl md:text-4xl mx-auto mb-3 text-[#00a3a1]" />
                <h3 className="text-2xl md:text-3xl font-bold mb-1">{stat.value}{stat.suffix}</h3>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY US SECTION ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
                <FaAward className="text-sm" />
                <span className="text-sm font-semibold">Why Choose Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-4">
                Why Students Love{' '}
                <span className="text-[#00a3a1]">Learning With Us</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                We provide the tools and support you need to succeed in your nursing career
              </p>
              <div className="space-y-4">
                {[
                  { icon: FaChartLine, title: "98% Pass Rate", desc: "Our students consistently excel in their exams with proven success rates" },
                  { icon: FaClock, title: "Flexible Learning", desc: "Study at your own pace, anywhere, anytime with 24/7 platform access" },
                  { icon: FaHandsHelping, title: "Expert Support", desc: "Get guidance from experienced healthcare professionals and educators" },
                  { icon: FaVideo, title: "Video Explanations", desc: "Visual learning with high-quality video explanations and animations" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 p-3 rounded-lg h-fit">
                      <item.icon className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#0a1a3a] mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00a3a1] to-[#0a1a3a] rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-[#0a1a3a] rounded-2xl overflow-hidden shadow-2xl p-8">
                <div className="text-white">
                  <FaQuoteRight className="text-3xl text-[#00a3a1] mb-6" />
                  <p className="text-lg leading-relaxed mb-6">
                    "Alveoly transformed my career. The quality of education and support I received was unparalleled. I passed my licensure exam with flying colors!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#00a3a1] to-[#0a1a3a] rounded-full flex items-center justify-center text-lg font-bold">
                      JD
                    </div>
                    <div>
                      <p className="font-semibold">John Doe</p>
                      <p className="text-sm text-gray-400">Registered Nurse, Class of 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EDUCATORS SECTION ==================== */}
      <section className="py-16 bg-[#f0f6fa] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
                <FaChalkboardTeacher className="text-sm" />
                <span className="text-sm font-semibold">For Educators</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-4">
                Educators: Put your students on the path to success.
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                We work with educational institutions and programs to provide access to our products that promote student success.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Comprehensive reporting dashboard",
                  "Track individual and group performance",
                  "Access to premium content library",
                  "Customizable learning paths",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <FaCheckCircle className="text-[#00a3a1] mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate("/contact_us")}
                className="bg-[#0a1a3a] hover:bg-[#1a2a4a] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                Contact Our Team
                <FaArrowRight className="text-sm" />
              </button>
            </div>
            <div className="relative">
              <div className="bg-[#0a1a3a] rounded-xl p-6 text-white shadow-xl border border-[#00a3a1]/20">
                <div className="flex items-center gap-3 mb-4">
                  <FaChartLine className="text-[#00a3a1] text-2xl" />
                  <h3 className="font-bold text-lg">Institution Dashboard</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Overall Pass Rate", value: "94%" },
                    { label: "Avg. Score", value: "86%" },
                    { label: "Active Students", value: "1,247" },
                    { label: "Top Performer", value: "98%" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-3">
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-xs text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS SECTION ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              What Our{' '}
              <span className="text-[#00a3a1]">Students Say</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories from real students who achieved their goals with Alveoly
            </p>
          </div>

          {loadingTestimonials ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="h-8 w-8 text-[#00a3a1] animate-spin" />
              <span className="ml-3 text-gray-500">Loading testimonials...</span>
            </div>
          ) : testimonialsError && displayTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No testimonials available yet. Share your experience!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex gap-1 mb-4 text-[#f5a623]">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <FaStar key={`empty-${i}`} className="text-gray-300" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4 text-sm">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div>
                      <p className="font-semibold text-[#0a1a3a] text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== CAREERS / JOIN OUR TEAM SECTION ==================== */}
      <section className="py-16 bg-[#f0f6fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-4">
            Are you interested in shaping the future of education?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
            We employ only the most talented individuals who share our passion and commitment to producing the highest quality, student-focused educational content on the market today.
          </p>
          <button 
            onClick={() => navigate("/careers")}
            className="bg-[#f5a623] hover:bg-[#e0960f] text-[#0a1a3a] px-8 py-3 rounded-lg font-bold transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            Join Our Team
            <FaRocket className="text-sm" />
          </button>
        </div>
      </section>

      <Footer />
      
      {/* ==================== SMART CHAT BOT ==================== */}
      <SmartChatBot userId={userInfo.userId} userName={userInfo.userName} />

      {/* ==================== WHATSAPP FLOATING BUTTON ==================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-28 right-4 sm:bottom-32 sm:right-6 z-[9998]"
        onMouseEnter={() => setIsWhatsAppHovered(true)}
        onMouseLeave={() => setIsWhatsAppHovered(false)}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {(showWhatsAppTooltip || isWhatsAppHovered) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-16 right-0 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-xl whitespace-nowrap"
            >
              Chat with us on WhatsApp
              <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-gray-900 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp Button */}
        <motion.button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setShowWhatsAppTooltip(true)}
          onMouseLeave={() => setShowWhatsAppTooltip(false)}
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulsing animation ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></span>
          
          {/* WhatsApp Icon */}
          <FaWhatsapp className="text-2xl sm:text-3xl relative z-10" />
          
          {/* Notification dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </motion.button>

        {/* Available status text */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-green-600 font-medium whitespace-nowrap">
          Online
        </div>
      </motion.div>

      {/* ==================== PRODUCTS MODAL ==================== */}
      <AnimatePresence>
        {showProductsModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaBuilding className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Our Programs</h2>
                    <p className="text-sm text-blue-100">Explore all programs, courses, and subjects</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProductsModal(false)}
                  className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search programs, courses, or subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Modal Body - Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <FaSpinner className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400 mt-3">Loading programs...</p>
                  </div>
                ) : filteredPrograms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <FaBook className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {searchTerm ? "No results found for your search" : "No programs available"}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPrograms.map((program) => {
                      const isProgramExpanded = expandedPrograms[program._id];
                      const programCourses = getCoursesForProgram(program._id);
                      const isActive = program.isActive !== false;

                      return (
                        <div
                          key={program._id}
                          className={`border rounded-xl overflow-hidden ${
                            isActive 
                              ? "border-gray-200 dark:border-gray-700" 
                              : "border-gray-300 dark:border-gray-600 opacity-60"
                          }`}
                        >
                          {/* Program Header */}
                          <button
                            onClick={() => toggleProgram(program._id)}
                            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isActive 
                                  ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                                  : "bg-gray-400"
                              }`}>
                                <FaBuilding className="text-white text-sm" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {program.name}
                                </h3>
                                {program.code && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {program.code}
                                  </p>
                                )}
                                {!isActive && (
                                  <span className="text-xs text-red-500 font-medium">(Inactive)</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {programCourses.length} {programCourses.length === 1 ? 'Course' : 'Courses'}
                              </span>
                              {isProgramExpanded ? (
                                <FaChevronDown className="text-gray-400" />
                              ) : (
                                <FaChevronRight className="text-gray-400" />
                              )}
                            </div>
                          </button>

                          {/* Program Content - Courses */}
                          {isProgramExpanded && (
                            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 px-5 py-4">
                              {programCourses.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                  No courses available for this program
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {programCourses.map((course) => {
                                    const isCourseExpanded = expandedCourses[course._id];
                                    const courseSubjects = getSubjectsForCourse(course._id);

                                    return (
                                      <div
                                        key={course._id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
                                      >
                                        {/* Course Header */}
                                        <button
                                          onClick={() => toggleCourse(course._id)}
                                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                              <FaBook className="text-white text-xs" />
                                            </div>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                              {course.name}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {courseSubjects.length} {courseSubjects.length === 1 ? 'Subject' : 'Subjects'}
                                            </span>
                                            {isCourseExpanded ? (
                                              <FaChevronDown className="text-gray-400 text-sm" />
                                            ) : (
                                              <FaChevronRight className="text-gray-400 text-sm" />
                                            )}
                                          </div>
                                        </button>

                                        {/* Course Content - Subjects */}
                                        {isCourseExpanded && (
                                          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 px-4 py-3">
                                            {courseSubjects.length === 0 ? (
                                              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                                No subjects available for this course
                                              </p>
                                            ) : (
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {courseSubjects.map((subject) => (
                                                  <button
                                                    key={subject._id}
                                                    onClick={() => {
                                                      setShowProductsModal(false);
                                                      navigate(`/student/subjects?course=${course._id}`);
                                                    }}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all text-left group"
                                                  >
                                                    <div className={`w-2 h-2 rounded-full ${
                                                      subject.isPaid 
                                                        ? 'bg-yellow-500' 
                                                        : 'bg-green-500'
                                                    }`}></div>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                                                      {subject.name}
                                                    </span>
                                                    {subject.isPaid && (
                                                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400">
                                                        Premium
                                                      </span>
                                                    )}
                                                    <FaChevronRight className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredPrograms.length} programs • {courses.length} courses • {subjects.length} subjects
                </span>
                <button
                  onClick={() => setShowProductsModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;