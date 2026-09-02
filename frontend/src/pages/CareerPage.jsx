// src/pages/CareerPage.jsx - Main Career Landing Page (UWorld Style)
import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";
import backgroundVideo from "../assets/background-video.mp4";

const CareerPage = () => {
  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] overflow-x-hidden">
      <CareerNavbar />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
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

        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a3a]/60 via-[#0a1a3a]/40 to-[#0a1a3a]/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Preparation that enables success
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
              We pride ourselves on producing the highest quality test prep material.
              Our goal is not simply to ready individuals for exams, but to facilitate
              ongoing success in their chosen academic or professional development.
            </p>
            <div className="mt-8">
              <a
                href="/careers/what-we-do"
                className="inline-flex items-center gap-2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Learn More
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 bg-gradient-to-r from-[#0a1a3a] to-[#1a2a5a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/healthcare-pattern.svg')] opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Make an <span className="text-[#00a3a1]">Impact</span>?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join us in our mission to prepare the next generation of healthcare
              professionals. Your expertise can shape the future of nursing and
              healthcare across Africa.
            </p>
            <a
              href="/careers/jobs"
              className="inline-flex items-center gap-2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Open Positions
              <FaArrowRight className="text-sm" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareerPage;