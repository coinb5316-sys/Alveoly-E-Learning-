// pages/Disclaimer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Stethoscope, GraduationCap, BookOpen, Users, Shield, Info, CheckCircle } from "lucide-react";

const Disclaimer = () => {
  const disclaimers = [
    {
      icon: Stethoscope,
      title: "Medical Disclaimer",
      content: "The educational content provided on Alveoly is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare professionals for medical concerns."
    },
    {
      icon: GraduationCap,
      title: "Educational Disclaimer",
      content: "While we strive to provide accurate and up-to-date information, Alveoly does not guarantee that course content will fully prepare you for certification exams or professional licensure. Additional study and practical experience may be required."
    },
    {
      icon: BookOpen,
      title: "Content Accuracy",
      content: "We make reasonable efforts to ensure the accuracy of our content, but we do not warrant that all information is error-free, complete, or current. Medical knowledge evolves rapidly, and content may become outdated."
    },
    {
      icon: Users,
      title: "Third-Party Links",
      content: "Our platform may contain links to external websites. We are not responsible for the content, privacy practices, or availability of these third-party sites."
    },
    {
      icon: Shield,
      title: "Professional Certification",
      content: "Completion of our courses does not guarantee professional certification or employment. Certification requirements vary by institution and jurisdiction."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-white/80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Disclaimer</h1>
            <p className="text-xl text-yellow-100 max-w-3xl mx-auto">
              Important legal information about our educational platform.
            </p>
            <p className="text-sm text-yellow-200 mt-4">Last Updated: January 1, 2025</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* General Disclaimer */}
        <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">General Disclaimer</h2>
              <p className="text-gray-600 dark:text-gray-300">
                The information provided by Alveoly E-Learning Academy of Health and Sciences ("we", "us", "our") on 
                our platform is for general informational and educational purposes only. All information is provided 
                in good faith, however we make no representation or warranty of any kind regarding its accuracy, 
                adequacy, validity, reliability, availability, or completeness.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Disclaimers */}
        <div className="space-y-6">
          {disclaimers.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-950/50 dark:to-orange-950/50 rounded-xl">
                    <Icon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-4">
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* No Guarantee */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            No Guarantees
          </h3>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <p>We do not guarantee:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>That you will pass any certification exam</li>
              <li>That you will secure employment after course completion</li>
              <li>That our platform will be uninterrupted or error-free</li>
              <li>That specific results will be achieved through our courses</li>
            </ul>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Limitation of Liability
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                To the fullest extent permitted by law, Alveoly shall not be liable for any direct, indirect, 
                incidental, consequential, or punitive damages arising from your use of our platform or services.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;