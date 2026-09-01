// HomePage.jsx - UWorld Professional Clone
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  FaBriefcase,
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
} from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userId: null,
    userName: "Guest"
  });

  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState(null);

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

  const displayTestimonials = testimonials.slice(0, 3);

  // Product data matching UWorld's structure
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
      <header className="relative min-h-[60vh] md:min-h-[70vh] flex items-center bg-[#0a1a3a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,163,161,0.3) 0%, transparent 50%)`,
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              <span className="text-[#00a3a1]">Alveoly</span> E-Learning
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              Academy of Health & Sciences
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
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
                onClick={() => navigate("/programs")}
                className="bg-transparent border-2 border-[#00a3a1] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#00a3a1] hover:text-white transition-all duration-300"
              >
                View Products
              </button>
            </div>
          </div>
        </div>
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
                onClick={() => navigate(category.link)}
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

      {/* ==================== TESTIMONIALS SECTION ==================== */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              What Our Students Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from those who have achieved their goals with Alveoly
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

      {/* ==================== EDUCATORS SECTION ==================== */}
      <section className="py-16 bg-[#f0f6fa] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
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
                onClick={() => navigate("/contact")}
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

      {/* ==================== CAREERS / JOIN OUR TEAM SECTION ==================== */}
      <section className="py-16 bg-white">
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
      
      <SmartChatBot userId={userInfo.userId} userName={userInfo.userName} />
    </div>
  );
};

export default HomePage;