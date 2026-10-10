// src/components/blog/BlogSidebar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaSearch, FaEnvelope, FaTwitter, FaLinkedin,
  FaYoutube, FaInstagram, FaFacebook, FaPodcast,
  FaArrowRight, FaFire, FaTag,
} from "react-icons/fa";
import { categories, trendingTopics, posts, podcasts } from "../../data/blogData";
import toast from "react-hot-toast";

const BlogSidebar = () => {
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    toast.success("Subscribed! Check your inbox to confirm.");
    setEmail("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/blog/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const popularPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <aside className="space-y-8">
      {/* Search */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Search Articles</h3>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search health topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a3a1] focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#00a3a1] rounded-lg flex items-center justify-center text-white hover:bg-[#008b89] transition-colors"
            aria-label="Search"
          >
            <FaSearch className="text-xs" />
          </button>
        </form>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-br from-[#00a3a1] to-[#007a78] rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <FaEnvelope className="text-xl" />
          <h3 className="text-lg font-bold">Health Newsletter</h3>
        </div>
        <p className="text-white/90 text-sm mb-4">
          Get evidence-based health insights delivered to your inbox every week.
        </p>
        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
          />
          <button
            type="submit"
            className="w-full bg-white text-[#00a3a1] py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            Subscribe Free
          </button>
        </form>
        <p className="text-white/60 text-xs mt-3">
          No spam. Unsubscribe anytime.
        </p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat) => {
            const count = posts.filter((p) => p.categoryId === cat.id).length;
            return (
              <li key={cat.id}>
                <Link
                  to={`/blog/category/${cat.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-[#00a3a1] font-medium">
                    {cat.name}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Popular Posts */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <FaFire className="text-orange-500" />
          <h3 className="text-lg font-bold text-gray-900">Most Read</h3>
        </div>
        <div className="space-y-4">
          {popularPosts.map((post, i) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="flex gap-3 group"
            >
              <span className="text-2xl font-bold text-gray-200 group-hover:text-[#00a3a1] transition-colors w-8 flex-shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[#00a3a1] transition-colors">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {post.views?.toLocaleString()} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Podcast */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <FaPodcast className="text-[#00a3a1]" />
          <h3 className="text-lg font-bold">Alveoly Podcast</h3>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          Conversations with health experts on the topics that matter.
        </p>
        <Link
          to="/blog/podcasts"
          className="inline-flex items-center gap-2 text-[#00a3a1] font-semibold text-sm hover:gap-3 transition-all"
        >
          Listen Now <FaArrowRight className="text-xs" />
        </Link>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <FaTag className="text-[#00a3a1]" />
          <h3 className="text-lg font-bold text-gray-900">Trending Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <Link
              key={topic}
              to={`/blog/tag/${topic.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-3 py-1.5 bg-gray-100 hover:bg-[#00a3a1] hover:text-white text-gray-700 text-xs font-medium rounded-full transition-colors"
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>

      {/* Social */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { icon: FaFacebook, href: "https://facebook.com/alveoly", color: "hover:bg-blue-600" },
            { icon: FaTwitter, href: "https://twitter.com/alveoly", color: "hover:bg-sky-500" },
            { icon: FaLinkedin, href: "https://linkedin.com/company/alveoly", color: "hover:bg-blue-700" },
            { icon: FaInstagram, href: "https://instagram.com/alveoly", color: "hover:bg-pink-600" },
            { icon: FaYoutube, href: "https://youtube.com/alveoly", color: "hover:bg-red-600" },
          ].map((social, i) => (
            <a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full aspect-square flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:text-white ${social.color} transition-all duration-300`}
              aria-label="Social link"
            >
              <social.icon />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default BlogSidebar;