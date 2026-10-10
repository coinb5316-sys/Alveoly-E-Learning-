// src/pages/Blog.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaClock,
  FaEye,
  FaHeart,
  FaCheckCircle,
  FaThLarge,
  FaList,
  FaArrowRight,
  FaPodcast,
  FaPlay,
  FaChevronDown,
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
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    setActiveCategory(cat || "all");
    const q = searchParams.get("q");
    if (q !== null) setSearchQuery(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams]);

  // ---------- Derived data ----------
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (activeCategory !== "all") {
      list = list.filter((p) => p.categoryId === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === "popular") {
      list.sort((a, b) => b.views - a.views);
    } else if (sortBy === "liked") {
      list.sort((a, b) => b.likes - a.likes);
    }
    return list;
  }, [activeCategory, searchQuery, sortBy]);

  // Featured: 1 lead + 2 secondary
  const leadPost = useMemo(
    () => posts.find((p) => p.featured && p.editorsPick) || posts[0],
    []
  );
  const secondaryFeatured = useMemo(
    () =>
      posts
        .filter((p) => p.featured && p.id !== leadPost.id)
        .slice(0, 2),
    [leadPost]
  );

  const isBrowsingEverything = activeCategory === "all" && !searchQuery.trim();

  const heroAuthor = authors.find((a) => a.id === leadPost.authorId);

  // ---------- Helpers ----------
  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    if (catId === "all") {
      setSearchParams(searchQuery ? { q: searchQuery } : {});
    } else {
      setSearchParams({ category: catId });
    }
  };

  const handleSearch = () => {
    const next = {};
    if (searchQuery.trim()) next.q = searchQuery.trim();
    if (activeCategory !== "all") next.category = activeCategory;
    setSearchParams(next);
  };

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <Navbar />

      {/* ============================================================
          HERO — Editorial masthead
      ============================================================ */}
      <section className="relative pt-28 md:pt-32 pb-20 md:pb-24 overflow-hidden bg-[#0a1f1f]">
        {/* Background image, subtle */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1800&h=1000&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-[0.22]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f1f]/60 via-[#0a1f1f]/80 to-[#0a1f1f]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c2bf] animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-white/80">
                Updated weekly · Medically reviewed
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.05] mb-5">
              Health, explained
              <br />
              <span className="text-[#00c2bf]">by the people who practice it.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
              Clinician-written articles on heart health, nutrition, mental
              wellness, and public health — no clickbait, no miracle cures.
              Just evidence, in plain language.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative group">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00c2bf] transition-colors" />
                <input
                  type="text"
                  placeholder="Search hypertension, anxiety, sleep..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-13 pr-28 py-4 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00c2bf]/60 focus:border-transparent text-sm sm:text-base transition-all"
                  style={{ paddingLeft: "3.25rem" }}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#00c2bf] hover:bg-[#00a3a1] text-[#062222] px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap mt-4 text-xs text-white/50">
                <span>Trending:</span>
                {["Hypertension", "Gut Health", "Anxiety", "Sleep"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSearchQuery(t);
                      setSearchParams({ q: t });
                    }}
                    className="hover:text-[#00c2bf] transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Soft bottom fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#fafaf7]" />
      </section>

      {/* ============================================================
          FEATURED — Editorial lead story + two secondary
      ============================================================ */}
      {isBrowsingEverything && (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 -mt-12 md:-mt-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* LEAD */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3 group"
            >
              <Link to={`/blog/${leadPost.slug}`} className="block">
                <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                    <img
                      src={leadPost.image}
                      alt={leadPost.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute top-5 left-5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-900 text-[11px] font-semibold rounded-full">
                        <FaCheckCircle className="text-emerald-500 text-[10px]" />
                        Medically Reviewed
                      </span>
                      <span className="inline-flex px-3 py-1.5 bg-[#00c2bf] text-[#062222] text-[11px] font-semibold rounded-full">
                        Editor's Pick
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-tight mb-3 group-hover:text-[#00c2bf] transition-colors duration-300 line-clamp-3">
                        {leadPost.title}
                      </h2>
                      <p className="text-white/80 text-sm leading-relaxed line-clamp-2 mb-5 hidden sm:block">
                        {leadPost.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-white/90">
                        <img
                          src={heroAuthor?.avatar}
                          alt={heroAuthor?.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                        />
                        <div className="text-xs sm:text-sm">
                          <p className="font-semibold leading-tight">
                            {heroAuthor?.name}
                          </p>
                          <p className="text-white/60 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <FaClock className="text-[9px]" />
                            {leadPost.readingTime} min read
                            <span className="text-white/30">·</span>
                            <FaEye className="text-[9px]" />
                            {leadPost.views?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>

            {/* SECONDARY (stacked) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {secondaryFeatured.map((post, i) => {
                const a = authors.find((x) => x.id === post.authorId);
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                    className="group flex-1"
                  >
                    <Link to={`/blog/${post.slug}`} className="block h-full">
                      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col sm:flex-row lg:flex-col">
                        <div className="relative sm:w-40 lg:w-full h-40 sm:h-auto lg:h-44 overflow-hidden flex-shrink-0">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <span className="text-[11px] font-semibold text-[#00a3a1] tracking-wide uppercase mb-2">
                            {categories.find((c) => c.id === post.categoryId)?.name}
                          </span>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug mb-3 group-hover:text-[#00a3a1] transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="mt-auto flex items-center gap-2 text-xs text-gray-500">
                            <img
                              src={a?.avatar}
                              alt={a?.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-medium text-gray-700">
                              {a?.name}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-[9px]" />
                              {post.readingTime} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          CATEGORY FILTER — Horizontal chips
      ============================================================ */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 md:pt-20">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#00a3a1] uppercase mb-2">
              Browse
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
              Explore by topic
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => handleCategoryClick("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === "all"
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All articles
          </button>
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {categories.length > 5 && (
            <button
              onClick={() => setShowAllCategories((s) => !s)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[#00a3a1] hover:bg-[#00a3a1]/5 transition-colors"
            >
              {showAllCategories ? "Show less" : `+${categories.length - 5} more`}
              <FaChevronDown
                className={`text-[10px] transition-transform ${
                  showAllCategories ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>
      </section>

      {/* ============================================================
          MAIN GRID + SIDEBAR
      ============================================================ */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* ---------- ARTICLES ---------- */}
          <div className="lg:col-span-8">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-gray-200/70">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">
                  {filteredPosts.length}
                </strong>{" "}
                {filteredPosts.length === 1 ? "article" : "articles"}
                {activeCategory !== "all" && (
                  <>
                    {" "}
                    in{" "}
                    <strong className="text-gray-900">
                      {categories.find((c) => c.id === activeCategory)?.name}
                    </strong>
                  </>
                )}
              </p>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00a3a1]/40 focus:border-[#00a3a1] cursor-pointer"
                  >
                    <option value="newest">Newest first</option>
                    <option value="popular">Most read</option>
                    <option value="liked">Most liked</option>
                  </select>
                  <FaChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none" />
                </div>

                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-[#00a3a1]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    aria-label="Grid view"
                  >
                    <FaThLarge className="text-sm" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-[#00a3a1]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    aria-label="List view"
                  >
                    <FaList className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid / List */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 sm:p-16 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
                  <FaSearch className="text-2xl text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nothing matched that search
                </h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                  Try a different keyword or explore a topic from the list above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchParams({});
                  }}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
                      : "space-y-5"
                  }
                >
                  {filteredPosts.slice(0, visibleCount).map((post, i) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.03 }}
                    >
                      <BlogCard
                        post={post}
                        index={i}
                        variant={viewMode === "list" ? "list" : "default"}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* Load More */}
            {visibleCount < filteredPosts.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-7 py-3.5 rounded-full font-semibold text-sm transition-colors shadow-sm"
                >
                  Load {Math.min(6, filteredPosts.length - visibleCount)} more
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            )}

            {/* ---------- PODCAST BLOCK ---------- */}
            {isBrowsingEverything && podcasts[0] && (
              <div className="mt-20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-[#00a3a1]/10 flex items-center justify-center">
                    <FaPodcast className="text-[#00a3a1] text-xs" />
                  </span>
                  <p className="text-xs font-semibold tracking-widest text-[#00a3a1] uppercase">
                    Listen
                  </p>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight mb-6">
                  This week on the podcast
                </h2>
                <PodcastEmbed podcast={podcasts[0]} />
              </div>
            )}

            {/* ---------- VIDEO BLOCK ---------- */}
            {isBrowsingEverything && videos[0] && (
              <div className="mt-20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-[#00a3a1]/10 flex items-center justify-center">
                    <FaPlay className="text-[#00a3a1] text-[10px]" />
                  </span>
                  <p className="text-xs font-semibold tracking-widest text-[#00a3a1] uppercase">
                    Watch
                  </p>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight mb-6">
                  From the video library
                </h2>
                <VideoEmbed video={videos[0]} />
              </div>
            )}
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar />
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;