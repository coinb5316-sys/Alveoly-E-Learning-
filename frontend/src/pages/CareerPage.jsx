// CareerPage.jsx - Professional Career Page for Alveoly E-Learning Platform
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowRight, 
  FaCheckCircle, 
  FaStar,
  FaUsers,
  FaGraduationCap,
  FaChartLine,
  FaClock,
  FaHandsHelping,
  FaQuoteRight,
  FaSpinner,
  FaAward,
  FaRocket,
  FaVideo,
  FaUserMd,
  FaLaptopMedical,
  FaFlask,
  FaStethoscope,
  FaMicroscope,
  FaGlobeAfrica,
  FaBriefcase,
  FaChalkboardTeacher,
  FaBuilding,
  FaBook,
  FaTimes,
  FaChevronRight,
  FaChevronDown,
  FaSearch,
  FaFilter,
  FaWhatsapp,
  FaHeart,
  FaCoffee,
  FaHome,
  FaPlane,
  FaShieldAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaLifeRing,
  FaTrophy,
  FaTree,
  FaPizzaSlice,
  FaBaby,
  FaPiggyBank,
  FaUserTie,
  FaRegSmile,
  FaRegLightbulb,
  FaRegHandshake,
  FaGlobe,
  FaLaptop,
  FaUsersCog,
} from "react-icons/fa";
import { MdHealthAndSafety, MdFamilyRestroom, MdSchool } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { GiBrain, GiMedal } from "react-icons/gi";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const CareerPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    agreeTerms: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // Company values data
  const companyValues = [
    {
      icon: FaRegLightbulb,
      title: "Innovation First",
      description: "We constantly push boundaries to create the best learning experiences through cutting-edge technology and creative thinking.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: FaRegHandshake,
      title: "Student-Centered",
      description: "Every decision we make starts with our students' success. Their journey drives our passion and purpose.",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: GiBrain,
      title: "Excellence in Education",
      description: "We maintain the highest standards in educational content, ensuring quality and accuracy in everything we produce.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: IoIosPeople,
      title: "Collaborative Spirit",
      description: "We believe in the power of teamwork, diverse perspectives, and collective growth to achieve extraordinary results.",
      color: "from-green-400 to-teal-500"
    },
    {
      icon: FaUsersCog,
      title: "Empowerment & Growth",
      description: "We invest in our people, providing opportunities for professional development and career advancement.",
      color: "from-red-400 to-rose-500"
    },
    {
      icon: FaGlobe,
      title: "Global Impact",
      description: "We're committed to making quality education accessible worldwide, bridging gaps and creating opportunities.",
      color: "from-cyan-400 to-blue-500"
    }
  ];

  // Benefits data
  const benefits = [
    {
      icon: FaHeart,
      title: "Comprehensive Health",
      description: "Full medical, dental, and vision coverage for you and your family.",
      iconColor: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: FaCoffee,
      title: "Wellness Programs",
      description: "Mental health support, fitness stipends, and wellness workshops.",
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      icon: FaPiggyBank,
      title: "Retirement Planning",
      description: "401(k) matching and financial planning resources for your future.",
      iconColor: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: FaBaby,
      title: "Family Support",
      description: "Parental leave, childcare assistance, and family-friendly policies.",
      iconColor: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    {
      icon: FaLaptop,
      title: "Remote Work",
      description: "Flexible work arrangements and home office setup allowance.",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: FaCalendarAlt,
      title: "Flexible Hours",
      description: "Work-life balance with flexible scheduling and generous PTO.",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: FaGraduationCap,
      title: "Learning Budget",
      description: "$2,000 annual budget for courses, conferences, and certifications.",
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      icon: FaPizzaSlice,
      title: "Team Culture",
      description: "Regular team events, celebrations, and a supportive community.",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50"
    }
  ];

  // Sample job listings (would come from API in production)
  const sampleJobs = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Accra, Ghana (Remote)",
      type: "Full-time",
      experience: "5+ years",
      salary: "Competitive",
      posted: "2 days ago",
      description: "We're looking for a Senior Full Stack Developer to lead our engineering team in building the next generation of our e-learning platform. You'll work with React, Node.js, and cloud technologies to create scalable, high-performance solutions.",
      responsibilities: [
        "Lead development of new features and products",
        "Mentor junior developers and conduct code reviews",
        "Design and implement scalable backend services",
        "Optimize application performance and user experience",
        "Collaborate with product and design teams"
      ],
      requirements: [
        "5+ years of full-stack development experience",
        "Expertise in React, Node.js, and MongoDB",
        "Experience with cloud platforms (AWS/Azure/GCP)",
        "Strong understanding of CI/CD and DevOps practices",
        "Excellent problem-solving and communication skills"
      ],
      benefits: [
        "Competitive salary and equity",
        "Health insurance coverage",
        "Flexible work hours",
        "Professional development budget",
        "Remote work option"
      ]
    },
    {
      id: 2,
      title: "Instructional Designer",
      department: "Content",
      location: "Accra, Ghana (Hybrid)",
      type: "Full-time",
      experience: "3+ years",
      salary: "Competitive",
      posted: "5 days ago",
      description: "Join our content team as an Instructional Designer to create engaging, effective learning experiences for healthcare professionals. You'll design curriculum, develop assessments, and ensure educational excellence.",
      responsibilities: [
        "Design and develop online learning materials",
        "Create engaging multimedia content and assessments",
        "Collaborate with subject matter experts",
        "Implement instructional design best practices",
        "Evaluate and improve learning outcomes"
      ],
      requirements: [
        "3+ years of instructional design experience",
        "Bachelor's degree in Education or related field",
        "Experience with e-learning authoring tools (Articulate, Captivate)",
        "Understanding of learning theories and pedagogical approaches",
        "Strong project management skills"
      ],
      benefits: [
        "Competitive salary",
        "Health and wellness benefits",
        "Flexible work arrangements",
        "Professional development opportunities",
        "Collaborative team environment"
      ]
    },
    {
      id: 3,
      title: "Content Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      experience: "4+ years",
      salary: "Competitive",
      posted: "1 week ago",
      description: "Lead our content marketing strategy to reach students and educators worldwide. You'll create compelling content, manage social media, and drive engagement across all channels.",
      responsibilities: [
        "Develop and execute content marketing strategy",
        "Create engaging blog posts, videos, and social media content",
        "Manage content calendar and editorial workflow",
        "Analyze content performance and optimize strategies",
        "Build and nurture online communities"
      ],
      requirements: [
        "4+ years of content marketing experience",
        "Excellent writing and editing skills",
        "Experience with SEO and content analytics",
        "Knowledge of healthcare/education industry preferred",
        "Strong creativity and strategic thinking"
      ],
      benefits: [
        "Competitive salary package",
        "Health benefits",
        "Remote work flexibility",
        "Professional growth opportunities",
        "Creative and supportive team culture"
      ]
    },
    {
      id: 4,
      title: "Customer Success Specialist",
      department: "Operations",
      location: "Accra, Ghana",
      type: "Full-time",
      experience: "2+ years",
      salary: "Competitive",
      posted: "3 days ago",
      description: "Join our Customer Success team to help students and educators get the most out of our platform. You'll provide support, gather feedback, and ensure an exceptional user experience.",
      responsibilities: [
        "Provide outstanding customer support via multiple channels",
        "Onboard new users and conduct training sessions",
        "Collect and analyze user feedback",
        "Improve customer satisfaction and retention",
        "Collaborate with product and engineering teams"
      ],
      requirements: [
        "2+ years of customer success experience",
        "Excellent communication and interpersonal skills",
        "Experience with CRM and support tools",
        "Problem-solving mindset",
        "Passion for education and technology"
      ],
      benefits: [
        "Competitive salary",
        "Health benefits",
        "Paid time off",
        "Professional development",
        "Supportive team environment"
      ]
    },
    {
      id: 5,
      title: "Data Analyst",
      department: "Analytics",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      salary: "Competitive",
      posted: "4 days ago",
      description: "Help us make data-driven decisions by analyzing user behavior, learning outcomes, and platform performance. You'll create dashboards, identify trends, and provide actionable insights.",
      responsibilities: [
        "Analyze user data and learning patterns",
        "Create dashboards and reports for stakeholders",
        "Identify trends and opportunities for improvement",
        "Support product and marketing teams with data insights",
        "Maintain data quality and integrity"
      ],
      requirements: [
        "3+ years of data analysis experience",
        "Proficiency in SQL, Python, and data visualization tools",
        "Experience with analytics platforms (Google Analytics, Mixpanel)",
        "Strong analytical and problem-solving skills",
        "Excellent communication and presentation skills"
      ],
      benefits: [
        "Competitive salary",
        "Health benefits",
        "Remote work flexibility",
        "Professional development budget",
        "Collaborative work culture"
      ]
    },
    {
      id: 6,
      title: "UI/UX Designer",
      department: "Design",
      location: "Accra, Ghana (Hybrid)",
      type: "Full-time",
      experience: "3+ years",
      salary: "Competitive",
      posted: "6 days ago",
      description: "Design beautiful, intuitive user experiences for our learning platform. You'll collaborate with product managers and developers to create user-centered designs that enhance learning.",
      responsibilities: [
        "Design user interfaces for web and mobile platforms",
        "Conduct user research and usability testing",
        "Create wireframes, prototypes, and design systems",
        "Collaborate with product and engineering teams",
        "Ensure consistent user experience across products"
      ],
      requirements: [
        "3+ years of UI/UX design experience",
        "Proficiency in Figma, Sketch, or similar tools",
        "Strong portfolio demonstrating user-centered design",
        "Experience with design systems and accessibility",
        "Understanding of front-end development principles"
      ],
      benefits: [
        "Competitive salary",
        "Health benefits",
        "Flexible work arrangements",
        "Design conferences and training",
        "Creative and collaborative environment"
      ]
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    setJobs(sampleJobs);
    setFilteredJobs(sampleJobs);
    
    // Extract unique departments, locations, and types
    const depts = [...new Set(sampleJobs.map(job => job.department))];
    const locs = [...new Set(sampleJobs.map(job => job.location))];
    const types = [...new Set(sampleJobs.map(job => job.type))];
    
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

  // Handle job application
  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    // Reset form
    setApplicationData({
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      portfolio: "",
      coverLetter: "",
      resume: null,
      agreeTerms: false,
    });
    setFormErrors({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
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

  // Validate form
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

  // Submit application
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // In production, this would be an API call
      // const formData = new FormData();
      // formData.append('jobId', selectedJob.id);
      // formData.append('fullName', applicationData.fullName);
      // formData.append('email', applicationData.email);
      // formData.append('phone', applicationData.phone);
      // formData.append('linkedin', applicationData.linkedin);
      // formData.append('portfolio', applicationData.portfolio);
      // formData.append('coverLetter', applicationData.coverLetter);
      // formData.append('resume', applicationData.resume);
      // 
      // const response = await API.post('/jobs/apply', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Application submitted successfully for ${selectedJob.title}!`);
      setShowApplicationModal(false);
      
      // Reset form
      setApplicationData({
        fullName: "",
        email: "",
        phone: "",
        linkedin: "",
        portfolio: "",
        coverLetter: "",
        resume: null,
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

  // Animation variants
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

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a3a] via-[#0a1a3a]/95 to-[#1a2a5a]">
          <div className="absolute inset-0 bg-[url('/images/career-pattern.svg')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a3a] via-transparent to-transparent"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
              <FaHeart className="text-[#00a3a1] animate-pulse" />
              <span className="text-white text-sm font-medium">Join Our Team</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              <span className="text-[#00a3a1]">Build</span> the Future of
              <br />
              <span className="bg-gradient-to-r from-[#00a3a1] to-blue-400 bg-clip-text text-transparent">
                Education
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
              Join us in revolutionizing healthcare education across Africa and beyond. 
              We're looking for passionate individuals who want to make a difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth' })}
                className="group bg-[#00a3a1] hover:bg-[#008b89] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                View Open Positions
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('company-values').scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#0a1a3a] transition-all duration-300"
              >
                Learn About Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="py-16 bg-[#0a1a3a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FaUsers, value: "150+", label: "Team Members" },
              { icon: FaGlobeAfrica, value: "12+", label: "Countries Reached" },
              { icon: FaGraduationCap, value: "15,000+", label: "Students Impacted" },
              { icon: FaTrophy, value: "98%", label: "Student Satisfaction" },
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

      {/* ==================== COMPANY VALUES SECTION ==================== */}
      <section id="company-values" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
              <FaHeart className="text-sm" />
              <span className="text-sm font-semibold">Our Values</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              What Drives <span className="text-[#00a3a1]">Our Team</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              At Alveoly, we're guided by a set of core values that shape our culture
              and drive our mission forward.
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
                className="group bg-gray-50 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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

      {/* ==================== BENEFITS SECTION ==================== */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
              <FaAward className="text-sm" />
              <span className="text-sm font-semibold">Perks & Benefits</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Why You'll <span className="text-[#00a3a1]">Love Working Here</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We believe in taking care of our team with comprehensive benefits
              that support your professional and personal growth.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className={`w-14 h-14 rounded-full ${benefit.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <benefit.icon className={`text-2xl ${benefit.iconColor}`} />
                </div>
                <h3 className="font-semibold text-[#0a1a3a] mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== LIFE AT ALVEOLY SECTION ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
                <FaUsers className="text-sm" />
                <span className="text-sm font-semibold">Our Culture</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-4">
                Life at <span className="text-[#00a3a1]">Alveoly</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                We're more than just a workplace—we're a community of passionate 
                educators, technologists, and innovators working together to 
                transform education in Africa.
              </p>
              
              <div className="space-y-4">
                {[
                  "Collaborative and inclusive work environment",
                  "Opportunities for impact and growth",
                  "Work-life balance and flexible schedules",
                  "Regular team events and celebrations",
                  "Supportive leadership and mentorship"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <FaCheckCircle className="text-[#00a3a1] mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00a3a1] to-[#0a1a3a] rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-[#0a1a3a] rounded-2xl overflow-hidden shadow-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: FaCoffee, label: "Coffee Breaks", color: "bg-amber-500/20 text-amber-400" },
                    { icon: FaUsers, label: "Team Building", color: "bg-blue-500/20 text-blue-400" },
                    { icon: FaRocket, label: "Innovation", color: "bg-purple-500/20 text-purple-400" },
                    { icon: FaHeart, label: "Community", color: "bg-red-500/20 text-red-400" },
                  ].map((item, idx) => (
                    <div key={idx} className={`${item.color} rounded-lg p-4 text-center`}>
                      <item.icon className="text-2xl mx-auto mb-2" />
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-white text-sm italic text-center">
                    "Working at Alveoly has been the most rewarding experience of my career. 
                    The team is incredible, and we're truly making a difference."
                  </p>
                  <p className="text-[#00a3a1] text-sm font-medium text-center mt-2">
                    — Sarah Mensah, Senior Developer
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== OPEN POSITIONS SECTION ==================== */}
      <section id="open-positions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full mb-4">
              <FaBriefcase className="text-sm" />
              <span className="text-sm font-semibold">Open Positions</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a3a] mb-3">
              Join Our <span className="text-[#00a3a1]">Team</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We're looking for talented individuals to help us shape the future 
              of healthcare education. Check out our open positions below.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search positions by title, department, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
                />
              </div>
            </div>

            {/* Filters */}
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
              <FaBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Positions Available</h3>
              <p className="text-gray-500">
                We don't have any positions matching your criteria right now. 
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
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
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
                          className="bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                        >
                          Apply Now
                          <FaArrowRight className="text-sm" />
                        </button>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="border-2 border-gray-300 hover:border-[#00a3a1] px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-[#00a3a1] transition-all duration-300"
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

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 bg-gradient-to-r from-[#0a1a3a] to-[#1a2a5a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Make an <span className="text-[#00a3a1]">Impact</span>?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join us in our mission to transform healthcare education across Africa. 
              Your skills and passion can make a real difference.
            </p>
            <button
              onClick={() => document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#00a3a1] hover:bg-[#008b89] text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              View Open Positions
              <FaRocket className="text-sm" />
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ==================== JOB DETAIL MODAL ==================== */}
      <AnimatePresence>
        {selectedJob && !showApplicationModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                    <p className="text-sm text-blue-100">
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

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Job Meta */}
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

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#0a1a3a] mb-2">About the Role</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {/* Responsibilities */}
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

                  {/* Requirements */}
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

                  {/* Benefits */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#0a1a3a] mb-2">What We Offer</h3>
                    <ul className="space-y-2">
                      {selectedJob.benefits.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <FaHeart className="text-[#00a3a1] mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowApplicationModal(true);
                  }}
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
              {/* Modal Header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-teal-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Apply for {selectedJob.title}</h2>
                    <p className="text-sm text-green-100">
                      Fill out the form below to submit your application
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

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  {/* Full Name */}
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

                  {/* Email */}
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

                  {/* Phone */}
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

                  {/* LinkedIn */}
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

                  {/* Portfolio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Portfolio/Website (Optional)
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={applicationData.portfolio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/20 focus:border-[#00a3a1] transition-all"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>

                  {/* Cover Letter */}
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
                      placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    />
                  </div>

                  {/* Resume Upload */}
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

                  {/* Terms Agreement */}
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

              {/* Modal Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="flex-1 bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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