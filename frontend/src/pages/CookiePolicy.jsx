// src/pages/CookiePolicy.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaCookie, FaShieldAlt, FaUserCog, FaChartLine } from "react-icons/fa";

const CookiePolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cookieTypes = [
    {
      icon: FaCookie,
      title: "Essential Cookies",
      description: "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.",
      examples: ["Session tokens", "Authentication cookies", "Security measures"],
    },
    {
      icon: FaUserCog,
      title: "Preference Cookies",
      description: "These cookies allow the website to remember choices you make and provide enhanced, more personal features.",
      examples: ["Language preferences", "Theme selection", "Course progress"],
    },
    {
      icon: FaChartLine,
      title: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: ["Page views", "Session duration", "User journey tracking"],
    },
    {
      icon: FaShieldAlt,
      title: "Marketing Cookies",
      description: "These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.",
      examples: ["Ad personalization", "Social media integration", "Retargeting"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
              <FaCookie className="text-2xl" />
              <span className="font-semibold">Cookie Policy</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Your Privacy Matters to Us
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how Alveoly uses cookies to enhance your learning experience and protect your data.
            </p>
          </div>

          {/* Last Updated */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Last Updated:</span> January 1, 2024
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This policy applies to all Alveoly E-Learning platforms and services
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
            </p>
            <p className="text-gray-600 leading-relaxed">
              At Alveoly, we use cookies to enhance your learning experience, remember your preferences, 
              and help us improve our platform to better serve you.
            </p>
          </div>

          {/* Cookie Types */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>
            
            {cookieTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600 flex-shrink-0">
                    <type.icon className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-3">{type.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.examples.map((example, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Your Choices */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 md:p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Cookie Choices</h2>
            <p className="text-blue-100 leading-relaxed mb-4">
              You have the right to choose whether to accept cookies. You can manage your cookie preferences 
              through your browser settings or through our cookie consent tool.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-2">Browser Settings</h4>
                <p className="text-sm text-blue-100">
                  Most web browsers allow you to control cookies through their settings. You can block or delete cookies at any time.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-2">Cookie Consent Tool</h4>
                <p className="text-sm text-blue-100">
                  You can change your cookie preferences at any time by clicking the cookie icon in the bottom-left corner of your screen.
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may also use third-party cookies from trusted partners to enhance your experience. These include:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><span className="font-semibold">Analytics:</span> Google Analytics to help us understand how you use our platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><span className="font-semibold">Payments:</span> Payment processors like Stripe for secure transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><span className="font-semibold">Social Media:</span> Social media platforms for sharing content and authentication</span>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="bg-gray-900 rounded-xl p-6 md:p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About Our Cookie Policy?</h2>
            <p className="text-gray-300 mb-6">
              If you have any questions or concerns about our use of cookies, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Contact Us
              </Link>
              <Link 
                to="/privacy" 
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                View Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;