import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaStethoscope, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart
} from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Admissions", path: "/admissions" },
    { name: "Contact Us", path: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Disclaimer", path: "/disclaimer" },
    { name: "Cookie Policy", path: "/cookies" },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com/alveoly", color: "hover:text-blue-600" },
    { icon: FaTwitter, href: "https://twitter.com/alveoly", color: "hover:text-blue-400" },
    { icon: FaLinkedin, href: "https://linkedin.com/company/alveoly", color: "hover:text-blue-700" },
    { icon: FaInstagram, href: "https://instagram.com/alveoly", color: "hover:text-pink-600" },
    { icon: FaYoutube, href: "https://youtube.com/alveoly", color: "hover:text-red-600" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div 
              onClick={() => handleNavigate("/")}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg transform transition-transform group-hover:scale-110">
                <FaStethoscope className="text-2xl text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Alveoly
              </span>
            </div>
            
            <p className="text-gray-300 leading-relaxed text-sm">
              Alveoly E-Learning Academy of Health and Sciences is your trusted resource 
              and lifestyle platform for student and professional nurses. Our mission is 
              to empower nursing education, clinical excellence, and lifelong learning.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3 pt-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    bg-gray-800 p-2 rounded-lg transition-all duration-300 
                    hover:bg-gray-700 ${social.color} transform hover:scale-110
                  `}
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigate(link.path)}
                    className="text-gray-300 hover:text-purple-400 transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-purple-500 transition-all duration-300"></span>
                    <span>{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigate(link.path)}
                    className="text-gray-300 hover:text-purple-400 transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-purple-500 transition-all duration-300"></span>
                    <span>{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-300">
                <FaMapMarkerAlt className="text-purple-400 mt-1 flex-shrink-0" />
                <span className="text-sm">Accra, Ghana</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FaEnvelope className="text-purple-400 flex-shrink-0" />
                <a href="mailto:info@alveoly.com" className="hover:text-purple-400 transition-colors text-sm">
                  alveolyelearning@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FaPhone className="text-purple-400 flex-shrink-0" />
                <a href="tel:+233123456789" className="hover:text-purple-400 transition-colors text-sm">
                  +233 (0) 549 556 6116
                </a>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-white mb-2">Subscribe to Newsletter</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-gray-300"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <span className="text-gray-400 text-sm">
              © {currentYear} Alveoly E-Learning Academy of Health and Sciences. 
              All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>Ut in Omnibus Glorificetur Deus!</span>
            <FaHeart className="text-red-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Back to top"
      >
        <svg 
          className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;