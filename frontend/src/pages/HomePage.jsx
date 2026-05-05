// HomePage.jsx - Updated with real testimonials from API
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import kalveoBg from "../images/kalveo-bg.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnswerBot from "../components/AnswerBot";
import API from "../api/axios";

import {
  FaLightbulb,
  FaBriefcase,
  FaFlask,
  FaGlobeAfrica,
  FaUsers,
  FaGraduationCap,
  FaServicestack,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaCertificate,
  FaChartLine,
  FaClock,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaHandsHelping,
  FaQuoteRight,
  FaSpinner,
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
        // Fetch all testimonials and filter approved ones
        const response = await API.get("/testimonials");
        const approvedTestimonials = response.data.filter(t => t.status === "approved");
        
        // Format testimonials for display
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
        // Fallback testimonials in case API fails
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
    const targets = { partnerships: 25, students: 15000, employment: 98, programs: 100 };
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const features = [
    {
      icon: FaLightbulb,
      title: "Innovation Driven",
      description: "Cutting-edge labs, technology-driven programs, and forward-thinking curriculum.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: FaBriefcase,
      title: "Career Focused",
      description: "Simplifying complex topics with step-by-step guidance and practical examples.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: FaFlask,
      title: "Global Research Impact",
      description: "Groundbreaking research in sustainability, health, and emerging technologies.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const services = [
    {
      title: "Health Science Tutorials",
      items: ["Nursing", "Midwifery", "Public Health", "Allied Health"],
      gradient: "from-blue-500 to-cyan-500",
      icon: FaUserGraduate,
    },
    {
      title: "Step-by-Step Guides",
      items: ["Topic Breakdowns", "Practical Examples", "Case Studies", "Real-life Applications"],
      gradient: "from-green-500 to-emerald-500",
      icon: FaChalkboardTeacher,
    },
    {
      title: "Exam-Focused Prep",
      items: ["Bsc Nursing Exams", "Licensure (NMC)", "NCLEX-RN", "Semester Exams 100-400"],
      gradient: "from-purple-500 to-pink-500",
      icon: FaCertificate,
    },
  ];

  // Display only first 3 testimonials
  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Mobile Optimized */}
      <header className="relative min-h-[60vh] md:h-screen flex items-center justify-center bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${kalveoBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        
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
            <span className="text-white text-xs md:text-sm font-medium">World-Class Education</span>
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Alveoly E-Learning
            </span>
            <br />
            <span className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl">Academy of Health & Sciences</span>
          </motion.h1>

          <motion.p 
            className="text-sm sm:text-base md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-4xl mx-auto text-gray-200 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Discover a world-class education designed to prepare you for global success. 
            Join thousands of students shaping the future of healthcare education.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={() => navigate("/signup")}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm md:text-base" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="group bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Login
            </button>
          </motion.div>
        </motion.div>

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

      {/* Trusted By Section */}
      <section className="py-8 md:py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-center text-gray-500 text-xs md:text-sm uppercase tracking-wide mb-6 md:mb-8">
            Trusted by leading institutions worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 lg:gap-16 opacity-50">
            {["WHO", "UNESCO", "Ministry of Health", "Nursing Council", "Medical Association"].map((org, i) => (
              <span key={i} className="text-gray-600 font-semibold text-sm md:text-lg">{org}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="py-12 md:py-20 px-4 md:px-6 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-8 md:mb-16" variants={fadeInUp}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Alveoly?</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              We provide an exceptional learning experience that prepares you for real-world success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative bg-white rounded-xl md:rounded-2xl p-5 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className={`${feature.bgColor} w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`text-2xl md:text-4xl ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 md:mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.description}</p>
                <div className="mt-4 md:mt-6 flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-sm md:text-base">
                  Learn more <FaArrowRight className="ml-2 text-xs md:text-sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section with Counters */}
      <section ref={statsRef} className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: FaGlobeAfrica, label: "International Partnerships", value: counters.partnerships, suffix: "+" },
              { icon: FaUsers, label: "Active Students", value: counters.students.toLocaleString(), suffix: "+" },
              { icon: FaBriefcase, label: "Graduate Employment Rate", value: counters.employment, suffix: "%" },
              { icon: FaGraduationCap, label: "Programs Offered", value: counters.programs, suffix: "+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={counterStarted ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl mx-auto mb-2 md:mb-4 text-white/80" />
                <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-5xl font-bold mb-1 md:mb-2">{stat.value}{stat.suffix}</h3>
                <p className="text-xs md:text-sm lg:text-base text-white/90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <motion.section 
        className="py-12 md:py-20 px-4 md:px-6 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-8 md:mb-16" variants={fadeInUp}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              Our Premium <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Services</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${service.gradient} p-4 md:p-6 text-white`}>
                  <service.icon className="text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold">{service.title}</h3>
                </div>
                <div className="p-4 md:p-6">
                  <ul className="space-y-2 md:space-y-3">
                    {service.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 md:gap-3 text-gray-700 text-sm md:text-base">
                        <FaCheckCircle className="text-green-500 flex-shrink-0 text-xs md:text-sm" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Us Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                Why Students Love <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Learning With Us</span>
              </h2>
              <div className="space-y-4 md:space-y-6">
                {[
                  { icon: FaChartLine, title: "98% Pass Rate", desc: "Our students consistently excel in their exams" },
                  { icon: FaClock, title: "Flexible Learning", desc: "Study at your own pace, anywhere, anytime" },
                  { icon: FaHandsHelping, title: "24/7 Mentorship", desc: "Expert support whenever you need it" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-lg h-fit">
                      <item.icon className="text-lg md:text-xl lg:text-2xl text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm md:text-base">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl md:rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-5 md:p-8 text-white">
                  <FaQuoteRight className="text-2xl md:text-3xl lg:text-4xl text-blue-400 mb-4 md:mb-6" />
                  <p className="text-sm md:text-base lg:text-xl leading-relaxed mb-4 md:mb-6">
                    "Alveoly transformed my career. The quality of education and support I received was unparalleled. I passed my licensure exam with flying colors!"
                  </p>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm md:text-base lg:text-xl font-bold">
                      JD
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">John Doe</p>
                      <p className="text-xs md:text-sm text-gray-400">Registered Nurse, Class of 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Now with REAL approved testimonials */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              What Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Students Say</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
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
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {displayTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex gap-1 mb-3 md:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-sm md:text-base" />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <FaStar key={`empty-${i}`} className="text-gray-300 text-sm md:text-base" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base line-clamp-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" 
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">{testimonial.name}</p>
                      <p className="text-xs md:text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Show message if less than 3 testimonials */}
          {!loadingTestimonials && displayTestimonials.length > 0 && displayTestimonials.length < 3 && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Showing {displayTestimonials.length} testimonial{displayTestimonials.length !== 1 ? 's' : ''}. 
                More coming soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 md:mb-8 px-4">
            Join thousands of successful students who chose Alveoly for their healthcare education
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <button 
              onClick={() => navigate("/signup")}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Get Started
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      <Footer />
      
      <AnswerBot 
        userId={userInfo.userId}
        userName={userInfo.userName}
      />
    </div>
  );
};

export default HomePage;