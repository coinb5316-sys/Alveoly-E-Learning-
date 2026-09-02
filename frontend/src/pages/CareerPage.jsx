// CareerPage.jsx - Professional Healthcare & Nursing Career Page
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowRight, 
  FaCheckCircle, 
  FaUsers,
  FaGraduationCap,
  FaClock,
  FaSpinner,
  FaAward,
  FaRocket,
  FaGlobeAfrica,
  FaBriefcase,
  FaBuilding,
  FaTimes,
  FaSearch,
  FaHeartbeat,
  FaHospital,
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaTrophy,
  FaPiggyBank,
  FaUserTie,
  FaRegLightbulb,
  FaRegHandshake,
  FaGlobe,
  FaLaptop,
  FaUsersCog,
  FaBrain,
  FaHandSparkles,
  FaHandHoldingHeart,
  FaHouseMedical,
  FaHeartPulse,
  FaUserNurse,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { GiBrain } from "react-icons/gi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const CareerPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [applicationData, setApplicationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    coverLetter: "",
    resume: null,
    nursingLicense: "",
    yearsOfExperience: "",
    specialization: "",
    agreeTerms: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // Healthcare-specific company values
  const companyValues = [
    {
      icon: FaRegLightbulb,
      title: "Innovation in Healthcare Education",
      description: "We leverage cutting-edge technology to create immersive learning experiences that prepare nurses and healthcare professionals for real-world challenges.",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: FaRegHandshake,
      title: "Patient-Centered Approach",
      description: "Every educational resource we develop is designed with the ultimate goal of improving patient outcomes through better-prepared healthcare professionals.",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: GiBrain,
      title: "Clinical Excellence",
      description: "We maintain the highest standards in nursing and healthcare education, ensuring our content reflects evidence-based practice and current medical guidelines.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: FaHandSparkles,
      title: "Compassion & Empathy",
      description: "We believe that exceptional healthcare starts with compassion. Our courses emphasize the importance of empathy in patient care and professional practice.",
      color: "from-red-400 to-rose-500"
    },
    {
      icon: FaHeartPulse,
      title: "Lifelong Learning",
      description: "We empower healthcare professionals to embrace continuous learning, staying current with medical advancements and evolving best practices.",
      color: "from-indigo-400 to-purple-500"
    },
    {
      icon: FaGlobe,
      title: "Global Health Impact",
      description: "We're committed to improving healthcare education worldwide, particularly in underserved communities across Africa and beyond.",
      color: "from-teal-400 to-cyan-500"
    }
  ];

  // Healthcare-specific benefits
  const benefits = [
    {
      icon: MdHealthAndSafety,
      title: "Comprehensive Medical Coverage",
      description: "Full health insurance including medical, dental, and vision coverage for you and your family.",
      iconColor: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: FaHandHoldingHeart,
      title: "Wellness & Mental Health",
      description: "Access to mental health support, counseling services, and wellness programs designed for healthcare professionals.",
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      icon: FaPiggyBank,
      title: "Retirement & Financial Security",
      description: "Competitive retirement plans with employer matching and financial planning resources for your future.",
      iconColor: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: FaHouseMedical,
      title: "Family Support Services",
      description: "Parental leave, childcare assistance, and flexible family-friendly policies.",
      iconColor: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    {
      icon: FaLaptop,
      title: "Remote & Hybrid Work",
      description: "Flexible work arrangements with home office setup allowance for remote work.",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: FaCalendarAlt,
      title: "Flexible Scheduling",
      description: "Work-life balance with flexible hours and generous paid time off for healthcare professionals.",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: FaGraduationCap,
      title: "Professional Development",
      description: "$3,000 annual budget for continuing education, certifications, and professional conferences.",
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      icon: FaTrophy,
      title: "Recognition & Growth",
      description: "Regular recognition programs, career advancement opportunities, and mentorship from industry leaders.",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50"
    }
  ];

  // Healthcare-focused job listings - ONLY NURSING & HEALTHCARE POSITIONS
  const sampleJobs = [
    {
      id: 1,
      title: "Senior Nursing Educator & Curriculum Developer",
      department: "Nursing Education",
      location: "Accra, Ghana (Hybrid)",
      type: "Full-time",
      experience: "5+ years",
      salary: "Competitive",
      posted: "2 days ago",
      description: "Lead the development of innovative nursing education programs and curriculum. You'll shape the next generation of nursing professionals by creating evidence-based, engaging learning materials that align with international nursing standards.",
      responsibilities: [
        "Lead curriculum development for nursing programs",
        "Create and review nursing course materials and assessments",
        "Collaborate with subject matter experts and clinical educators",
        "Ensure alignment with NCLEX, NMC, and other professional standards",
        "Mentor junior nursing educators and content developers"
      ],
      requirements: [
        "Active RN license with 5+ years of clinical experience",
        "Master's degree in Nursing Education or related field",
        "Experience in curriculum development and instructional design",
        "Knowledge of international nursing standards (NCLEX, NMC, WHO)",
        "Excellent communication and educational leadership skills"
      ],
      benefits: [
        "Competitive salary and performance bonuses",
        "Comprehensive health and wellness benefits",
        "Professional development opportunities",
        "Flexible work arrangements",
        "Research and publication support"
      ]
    },
    {
      id: 2,
      title: "Clinical Simulation Specialist",
      department: "Clinical Education",
      location: "Accra, Ghana (On-site)",
      type: "Full-time",
      experience: "3+ years",
      salary: "Competitive",
      posted: "3 days ago",
      description: "Join our clinical education team to create immersive simulation experiences for nursing and healthcare students. You'll develop virtual clinical scenarios, manage simulation lab operations, and train educators on simulation best practices.",
      responsibilities: [
        "Design and implement clinical simulation scenarios",
        "Manage simulation equipment and technology",
        "Train faculty on simulation-based education",
        "Evaluate simulation effectiveness and student outcomes",
        "Collaborate with clinical partners and healthcare institutions"
      ],
      requirements: [
        "RN license with 3+ years of clinical experience",
        "Experience with simulation-based education",
        "Knowledge of simulation technologies and debriefing techniques",
        "Bachelor's degree in Nursing or Healthcare Education",
        "CHSE certification preferred"
      ],
      benefits: [
        "Competitive salary package",
        "Health insurance coverage",
        "Professional development support",
        "Collaborative work environment",
        "State-of-the-art simulation facility access"
      ]
    },
    {
      id: 3,
      title: "Healthcare Content Writer & Editor",
      department: "Content Development",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      salary: "Competitive",
      posted: "5 days ago",
      description: "Create compelling, accurate healthcare education content for nursing and medical students. You'll write and edit educational materials, ensure medical accuracy, and help develop our comprehensive content library.",
      responsibilities: [
        "Write and edit nursing and healthcare education content",
        "Ensure medical accuracy and evidence-based practice",
        "Develop engaging educational resources and assessments",
        "Collaborate with subject matter experts",
        "Review and update content to reflect current guidelines"
      ],
      requirements: [
        "Nursing or healthcare background with clinical experience",
        "Excellent writing and editing skills",
        "Experience in healthcare content development",
        "Knowledge of medical terminology and nursing concepts",
        "Strong attention to detail and commitment to accuracy"
      ],
      benefits: [
        "Competitive salary",
        "Remote work flexibility",
        "Health benefits",
        "Professional development budget",
        "Creative and supportive team culture"
      ]
    },
    {
      id: 4,
      title: "Clinical Instructor - Nursing Programs",
      department: "Clinical Instruction",
      location: "Accra, Ghana (On-site)",
      type: "Full-time",
      experience: "4+ years",
      salary: "Competitive",
      posted: "1 week ago",
      description: "Join our team as a Clinical Instructor to guide and mentor nursing students in clinical settings. You'll provide hands-on instruction, evaluate student performance, and help bridge the gap between theory and practice.",
      responsibilities: [
        "Supervise nursing students in clinical rotations",
        "Provide clinical instruction and mentorship",
        "Evaluate student performance and competencies",
        "Coordinate with clinical placement sites",
        "Develop clinical teaching materials and resources"
      ],
      requirements: [
        "Active RN license with 4+ years of clinical experience",
        "Experience in clinical teaching or preceptorship",
        "Bachelor's degree in Nursing (Master's preferred)",
        "Strong communication and leadership skills",
        "Commitment to nursing education and student success"
      ],
      benefits: [
        "Competitive salary",
        "Comprehensive benefits package",
        "Professional development opportunities",
        "Collaborative academic environment",
        "Impact on the next generation of nurses"
      ]
    },
    {
      id: 5,
      title: "Health Education Technology Specialist",
      department: "Education Technology",
      location: "Accra, Ghana (Hybrid)",
      type: "Full-time",
      experience: "3+ years",
      salary: "Competitive",
      posted: "4 days ago",
      description: "Innovate healthcare education through technology. You'll develop and implement educational technology solutions, work with our development team, and ensure our e-learning platforms meet the needs of healthcare students.",
      responsibilities: [
        "Implement educational technology solutions",
        "Collaborate with development teams on learning platforms",
        "Train educators on technology integration",
        "Evaluate educational technology effectiveness",
        "Stay current with emerging education technologies"
      ],
      requirements: [
        "Background in healthcare education or related field",
        "Experience with e-learning platforms and educational technology",
        "Understanding of healthcare education needs",
        "Strong problem-solving and technical skills",
        "Knowledge of learning management systems"
      ],
      benefits: [
        "Competitive salary",
        "Health benefits",
        "Flexible work arrangements",
        "Professional development opportunities",
        "Innovative and collaborative work culture"
      ]
    },
    {
      id: 6,
      title: "Healthcare Assessment & Evaluation Specialist",
      department: "Assessment & Evaluation",
      location: "Remote",
      type: "Full-time",
      experience: "4+ years",
      salary: "Competitive",
      posted: "6 days ago",
      description: "Design and implement assessment strategies for healthcare education programs. You'll develop evaluation tools, analyze student outcomes, and ensure our assessment practices align with professional standards.",
      responsibilities: [
        "Design assessment and evaluation strategies",
        "Develop testing and evaluation tools",
        "Analyze student performance data",
        "Ensure assessment alignment with learning objectives",
        "Support program evaluation and quality improvement"
      ],
      requirements: [
        "Background in healthcare education or assessment",
        "Experience with educational evaluation and assessment",
        "Knowledge of measurement and evaluation principles",
        "Strong analytical and data interpretation skills",
        "Excellent communication and reporting abilities"
      ],
      benefits: [
        "Competitive salary package",
        "Remote work flexibility",
        "Comprehensive benefits",
        "Professional development support",
        "Meaningful work improving education quality"
      ]
    },
    {
      id: 7,
      title: "Nursing Research & Evidence-Based Practice Coordinator",
      department: "Research & Development",
      location: "Accra, Ghana (Hybrid)",
      type: "Full-time",
      experience: "5+ years",
      salary: "Competitive",
      posted: "1 week ago",
      description: "Lead nursing research initiatives and promote evidence-based practice across our educational programs. You'll coordinate research projects, mentor faculty, and integrate research findings into curriculum.",
      responsibilities: [
        "Coordinate nursing and healthcare research initiatives",
        "Promote evidence-based practice in education",
        "Mentor faculty on research methodology",
        "Integrate research findings into curriculum",
        "Collaborate with healthcare institutions on research"
      ],
      requirements: [
        "PhD in Nursing or related field",
        "5+ years of research experience",
        "Strong publication record",
        "Experience in nursing education",
        "Knowledge of research methodology and statistics"
      ],
      benefits: [
        "Competitive salary",
        "Research support and funding",
        "Professional development opportunities",
        "Collaborative research environment",
        "Impact on healthcare education and practice"
      ]
    },
    {
      id: 8,
      title: "Healthcare Simulation Technology Specialist",
      department: "Simulation Technology",
      location: "Accra, Ghana (On-site)",
      type: "Full-time",
      experience: "2+ years",
      salary: "Competitive",
      posted: "3 days ago",
      description: "Support simulation-based education through technology management and technical expertise. You'll maintain simulation equipment, develop technical solutions, and support faculty and students in simulation activities.",
      responsibilities: [
        "Maintain and operate simulation equipment",
        "Develop technical solutions for simulation",
        "Support simulation-based education activities",
        "Train faculty and staff on simulation technology",
        "Evaluate and recommend new simulation technologies"
      ],
      requirements: [
        "Background in healthcare or simulation technology",
        "Experience with simulation equipment and technology",
        "Understanding of healthcare simulation standards",
        "Strong technical and problem-solving skills",
        "Excellent communication and training abilities"
      ],
      benefits: [
        "Competitive salary",
        "Health benefits",
        "Professional development",
        "State-of-the-art simulation facility",
        "Collaborative team environment"
      ]
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    // Force refresh by setting jobs with new data
    const healthcareJobs = sampleJobs;
    setJobs(healthcareJobs);
    setFilteredJobs(healthcareJobs);
    
    const depts = [...new Set(healthcareJobs.map(job => job.department))];
    const locs = [...new Set(healthcareJobs.map(job => job.location))];
    const types = [...new Set(healthcareJobs.map(job => job.type))];
    
    setDepartments(depts);
    setLocations(locs);
    setJobTypes(types);
  }, []);

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = jobs;
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(job => job.department === selectedDepartment);
    }
    
    if (selectedLocation !== "all") {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter(job => job.type === selectedType);
    }
    
    setFilteredJobs(filtered);
  }, [searchTerm, selectedDepartment, selectedLocation, selectedType, jobs]);

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    setApplicationData({
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      portfolio: "",
      coverLetter: "",
      resume: null,
      nursingLicense: "",
      yearsOfExperience: "",
      specialization: "",
      agreeTerms: false,
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setApplicationData(prev => ({ ...prev, resume: file }));
      if (formErrors.resume) {
        setFormErrors(prev => ({ ...prev, resume: null }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!applicationData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!applicationData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(applicationData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!applicationData.phone.trim()) {
      errors.phone = "Phone number is required";
    }
    
    if (!applicationData.resume) {
      errors.resume = "Please upload your resume";
    }
    
    if (!applicationData.agreeTerms) {
      errors.agreeTerms = "You must agree to the terms and conditions";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Application submitted successfully for ${selectedJob.title}!`);
      setShowApplicationModal(false);
      
      setApplicationData({
        fullName: "",
        email: "",
        phone: "",
        linkedin: "",
        portfolio: "",
        coverLetter: "",
        resume: null,
        nursingLicense: "",
        yearsOfExperience: "",
        specialization: "",
        agreeTerms: false,
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a3a] via-[#0a1a3a]/95 to-[#1a2a5a]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a3a] via-transparent to-transparent"></div>
        </div>
        
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
              <FaHeartPulse className="text-[#00a3a1] animate-pulse" />
              <span className="text-white text-sm font-medium">Healthcare Education Careers</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Join the <span className="text-[#00a3a1]">Healthcare</span> Education
              <br />
              <span className="bg-gradient-to-r from-[#00a3a1] to-emerald-400 bg-clip-text text-transparent">
                Revolution
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Help us shape the future of nursing and healthcare education. 
              Join a team dedicated to excellence, innovation, and improving 
              healthcare outcomes across Africa and beyond.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth' })}
                className="group bg-[#00a3a1] hover:bg-[#008b89] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                View Nursing Positions
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('company-values').scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#0a1a3a] transition-all duration-300"
              >
                Learn About Our Mission
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-10">
              <div className="flex items-center gap-2 text-white/80">
                <FaGraduationCap className="text-[#00a3a1] text-lg" />
                <span className="text-sm">15,000+ Students Trained</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <FaTrophy className="text-[#00a3a1] text-lg" />
                <span className="text-sm">98% NCLEX Pass Rate</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <FaHospital className="text-[#00a3a1] text-lg" />
                <span className="text-sm">50+ Clinical Partners</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-[#0a1a3a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FaUsers, value: "150+", label: "Healthcare Educators" },
              { icon: FaGlobeAfrica, value: "12+", label: "Countries Reached" },
              { icon: FaUserNurse, value: "15,000+", label: "Nursing Students" },
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

      {/* COMPANY VALUES SECTION */}
      <section id="company-values" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full mb-4">
              <FaHeartPulse className="text-sm" />
              <span className="text-sm font-semibold">Our Healthcare Mission</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Shaping the Future of <span className="text-[#00a3a1]">Healthcare Education</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our values guide everything we do - from curriculum development 
              to clinical training, ensuring excellence in healthcare education.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {companyValues.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group bg-gray-50 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-[#00a3a1]/20"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${value.color} mb-4`}>
                  <value.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1a3a] mb-2 group-hover:text-[#00a3a1] transition-colors">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-4 py-2 rounded-full mb-4">
              <FaHandHoldingHeart className="text-sm" />
              <span className="text-sm font-semibold">Healthcare Benefits</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Supporting Your <span className="text-[#00a3a1]">Healthcare Career</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We provide comprehensive benefits that support your professional 
              growth and personal well-being in the healthcare field.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center group"
              >
                <div className={`w-14 h-14 rounded-full ${benefit.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className={`text-2xl ${benefit.iconColor}`} />
                </div>
                <h3 className="font-semibold text-[#0a1a3a] mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIFE AT ALVEOLY SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full mb-4">
                <FaUsers className="text-sm" />
                <span className="text-sm font-semibold">Healthcare Education Culture</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-4">
                Life in <span className="text-[#00a3a1]">Healthcare Education</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                We're more than an e-learning platform - we're a community of 
                healthcare educators, clinical experts, and innovators committed 
                to transforming nursing and healthcare education in Africa.
              </p>
              
              <div className="space-y-4">
                {[
                  "Collaborate with leading healthcare professionals",
                  "Impact the next generation of nursing professionals",
                  "Flexible work arrangements for work-life balance",
                  "Continuous professional development and learning",
                  "Supportive leadership and mentorship programs"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <FaCheckCircle className="text-[#00a3a1] mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth' })}
                className="mt-8 bg-[#00a3a1] hover:bg-[#008b89] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                Explore Opportunities
                <FaArrowRight className="text-sm" />
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00a3a1] to-[#0a1a3a] rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-[#0a1a3a] rounded-2xl overflow-hidden shadow-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: FaUserNurse, label: "Clinical Training", color: "bg-emerald-500/20 text-emerald-400" },
                    { icon: FaBrain, label: "Research", color: "bg-purple-500/20 text-purple-400" },
                    { icon: FaHandSparkles, label: "Patient Care", color: "bg-rose-500/20 text-rose-400" },
                    { icon: FaHeartbeat, label: "Innovation", color: "bg-cyan-500/20 text-cyan-400" },
                  ].map((item, idx) => (
                    <div key={idx} className={`${item.color} rounded-lg p-4 text-center`}>
                      <item.icon className="text-2xl mx-auto mb-2" />
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-white text-sm italic text-center">
                    "Working at Alveoly has allowed me to combine my clinical expertise 
                    with my passion for education. We're truly making a difference in 
                    healthcare education across Africa."
                  </p>
                  <p className="text-[#00a3a1] text-sm font-medium text-center mt-2">
                    — Dr. Amara Okafor, Nursing Education Director
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* OPEN POSITIONS SECTION */}
      <section id="open-positions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full mb-4">
              <FaUserNurse className="text-sm" />
              <span className="text-sm font-semibold">Healthcare Education Positions</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Join Our <span className="text-[#00a3a1]">Healthcare Education</span> Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We're looking for passionate healthcare professionals and educators 
              to help us transform nursing and healthcare education.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nursing positions, departments, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
              >
                <option value="all">All Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {(searchTerm || selectedDepartment !== "all" || selectedLocation !== "all" || selectedType !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDepartment("all");
                    setSelectedLocation("all");
                    setSelectedType("all");
                  }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Job Listings */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <FaUserNurse className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Nursing Positions Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We don't have any healthcare education positions matching your criteria right now. 
                Please check back later or adjust your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-[#00a3a1]/30"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#0a1a3a] mb-2 hover:text-[#00a3a1] transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <FaBuilding className="text-gray-400" />
                            {job.department}
                          </span>
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <FaMapMarkerAlt className="text-gray-400" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <FaBriefcase className="text-gray-400" />
                            {job.type}
                          </span>
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <FaClock className="text-gray-400" />
                            {job.posted}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApply(job)}
                          className="bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md"
                        >
                          Apply Now
                          <FaArrowRight className="text-sm" />
                        </button>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="border-2 border-gray-300 hover:border-[#00a3a1] px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:text-[#00a3a1] transition-all duration-300"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-[#0a1a3a] to-[#1a2a5a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FaHeartPulse className="text-5xl text-[#00a3a1] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform <span className="text-[#00a3a1]">Healthcare Education</span>?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join us in our mission to prepare the next generation of healthcare 
              professionals. Your expertise can shape the future of nursing and 
              healthcare across Africa.
            </p>
            <button
              onClick={() => document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#00a3a1] hover:bg-[#008b89] text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              View Healthcare Positions
              <FaRocket className="text-sm" />
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* JOB DETAIL MODAL */}
      <AnimatePresence>
        {selectedJob && !showApplicationModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-600 to-emerald-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                    <p className="text-sm text-cyan-100">
                      {selectedJob.department} • {selectedJob.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      <FaBriefcase className="text-gray-500" />
                      {selectedJob.type}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      <FaClock className="text-gray-500" />
                      {selectedJob.posted}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      <FaDollarSign className="text-gray-500" />
                      {selectedJob.salary}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      <FaUserTie className="text-gray-500" />
                      {selectedJob.experience} experience
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#0a1a3a] mb-2">About the Role</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#0a1a3a] mb-2">Key Responsibilities</h3>
                    <ul className="space-y-2">
                      {selectedJob.responsibilities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <FaCheckCircle className="text-[#00a3a1] mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#0a1a3a] mb-2">Requirements</h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <FaCheckCircle className="text-[#00a3a1] mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#0a1a3a] mb-2">What We Offer</h3>
                    <ul className="space-y-2">
                      {selectedJob.benefits.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <FaHeartPulse className="text-[#00a3a1] mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowApplicationModal(true)}
                  className="flex-1 bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Apply for This Position
                </button>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold text-gray-700 hover:text-gray-900 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLICATION MODAL */}
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
                      className={`w-full px-4 py-2.5 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all`}
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
                      className={`w-full px-4 py-2.5 border ${formErrors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all`}
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
                      className={`w-full px-4 py-2.5 border ${formErrors.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all`}
                      placeholder="+233 XX XXX XXXX"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nursing License/Certification
                      </label>
                      <input
                        type="text"
                        name="nursingLicense"
                        value={applicationData.nursingLicense}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
                        placeholder="e.g., RN, LPN, CNA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Years of Healthcare Experience
                      </label>
                      <input
                        type="text"
                        name="yearsOfExperience"
                        value={applicationData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
                        placeholder="e.g., 5 years"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Specialization/Area of Expertise
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={applicationData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
                      placeholder="e.g., Medical-Surgical, Pediatrics, Critical Care"
                    />
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
                      placeholder="Share your passion for healthcare education and why you're interested in this position..."
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
                        className={`w-full px-4 py-2.5 border ${formErrors.resume ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00a3a1]/10 file:text-[#00a3a1] hover:file:bg-[#00a3a1]/20`}
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
                </form>
              </div>

              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="flex-1 bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <FaArrowRight className="text-sm" />
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedJob(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold text-gray-700 hover:text-gray-900 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerPage;