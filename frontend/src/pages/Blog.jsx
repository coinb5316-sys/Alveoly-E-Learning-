// src/pages/Blog.jsx - EDITORIAL REDESIGN
import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaClock, FaEye, FaArrowLeft, FaArrowRight,
  FaThLarge, FaList, FaChevronDown, FaPodcast, FaPlay,
  FaTimes,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BlogCard from "../components/blog/BlogCard";
import BlogSidebar from "../components/blog/BlogSidebar";
import PodcastEmbed from "../components/blog/PodcastEmbed";
import VideoEmbed from "../components/blog/VideoEmbed";
import { posts, categories, authors, podcasts, videos } from "../data/blogData";

// ==================== HELPERS ====================

const Skeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse space-y-4">
        <div className="bg-stone-200 dark:bg-stone-800 rounded-lg aspect-[16/10]" />
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/4" />
        <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full" />
      </div>
    ))}
  </div>
);

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

// ==================== MAIN ====================

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [visibleCount, setVisibleCount] = useState(6);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    setActiveCategory(cat || "all");
    const q = searchParams.get("q");
    if (q !== null) setSearchQuery(q);
    // Scroll to top when filters change
    window.scrollTo({ top: 0, behavior: "instant" });
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

  // Featured: 1 lead + up to 2 secondary
  const leadPost = useMemo(
    () => posts.find((p) => p.featured && p.editorsPick) || posts[0],
    []
  );
  const secondaryFeatured = useMemo(
    () => posts.filter((p) => p.featured && p.id !== leadPost.id).slice(0, 2),
    [leadPost]
  );

  const isBrowsingEverything = activeCategory === "all" && !searchQuery.trim();
  const heroAuthor = authors.find((a) => a.id === leadPost?.authorId);

  // ---------- Handlers ----------
  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    setSearchQuery("");
    setVisibleCount(6);
    if (catId === "all") setSearchParams({});
    else setSearchParams({ category: catId });
  };

  const submitSearch = (e) => {
    if (e) e.preventDefault();
    const next = {};
    if (searchQuery.trim()) next.q = searchQuery.trim();
    if (activeCategory !== "all") next.category = activeCategory;
    setSearchParams(next);
    setVisibleCount(6);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams(activeCategory !== "all" ? { category: activeCategory } : {});
    setVisibleCount(6);
  };

  const resetAll = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSearchParams({});
    setVisibleCount(6);
  };

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      {/* ============================================================
          MASTHEAD
      ============================================================ */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-5 pt-28 md:pt-32 pb-10 md:pb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4 text-center">
            The Alveoly Journal
          </p>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.08] mb-5 text-center max-w-3xl mx-auto">
            Health, explained by the people who practice it.
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed mb-8 text-center">
            Clinician-written essays on heart health, nutrition, mental wellness,
            and public health — evidence in plain language, no clickbait.
          </p>

          {/* Search */}
          <form onSubmit={submitSearch} className="relative max-w-xl mx-auto">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
            <input
              type="text"
              placeholder="Search hypertension, anxiety, sleep…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition text-[15px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-[86px] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition p-1"
                aria-label="Clear search"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Search
            </button>
          </form>

          {/* Trending terms */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
            <span className="text-xs uppercase tracking-wider">Trending</span>
            {["Hypertension", "Gut Health", "Anxiety", "Sleep"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSearchQuery(t);
                  setSearchParams({ q: t });
                }}
                className="hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700 hover:decoration-current"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ============================================================
          FEATURED STORIES (default view)
      ============================================================ */}
      {isBrowsingEverything && leadPost && (
        <section className="max-w-6xl mx-auto px-5 pt-12 md:pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* LEAD */}
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-3 group"
            >
              <Link to={`/blog/${leadPost.slug}`} className="block">
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={leadPost.image}
                    alt={leadPost.title}
                    className="w-full aspect-[16/10] object-cover group-hover:opacity-95 transition"
                  />
                </div>

                <div className="pt-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mb-3">
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      {categories.find((c) => c.id === leadPost.categoryId)?.name}
                    </span>
                    <span className="text-stone-300 dark:text-stone-700">·</span>
                    <time>{formatDate(leadPost.publishedAt)}</time>
                  </div>

                  <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-stone-900 dark:text-stone-50 mb-3 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                    {leadPost.title}
                  </h2>

                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3 mb-5">
                    {leadPost.excerpt}
                  </p>

                  <div className="flex items-center gap-3">
                    {heroAuthor?.avatar && (
                      <img
                        src={heroAuthor.avatar}
                        alt={heroAuthor.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-stone-900 dark:text-stone-100">
                        {heroAuthor?.name}
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <FaClock className="text-[9px]" />
                        {leadPost.readingTime} min
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <FaEye className="text-[9px]" />
                        {leadPost.views?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>

            {/* SECONDARY — stacked list */}
            <div className="lg:col-span-2 flex flex-col gap-8 lg:border-l lg:border-stone-200 lg:dark:border-stone-800 lg:pl-8">
              {secondaryFeatured.map((post, i) => {
                const a = authors.find((x) => x.id === post.authorId);
                const cat = categories.find((c) => c.id === post.categoryId);
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.08 + i * 0.06 }}
                    className="group"
                  >
                    <Link to={`/blog/${post.slug}`} className="block">
                      <div className="flex gap-4 items-start">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:opacity-95 transition"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
                            {cat?.name}
                          </p>
                          <h3 className="font-serif text-base sm:text-lg font-bold leading-snug text-stone-900 dark:text-stone-50 mb-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-xs text-stone-500 flex items-center gap-1.5">
                            {a?.name}
                            <span className="text-stone-300 dark:text-stone-700">·</span>
                            <FaClock className="text-[9px]" />
                            {post.readingTime} min
                          </p>
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
          DIVIDER — "Latest" / "All stories"
      ============================================================ */}
      <div className="max-w-6xl mx-auto px-5 pt-14 md:pt-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          <span className="text-xs uppercase tracking-widest text-stone-400">
            {isBrowsingEverything ? "Latest" : "Filtered"}
          </span>
          <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => handleCategoryClick("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === "all"
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "bg-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            All stories
          </button>
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat.id
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "bg-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {categories.length > 5 && (
            <button
              onClick={() => setShowAllCategories((s) => !s)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
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
      </div>

      {/* ============================================================
          MAIN GRID + SIDEBAR
      ============================================================ */}
      <section className="max-w-6xl mx-auto px-5 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* ---------- ARTICLES ---------- */}
          <div className="lg:col-span-8 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200 dark:border-stone-800">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {filteredPosts.length}
                </strong>{" "}
                {filteredPosts.length === 1 ? "story" : "stories"}
                {activeCategory !== "all" && (
                  <>
                    {" "}
                    in{" "}
                    <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                      {categories.find((c) => c.id === activeCategory)?.name}
                    </strong>
                  </>
                )}
                {searchQuery && (
                  <>
                    {" "}
                    matching{" "}
                    <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                      "{searchQuery}"
                    </strong>
                  </>
                )}
              </p>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm bg-transparent border-none text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most read</option>
                  <option value="liked">Most liked</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition ${
                      viewMode === "grid"
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    }`}
                    aria-label="Grid view"
                  >
                    <FaThLarge className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition ${
                      viewMode === "list"
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    }`}
                    aria-label="List view"
                  >
                    <FaList className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid / List */}
            {loading ? (
              <Skeleton />
            ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center max-w-md mx-auto">
                <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                  Nothing matched that search
                </p>
                <p className="text-stone-500 dark:text-stone-400 mb-6">
                  Try a different keyword or explore a topic from the list above.
                </p>
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
                >
                  <FaArrowLeft className="text-xs" />
                  Reset filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12"
                      : "space-y-10"
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

            {/* Load more */}
            {visibleCount < filteredPosts.length && (
              <div className="text-center mt-14">
                <button
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-full text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition"
                >
                  Load {Math.min(6, filteredPosts.length - visibleCount)} more
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            )}

            {/* ---------- PODCAST BLOCK ---------- */}
            {isBrowsingEverything && podcasts[0] && (
              <div className="mt-20 pt-12 border-t border-stone-200 dark:border-stone-800">
                <p className="text-xs font-semibold tracking-widest text-rose-600 dark:text-rose-400 uppercase mb-3 flex items-center gap-2">
                  <FaPodcast className="text-xs" />
                  Listen
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-6">
                  This week on the podcast
                </h2>
                <PodcastEmbed podcast={podcasts[0]} />
              </div>
            )}

            {/* ---------- VIDEO BLOCK ---------- */}
            {isBrowsingEverything && videos[0] && (
              <div className="mt-20 pt-12 border-t border-stone-200 dark:border-stone-800">
                <p className="text-xs font-semibold tracking-widest text-rose-600 dark:text-rose-400 uppercase mb-3 flex items-center gap-2">
                  <FaPlay className="text-[10px]" />
                  Watch
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-6">
                  From the video library
                </h2>
                <VideoEmbed video={videos[0]} />
              </div>
            )}
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar />
            </div>
          </aside>
        </div>
      </section>

      {/* ============================================================
          NEWSLETTER
      ============================================================ */}
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Letter
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-4 leading-tight">
            A weekly letter on health and clinical practice.
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
            Original reporting, clinical insight, and thoughtful essays — no noise, no miracle cures.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // wire up to your newsletter endpoint later
            }}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-stone-400 mt-4">
            Unsubscribe anytime. We never share your email.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;