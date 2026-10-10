// src/pages/Blog.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaFire, FaClock, FaEye, FaHeart,
  FaCheckCircle, FaFilter, FaThLarge, FaList,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BlogCard from "../components/blog/BlogCard";
import BlogSidebar from "../components/blog/BlogSidebar";
import PodcastEmbed from "../components/blog/PodcastEmbed";
import VideoEmbed from "../components/blog/VideoEmbed";
import { posts, categories, authors, podcasts, videos } from "../data/blogData";

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  // Filter posts
  let filteredPosts = [...posts];

  if (activeCategory !== "all") {
    filteredPosts = filteredPosts.filter((p) => p.categoryId === activeCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortBy === "newest") {
    filteredPosts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  } else if (sortBy === "popular") {
    filteredPosts.sort((a, b) => b.views - a.views);
  } else if (sortBy === "liked") {
    filteredPosts.sort((a, b) => b.likes - a.likes);
  }

  const featuredPosts = posts.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1600&h=800&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#00a3a1]/20 border border-[#00a3a1]/30 text-[#00a3a1] text-sm font-semibold rounded-full mb-4">
              Evidence-Based Health Journalism
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              The Alveoly Health Blog
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Trusted, medically reviewed articles on heart health, nutrition,
              mental wellness, and more — written by clinicians, for everyone.
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto relative">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, topics, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchParams(searchQuery ? { q: searchQuery } : {});
                  }
                }}
                className="w-full pl-14 pr-32 py-4 rounded-full bg-white/95 backdrop-blur text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a3a1] shadow-2xl"
              />
              <button
                onClick={() =>
                  setSearchParams(searchQuery ? { q: searchQuery } : {})
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
              >
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {activeCategory === "all" && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post, i) => (
              <BlogCard key={post.id} post={post} variant="featured" index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Column */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchParams({});
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === "all"
                      ? "bg-[#00a3a1] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchParams({ category: cat.id });
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      activeCategory === cat.id
                        ? "bg-[#00a3a1] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600">
                Showing <strong>{Math.min(visibleCount, filteredPosts.length)}</strong> of{" "}
                <strong>{filteredPosts.length}</strong> articles
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a1] bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Read</option>
                  <option value="liked">Most Liked</option>
                </select>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid" ? "bg-white shadow-sm text-[#00a3a1]" : "text-gray-500"
                    }`}
                    aria-label="Grid view"
                  >
                    <FaThLarge className="text-sm" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list" ? "bg-white shadow-sm text-[#00a3a1]" : "text-gray-500"
                    }`}
                    aria-label="List view"
                  >
                    <FaList className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Grid/List */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No articles found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
                      : "space-y-6"
                  }
                >
                  {filteredPosts.slice(0, visibleCount).map((post, i) => (
                    <BlogCard key={post.id} post={post} index={i} />
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* Load More */}
            {visibleCount < filteredPosts.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  Load More Articles
                </button>
              </div>
            )}

            {/* Podcast Section */}
            {activeCategory === "all" && !searchQuery && (
              <div className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-[#00a3a1] rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Featured Podcast
                  </h2>
                </div>
                <PodcastEmbed podcast={podcasts[0]} />
              </div>
            )}

            {/* Video Section */}
            {activeCategory === "all" && !searchQuery && (
              <div className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-[#00a3a1] rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    From Our Video Library
                  </h2>
                </div>
                <VideoEmbed video={videos[0]} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;