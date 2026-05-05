import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import admissionBg from "../images/admissions-bg.jpg";

import {
  FaClipboardList,
  FaBookOpen,
  FaUserCheck,
  FaGraduationCap,
  FaArrowRight,
  FaCheckCircle,
  FaCalendarAlt,
  FaFileAlt,
  FaLanguage,
  FaUsers,
  FaGlobe,
  FaStar,
} from "react-icons/fa";

const Admissions = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();

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

  const steps = [
    {
      icon: FaClipboardList,
      title: "Fill Application",
      description: "Complete your application form online or download the offline form.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      step: "1",
    },
    {
      icon: FaBookOpen,
      title: "Submit Documents",
      description: "Upload or mail your academic transcripts and supporting materials.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      step: "2",
    },
    {
      icon: FaUserCheck,
      title: "Review Process",
      description: "Our admissions team carefully reviews every application submitted.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      step: "3",
    },
    {
      icon: FaGraduationCap,
      title: "Get Admission Offer",
      description: "Successful applicants will receive their admission letter via email.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      step: "4",
    },
  ];

  const requirements = [
    { icon: FaFileAlt, text: "Completed application form (online or paper-based)", color: "text-blue-600" },
    { icon: FaGraduationCap, text: "Official high school transcripts or equivalent certificates", color: "text-green-600" },
    { icon: FaLanguage, text: "Proof of English proficiency (if applicable)", color: "text-purple-600" },
    { icon: FaUsers, text: "Two academic or professional recommendation letters", color: "text-orange-600" },
    { icon: FaClipboardList, text: "A personal statement (max 500 words)", color: "text-red-600" },
  ];

  const stats = [
    { number: "95%", label: "Acceptance Rate", icon: FaStar },
    { number: "50+", label: "Countries Represented", icon: FaGlobe },
    { number: "3", label: "Application Cycles/Year", icon: FaCalendarAlt },
    { number: "10K+", label: "Annual Applicants", icon: FaUsers },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Mobile Optimized */}
      <header className="relative min-h-[60vh] md:h-screen flex items-center justify-center bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${admissionBg})` }}
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
            <span className="text-white text-xs md:text-sm font-medium">Join Us</span>
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admissions
            </span>
            <br />
            <span className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl">Alveoly E-Learning Academy</span>
          </motion.h1>

          <motion.p 
            className="text-sm sm:text-base md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto text-gray-200 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your gateway to excellence, innovation, and global leadership in health sciences education.
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
                Apply Now
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

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="text-2xl md:text-4xl mx-auto mb-2 md:mb-3 text-white/80" />
                <h3 className="text-xl md:text-2xl lg:text-4xl font-bold mb-1">{stat.number}</h3>
                <p className="text-xs md:text-sm text-white/90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Requirements Section */}
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
              Admission <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Requirements</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Alveoly E-Learning Academy of Health and Sciences welcomes ambitious, curious, and creative minds ready to make an impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {requirements.map((req, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <req.icon className={`text-xl md:text-2xl ${req.color}`} />
                </div>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">{req.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="mt-8 md:mt-12 text-center">
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base hover:shadow-lg transition-all duration-300"
            >
              Check Eligibility
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Steps to Apply Section */}
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
              How to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Apply</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Follow these simple steps to begin your journey with us
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Step Number */}
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full ${step.bgColor} flex items-center justify-center text-sm font-bold ${step.iconColor}`}>
                  {step.step}
                </div>

                <div className={`${step.bgColor} w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`text-2xl md:text-3xl ${step.iconColor}`} />
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Important Dates Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
              Important Dates
            </h2>
            <div className="w-16 md:w-24 h-1 bg-white mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { term: "Fall Semester", deadline: "August 15, 2024", start: "September 2, 2024" },
              { term: "Spring Semester", deadline: "December 15, 2024", start: "January 15, 2025" },
              { term: "Summer Session", deadline: "April 30, 2025", start: "June 1, 2025" },
            ].map((date, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white"
              >
                <FaCalendarAlt className="text-3xl mx-auto mb-4 text-white/80" />
                <h3 className="text-xl font-bold mb-2">{date.term}</h3>
                <p className="text-sm mb-1">Application Deadline:</p>
                <p className="font-semibold mb-3">{date.deadline}</p>
                <p className="text-sm mb-1">Classes Start:</p>
                <p className="font-semibold">{date.start}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 md:mb-8 px-4">
            Join a world-class university shaping future innovators, thinkers, and leaders across Africa and beyond.
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

export default Admissions;