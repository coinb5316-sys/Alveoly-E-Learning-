// src/pages/LegalPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaBalanceScale,
  FaBook,
  FaVideo,
  FaClipboardCheck,
  FaGavel,
  FaBuilding,
  FaHandshake,
  FaUsers,
  FaFileContract,
  FaShieldAlt,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import legalBg from "../images/legal-bg.jpg";

const LegalPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FaBook,
      title: "Bar Exam Preparation",
      description: "Comprehensive bar exam preparation materials covering all major legal subjects.",
    },
    {
      icon: FaVideo,
      title: "Expert Lectures",
      description: "Learn from experienced attorneys and law professors through engaging video content.",
    },
    {
      icon: FaClipboardCheck,
      title: "Practice Questions",
      description: "Thousands of practice questions with detailed explanations for each answer.",
    },
    {
      icon: FaGavel,
      title: "Case Analysis",
      description: "Develop critical legal analysis skills through real case studies and scenarios.",
    },
  ];

  const legalAreas = [
    { icon: FaBuilding, name: "Corporate Law", color: "text-blue-500" },
    { icon: FaHandshake, name: "Contract Law", color: "text-green-500" },
    { icon: FaUsers, name: "Family Law", color: "text-red-500" },
    { icon: FaFileContract, name: "Property Law", color: "text-purple-500" },
    { icon: FaShieldAlt, name: "Criminal Law", color: "text-indigo-500" },
    { icon: FaBalanceScale, name: "Constitutional Law", color: "text-yellow-600" },
  ];

  return (
    <div className="min-h-screen bg-white text-[#333] overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[550px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${legalBg})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

        <div className="relative z-10 h-full max-w-[1180px] mx-auto px-6 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-[600px]"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaBalanceScale className="text-[#f7c928] text-3xl" />
              <span className="text-[#f7c928] text-sm font-semibold uppercase tracking-wider">
                Legal Program
              </span>
            </div>
            <h1 className="text-white font-medium text-[36px] sm:text-[44px] md:text-[52px] leading-[1.1]">
              Your Path to
              <br />
              Legal Excellence
              <br />
              Starts Here
            </h1>
            <p className="mt-4 text-white/85 text-[15px] md:text-[16px] leading-6 max-w-[450px]">
              Comprehensive legal education and bar exam preparation resources
              designed to help you succeed in law school and beyond.
            </p>
            <button
              onClick={() => navigate("/programs?category=legal")}
              className="mt-6 inline-flex items-center gap-2 bg-[#f7c928] hover:bg-[#eab900] text-[#222] px-6 py-3 rounded-full text-[14px] font-semibold transition-colors"
            >
              Explore Legal Programs
              <FaArrowRight className="text-[11px]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[#555] font-normal text-[28px] md:text-[34px]">
              Why Choose Our Legal Program?
            </h2>
            <p className="mt-3 text-[14px] text-[#777] max-w-[600px] mx-auto">
              Everything you need to excel in law school and pass the bar exam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#f8f9fa] p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-14 h-14 rounded-full bg-[#1687df]/10 flex items-center justify-center mb-4">
                    <Icon className="text-[#1687df] text-2xl" />
                  </div>
                  <h3 className="text-[#333] text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#777] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Legal Areas Section */}
      <section className="py-16 md:py-20 bg-[#f7f7f7]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[#555] font-normal text-[28px] md:text-[34px]">
              Legal Areas Covered
            </h2>
            <p className="mt-3 text-[14px] text-[#777]">
              Comprehensive coverage across all major legal disciplines
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {legalAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <Icon className={`${area.color} text-3xl mx-auto mb-3`} />
                  <p className="text-[#555] text-sm font-medium">
                    {area.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#1687df]">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-white font-normal text-[28px] md:text-[34px]">
            Ready to Start Your Legal Journey?
          </h2>
          <p className="mt-4 text-white/85 text-[15px] max-w-[600px] mx-auto">
            Join thousands of law students who have successfully prepared with
            Alveoly's comprehensive legal program.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="mt-6 inline-flex items-center gap-2 bg-white hover:bg-[#f7f7f7] text-[#1687df] px-8 py-3 rounded-full text-[14px] font-semibold transition-colors"
          >
            Get Started Now
            <FaArrowRight className="text-[11px]" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LegalPage;