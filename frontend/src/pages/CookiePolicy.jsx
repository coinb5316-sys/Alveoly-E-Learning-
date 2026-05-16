// pages/CookiePolicy.jsx - FIXED
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Cookie, 
  Settings, 
  BarChart3, 
  Shield, 
  CheckCircle, 
  X, 
  Info, 
  RefreshCw,
  Globe  // ← ADD THIS IMPORT
} from "lucide-react";

const CookiePolicy = () => {
  const [showPreferences, setShowPreferences] = useState(false);

  const cookieTypes = [
    {
      name: "Essential Cookies",
      icon: Shield,
      description: "These cookies are necessary for the platform to function properly.",
      examples: "Authentication, session management, security",
      required: true,
      color: "blue"
    },
    {
      name: "Functional Cookies",
      icon: Settings,
      description: "These cookies enable enhanced functionality and personalization.",
      examples: "Language preferences, theme settings, remember login",
      required: false,
      color: "purple"
    },
    {
      name: "Analytics Cookies",
      icon: BarChart3,
      description: "These cookies help us understand how visitors interact with our platform.",
      examples: "Page views, time spent, navigation patterns",
      required: false,
      color: "green"
    }
  ];

  const handleCookiePreference = (cookieName, accept) => {
    // Set cookie preference in localStorage
    const preferences = JSON.parse(localStorage.getItem("cookiePreferences") || "{}");
    preferences[cookieName] = accept;
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    
    // Show confirmation instead of reloading
    alert(`Cookie preference saved: ${cookieName} ${accept ? 'accepted' : 'declined'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Cookie className="h-16 w-16 mx-auto mb-6 text-white/80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Learn how we use cookies to enhance your experience.
            </p>
            <p className="text-sm text-teal-200 mt-4">Last Updated: January 1, 2025</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-teal-600 dark:text-teal-400 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">What Are Cookies?</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Cookies are small text files that are placed on your device when you visit our website. They help us 
                provide you with a better experience, understand how you use our platform, and personalize content.
              </p>
            </div>
          </div>
        </div>

        {/* Cookie Types */}
        <div className="space-y-6 mb-8">
          {cookieTypes.map((cookie, index) => {
            const Icon = cookie.icon;
            const colorClasses = {
              blue: "from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-600",
              purple: "from-purple-100 to-pink-100 dark:from-purple-950/50 dark:to-pink-950/50 text-purple-600",
              green: "from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 text-green-600"
            };
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${colorClasses[cookie.color]} rounded-xl`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{cookie.name}</h2>
                      {cookie.required && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          Always Active
                        </span>
                      )}
                    </div>
                  </div>
                  {!cookie.required && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCookiePreference(cookie.name, true)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleCookiePreference(cookie.name, false)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-4 ml-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{cookie.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Examples:</span> {cookie.examples}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manage Preferences */}
        <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-2xl">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <RefreshCw className="h-6 w-6 text-teal-600 dark:text-teal-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Manage Cookie Preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can change your cookie preferences at any time by adjusting your browser settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Control Cookies */}
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            How to Control Cookies
          </h3>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <p>You can control cookies through your browser settings:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
              <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Cookies and website data</li>
              <li>Edge: Settings → Site permissions → Cookies and site data</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Please note that disabling certain cookies may affect the functionality of our platform.
            </p>
          </div>
        </div>

        {/* Third-Party Cookies */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <Globe className="h-6 w-6 text-teal-600 dark:text-teal-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Third-Party Cookies
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We may also use third-party services (such as Google Analytics, payment processors, and video hosting) 
                that set their own cookies. We do not control these cookies, and you should check the respective 
                privacy policies of these third parties.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-teal-600 dark:text-teal-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Questions About Cookies?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                If you have questions about our use of cookies, please contact us at{" "}
                <a href="mailto:privacy@alveoly.com" className="text-teal-600 hover:text-teal-700 dark:text-teal-400">
                  alveolyelearning@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;