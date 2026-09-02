// src/pages/CareerWhatWeDo.jsx - What We Do Page (UWorld Style)
import React from "react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaCheckCircle,
  FaUsers,
  FaGraduationCap,
  FaGlobeAfrica,
  FaRegLightbulb,
  FaRegHandshake,
  FaHeartbeat,
  FaUserNurse,
  FaBrain,
  FaLaptopMedical,
  FaStethoscope,
  FaMicroscope,
  FaFlask,
  FaUserMd,
} from "react-icons/fa";
import { GiBrain } from "react-icons/gi";
import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";
import backgroundVideo from "../assets/background-video.mp4";

const CareerWhatWeDo = () => {
  // Content blocks matching UWorld's "What We Do" structure
  const contentBlocks = [
    {
      title: "High-Stakes Exam Preparation",
      description:
        "We create practice question banks (QBanks) to help users immediately engage with content. Our material doesn't just prepare users for their exams, it ensures they understand the concept behind each question with expertly crafted explanations and visuals.",
      icon: FaGraduationCap,
      color: "from-cyan-400 to-blue-500",
    },
    {
      title: "Evidence-Based Learning",
      description:
        "Every question and explanation is built on the latest evidence-based practice guidelines, ensuring our users learn the most current and clinically relevant information for their professional development.",
      icon: FaStethoscope,
      color: "from-green-400 to-emerald-500",
    },
    {
      title: "Expertly Crafted Content",
      description:
        "Our team of subject matter experts, including practicing clinicians and educators, meticulously develop and review all content to maintain the highest standards of accuracy and educational value.",
      icon: FaUserMd,
      color: "from-purple-400 to-pink-500",
    },
    {
      title: "Interactive Learning Experience",
      description:
        "We combine cutting-edge technology with proven pedagogical approaches to create an engaging, interactive learning experience that promotes deep understanding and long-term retention.",
      icon: FaLaptopMedical,
      color: "from-red-400 to-rose-500",
    },
    {
      title: "Visual Learning Aids",
      description:
        "Our platform features high-quality visuals, diagrams, and illustrations that help learners grasp complex medical concepts quickly and retain them more effectively.",
      icon: FaMicroscope,
      color: "from-indigo-400 to-purple-500",
    },
    {
      title: "Global Reach & Impact",
      description:
        "We're committed to making quality healthcare education accessible worldwide, particularly in underserved communities across Africa and beyond.",
      icon: FaGlobeAfrica,
      color: "from-teal-400 to-cyan-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] overflow-x-hidden">
      <CareerNavbar />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
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
            <span className="inline-block text-[#00a3a1] font-semibold text-sm tracking-wider uppercase mb-4">
              What We Do
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Simply stated: We create study materials
              <br />
              <span className="bg-gradient-to-r from-[#00a3a1] to-emerald-400 bg-clip-text text-transparent">
                for high-stakes exams.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
              Specifically, we create practice question banks (QBanks) to help users
              immediately engage with content. Our material doesn't just prepare
              users for their exams, it ensures they understand the concept behind
              each question with expertly crafted explanations and visuals.
            </p>
            <div className="mt-8">
              <a
                href="/careers/jobs"
                className="inline-flex items-center gap-2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Open Positions
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== CONTENT BLOCKS ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              What Drives <span className="text-[#00a3a1]">Our Work</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our mission is to create the highest quality educational materials
              that empower healthcare professionals to succeed.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {contentBlocks.map((block, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-50 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-[#00a3a1]/20"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${block.color} mb-4`}>
                  <block.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1a3a] mb-2 group-hover:text-[#00a3a1] transition-colors">
                  {block.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{block.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="py-16 bg-[#0a1a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FaUsers, value: "150+", label: "Team Members" },
              { icon: FaGlobeAfrica, value: "12+", label: "Countries Reached" },
              { icon: FaUserNurse, value: "15,000+", label: "Students Trained" },
              { icon: FaHeartbeat, value: "98%", label: "Student Satisfaction" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="text-3xl md:text-4xl mx-auto mb-3 text-[#00a3a1]" />
                <h3 className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 bg-gradient-to-r from-[#0a1a3a] to-[#1a2a5a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/healthcare-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

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

export default CareerWhatWeDo;