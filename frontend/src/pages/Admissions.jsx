// pages/Admissions.jsx - Simplified Professional Version with Image Banner
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import admissionBg from "../images/admissions-bg.jpg";

import {
  FaUserPlus,
  FaGraduationCap,
  FaArrowRight,
  FaCheckCircle,
  FaGlobe,
  FaStar,
  FaUsers,
  FaRocket,
  FaCalendarAlt,
  FaCertificate,
  FaLaptopCode,
  FaHandsHelping,
  FaInfinity,
  FaTrophy,
  FaHeart,
} from "react-icons/fa";

const Admissions = () => {
  const navigate = useNavigate();

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

  const simpleSteps = [
    {
      icon: FaUserPlus,
      title: "Create Your Account",
      description: "Sign up with your email address in just 2 minutes. No complex forms required.",
      action: "Sign Up Now",
      actionLink: "/signup",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      step: "1",
    },
    {
      icon: FaGraduationCap,
      title: "Start Learning",
      description: "Browse our courses and begin your educational journey immediately. No waiting period.",
      action: "Browse Courses",
      actionLink: "/programs",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      step: "2",
    },
    {
      icon: FaRocket,
      title: "Achieve Your Goals",
      description: "Complete courses, earn certificates, and advance your healthcare career.",
      action: "Get Started",
      actionLink: "/login",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      step: "3",
    },
  ];

  const benefits = [
    {
      icon: FaLaptopCode,
      title: "100% Online Learning",
      description: "Study from anywhere, anytime. Access lectures, materials, and resources 24/7.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaCertificate,
      title: "Industry-Recognized Certificates",
      description: "Earn certificates that are valued by employers and institutions worldwide.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: FaHandsHelping,
      title: "Expert Faculty Support",
      description: "Learn from experienced healthcare professionals dedicated to your success.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FaInfinity,
      title: "Flexible Payment Plans",
      description: "Pay-as-you-learn options with affordable monthly installments.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: FaTrophy,
      title: "Career Development",
      description: "Get career guidance, job placement assistance, and networking opportunities.",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: FaHeart,
      title: "Community Support",
      description: "Join a vibrant community of healthcare professionals and students.",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Students", icon: FaUsers },
    { number: "120+", label: "Countries", icon: FaGlobe },
    { number: "500+", label: "Course Offerings", icon: FaStar },
    { number: "24/7", label: "Learning Access", icon: FaCalendarAlt },
  ];

  const testimonials = [
    {
      quote: "Joining Alveoly was the best decision for my nursing career. The flexibility and quality of education are unmatched.",
      name: "Sarah Mensah",
      role: "Registered Nurse",
      rating: 5,
    },
    {
      quote: "I started as a beginner and now I'm a certified healthcare professional. The support system here is incredible.",
      name: "Michael Osei",
      role: "Public Health Officer",
      rating: 5,
    },
    {
      quote: "The courses are practical, up-to-date, and taught by industry experts. Highly recommended!",
      name: "Jennifer Adjei",
      role: "Pharmacy Technician",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section - WITH IMAGE BANNER */}
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
            <span className="text-white text-xs md:text-sm font-medium">Join Our Community</span>
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Journey Starts Here
            </span>
            <br />
            <span className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl">Join Alveoly Today</span>
          </motion.h1>

          <motion.p 
            className="text-sm sm:text-base md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto text-gray-200 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            No complex admission forms. No entrance exams. Just create an account and start learning immediately.
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
                Create Free Account
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm md:text-base" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <button
              onClick={() => navigate("/programs")}
              className="group bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Explore Programs
            </button>
          </motion.div>

          <motion.p 
            className="text-xs md:text-sm text-gray-300 mt-6 md:mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            ⚡ No application fee • Instant access • Start learning in minutes
          </motion.p>
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

      {/* Simple 3-Step Process - NO DOCUMENTS REQUIRED */}
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
              Get Started in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              No waiting periods, no complicated forms. Just you, your passion, and your future.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {simpleSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100"
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
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">{step.description}</p>
                
                <button
                  onClick={() => navigate(step.actionLink)}
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all"
                >
                  {step.action}
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
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
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Alveoly?</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Thousands of healthcare professionals have chosen Alveoly for their education. Here's why:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className={`bg-gradient-to-r ${benefit.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="text-xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
              What Our Students Say
            </h2>
            <div className="w-16 md:w-24 h-1 bg-white mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>
                <p className="text-sm md:text-base mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-white/80">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 md:mb-8 px-4">
              Join thousands of successful healthcare professionals who started their journey with Alveoly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <button 
                onClick={() => navigate("/signup")}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Create Free Account
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate("/contact")}
                className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Contact Support
              </button>
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-6">
              No commitment required • Start learning immediately • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admissions;