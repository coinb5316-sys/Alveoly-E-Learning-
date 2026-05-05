// Contact.jsx - Updated with EmailJS from first component + professional styling
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { motion, useScroll } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import contactBg from "../images/contact-bg.jpg";
import API from "../api/axios";
import { 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaPaperPlane,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaHeadset,
  FaChartLine,
  FaUsers,
  FaGlobe,
} from "react-icons/fa";

const Contact = () => {
  const navigate = useNavigate();
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitSuccess(false);

    try {
      // ✅ Save to database
      await API.post("/messages", formData);

      // ✅ Send email via EmailJS (using the same format as the first component)
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Error sending message:", err);
      alert(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com/alveoly", bgColor: "bg-blue-600" },
    { icon: FaTwitter, href: "https://twitter.com/alveoly", bgColor: "bg-blue-400" },
    { icon: FaInstagram, href: "https://instagram.com/alveoly", bgColor: "bg-pink-600" },
    { icon: FaLinkedin, href: "https://linkedin.com/company/alveoly", bgColor: "bg-blue-700" },
    { icon: FaYoutube, href: "https://youtube.com/alveoly", bgColor: "bg-red-600" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative min-h-[60vh] md:h-screen flex items-center justify-center bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${contactBg})` }}
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
            <span className="text-white text-xs md:text-sm font-medium">Get in Touch</span>
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Contact
            </span>
            <br />
            <span className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl">Our Support Team</span>
          </motion.h1>

          <motion.p 
            className="text-sm sm:text-base md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto text-gray-200 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            We'd love to hear from you! Whether you have a question about admissions,
            programs, or anything else — our team is ready to help.
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
                Apply Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm md:text-base" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <button
              onClick={() => navigate("/programs")}
              className="group bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Explore Programs
            </button>
          </motion.div>
        </motion.div>

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
            {[
              { icon: FaHeadset, value: "24/7", label: "Customer Support" },
              { icon: FaChartLine, value: "99%", label: "Response Rate" },
              { icon: FaUsers, value: "10K+", label: "Happy Students" },
              { icon: FaGlobe, value: "20+", label: "Countries Served" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="text-2xl md:text-4xl mx-auto mb-2 md:mb-3 text-white/80" />
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1">{stat.value}</h3>
                <p className="text-xs md:text-sm text-white/90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Cards Section */}
      <motion.section 
        className="py-12 md:py-20 px-4 md:px-6 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Email Card */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-blue-600 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="text-2xl md:text-3xl text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2 text-sm md:text-base">alveolyapexprep@gmail.com</p>
              <p className="text-gray-500 text-xs md:text-sm">Response within 24 hours</p>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-green-600 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaPhoneAlt className="text-2xl md:text-3xl text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2 text-sm md:text-base">+233 54 955 6116</p>
              <p className="text-gray-500 text-xs md:text-sm">Mon-Fri, 9am-6pm GMT</p>
            </motion.div>

            {/* Address Card */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-purple-600 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaMapMarkerAlt className="text-2xl md:text-3xl text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-2 text-sm md:text-base">Alveoly E-Learning Academy</p>
              <p className="text-gray-500 text-xs md:text-sm">Accra, Ghana</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact Form Section */}
      <motion.section 
        className="py-12 md:py-20 px-4 md:px-6 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Form */}
            <motion.div variants={fadeInUp} className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
              </div>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-500 rounded-lg flex items-center gap-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <div>
                    <p className="text-green-700 font-semibold">Message Sent Successfully!</p>
                    <p className="text-green-600 text-sm">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Message *</label>
                  <textarea
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Office Hours & Social Media */}
            <motion.div variants={fadeInUp} className="space-y-6 md:space-y-8">
              {/* Office Hours */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FaClock className="text-2xl text-blue-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Office Hours</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold text-gray-900">10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold text-gray-900">Closed</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 text-white text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-4">Connect With Us</h3>
                <p className="text-white/80 mb-6 text-sm md:text-base">Follow us on social media for updates and news</p>
                <div className="flex justify-center gap-3 md:gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${social.bgColor} p-3 rounded-full text-white hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <social.icon className="text-lg md:text-xl" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Map Location */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15884.814380779153!2d-0.1869504!3d5.6037168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9b3a1b8e4b6f%3A0x2b3c5d7e9f1a2b4c!2sAccra%2C%20Ghana!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Alveoly Location"
                  className="w-full"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4 md:space-y-6">
            {[
              { q: "How long does it take to get a response?", a: "We typically respond to all inquiries within 24 hours during business days." },
              { q: "Can I apply online?", a: "Yes, you can apply online through our application portal. Click the 'Apply Now' button to get started." },
              { q: "Do you offer financial aid?", a: "Yes, we offer various scholarships and financial aid options. Contact our admissions team for more information." },
              { q: "Is there a campus I can visit?", a: "Our main administrative office is located in Accra, Ghana. Virtual tours are also available upon request." },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-5 md:p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm md:text-base">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 md:mb-8 px-4">
            Take the first step towards your future. Apply now or contact us for more information.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <button 
              onClick={() => navigate("/signup")}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Apply Now
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/programs")}
              className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-4 rounded-xl font-semibold text-sm md:text-base lg:text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Explore Programs
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;