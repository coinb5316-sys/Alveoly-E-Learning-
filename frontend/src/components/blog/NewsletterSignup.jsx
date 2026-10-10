// paste the content above
// src/components/blog/NewsletterSignup.jsx
import React, { useState } from "react";
import { FaEnvelope, FaCheckCircle, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    // Simulate API call — replace with your real endpoint later
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      toast.success("Subscribed! Check your inbox to confirm.");
    }, 1200);
  };

  if (subscribed) {
    return (
      <div className="bg-gradient-to-br from-[#00a3a1] to-[#007a78] rounded-2xl p-8 my-12 text-center text-white shadow-xl">
        <FaCheckCircle className="text-5xl mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">You're subscribed!</h3>
        <p className="text-white/90">
          Look out for our weekly health insights in your inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2847] rounded-2xl p-8 md:p-10 my-12 text-center text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a3a1]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-[#00a3a1]/20 border border-[#00a3a1]/30 flex items-center justify-center mx-auto mb-4">
          <FaEnvelope className="text-[#00a3a1] text-2xl" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-3">
          Health Insights, Weekly
        </h3>
        <p className="text-gray-300 max-w-lg mx-auto mb-6">
          Join 25,000+ readers getting evidence-based health articles,
          podcast episodes, and practical guides — straight to their inbox.
        </p>
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Subscribing...
              </>
            ) : (
              "Subscribe Free"
            )}
          </button>
        </form>
        <p className="text-gray-500 text-xs mt-4">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default NewsletterSignup;