// src/components/CookieBanner.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCookie, FaTimes, FaCheck, FaCog } from "react-icons/fa";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    preferences: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setIsVisible(true);
    } else {
      const consentData = JSON.parse(cookieConsent);
      setPreferences(consentData);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = {
      essential: true,
      preferences: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allPreferences);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
  };

  const handleRejectAll = () => {
    const minimalPreferences = {
      essential: true,
      preferences: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(minimalPreferences);
  };

  const savePreferences = (prefs) => {
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key) => {
    if (key === "essential") return; // Essential cookies cannot be disabled
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-2xl">
        {!showPreferences ? (
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 flex-shrink-0 mt-1">
                  <FaCookie className="text-xl" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">
                    We Value Your Privacy
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-2xl">
                    We use cookies to enhance your learning experience, analyze site traffic, 
                    and personalize content. By clicking "Accept All," you consent to our use of cookies. 
                    You can customize your preferences at any time.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link 
                      to="/cookies" 
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      Learn More
                    </Link>
                    <span className="text-gray-300">|</span>
                    <button 
                      onClick={() => setShowPreferences(true)}
                      className="text-xs text-gray-600 hover:text-gray-900 font-medium hover:underline"
                    >
                      Customize Settings
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-xs md:text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptSelected}
                  className="px-4 py-2 text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-300"
                >
                  Accept Selected
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <FaCheck />
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Preferences Panel
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <FaCog className="text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cookie Preferences</h3>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close preferences"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Essential Cookies - Always On */}
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Essential Cookies</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Always Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Required for the website to function properly. These cookies enable core functionality like security and authentication.
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className="inline-block w-10 h-6 bg-blue-600 rounded-full relative">
                    <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"></span>
                  </span>
                </div>
              </div>

              {/* Preference Cookies */}
              <div className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <span className="font-semibold text-gray-900">Preference Cookies</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Remember your settings like language preferences and theme selection.
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange("preferences")}
                  className={`flex-shrink-0 ml-4 w-12 h-7 rounded-full transition-colors duration-200 ${
                    preferences.preferences ? "bg-blue-600" : "bg-gray-300"
                  } relative`}
                  aria-label="Toggle preference cookies"
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      preferences.preferences ? "transform translate-x-5" : ""
                    }`}
                  ></span>
                </button>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <span className="font-semibold text-gray-900">Analytics Cookies</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Help us understand how visitors interact with our platform to improve your experience.
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange("analytics")}
                  className={`flex-shrink-0 ml-4 w-12 h-7 rounded-full transition-colors duration-200 ${
                    preferences.analytics ? "bg-blue-600" : "bg-gray-300"
                  } relative`}
                  aria-label="Toggle analytics cookies"
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      preferences.analytics ? "transform translate-x-5" : ""
                    }`}
                  ></span>
                </button>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <span className="font-semibold text-gray-900">Marketing Cookies</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Used to deliver personalized advertisements and social media integration.
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange("marketing")}
                  className={`flex-shrink-0 ml-4 w-12 h-7 rounded-full transition-colors duration-200 ${
                    preferences.marketing ? "bg-blue-600" : "bg-gray-300"
                  } relative`}
                  aria-label="Toggle marketing cookies"
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      preferences.marketing ? "transform translate-x-5" : ""
                    }`}
                  ></span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleAcceptSelected}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
              >
                Cancel
              </button>
              <Link
                to="/cookies"
                className="px-6 py-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CookieBanner;