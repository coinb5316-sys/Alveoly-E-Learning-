// HomePage.jsx - Complete UWorld-Inspired Redesign
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";
import SmartChatBot from "../components/SmartChatBot";

import {
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaUserGraduate,
  FaCertificate,
  FaChalkboardTeacher,
  FaChartLine,
  FaClock,
  FaHandsHelping,
  FaQuoteRight,
  FaSpinner,
  FaUsers,
  FaGraduationCap,
  FaBriefcase,
  FaGlobeAfrica,
  FaPlay,
  FaShieldAlt,
  FaAward,
  FaRocket,
  FaBookOpen,
  FaVideo,
} from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  const [counterStarted, setCounterStarted] = useState(false);
  const statsRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  const [userInfo, setUserInfo] = useState({
    userId: null,
    userName: "Guest"
  });

  // State for testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState(null);

  // Counters for stats
  const [counters, setCounters] = useState({
    partnerships: 0,
    students: 0,
    employment: 0,
    programs: 0,
  });

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
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=3b82f6&color=fff`,
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
            image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=fff",
          },
          {
            name: "Prof. Michael Amoah",
            role: "Medical Sciences Lecturer",
            content: "The quality of content and teaching methodology at Alveoly is exceptional. Highly recommended!",
            rating: 5,
            image: "https://ui-avatars.com/api/?name=Michael+Amoah&background=3b82f6&color=fff",
          },
          {
            name: "Dr. Elizabeth Mensah",
            role: "Clinical Instructor",
            content: "My students have shown remarkable improvement since using Alveoly. The platform's approach to teaching is truly innovative.",
            rating: 5,
            image: "https://ui-avatars.com/api/?name=Elizabeth+Mensah&background=3b82f6&color=fff",
          },
        ]);
      } finally {
        setLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

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

  const programs = [
    {
      title: "NCLEX-RN Prep",
      description: "Comprehensive preparation for the NCLEX-RN with thousands of practice questions and detailed rationales.",
      features: ["2,500+ Practice Questions", "Detailed Rationales", "Performance Tracking", "Mock Exams"],
      color: "from-blue-500 to-cyan-500",
      icon: FaUserGraduate,
      cta: "Start Free Trial",
      popular: true,
    },
    {
      title: "BSc Nursing Exams",
      description: "Master your nursing school exams with subject-specific practice and comprehensive study materials.",
      features: ["Subject-Specific Tests", "Study Guides", "Progress Reports", "Expert Explanations"],
      color: "from-purple-500 to-pink-500",
      icon: FaCertificate,
      cta: "Learn More",
      popular: false,
    },
    {
      title: "Licensure Exam Prep",
      description: "Prepare for your licensure exams with targeted practice and expert-guided preparation.",
      features: ["NMC Prep", "Regional Exams", "Mock Tests", "Performance Analytics"],
      color: "from-green-500 to-emerald-500",
      icon: FaChalkboardTeacher,
      cta: "Get Started",
      popular: false,
    },
  ];

  const trustStats = [
    { number: "15,000+", label: "Active Students" },
    { number: "98%", label: "Pass Rate" },
    { number: "50+", label: "Partner Institutions" },
    { number: "4.9/5", label: "Student Rating" },
  ];

  const whyUsItems = [
    { icon: FaChartLine, title: "98% Pass Rate", desc: "Our students consistently excel in their exams with proven success rates" },
    { icon: FaClock, title: "Flexible Learning", desc: "Study at your own pace, anywhere, anytime with 24/7 platform access" },
    { icon: FaHandsHelping, title: "Expert Support", desc: "Get guidance from experienced healthcare professionals and educators" },
    { icon: FaVideo, title: "Video Explanations", desc: "Visual learning with high-quality video explanations and animations" },
  ];

  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ==================== HERO SECTION ==================== */}
      <header className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
          }}></div>
        </div>

        {/* Animated floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

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
                Ace Your Nursing Exams with{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Confidence
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg leading-relaxed">
                Master complex topics with thousands of realistic practice questions, detailed rationales, and performance-tracking tools designed for your success.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate("/signup")}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate("/programs")}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  View Programs
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

            {/* Right Column - Hero Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-3xl opacity-20"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  {/* Dashboard preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          A
                        </div>
                        <div>
                          <div className="h-3 bg-white/30 rounded w-24"></div>
                          <div className="h-2 bg-white/20 rounded w-16 mt-1"></div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-white/30 rounded-full"></div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Score", value: "85%", color: "bg-green-500/30" },
                        { label: "Rank", value: "Top 10%", color: "bg-blue-500/30" },
                        { label: "Questions", value: "1,247", color: "bg-purple-500/30" },
                        { label: "Streak", value: "12 Days", color: "bg-orange-500/30" },
                      ].map((stat, i) => (
                        <div key={i} className={`${stat.color} rounded-lg p-3`}>
                          <div className="text-xs text-white/70">{stat.label}</div>
                          <div className="text-lg font-bold text-white">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between text-white text-sm">
                        <span>Progress</span>
                        <span className="font-semibold">68%</span>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
                        <div className="w-[68%] h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
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

      {/* ==================== TRUST SECTION ==================== */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm font-semibold uppercase tracking-wider mb-6">
            Trusted by Students and Institutions Worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PROGRAMS SECTION ==================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Prepare for Your Nursing Exams with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Confidence
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive test prep programs designed for your success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2 relative"
              >
                {program.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={`bg-gradient-to-r ${program.color} p-6 text-white`}>
                  <program.icon className="text-3xl mb-3" />
                  <h3 className="text-xl font-bold">{program.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{program.description}</p>
                  <ul className="space-y-2 mb-6">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => navigate("/signup")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    {program.cta}
                  </button>
                </div>
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Students Love{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Learning With Us
                </span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                We provide the tools and support you need to succeed in your nursing career
              </p>
              <div className="space-y-4">
                {whyUsItems.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 p-3 rounded-lg h-fit">
                      <item.icon className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl p-8">
                <div className="text-white">
                  <FaQuoteRight className="text-3xl text-blue-400 mb-6" />
                  <p className="text-lg leading-relaxed mb-6">
                    "Alveoly transformed my career. The quality of education and support I received was unparalleled. I passed my licensure exam with flying colors!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold">
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

      {/* ==================== FOR EDUCATORS SECTION ==================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
                <FaChalkboardTeacher className="text-sm" />
                <span className="text-sm font-semibold">For Educators</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Put Your Students on the Path to Success
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Partner with Alveoly to provide your students with the best exam preparation tools available.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Comprehensive reporting dashboard",
                  "Track individual and group performance",
                  "Access to premium content library",
                  "Customizable learning paths",
                  "Real-time analytics and insights",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate("/contact")}
                className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg inline-flex items-center gap-2"
              >
                Request a Demo
                <FaArrowRight className="text-sm" />
              </button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FaUsers className="text-2xl" />
                  </div>
                  <div>
                    <div className="font-bold">Institution Dashboard</div>
                    <div className="text-sm text-blue-200">Real-time analytics</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Pass Rate", value: "94%" },
                    { label: "Completion", value: "87%" },
                    { label: "Active Students", value: "1,247" },
                    { label: "Top Score", value: "98%" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-blue-200">{stat.label}</div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Students Say
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories from real students who achieved their goals with Alveoly
            </p>
          </div>

          {loadingTestimonials ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-500">Loading testimonials...</span>
            </div>
          ) : testimonialsError && displayTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No testimonials available yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <FaStar key={`empty-${i}`} className="text-gray-300" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(59,130,246,0.3) 0%, transparent 50%)`,
          }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Join thousands of successful students who chose Alveoly for their healthcare education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate("/signup")}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              Start Free Trial
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/programs")}
              className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
            >
              View All Programs
            </button>
          </div>
        </div>
      </section>

      <Footer />
      
      <SmartChatBot userId={userInfo.userId} userName={userInfo.userName} />
    </div>
  );
};

export default HomePage;