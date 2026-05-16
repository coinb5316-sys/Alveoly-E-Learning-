// pages/TermsOfService.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FileText, Users, CreditCard, Shield, BookOpen, AlertCircle, CheckCircle, Globe } from "lucide-react";

const TermsOfService = () => {
  const sections = [
    {
      icon: BookOpen,
      title: "Acceptance of Terms",
      content: "By accessing or using Alveoly's e-learning platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services."
    },
    {
      icon: Users,
      title: "User Accounts",
      content: "You must create an account to access our courses. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account."
    },
    {
      icon: CreditCard,
      title: "Payments and Subscriptions",
      content: "Course fees, subscription plans, and payment terms are clearly displayed before purchase. All payments are processed securely through our payment partners. Refunds are handled according to our refund policy."
    },
    {
      icon: Shield,
      title: "Academic Integrity",
      content: "You agree to maintain academic honesty. Plagiarism, cheating, or any form of academic dishonesty may result in account suspension or termination without refund."
    },
    {
      icon: AlertCircle,
      title: "Prohibited Activities",
      content: "You may not share your account credentials, distribute course materials without permission, attempt to hack or disrupt our platform, or use our services for any illegal purpose."
    },
    {
      icon: Globe,
      title: "Intellectual Property",
      content: "All course content, videos, quizzes, and materials are the intellectual property of Alveoly. You may not reproduce, distribute, or create derivative works without explicit permission."
    }
  ];

  const additionalTerms = [
    "We reserve the right to modify or discontinue services at any time",
    "We are not liable for any indirect or consequential damages",
    "Your use of the platform is at your sole risk",
    "These terms are governed by the laws of Ghana",
    "Any disputes shall be resolved through binding arbitration"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-6 text-white/80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Please read these terms carefully before using our platform.
            </p>
            <p className="text-sm text-indigo-200 mt-4">Last Updated: January 1, 2025 • Effective: January 15, 2025</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="mb-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Welcome to Alveoly</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            These Terms of Service ("Terms") govern your use of the Alveoly E-Learning Academy of Health and Sciences 
            platform, website, and related services. By accessing or using our services, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-xl">
                    <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{section.title}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-4">
                  {section.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Terms */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Terms & Conditions</h3>
          <ul className="space-y-3">
            {additionalTerms.map((term, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">{term}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Need Clarification?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                If you have questions about these Terms, please contact us at{" "}
                <a href="mailto:legal@alveoly.com" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                  alveolyelearning@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;