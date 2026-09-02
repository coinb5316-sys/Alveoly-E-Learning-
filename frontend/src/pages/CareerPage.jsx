// src/pages/CareerPage.jsx - EXACT UWorld Career Page Replica
import React from "react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaTrophy,
  FaStar,
  FaStethoscope,
  FaUserMd,
  FaUserNurse,
  FaBriefcase,
  FaHandHoldingHeart,
} from "react-icons/fa";
import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";
import backgroundVideo from "../assets/background-video.mp4";

// Images matching UWorld style
const IMAGES = {
  medical: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  physicians: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=600&q=80",
  nursing: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80",
  marketing: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
  sales: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80",
};

const CareerPage = () => {
  // Featured job categories (exactly like UWorld)
  const featuredCategories = [
    { title: "Medical", icon: FaStethoscope, image: IMAGES.medical },
    { title: "Physicians", icon: FaUserMd, image: IMAGES.physicians },
    { title: "Nursing", icon: FaUserNurse, image: IMAGES.nursing },
    { title: "Marketing", icon: FaBriefcase, image: IMAGES.marketing },
    { title: "Sales", icon: FaHandHoldingHeart, image: IMAGES.sales },
  ];

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] overflow-x-hidden">
      <CareerNavbar />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.4)" }}
        >
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a3a]/80 via-[#0a1a3a]/60 to-[#0a1a3a]/40"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* UWorld-style headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Love Your Job,
              <br />
              <span className="text-[#00a3a1]">Live Your Life,</span>
              <br />
              Make An Impact
            </h1>

            {/* CTA Button */}
            <div className="mt-8">
              <a
                href="#jobs"
                className="inline-flex items-center gap-2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                See Job Openings
                <FaArrowRight className="text-sm" />
              </a>
            </div>

            {/* Great Place to Work Badge - EXACTLY like UWorld */}
            <div className="mt-10 flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-sm">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <FaTrophy className="text-2xl" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Great Place To Work</p>
                <p className="text-white/70 text-xs">Certified</p>
                <p className="text-white/70 text-xs">OCT 2023-OCT 2024</p>
                <p className="text-white/70 text-xs font-medium">USA</p>
              </div>
              <div className="ml-auto flex text-amber-400 gap-0.5">
                <FaStar className="text-sm" /><FaStar className="text-sm" />
                <FaStar className="text-sm" /><FaStar className="text-sm" />
                <FaStar className="text-sm" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </motion.div>
      </section>

      {/* ==================== FEATURED JOB CATEGORIES ==================== */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0a1a3a]">Featured Job Listings</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {featuredCategories.map((category, index) => (
              <motion.a
                key={index}
                href="#jobs"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer block"
              >
                <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] relative">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    {/* Category title */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center gap-2">
                        <category.icon className="text-lg" />
                        <h3 className="font-bold text-lg">{category.title}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PREPARATION THAT ENABLES SUCCESS ==================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-4">
                Preparation that <span className="text-[#00a3a1]">enables success</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We pride ourselves on producing the highest quality test prep material.
                Our goal is not simply to ready individuals for exams, but to facilitate
                ongoing success in their chosen academic or professional development.
              </p>
              <a
                href="/careers/what-we-do"
                className="inline-flex items-center gap-2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Learn More
                <FaArrowRight className="text-sm" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "15,000+ Students Trained", color: "bg-blue-100 text-blue-600" },
                { label: "98% Pass Rate", color: "bg-emerald-100 text-emerald-600" },
                { label: "50+ Clinical Partners", color: "bg-purple-100 text-purple-600" },
                { label: "12+ Countries", color: "bg-cyan-100 text-cyan-600" },
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.color} rounded-xl p-6 text-center font-semibold text-sm`}>
                  {stat.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareerPage;