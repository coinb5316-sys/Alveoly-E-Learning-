// pages/PrivacyPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, Database, Cookie, Mail, Globe, Users, Lock, FileText, CheckCircle } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: [
        "Personal identification information (Name, email address, phone number, etc.)",
        "Educational data (Course enrollment, progress, quiz results, certificates)",
        "Payment information (Processed securely through third-party payment gateways)",
        "Technical data (IP address, browser type, device information)",
        "Usage data (Pages visited, time spent, features used)"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our educational services",
        "To notify you about changes to our services",
        "To provide customer support and respond to inquiries",
        "To analyze and improve our platform",
        "To monitor usage and detect technical issues",
        "To issue certificates and track academic progress"
      ]
    },
    {
      icon: Database,
      title: "Data Storage & Security",
      content: [
        "We implement industry-standard security measures including encryption",
        "Your data is stored on secure servers with regular backups",
        "Access to personal data is restricted to authorized personnel only",
        "We use SSL/TLS encryption for data transmission",
        "Regular security audits and vulnerability assessments are performed"
      ]
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking Technologies",
      content: [
        "Essential cookies for platform functionality",
        "Analytics cookies to improve user experience",
        "Preference cookies to remember your settings",
        "You can control cookie preferences through your browser settings",
        "Third-party cookies from integrated services (payment, video hosting)"
      ]
    },
    {
      icon: Users,
      title: "Data Sharing & Disclosure",
      content: [
        "We do not sell your personal information to third parties",
        "Data may be shared with service providers (payment processors, hosting services)",
        "Educational institutions may receive verification of your progress",
        "Legal compliance when required by law enforcement",
        "With your explicit consent for specific purposes"
      ]
    },
    {
      icon: Lock,
      title: "Your Rights",
      content: [
        "Access your personal data at any time",
        "Request correction of inaccurate information",
        "Request deletion of your account and data",
        "Opt-out of marketing communications",
        "Data portability to other platforms",
        "Lodge a complaint with data protection authorities"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-white/80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-blue-200 mt-4">Last Updated: January 1, 2025</p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="mb-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            At Alveoly E-Learning Academy of Health and Sciences ("we", "our", "us"), we are committed to protecting 
            your privacy and ensuring the security of your personal information. This Privacy Policy explains how we 
            collect, use, disclose, and safeguard your information when you use our e-learning platform, website, and 
            related services (collectively, the "Services").
          </p>
        </div>

        {/* Sections Grid */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-3 ml-4">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Information */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Questions About This Policy?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                If you have any questions about our Privacy Policy or how we handle your data, please contact us:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>📧 Email: alveolyelearning@gmail.com</li>
                <li>📞 Phone: +233 (0) 549 556 6116</li>
                <li>📍 Address: Accra, Ghana</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Footer Link */}
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;