// src/pages/ProgramDetail.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaClock,
  FaGraduationCap,
  FaCalendarAlt,
  FaDollarSign,
  FaCheckCircle,
  FaBriefcase,
  FaUsers,
  FaChartLine,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaComment,
  FaStar,
  FaTrophy,
  FaGlobe,
  FaBookOpen,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Complete programs array with all details
  const programs = [
    {
      id: 1,
      title: "Computer Science",
      category: "technology",
      duration: "4 Years",
      degree: "BSc",
      tuition: "$5,000/year",
      description: "Explore AI, data science, and software engineering with modern labs and expert faculty.",
      fullDescription: "Our Computer Science program provides a strong foundation in computing principles, programming, and software development. Students gain hands-on experience with cutting-edge technologies including Artificial Intelligence, Machine Learning, Data Science, and Cloud Computing. The curriculum is designed to meet industry demands and prepare students for successful careers in technology.",
      features: ["AI & Machine Learning", "Data Science", "Software Engineering", "Cloud Computing", "Cybersecurity", "Mobile Development"],
      careers: ["Software Developer", "Data Scientist", "AI Engineer", "Cloud Architect", "DevOps Engineer", "Security Analyst"],
      requirements: ["High School Diploma or equivalent", "Mathematics proficiency", "English proficiency", "Pass entrance exam"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "Accredited by ABET",
    },
    {
      id: 2,
      title: "Biological Sciences",
      category: "science",
      duration: "4 Years",
      degree: "BSc",
      tuition: "$4,800/year",
      description: "Hands-on research experience with world-class equipment and professional mentorship.",
      fullDescription: "The Biological Sciences program offers comprehensive training in molecular biology, genetics, and biotechnology. Students engage in cutting-edge research projects and gain practical laboratory skills. Our state-of-the-art labs and experienced faculty provide an unparalleled learning experience.",
      features: ["Molecular Biology", "Genetics", "Biotechnology", "Environmental Science", "Microbiology", "Biochemistry"],
      careers: ["Research Scientist", "Biotechnologist", "Lab Manager", "Clinical Researcher", "Environmental Consultant", "Science Educator"],
      requirements: ["High School Diploma with Science background", "Biology and Chemistry proficiency", "English proficiency", "Pass entrance exam"],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "Accredited by ICAS",
    },
    {
      id: 3,
      title: "Business Administration",
      category: "business",
      duration: "4 Years",
      degree: "BBA",
      tuition: "$4,500/year",
      description: "Learn leadership, entrepreneurship, and innovation through practical industry projects.",
      fullDescription: "Our Business Administration program develops strategic thinkers and innovative leaders. Students learn through real-world case studies, industry projects, and internships with leading companies. The curriculum covers all aspects of modern business management.",
      features: ["Marketing", "Finance", "Entrepreneurship", "Strategic Management", "Organizational Behavior", "Business Analytics"],
      careers: ["Business Analyst", "Marketing Manager", "Entrepreneur", "Consultant", "Financial Analyst", "Operations Manager"],
      requirements: ["High School Diploma or equivalent", "Mathematics proficiency", "English proficiency", "Pass entrance exam"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "AACSB Accredited",
    },
    {
      id: 4,
      title: "International Relations",
      category: "humanities",
      duration: "4 Years",
      degree: "BA",
      tuition: "$4,200/year",
      description: "Gain insights into global politics, diplomacy, and international development.",
      fullDescription: "The International Relations program prepares students for careers in diplomacy, international organizations, and global affairs. Students analyze complex global issues and develop diplomatic skills through simulations and real-world case studies.",
      features: ["Global Governance", "Diplomacy", "International Law", "Conflict Resolution", "Human Rights", "International Economics"],
      careers: ["Diplomat", "Policy Analyst", "NGO Director", "International Consultant", "Foreign Service Officer", "Intelligence Analyst"],
      requirements: ["High School Diploma", "English proficiency", "Social Studies background", "Pass entrance exam"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "Accredited by APSIA",
    },
    {
      id: 5,
      title: "Education",
      category: "education",
      duration: "4 Years",
      degree: "BEd",
      tuition: "$4,000/year",
      description: "Train to become an inspiring educator with 21st-century teaching methodologies.",
      fullDescription: "Our Education program prepares future educators with innovative teaching methods, educational technology, and inclusive classroom strategies. Students gain practical teaching experience through internships in partner schools.",
      features: ["Curriculum Design", "Educational Psychology", "EdTech", "Special Education", "Classroom Management", "Assessment Strategies"],
      careers: ["Teacher", "Curriculum Developer", "Education Consultant", "School Administrator", "Instructional Designer", "Education Policy Analyst"],
      requirements: ["High School Diploma", "English proficiency", "Pass aptitude test", "Interview"],
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "NCATE Accredited",
    },
    {
      id: 6,
      title: "Health Sciences",
      category: "health",
      duration: "4 Years",
      degree: "BSc",
      tuition: "$5,200/year",
      description: "Study healthcare innovation, nursing, and clinical science with professional guidance.",
      fullDescription: "The Health Sciences program provides comprehensive education in healthcare systems, public health, and clinical practices. Students prepare for diverse careers in the healthcare industry with hands-on training and expert mentorship.",
      features: ["Public Health", "Nursing", "Clinical Research", "Healthcare Management", "Health Informatics", "Global Health"],
      careers: ["Healthcare Administrator", "Public Health Officer", "Clinical Coordinator", "Health Educator", "Healthcare Consultant", "Research Coordinator"],
      requirements: ["High School Diploma with Science background", "Biology and Chemistry", "English proficiency", "Pass entrance exam"],
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "CEPH Accredited",
    },
    {
      id: 7,
      title: "Nursing Science",
      category: "health",
      duration: "4 Years",
      degree: "BNSc",
      tuition: "$5,500/year",
      description: "Comprehensive nursing education with clinical rotations and hands-on training.",
      fullDescription: "Our Nursing Science program offers rigorous training in patient care, clinical procedures, and healthcare ethics. Students complete clinical rotations in leading hospitals and gain practical experience under professional supervision.",
      features: ["Patient Care", "Pharmacology", "Clinical Practice", "Health Assessment", "Critical Care", "Community Health Nursing"],
      careers: ["Registered Nurse", "Clinical Nurse Specialist", "Nurse Educator", "Healthcare Manager", "Nurse Practitioner", "Public Health Nurse"],
      requirements: ["High School Diploma with Science background", "Biology, Chemistry, Mathematics", "English proficiency", "Pass entrance exam", "Health clearance"],
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "CCNE Accredited",
    },
    {
      id: 8,
      title: "Public Health",
      category: "health",
      duration: "4 Years",
      degree: "BPH",
      tuition: "$4,800/year",
      description: "Focus on community health, epidemiology, and health promotion strategies.",
      fullDescription: "The Public Health program prepares students to address community health challenges, develop health policies, and promote wellness. Students learn epidemiology, biostatistics, and health program management.",
      features: ["Epidemiology", "Biostatistics", "Health Policy", "Community Health", "Environmental Health", "Health Promotion"],
      careers: ["Public Health Specialist", "Epidemiologist", "Health Policy Advisor", "Community Health Worker", "Program Coordinator", "Health Educator"],
      requirements: ["High School Diploma", "Science background preferred", "English proficiency", "Pass entrance exam"],
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "CEPH Accredited",
    },
    {
      id: 9,
      title: "Medical Laboratory Science",
      category: "science",
      duration: "4 Years",
      degree: "BMLS",
      tuition: "$4,900/year",
      description: "Train in diagnostic techniques and laboratory management.",
      fullDescription: "This program trains students in diagnostic laboratory procedures, quality control, and lab management. Graduates work in hospitals, research labs, and diagnostic centers. Students gain hands-on experience in modern laboratories.",
      features: ["Clinical Chemistry", "Hematology", "Microbiology", "Immunology", "Blood Banking", "Molecular Diagnostics"],
      careers: ["Medical Lab Scientist", "Lab Manager", "Research Associate", "Quality Control Specialist", "Clinical Researcher", "Pathology Assistant"],
      requirements: ["High School Diploma with Science background", "Chemistry and Biology", "English proficiency", "Pass entrance exam"],
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
      startDate: "September 2024",
      applicationDeadline: "August 15, 2024",
      accreditation: "NAACLS Accredited",
    },
  ];

  const program = programs.find(p => p.id === parseInt(id));

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRequestInfo = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Request Info Submitted:", { program: program.title, ...formData });
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setSubmitSuccess(false);
        setFormData({ name: "", email: "", phone: "", message: "" });
      }, 2000);
    }, 1500);
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        <div className="pt-32 text-center px-6">
          <div className="max-w-md mx-auto">
            <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Program Not Found</h1>
            <p className="text-gray-600 mb-8">The program you're looking for doesn't exist or has been moved.</p>
            <button 
              onClick={() => navigate("/programs")} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Back to Programs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className={`relative pt-32 pb-20 bg-gradient-to-r ${program.color}`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => navigate("/programs")}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition group"
            >
              ← Back to Programs
            </button>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{program.title}</h1>
            <p className="text-xl text-white/90 max-w-3xl">{program.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Program Details */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Program Overview</h2>
                <p className="text-gray-700 leading-relaxed mb-8">{program.fullDescription}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: FaStar, label: "Program Rating", value: "4.8/5" },
                    { icon: FaUsers, label: "Current Students", value: "250+" },
                    { icon: FaTrophy, label: "Graduates", value: "1,000+" },
                    { icon: FaGlobe, label: "Global Alumni", value: "30+ Countries" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center">
                      <stat.icon className="text-2xl text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                <div className="grid md:grid-cols-2 gap-3 mb-8">
                  {program.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                      <FaCheckCircle className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Opportunities</h3>
                <div className="grid md:grid-cols-2 gap-3 mb-8">
                  {program.careers.map((career, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                      <FaBriefcase className="text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700">{career}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">Admission Requirements</h3>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
                  {program.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3 mb-3 last:mb-0">
                      <FaGraduationCap className="text-purple-500 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </div>
                  ))}
                </div>

                {/* Accreditation */}
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Accreditation</h3>
                  <p className="text-gray-700">{program.accreditation}</p>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6 sticky top-28"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Program Details</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-900">{program.duration}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Degree</span>
                    <span className="font-semibold text-gray-900">{program.degree}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Tuition</span>
                    <span className="font-semibold text-gray-900">{program.tuition}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Study Mode</span>
                    <span className="font-semibold text-gray-900">Full-time / Part-time</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Language</span>
                    <span className="font-semibold text-gray-900">English</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-semibold text-gray-900">{program.startDate}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Application Deadline</span>
                    <span className="font-semibold text-red-600">{program.applicationDeadline}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/signup")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mb-3"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                >
                  Request Information
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Info Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`bg-gradient-to-r ${program.color} p-6 text-white rounded-t-2xl`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Request Information</h2>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="text-white/80 hover:text-white transition"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
                <p className="text-white/80 mt-2">Get detailed information about {program.title}</p>
              </div>

              {submitSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-4xl text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                  <p className="text-gray-600">
                    Thank you for your interest. Our admissions team will contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestInfo} className="p-6 space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Message / Questions</label>
                    <div className="relative">
                      <FaComment className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Any specific questions about the program?"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : `bg-gradient-to-r ${program.color} hover:shadow-lg`
                      }`}
                    >
                      {isSubmitting ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ProgramDetail;