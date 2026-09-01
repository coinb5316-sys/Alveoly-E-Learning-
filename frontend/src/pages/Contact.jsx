// Contact.jsx - UWorld Professional Style (Exact Match)
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";
import { 
  FaSearch,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const Contact = () => {
  const navigate = useNavigate();
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // FAQ Data - Directly from UWorld's page structure
  const faqCategories = [
    {
      category: "Most Common Questions",
      questions: [
        {
          q: "What is your refund policy?",
          a: "All direct Alveoly purchase refund requests are evaluated case-by-case. The refund amounts determined are final. Please contact our support team for assistance."
        },
        {
          q: "Can I upgrade or downgrade my subscription purchase?",
          a: "If your subscription purchase has not been activated, you may request to upgrade or downgrade it. Current subscription pricing will apply to all upgrades and downgrades."
        },
        {
          q: "How can I renew/extend my subscription?",
          a: "You can renew your subscription by logging into your account and clicking the 'Renew' button. A renewal is an extension of time to continue accessing an active subscription."
        },
        {
          q: "Can I reset/delete my Qbank test history or start all over again?",
          a: "We offer a one-time reset option for subscriptions active for 180 days or more. Once a reset has been used, a subscription cannot be reset again."
        },
        {
          q: "When does a new purchase/renewal begin?",
          a: "All new subscriptions go into effect from when they are activated, not at the time of purchase. Renewal purchases are effective from the existing expiration date."
        },
      ]
    },
    {
      category: "Payment",
      questions: [
        {
          q: "How do I purchase a subscription from the website?",
          a: "Any of our product offerings can be purchased from our website. Payment is due in full at the time of purchase via credit or debit card or via mobile money. You must have an account to make a purchase."
        },
        {
          q: "What forms of payment do you accept?",
          a: "We accept credit/debit cards with Visa, MasterCard, or American Express logos, mobile money, and bank transfers. After a successful payment, your subscription will immediately be available."
        },
        {
          q: "Do you offer a Military Discount?",
          a: "We are grateful to our men and women in uniform! We offer a 10% discount on new packages for active duty members and veterans. Please contact us for more information."
        },
      ]
    },
    {
      category: "Subscriptions",
      questions: [
        {
          q: "How do I activate and/or access my subscription?",
          a: "Log in to your account, click on the 'Activate' button associated with the subscription you wish to start. If already activated, click on the 'Launch' button."
        },
        {
          q: "I forgot my username/password; how can I retrieve it?",
          a: "If you have forgotten your password, please use the 'Forgot Password?' link on the login page to reset your password. You may be required to answer a security question."
        },
        {
          q: "How can I change my registered email address and password?",
          a: "You may update your registered email address by signing in, clicking on the Profile tab, and entering your desired email address. A verification email will be sent to confirm the change."
        },
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          q: "What are the system/device/network requirements?",
          a: "Alveoly products are compatible with most recent Windows and Mac laptop or desktop systems. We also offer mobile applications compatible with recent Android and iOS devices."
        },
        {
          q: "How do I access my purchased subscription?",
          a: "All Alveoly subscriptions require an active internet connection. Sign in to your account and click the 'Activate' or 'Launch' button beside your subscription."
        },
        {
          q: "Can I access my subscriptions on a mobile device?",
          a: "Yes! Access to QBank and Self-Assessment subscriptions is offered through our companion application for Android and iOS devices for convenient on-the-go access."
        },
        {
          q: "How do I ensure I am viewing the latest version of the web app? (Clear browser cache)",
          a: "To ensure you are viewing the latest version, please clear your browser cache. You can do this by pressing Ctrl-Shift-Delete (Windows) or Command-Shift-Delete (Mac) and selecting 'Clear browsing data'."
        },
      ]
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitSuccess(false);

    try {
      // Save to database
      await API.post("/messages", formData);

      // Send email via EmailJS
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
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Error sending message:", err);
      alert(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Filter FAQs based on search
  const filteredFaqs = searchQuery
    ? faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
               q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqCategories;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-['Inter',sans-serif]">
      <Navbar />

      {/* ==================== HERO SECTION - UWORLD EXACT STYLE ==================== */}
      <header className="relative min-h-[60vh] flex items-center justify-center bg-[#0a1a3a] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,163,161,0.3) 0%, transparent 50%)`,
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2">
              Hi there, how can we help?
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Choose a category to quickly find what you need or contact us
            </p>

            {/* Search Bar - Exact UWorld Style */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent text-lg"
              />
              <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </motion.div>
        </div>
      </header>

      {/* ==================== FAQ SECTION - UWORLD EXACT STYLE ==================== */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.map((category, catIndex) => (
            <motion.div
              key={catIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: catIndex * 0.1 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-[#0a1a3a] mb-6 pb-2 border-b-2 border-gray-200">
                {category.category}
              </h2>
              
              <div className="space-y-3">
                {category.questions.map((faq, idx) => {
                  const faqIndex = `${catIndex}-${idx}`;
                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#00a3a1] transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(faqIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-base md:text-lg font-medium text-gray-800">
                          {faq.q}
                        </span>
                        {expandedFaq === faqIndex ? (
                          <FaChevronUp className="text-[#00a3a1] flex-shrink-0 ml-4" />
                        ) : (
                          <FaChevronDown className="text-gray-400 flex-shrink-0 ml-4" />
                        )}
                      </button>
                      
                      {expandedFaq === faqIndex && (
                        <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-gray-400 mt-2">Try searching with different keywords</p>
            </div>
          )}
        </div>
      </section>

      {/* ==================== CONTACT FORM SECTION ==================== */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#00a3a1] p-3 rounded-lg">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#0a1a3a]">Contact Us</h2>
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
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Message *</label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00a3a1] hover:bg-[#008b89] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;