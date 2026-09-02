// src/pages/CareerPage.jsx - Complete UWorld-Style Career Landing Page
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowRight, 
  FaCheckCircle, 
  FaUsers, 
  FaTrophy, 
  FaHeartbeat,
  FaBriefcase,
  FaGraduationCap,
  FaStethoscope,
  FaUserMd,
  FaLaptopMedical,
  FaMicroscope,
  FaFlask,
  FaUserNurse,
  FaClock,
  FaMapMarkerAlt,
  FaBuilding,
  FaAward,
  FaRocket,
  FaStar,
  FaQuoteRight,
  FaSpinner,
  FaTimes,
  FaSearch,
  FaDollarSign,
  FaCalendarAlt,
  FaPiggyBank,
  FaHandHoldingHeart,
  FaGlobeAfrica,
  FaRegLightbulb,
  FaRegHandshake,
  FaBrain,
  FaHandSparkles,
  FaHospital,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { GiBrain } from "react-icons/gi";
import { toast } from "react-toastify";
import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";
import backgroundVideo from "../assets/background-video.mp4";

// Placeholder images - Replace with your actual image URLs
const IMAGES = {
  heroBg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80",
  medical: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
  nursing: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80",
  marketing: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  sales: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  physicians: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&q=80",
  team1: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  team2: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
  team3: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  benefit1: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  benefit2: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  benefit3: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&q=80",
};

const CareerPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    coverLetter: "",
    resume: null,
    agreeTerms: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // Featured job categories (matching UWorld)
  const featuredCategories = [
    {
      title: "Medical",
      icon: FaStethoscope,
      count: "12 openings",
      image: IMAGES.medical,
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Physicians",
      icon: FaUserMd,
      count: "8 openings",
      image: IMAGES.physicians,
      color: "from-emerald-500 to-teal-400"
    },
    {
      title: "Nursing",
      icon: FaUserNurse,
      count: "15 openings",
      image: IMAGES.nursing,
      color: "from-purple-500 to-pink-400"
    },
    {
      title: "Marketing",
      icon: FaBriefcase,
      count: "6 openings",
      image: IMAGES.marketing,
      color: "from-orange-500 to-amber-400"
    },
    {
      title: "Sales",
      icon: FaHandHoldingHeart,
      count: "4 openings",
      image: IMAGES.sales,
      color: "from-red-500 to-rose-400"
    },
  ];

  // Sample job listings
  const jobs = [
    {
      id: 1,
      title: "Senior Nursing Educator",
      department: "Nursing",
      location: "Accra, Ghana",
      type: "Full-time",
      posted: "2 days ago",
      description: "Lead the development of innovative nursing education programs and curriculum for healthcare professionals.",
    },
    {
      id: 2,
      title: "Medical Content Writer",
      department: "Medical",
      location: "Remote",
      type: "Full-time",
      posted: "3 days ago",
      description: "Create compelling, accurate medical education content for healthcare students and professionals.",
    },
    {
      id: 3,
      title: "Clinical Simulation Specialist",
      department: "Nursing",
      location: "Accra, Ghana",
      type: "Full-time",
      posted: "5 days ago",
      description: "Design and implement clinical simulation experiences for nursing and healthcare students.",
    },
    {
      id: 4,
      title: "Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      posted: "1 week ago",
      description: "Lead marketing strategy and campaigns for our healthcare education platform.",
    },
    {
      id: 5,
      title: "Sales Representative",
      department: "Sales",
      location: "Accra, Ghana",
      type: "Full-time",
      posted: "1 week ago",
      description: "Drive sales growth and build relationships with healthcare institutions and partners.",
    },
  ];

  const filteredJobs = jobs.filter(job => {
    if (searchTerm) {
      return job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             job.department.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (selectedDepartment !== "all") {
      return job.department.toLowerCase() === selectedDepartment.toLowerCase();
    }
    return true;
  });

  const departments = [...new Set(jobs.map(job => job.department))];

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    setApplicationData({
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      coverLetter: "",
      resume: null,
      agreeTerms: false,
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApplicationData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        e.target.value = "";
        return;
      }
      setApplicationData((prev) => ({ ...prev, resume: file }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!applicationData.fullName.trim()) errors.fullName = "Full name is required";
    if (!applicationData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(applicationData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!applicationData.phone.trim()) errors.phone = "Phone number is required";
    if (!applicationData.resume) errors.resume = "Please upload your resume";
    if (!applicationData.agreeTerms) errors.agreeTerms = "You must agree to the terms";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Application submitted successfully!`);
      setShowApplicationModal(false);
      setApplicationData({
        fullName: "",
        email: "",
        phone: "",
        linkedin: "",
        coverLetter: "",
        resume: null,
        agreeTerms: false,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] overflow-x-hidden">
      <CareerNavbar />

      {/* ==================== HERO SECTION WITH VIDEO ==================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.35)" }}
        >
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a3a]/70 via-[#0a1a3a]/50 to-[#0a1a3a]/30"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Love Your Job,
              <br />
              <span className="bg-gradient-to-r from-[#00a3a1] to-emerald-400 bg-clip-text text-transparent">
                Live Your Life,
              </span>
              <br />
              Make An Impact
            </h1>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#jobs"
                className="inline-flex items-center gap-2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                See Job Openings
                <FaArrowRight className="text-sm" />
              </a>
            </div>

            {/* Great Place to Work Award Badge */}
            <div className="mt-10 flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold">
                <FaTrophy />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Great Place To Work</p>
                <p className="text-gray-300 text-xs">Certified 2024</p>
              </div>
              <div className="ml-auto flex text-amber-400">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </motion.div>
      </section>

      {/* ==================== FEATURED JOB CATEGORIES (UNDER HERO) ==================== */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0a1a3a]">Featured Job Categories</h2>
            <a href="/careers/jobs" className="text-[#00a3a1] hover:text-[#008b89] font-medium text-sm flex items-center gap-1">
              View All Jobs <FaArrowRight className="text-xs" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {featuredCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
                onClick={() => setSelectedDepartment(category.title.toLowerCase())}
              >
                <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] relative">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-70`}></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <category.icon className="text-lg" />
                        <h3 className="font-bold text-lg">{category.title}</h3>
                      </div>
                      <p className="text-xs text-white/80">{category.count}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
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
                { icon: FaGraduationCap, label: "15,000+ Students Trained", color: "bg-blue-100 text-blue-600" },
                { icon: FaAward, label: "98% Pass Rate", color: "bg-emerald-100 text-emerald-600" },
                { icon: FaUsers, label: "50+ Clinical Partners", color: "bg-purple-100 text-purple-600" },
                { icon: FaGlobeAfrica, label: "12+ Countries", color: "bg-cyan-100 text-cyan-600" },
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.color} rounded-xl p-6 text-center`}>
                  <stat.icon className="text-3xl mx-auto mb-2" />
                  <p className="font-semibold text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== LIFE AT ALVEOLY SECTION (with images) ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Life at <span className="text-[#00a3a1]">Alveoly</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A workplace where innovation meets compassion, and every day brings new opportunities to make a difference.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                image: IMAGES.team1, 
                title: "Collaborative Environment",
                description: "Work alongside passionate professionals who share your commitment to excellence."
              },
              { 
                image: IMAGES.team2, 
                title: "Innovative Culture",
                description: "We embrace new ideas and technologies to push the boundaries of healthcare education."
              },
              { 
                image: IMAGES.office, 
                title: "Great Place to Work",
                description: "Our offices are designed to foster creativity, collaboration, and community."
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-[#0a1a3a] mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BENEFITS SECTION ==================== */}
      <section className="py-20 bg-[#f0f6fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Benefits That <span className="text-[#00a3a1]">Support You</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We invest in our team with comprehensive benefits that support your well-being and professional growth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MdHealthAndSafety,
                title: "Health & Wellness",
                description: "Full medical, dental, and vision coverage plus wellness programs.",
                image: IMAGES.benefit1,
                color: "bg-red-50 text-red-500"
              },
              {
                icon: FaPiggyBank,
                title: "Financial Security",
                description: "Competitive compensation, retirement plans, and financial planning.",
                image: IMAGES.benefit2,
                color: "bg-green-50 text-green-500"
              },
              {
                icon: FaCalendarAlt,
                title: "Work-Life Balance",
                description: "Flexible hours, remote work options, and generous paid time off.",
                image: IMAGES.benefit3,
                color: "bg-purple-50 text-purple-500"
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={benefit.image} alt={benefit.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-full ${benefit.color} flex items-center justify-center text-2xl mb-4`}>
                    <benefit.icon />
                  </div>
                  <h3 className="text-xl font-bold text-[#0a1a3a] mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== JOB LISTINGS SECTION ==================== */}
      <section id="jobs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Featured <span className="text-[#00a3a1]">Job Listings</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find your next opportunity and join a team that's transforming healthcare education.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept.toLowerCase()}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Job Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#0a1a3a] group-hover:text-[#00a3a1] transition-colors">
                    {job.title}
                  </h3>
                  <span className="text-xs text-gray-500">{job.posted}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                  <span className="inline-flex items-center gap-1">
                    <FaBuilding className="text-gray-400" />
                    {job.department}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FaClock className="text-gray-400" />
                    {job.type}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>
                <button
                  onClick={() => handleApply(job)}
                  className="w-full bg-[#00a3a1] hover:bg-[#008b89] text-white py-2.5 rounded-lg font-medium transition-all duration-300"
                >
                  Apply Now
                </button>
              </motion.div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No jobs found matching your criteria.</p>
            </div>
          )}
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
              href="#jobs"
              className="inline-flex items-center gap-2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Open Positions
              <FaRocket className="text-sm" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ==================== APPLICATION MODAL ==================== */}
      <AnimatePresence>
        {showApplicationModal && selectedJob && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-teal-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Apply for {selectedJob.title}</h2>
                    <p className="text-sm text-emerald-100">
                      Complete the form to join our healthcare education team
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      setSelectedJob(null);
                    }}
                    className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={applicationData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border ${formErrors.fullName ? "border-red-500" : "border-gray-200"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all`}
                      placeholder="John Doe"
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={applicationData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border ${formErrors.email ? "border-red-500" : "border-gray-200"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all`}
                      placeholder="john@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={applicationData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border ${formErrors.phone ? "border-red-500" : "border-gray-200"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all`}
                      placeholder="+233 XX XXX XXXX"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={applicationData.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      name="coverLetter"
                      value={applicationData.coverLetter}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all resize-none"
                      placeholder="Share your passion for healthcare education..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Resume/CV <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        name="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className={`w-full px-4 py-2.5 border ${formErrors.resume ? "border-red-500" : "border-gray-200"} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00a3a1]/10 file:text-[#00a3a1] hover:file:bg-[#00a3a1]/20`}
                      />
                      {formErrors.resume && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.resume}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted formats: PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={applicationData.agreeTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-[#00a3a1] border-gray-300 rounded focus:ring-[#00a3a1]"
                    />
                    <label className="text-sm text-gray-600">
                      I agree to the terms and conditions and confirm that the information provided is accurate. <span className="text-red-500">*</span>
                    </label>
                  </div>
                  {formErrors.agreeTerms && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.agreeTerms}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#00a3a1] hover:bg-[#008b89] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <FaArrowRight className="text-sm" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerPage;