// src/components/blog/NewsletterSignup.jsx
// The Alveoly Letter — a reusable newsletter block used across the journal.
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaSpinner, FaBookOpen } from "react-icons/fa";
import toast from "react-hot-toast";

/* ============================================================
   VARIANTS
   - "inline"    → dark card, full width, used mid-article
   - "sidebar"   → dark card, narrow, used in sidebar
   - "centered"  → wide, centered, used at end of section pages
   ============================================================ */

const NewsletterSignup = ({
  variant = "inline",
  eyebrow = "The Alveoly Letter",
  headline = "A weekly letter on health and clinical practice.",
  description = "Original reporting, clinical insight, and thoughtful essays — no noise, no miracle cures.",
  cta = "Subscribe",
  note = "Unsubscribe anytime. We never share your email.",
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("That doesn't look like a valid email");
      return;
    }
    setLoading(true);
    // Simulate request — replace with real API call later
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      toast.success("You're on the list.");
    }, 1000);
  };

  /* ---------- SUCCESS STATE ---------- */
  if (subscribed) {
    return (
      <div
        className={`rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 ${
          variant === "centered" ? "max-w-3xl mx-auto px-6 py-14 md:py-16 text-center" : "p-6 md:p-8"
        }`}
      >
        <FaCheckCircle
          className={`text-emerald-400 dark:text-emerald-600 ${
            variant === "centered" ? "text-3xl mx-auto mb-4" : "text-xl mb-3"
          }`}
        />
        <p
          className={`font-serif font-bold ${
            variant === "centered" ? "text-2xl md:text-3xl mb-3" : "text-lg mb-2"
          }`}
        >
          You're on the list.
        </p>
        <p
          className={`opacity-80 leading-relaxed ${
            variant === "centered" ? "text-base max-w-md mx-auto" : "text-sm"
          }`}
        >
          The next letter goes out Thursday. Unsubscribe with one click anytime.
        </p>
      </div>
    );
  }

  /* ---------- CENTERED VARIANT ---------- */
  if (variant === "centered") {
    return (
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            {eyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-4 leading-tight">
            {headline}
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
            {description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Subscribing…
                </>
              ) : (
                cta
              )}
            </button>
          </form>

          <p className="text-xs text-stone-400 mt-4">{note}</p>
        </div>
      </section>
    );
  }

  /* ---------- INLINE + SIDEBAR ---------- */
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={`rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 ${
        isSidebar ? "p-5" : "p-6 md:p-8"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-rose-400 dark:text-rose-600 font-semibold mb-2 flex items-center gap-2">
        <FaBookOpen className="text-[10px]" />
        {eyebrow}
      </p>

      <p
        className={`font-serif font-bold mb-2 ${
          isSidebar ? "text-base" : "text-xl md:text-2xl"
        }`}
      >
        {isSidebar ? "Get stories worth reading." : headline}
      </p>

      <p
        className={`opacity-80 mb-4 leading-relaxed ${
          isSidebar ? "text-xs" : "text-sm"
        }`}
      >
        {isSidebar
          ? "A weekly letter on healthcare and clinical practice. No noise."
          : description}
      </p>

      <form
        onSubmit={handleSubmit}
        className={isSidebar ? "space-y-2" : "space-y-2"}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
          className={`w-full rounded-lg bg-white/10 dark:bg-stone-900/10 border border-white/20 dark:border-stone-900/20 text-white dark:text-stone-900 placeholder-white/50 dark:placeholder-stone-900/50 focus:outline-none focus:border-white/60 dark:focus:border-stone-900/60 transition disabled:opacity-60 ${
            isSidebar ? "px-3.5 py-2.5 text-xs" : "px-4 py-3 text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${
            isSidebar ? "px-4 py-2.5 text-xs" : "px-5 py-3 text-sm"
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin text-[10px]" />
              Subscribing…
            </>
          ) : (
            cta
          )}
        </button>
      </form>

      <p
        className={`opacity-60 mt-3 ${
          isSidebar ? "text-[10px]" : "text-xs"
        }`}
      >
        {isSidebar ? "Unsubscribe anytime." : note}
      </p>
    </div>
  );
};

export default NewsletterSignup;