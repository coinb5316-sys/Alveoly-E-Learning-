import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import aboutBg from "../images/about-bg.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  FaBullseye,
  FaLightbulb,
  FaUsers,
  FaHandshake,
  FaAward,
  FaQuoteLeft,
  FaBookReader,
  FaArrowRight,
  FaGraduationCap,
  FaGlobe,
  FaHeart,
  FaStar,
  FaTrophy,
  FaCheckCircle,
} from "react-icons/fa";

const AboutPage = () => {
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

  const values = [
    {
      icon: FaUsers,
      title: "Empowerment",
      description: "Helping students gain confidence and mastery in their studies.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: FaBookReader,
      title: "Lifelong Learning",
      description: "Encouraging continuous academic and professional growth.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: FaHandshake,
      title: "Integrity",
      description: "Providing accurate, reliable, and evidence-based guidance.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: FaLightbulb,
      title: "Innovation",
      description: "Using modern e-learning methods to simplify learning.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      icon: FaAward,
      title: "Excellence",
      description: "Delivering focused, high-quality tutorials for student success.",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  const stats = [
    { number: "5+", label: "Years of Excellence", icon: FaTrophy },
    { number: "10K+", label: "Students Empowered", icon: FaUsers },
    { number: "50+", label: "Expert Faculty", icon: FaGraduationCap },
    { number: "20+", label: "Countries Reached", icon: FaGlobe },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Mobile Optimized */}
      <header className="relative min-h-[60vh] md:h-screen flex items-center justify-center bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${aboutBg})` }}
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
            <span className="text-white text-xs md:text-sm font-medium">Our Story</span>
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              About Alveoly
            </span>
            <br />
            <span className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl">E-Learning Academy</span>
          </motion.h1>

          <motion.p 
            className="text-sm sm:text-base md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto text-gray-200 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Shaping minds. Building leaders. Inspiring innovation in health sciences education.
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
              className="group bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base hover:bg-white hover:text-gray-900 transition-all duration-300"
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

      {/* Stats Section - Responsive */}
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
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1">{stat.number}</h3>
                <p className="text-xs md:text-sm text-white/90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <motion.section 
        className="py-12 md:py-20 px-4 md:px-6 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* Mission Card */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-6 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-bl-full opacity-50"></div>
              <div className="relative z-10">
                <div className="bg-blue-600 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                  <FaBullseye className="text-2xl md:text-3xl text-white" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg">
                  To provide high-quality, accessible academic support that equips students with the
                  knowledge, skills, and confidence to excel in their Nursing, Midwifery, Public Health  
                  and health science exams.
                </p>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl md:rounded-2xl p-6 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-bl-full opacity-50"></div>
              <div className="relative z-10">
                <div className="bg-purple-600 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                  <FaLightbulb className="text-2xl md:text-3xl text-white" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Our Vision</h2>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg">
                  To become the leading online academic support platform for healthcare students globally,
                  known for producing confident, knowledgeable, and high-performing graduates.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Institutional Profile Section */}
      <motion.section 
        className="py-12 md:py-20 px-4 md:px-6 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              Institutional <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 shadow-lg">
                <FaGraduationCap className="text-2xl md:text-3xl text-blue-600 mb-3 md:mb-4" />
                <p className="text-gray-700 leading-relaxed mb-3 md:mb-4 text-sm md:text-base lg:text-lg">
                  <strong className="text-gray-900">Alveoly E-learning Institute of Health and Sciences</strong> is a dynamic online platform dedicated to helping students excel in health sciences, nursing, midwifery, and foundational sciences such as Mathematics, Physics, and Chemistry.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg">
                  The Institute focuses on simplifying complex topics, providing practical examples, and offering exam-focused tutorials to ensure students perform confidently in national and international licensure and professional exams, including Licensure, NCLEX-RN and other professional exams.
                </p>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 shadow-lg">
                <FaHeart className="text-2xl md:text-3xl text-red-500 mb-3 md:mb-4" />
                <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg">
                  The Institute's approach ensures that learners understand core scientific principles that underpin healthcare practice, strengthening both academic knowledge and clinical reasoning skills.
                </p>
              </div>
            </div>

            {/* Stats/Highlights - Responsive grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-6">
              {[
                { value: "98%", label: "Student Satisfaction", color: "from-blue-500 to-cyan-500" },
                { value: "100+", label: "Expert-Led Courses", color: "from-green-500 to-emerald-500" },
                { value: "24/7", label: "Learning Support", color: "from-purple-500 to-pink-500" },
                { value: "50K+", label: "Practice Questions", color: "from-orange-500 to-red-500" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-r ${item.color} p-4 md:p-6 rounded-xl md:rounded-2xl text-center text-white shadow-lg`}
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">{item.value}</h3>
                  <p className="text-xs md:text-sm text-white/90">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Core Values Section */}
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
              Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Core Values</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="mt-4 md:mt-6 text-sm md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative bg-white rounded-xl md:rounded-2xl p-5 md:p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className={`${value.bgColor} w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`text-2xl md:text-3xl ${value.iconColor}`} />
                </div>
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-1 md:mb-2">{value.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Leadership Quote Section - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 md:w-72 md:h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <FaQuoteLeft className="text-4xl md:text-5xl lg:text-6xl text-blue-400 mx-auto mb-4 md:mb-6 opacity-50" />
          <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white leading-relaxed mb-6 md:mb-8 px-4">
            “At Alveoly E-Learning Academy of Health and Sciences, we don't just educate students — we empower them to change the world.”
          </p>
          <div className="inline-flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FaStar className="text-white text-sm md:text-base" />
            </div>
            <div className="text-left">
              <h4 className="text-white font-semibold text-sm md:text-base">— Prof. Emmanuel Adusei</h4>
              <p className="text-gray-300 text-xs md:text-sm">Vice Chancellor</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6">
            Be Part of Our Legacy
          </h2>
          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-white/90 mb-6 md:mb-8 px-4">
            Join Alveoly E-Learning Academy of Health and Sciences and become part of a vibrant community shaping
            the future of Africa and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <button 
              onClick={() => navigate("/signup")}
              className="group bg-white text-blue-600 px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
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
    </div>
  );
};

export default AboutPage;