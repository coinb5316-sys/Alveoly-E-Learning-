// src/pages/Blog.jsx — THE ALVEOLY JOURNAL
// Standalone editorial blog. Mock data. No blogAPI.
// Nav links to /blog/* routes you're building next. Fallback = 404 (expected).
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaClock, FaEye, FaHeart, FaTimes,
  FaArrowLeft, FaArrowRight, FaHome, FaTwitter, FaLinkedin, FaEnvelope,
  FaShareAlt, FaBookmark, FaRegBookmark, FaPlay, FaPodcast,
  FaChevronDown, FaCheckCircle, FaTag, FaArrowUp, FaInstagram,
  FaYoutube, FaGlobe, FaRss, FaNewspaper, FaMicrophone, FaVideo,
  FaArchive, FaStream, FaBookOpen, FaEnvelopeOpenText,
} from "react-icons/fa";
import {
  posts as allPosts,
  categories,
  authors,
  podcasts,
  videos,
} from "../data/blogData";

/* ============================================================
   UTILITIES
============================================================ */

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

const formatShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/* ============================================================
   PRIMITIVES
============================================================ */

const Avatar = ({ author, size = "md" }) => {
  const [broken, setBroken] = useState(false);
  const cls =
    size === "sm"
      ? "w-6 h-6 text-[10px]"
      : size === "lg"
      ? "w-16 h-16 text-lg"
      : size === "xl"
      ? "w-20 h-20 text-xl"
      : "w-9 h-9 text-xs";
  if (!author) return null;
  if (author.avatar && !broken) {
    return (
      <img
        src={author.avatar}
        alt={author.name}
        onError={() => setBroken(true)}
        className={`${cls} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${cls} rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center font-medium flex-shrink-0`}
    >
      {initials(author.name)}
    </div>
  );
};

const PostMeta = ({ post, category, compact = false }) => (
  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-500">
    {category && (
      <>
        <Link
          to={`/blog/category/${category.slug || slugify(category.name)}`}
          className="uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold hover:underline"
        >
          {category.name}
        </Link>
        <span className="text-stone-300 dark:text-stone-700">·</span>
      </>
    )}
    <time>{formatShortDate(post.publishedAt)}</time>
    {!compact && (
      <>
        <span className="text-stone-300 dark:text-stone-700">·</span>
        <span className="flex items-center gap-1.5">
          <FaClock className="text-[9px]" />
          {post.readingTime} min
        </span>
      </>
    )}
  </div>
);

const SectionLabel = ({ icon: Icon, children }) => (
  <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
    {Icon && <Icon className="text-xs" />}
    {children}
  </p>
);

const TopicPill = ({ tag, count }) => (
  <Link
    to={`/blog/tag/${slugify(tag)}`}
    className="inline-flex items-baseline gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
  >
    <span>#{tag}</span>
    {count != null && (
      <span className="text-[10px] text-stone-400">{count}</span>
    )}
  </Link>
);

/* ============================================================
   PRIMARY NAVIGATION
============================================================ */

const BlogNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/blog", label: "Home", icon: FaHome, exact: true },
    { to: "/blog/archive", label: "Archive", icon: FaArchive },
    { to: "/blog/podcasts", label: "Podcasts", icon: FaMicrophone },
    { to: "/blog/videos", label: "Videos", icon: FaVideo },
    { to: "/blog/search", label: "Search", icon: FaSearch },
    { to: "/sitemap", label: "Sitemap", icon: FaStream },
  ];

  return (
    <nav className="border-b border-stone-200 dark:border-stone-800 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition text-sm flex items-center gap-2"
              title="Back to homepage"
            >
              <FaHome className="text-xs" />
              <span className="hidden sm:inline">Alveoly</span>
            </Link>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <Link
              to="/blog"
              className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-50"
            >
              The Journal
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-full text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/blog/search"
              className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
              title="Search"
            >
              <FaSearch className="text-xs" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
          >
            Menu
            <FaChevronDown
              className={`text-[10px] transition-transform ${
                mobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-stone-200 dark:border-stone-800"
            >
              <div className="py-3 flex flex-col">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-2 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition flex items-center gap-3"
                  >
                    {l.icon && <l.icon className="text-xs text-stone-400" />}
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

/* ============================================================
   LIST VIEW — the /blog index
============================================================ */

const BlogIndex = ({ onOpenPost }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [showAllCategories, setShowAllCategories] = useState(false);

  /* ------------------ Derived data ------------------ */
  const filteredPosts = useMemo(() => {
    let list = [...allPosts];
    if (activeCategory !== "all") {
      list = list.filter((p) => p.categoryId === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (authors.find((a) => a.id === p.authorId)?.name || "")
            .toLowerCase()
            .includes(q)
      );
    }
    if (sortBy === "newest")
      list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    else if (sortBy === "popular") list.sort((a, b) => b.views - a.views);
    else if (sortBy === "liked") list.sort((a, b) => b.likes - a.likes);
    return list;
  }, [activeCategory, sortBy, searchQuery]);

  const leadPost = useMemo(
    () =>
      allPosts.find((p) => p.featured && p.editorsPick) ||
      allPosts.find((p) => p.featured) ||
      allPosts[0],
    []
  );

  const secondaryFeatured = useMemo(
    () =>
      allPosts.filter((p) => p.featured && p.id !== leadPost.id).slice(0, 2),
    [leadPost]
  );

  const longReads = useMemo(
    () =>
      [...allPosts]
        .sort((a, b) => b.readingTime - a.readingTime)
        .slice(0, 3),
    []
  );

  const startHere = useMemo(
    () =>
      allPosts
        .filter((p) => p.medicallyReviewed && p.editorsPick)
        .slice(0, 3),
    []
  );

  const isBrowsingEverything =
    activeCategory === "all" && !searchQuery.trim();

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  const trendingTags = useMemo(() => {
    const map = new Map();
    allPosts.forEach((p) =>
      (p.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    );
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([name, count]) => ({ name, count }));
  }, []);

  const resetAll = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSortBy("newest");
    setVisibleCount(6);
  };

  return (
    <div className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* ---------- MASTHEAD ---------- */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-20 pb-10 md:pb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Journal
          </p>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.08] mb-5 max-w-3xl mx-auto">
            Health, explained by the people who practice it.
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Clinician-written essays on heart health, nutrition, mental
            wellness, and public health — evidence in plain language, no
            clickbait.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative max-w-xl mx-auto"
          >
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
            <input
              type="text"
              placeholder="Search hypertension, anxiety, sleep…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6);
              }}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition text-[15px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                aria-label="Clear search"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </form>

          {/* Trending */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
            <span className="text-xs uppercase tracking-wider">Trending</span>
            {["Hypertension", "Gut Health", "Anxiety", "Sleep"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSearchQuery(t);
                  setVisibleCount(6);
                }}
                className="hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700 hover:decoration-current"
              >
                {t}
              </button>
            ))}
          </div>

          {/* Editorial promise line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500 dark:text-stone-500">
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-600 dark:text-emerald-400" />
              Every article medically reviewed
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <FaBookOpen className="text-stone-400" />
              Written by practicing clinicians
            </span>
            <span className="flex items-center gap-2">
              <FaEnvelopeOpenText className="text-stone-400" />
              No sponsored content
            </span>
          </div>
        </div>
      </header>

      {/* ---------- FEATURED ---------- */}
      {isBrowsingEverything && leadPost && (
        <section className="max-w-6xl mx-auto px-5 pt-12 md:pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Lead */}
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-3 group cursor-pointer"
              onClick={() => onOpenPost(leadPost)}
            >
              <div className="overflow-hidden rounded-lg">
                <img
                  src={leadPost.image}
                  alt={leadPost.title}
                  className="w-full aspect-[16/10] object-cover group-hover:opacity-95 transition"
                />
              </div>
              <div className="pt-6">
                <PostMeta
                  post={leadPost}
                  category={categories.find(
                    (c) => c.id === leadPost.categoryId
                  )}
                />
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-stone-900 dark:text-stone-50 mt-3 mb-3 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                  {leadPost.title}
                </h2>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3 mb-5">
                  {leadPost.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <Avatar
                    author={authors.find((a) => a.id === leadPost.authorId)}
                  />
                  <div className="text-sm">
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {authors.find((a) => a.id === leadPost.authorId)?.name}
                    </p>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <FaEye className="text-[9px]" />
                      {leadPost.views.toLocaleString()} reads
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Secondary */}
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
                    className="group cursor-pointer"
                    onClick={() => onOpenPost(post)}
                  >
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
                          <span className="text-stone-300 dark:text-stone-700">
                            ·
                          </span>
                          <FaClock className="text-[9px]" />
                          {post.readingTime} min
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------- START HERE ---------- */}
      {isBrowsingEverything && startHere.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 pt-16 md:pt-20">
          <div className="border-t border-stone-200 dark:border-stone-800 pt-10">
            <SectionLabel icon={FaBookOpen}>Start here</SectionLabel>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              New to the journal?
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
              Three pieces our editors recommend first — reviewed for accuracy,
              written for everyday readers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {startHere.map((post) => {
                const a = authors.find((x) => x.id === post.authorId);
                const cat = categories.find((c) => c.id === post.categoryId);
                return (
                  <motion.button
                    key={post.id}
                    onClick={() => onOpenPost(post)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-left group"
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:opacity-95 transition"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-2">
                      {cat?.name}
                    </p>
                    <h3 className="font-serif text-lg font-bold leading-snug text-stone-900 dark:text-stone-50 mb-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {a?.name} · {post.readingTime} min
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------- DIVIDER + CATEGORIES ---------- */}
      <div className="max-w-6xl mx-auto px-5 pt-14 md:pt-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          <span className="text-xs uppercase tracking-widest text-stone-400">
            {isBrowsingEverything ? "Latest" : "Filtered"}
          </span>
          <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => {
              setActiveCategory("all");
              setVisibleCount(6);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === "all"
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            All stories
          </button>
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setVisibleCount(6);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat.id
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
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

      {/* ---------- GRID ---------- */}
      <section className="max-w-6xl mx-auto px-5 py-10 md:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            <strong className="text-stone-900 dark:text-stone-100 font-semibold">
              {filteredPosts.length}
            </strong>{" "}
            {filteredPosts.length === 1 ? "story" : "stories"}
            {activeCategory !== "all" && (
              <>
                {" in "}
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {categories.find((c) => c.id === activeCategory)?.name}
                </strong>
              </>
            )}
            {searchQuery && (
              <>
                {" matching "}
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  "{searchQuery}"
                </strong>
              </>
            )}
          </p>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-transparent border-none text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most read</option>
            <option value="liked">Most liked</option>
          </select>
        </div>

        {filteredPosts.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredPosts.slice(0, visibleCount).map((post, i) => {
                const a = authors.find((x) => x.id === post.authorId);
                const cat = categories.find((c) => c.id === post.categoryId);
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(i * 0.04, 0.4),
                    }}
                    className="group cursor-pointer"
                    onClick={() => onOpenPost(post)}
                  >
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full aspect-[16/10] object-cover rounded-md group-hover:opacity-95 transition"
                      />
                    ) : (
                      <div className="w-full aspect-[16/10] rounded-md bg-stone-100 dark:bg-stone-900" />
                    )}
                    <div className="pt-5">
                      <PostMeta post={post} category={cat} />
                      <h3 className="font-serif text-xl font-bold leading-snug text-stone-900 dark:text-stone-50 mt-3 mb-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2.5">
                        <Avatar author={a} size="sm" />
                        <div className="text-xs">
                          <p className="font-medium text-stone-800 dark:text-stone-200">
                            {a?.name}
                          </p>
                          <p className="text-stone-500 flex items-center gap-1.5">
                            <FaEye className="text-[9px]" />
                            {post.views.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

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
          </>
        )}
      </section>

      {/* ---------- LONG READS ---------- */}
      {isBrowsingEverything && longReads.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-14">
            <SectionLabel icon={FaBookOpen}>Long reads</SectionLabel>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-8">
              For when you have time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {longReads.map((post, i) => {
                const a = authors.find((x) => x.id === post.authorId);
                const cat = categories.find((c) => c.id === post.categoryId);
                return (
                  <motion.button
                    key={post.id}
                    onClick={() => onOpenPost(post)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="text-left group"
                  >
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="font-serif text-3xl text-stone-300 dark:text-stone-700">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-stone-500">
                        {post.readingTime} min read
                      </span>
                    </div>
                    <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-2">
                      {cat?.name}
                    </p>
                    <h3 className="font-serif text-xl font-bold leading-snug text-stone-900 dark:text-stone-50 mb-3 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                      {post.title}
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <p className="text-xs text-stone-500">{a?.name}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------- MEET THE DESK ---------- */}
      {isBrowsingEverything && authors.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-14">
            <SectionLabel icon={FaBookOpen}>The desk</SectionLabel>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              Meet the people behind the journal
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
              Every article is written or reviewed by a practicing clinician.
              These are the editors who sign off on what you read.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {authors.slice(0, 6).map((a) => (
                <Link
                  key={a.id}
                  to={`/blog/author/${a.id}`}
                  className="group flex items-start gap-4 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
                >
                  <Avatar author={a} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                      {a.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">{a.role}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">
                      {a.bio}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- BROWSE BY TOPIC ---------- */}
      <section className="max-w-6xl mx-auto px-5 pb-16 pt-14 border-t border-stone-200 dark:border-stone-800">
        <SectionLabel icon={FaTag}>Browse by topic</SectionLabel>
        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">
          Every subject we cover
        </h2>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map(({ name, count }) => (
            <TopicPill key={name} tag={name} count={count} />
          ))}
        </div>
      </section>

      {/* ---------- PODCAST + VIDEO ---------- */}
      {isBrowsingEverything && (podcasts[0] || videos[0]) && (
        <section className="max-w-6xl mx-auto px-5 pb-16 border-t border-stone-200 dark:border-stone-800 pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {podcasts[0] && (
              <div>
                <SectionLabel icon={FaPodcast}>Listen</SectionLabel>
                <div className="flex items-end justify-between mb-6 gap-4">
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                    This week on the podcast
                  </h2>
                  <Link
                    to="/blog/podcasts"
                    className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition whitespace-nowrap"
                  >
                    All episodes →
                  </Link>
                </div>
                <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={podcasts[0].image}
                      alt={podcasts[0].title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-stone-500 mb-1">
                        Episode {podcasts[0].episodeNumber} ·{" "}
                        {podcasts[0].duration}
                      </p>
                      <h3 className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-100 line-clamp-2">
                        {podcasts[0].title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2">
                    {podcasts[0].description}
                  </p>
                  <audio
                    controls
                    src={podcasts[0].audioUrl}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {videos[0] && (
              <div>
                <SectionLabel icon={FaPlay}>Watch</SectionLabel>
                <div className="flex items-end justify-between mb-6 gap-4">
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                    From the video library
                  </h2>
                  <Link
                    to="/blog/videos"
                    className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition whitespace-nowrap"
                  >
                    All videos →
                  </Link>
                </div>
                <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
                  <div className="aspect-video bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${videos[0].youtubeId}`}
                      title={videos[0].title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-5 bg-white dark:bg-stone-900">
                    <h3 className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-100 mb-1 line-clamp-2">
                      {videos[0].title}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {videos[0].duration} · {videos[0].category}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

/* ============================================================
   POST VIEW — the detail "page" (rendered inline, same route)
============================================================ */

const BlogPostView = ({ post, onOpen, onBack }) => {
  const author = authors.find((a) => a.id === post.authorId);
  const category = categories.find((c) => c.id === post.categoryId);
  const reviewedBy = post.reviewedBy
    ? authors.find((a) => a.id === post.reviewedBy)
    : null;
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const contentRef = useRef(null);

  const relatedPosts = useMemo(
    () =>
      allPosts
        .filter((p) => p.id !== post.id && p.categoryId === post.categoryId)
        .slice(0, 3),
    [post.id, post.categoryId]
  );

  const relatedCategories = useMemo(
    () => categories.filter((c) => c.id !== post.categoryId).slice(0, 6),
    [post.categoryId]
  );

  const relatedTags = useMemo(() => {
    const own = new Set(post.tags || []);
    const map = new Map();
    allPosts.forEach((p) =>
      (p.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    );
    return [...map.entries()]
      .filter(([t]) => !own.has(t))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [post.id, post.tags]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [post.id]);

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <article className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* ---------- STICKY TOP BAR ---------- */}
      <div className="sticky top-16 z-30 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800/70">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-stone-300 dark:border-stone-700 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-900 hover:text-white transition"
            >
              <FaHome className="text-xs" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
            >
              <FaArrowLeft className="text-xs" />
              <span className="hidden sm:inline">All stories</span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-stone-500 dark:text-stone-400">
            <button
              onClick={() => setLiked((l) => !l)}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                liked ? "text-rose-600" : "hover:text-rose-600"
              }`}
            >
              <FaHeart />
              <span className="hidden sm:inline">
                {(post.likes + (liked ? 1 : 0)).toLocaleString()}
              </span>
            </button>
            <button
              onClick={() => setBookmarked((b) => !b)}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                bookmarked ? "text-amber-600" : "hover:text-amber-600"
              }`}
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>
            <button
              onClick={share}
              className="inline-flex items-center gap-1.5 text-sm hover:text-stone-900 dark:hover:text-stone-100 transition"
            >
              <FaShareAlt className="text-xs" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------- HEADER ---------- */}
      <header className="max-w-3xl mx-auto px-5 pt-12 md:pt-20 pb-6">
        <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400 mb-6">
          {category && (
            <>
              <Link
                to={`/blog/category/${category.slug || slugify(category.name)}`}
                className="uppercase tracking-wider text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                {category.name}
              </Link>
              <span className="text-stone-300 dark:text-stone-700">·</span>
            </>
          )}
          <time>{formatDate(post.publishedAt)}</time>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-stone-900 dark:text-stone-50 mb-6">
          {post.title}
        </h1>

        <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 leading-relaxed mb-8 font-light">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <Avatar author={author} size="md" />
            <div className="text-sm">
              <p className="font-medium text-stone-900 dark:text-stone-100">
                {author?.name}
              </p>
              <p className="text-xs text-stone-500 flex items-center flex-wrap gap-x-1.5">
                {author?.role}
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <FaClock className="text-[9px]" />
                {post.readingTime} min
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <FaEye className="text-[9px]" />
                {post.views.toLocaleString()}
              </p>
            </div>
          </div>

          {post.medicallyReviewed && reviewedBy && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full">
              <FaCheckCircle className="text-[11px]" />
              Medically reviewed by {reviewedBy.name}
            </div>
          )}
        </div>
      </header>

      {/* ---------- FEATURED IMAGE ---------- */}
      {post.image && (
        <div className="max-w-5xl mx-auto px-5 mb-12">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* ---------- CONTENT ---------- */}
      <div className="max-w-3xl mx-auto px-5 pb-12">
        <div
          ref={contentRef}
          className="prose-editorial text-[17px] sm:text-[19px]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags?.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mr-1">
              Tagged
            </span>
            {post.tags.map((tag) => (
              <TopicPill key={tag} tag={tag} />
            ))}
          </div>
        )}

        <div className="my-14 flex items-center justify-center gap-4">
          <span className="w-12 h-px bg-stone-300 dark:bg-stone-700" />
          <span className="text-stone-400 dark:text-stone-600 text-xs tracking-widest">
            ◆
          </span>
          <span className="w-12 h-px bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* AUTHOR CARD */}
        {author && (
          <div className="p-6 md:p-8 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-start gap-5">
              <Avatar author={author} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                  Written by
                </p>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  {author.name}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                  {author.role} · {author.credentials}
                </p>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                  {author.bio}
                </p>

                {author.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {author.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4 text-stone-400">
                  {author.social?.twitter && (
                    <a
                      href={author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-sky-500 transition"
                    >
                      <FaTwitter />
                    </a>
                  )}
                  {author.social?.linkedin && (
                    <a
                      href={author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition"
                    >
                      <FaLinkedin />
                    </a>
                  )}
                  {author.social?.instagram && (
                    <a
                      href={author.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-pink-500 transition"
                    >
                      <FaInstagram />
                    </a>
                  )}
                  {author.social?.email && (
                    <a
                      href={`mailto:${author.social.email}`}
                      className="hover:text-rose-500 transition"
                    >
                      <FaEnvelope />
                    </a>
                  )}
                  <Link
                    to={`/blog/author/${author.id}`}
                    className="ml-1 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4"
                  >
                    All articles →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RELATED POSTS */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
            <SectionLabel>Keep reading</SectionLabel>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              More in {category?.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((r) => {
                const ra = authors.find((x) => x.id === r.authorId);
                const rc = categories.find((c) => c.id === r.categoryId);
                return (
                  <button
                    key={r.id}
                    onClick={() => onOpen(r)}
                    className="text-left group"
                  >
                    {r.image && (
                      <img
                        src={r.image}
                        alt={r.title}
                        className="w-full aspect-[16/10] object-cover rounded-md mb-3 group-hover:opacity-95 transition"
                      />
                    )}
                    <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
                      {rc?.name}
                    </p>
                    <h4 className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2 mb-2">
                      {r.title}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {ra?.name} · {r.readingTime} min
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* OTHER CATEGORIES */}
        {relatedCategories.length > 0 && (
          <div className="mt-14 pt-10 border-t border-stone-200 dark:border-stone-800">
            <SectionLabel>Explore</SectionLabel>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              Other topics in the journal
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedCategories.map((c) => (
                <Link
                  key={c.id}
                  to={`/blog/category/${c.slug || slugify(c.name)}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* RELATED TAGS */}
        {relatedTags.length > 0 && (
          <div className="mt-14 pt-10 border-t border-stone-200 dark:border-stone-800">
            <SectionLabel icon={FaTag}>Related topics</SectionLabel>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              Tags from across the journal
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map(({ name, count }) => (
                <TopicPill key={name} tag={name} count={count} />
              ))}
            </div>
          </div>
        )}

        {/* BACK TO TOP */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100 transition"
          >
            <FaArrowUp className="text-xs" />
            Back to top
          </button>
        </div>
      </div>
    </article>
  );
};

/* ============================================================
   NEWSLETTER (shared block)
============================================================ */

const JournalNewsletter = () => (
  <section className="border-t border-stone-200 dark:border-stone-800">
    <div className="max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
        The Alveoly Letter
      </p>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-4 leading-tight">
        A weekly letter on health and clinical practice.
      </h2>
      <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
        Original reporting, clinical insight, and thoughtful essays — no noise,
        no miracle cures.
      </p>
      <form
        onSubmit={(e) => e.preventDefault()}
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
);

/* ============================================================
   FOOTER
============================================================ */

const JournalFooter = () => {
  const policyLinks = [
    { to: "/editorial-policy", label: "Editorial Policy" },
    { to: "/medical-review-policy", label: "Medical Review Policy" },
    { to: "/advertising-policy", label: "Advertising Policy" },
  ];

  const contentLinks = [
    { to: "/blog", label: "All articles" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts" },
    { to: "/blog/videos", label: "Videos" },
    { to: "/blog/search", label: "Search" },
    { to: "/sitemap", label: "Sitemap" },
  ];

  const socials = [
    { icon: FaTwitter, href: "https://twitter.com/alveoly", label: "Twitter" },
    { icon: FaInstagram, href: "https://instagram.com/alveoly", label: "Instagram" },
    { icon: FaYoutube, href: "https://youtube.com/@alveoly", label: "YouTube" },
    { icon: FaLinkedin, href: "https://linkedin.com/company/alveoly", label: "LinkedIn" },
    { icon: FaRss, href: "/blog/rss", label: "RSS" },
  ];

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              to="/blog"
              className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50"
            >
              The Alveoly Journal
            </Link>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-4 max-w-sm leading-relaxed">
              A clinician-written publication on heart health, nutrition,
              mental wellness, and public health. Evidence in plain language,
              reviewed for accuracy, free of clickbait.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
              Content
            </p>
            <ul className="space-y-2.5">
              {contentLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
              Trust
            </p>
            <ul className="space-y-2.5">
              {policyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/"
                  className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  Back to Alveoly
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-500">
          <p>© {new Date().getFullYear()} Alveoly. All rights reserved.</p>
          <p className="italic">
            The content is educational only and not a substitute for medical
            advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ============================================================
   ROOT — /blog
============================================================ */

const Blog = () => {
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [openPost?.id]);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950">
      <BlogNav />

      <AnimatePresence mode="wait">
        {openPost ? (
          <motion.div
            key={`post-${openPost.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <BlogPostView
              post={openPost}
              onOpen={(next) => setOpenPost(next)}
              onBack={() => setOpenPost(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="index"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <BlogIndex onOpenPost={setOpenPost} />
          </motion.div>
        )}
      </AnimatePresence>

      <JournalNewsletter />
      <JournalFooter />
    </div>
  );
};

export default Blog;