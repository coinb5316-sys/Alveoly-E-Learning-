// src/pages/Blog.jsx — WIRED TO LIVE API
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaClock, FaEye, FaTimes,
  FaArrowLeft, FaArrowRight, FaHome, FaTwitter, FaLinkedin,
  FaShareAlt, FaBookmark, FaRegBookmark, FaPlay, FaPodcast,
  FaChevronDown, FaCheckCircle, FaTag, FaInstagram, FaYoutube,
  FaGlobe, FaRss, FaMicrophone, FaVideo, FaArchive, FaStream,
  FaBookOpen, FaEnvelopeOpenText,
} from "react-icons/fa";
import { publicBlogAPI as blogAPI } from "../api/blogApi";

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

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

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

const PostMeta = ({ post, category }) => (
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
    <span className="text-stone-300 dark:text-stone-700">·</span>
    <span className="flex items-center gap-1.5">
      <FaClock className="text-[9px]" />
      {post.readingTime || 5} min
    </span>
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
    {count != null && <span className="text-[10px] text-stone-400">{count}</span>}
  </Link>
);

/* ============================================================
   NAVIGATION
============================================================ */

const BlogNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: "/blog", label: "Home" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts" },
    { to: "/blog/videos", label: "Videos" },
    { to: "/blog/search", label: "Search" },
    { to: "/sitemap", label: "Sitemap" },
  ];

  return (
    <nav className="border-b border-stone-200 dark:border-stone-800 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition text-sm flex items-center gap-2"
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
            >
              <FaSearch className="text-xs" />
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
          >
            Menu
            <FaChevronDown
              className={`text-[10px] transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

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
                    className="px-2 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
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
   MAIN INDEX
============================================================ */

const BlogIndex = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const params = { page: 1, limit: 50, publishedOnly: true, sort: sortBy };
        if (activeCategory !== "all") params.category = activeCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const [postsRes, categoriesRes, podcastsRes, videosRes] = await Promise.all([
          blogAPI.getPosts(params),
          blogAPI.getCategories(),
          blogAPI.getPodcasts(),
          blogAPI.getVideos(),
        ]);

        if (postsRes.success) {
          const data = postsRes.data;
          setPosts(
            (data.posts || []).map((p) => ({
              ...p,
              id: p._id,
              author: p.author || p.authorId,
              category: p.categoryId?.name || p.category,
            }))
          );
          setFeaturedPost(
            data.featuredPost
              ? {
                  ...data.featuredPost,
                  id: data.featuredPost._id,
                  author: data.featuredPost.author || data.featuredPost.authorId,
                  category: data.featuredPost.categoryId?.name || data.featuredPost.category,
                }
              : null
          );
          setTrendingTags(data.trendingTags || []);
        }

        if (categoriesRes.success) {
          setCategories((categoriesRes.data || []).map((c) => ({ ...c, id: c._id })));
        }
        if (podcastsRes.success) setPodcasts(podcastsRes.data || []);
        if (videosRes.success) setVideos(videosRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeCategory, sortBy, searchQuery]);

  const isBrowsingEverything = activeCategory === "all" && !searchQuery.trim();

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  const resetAll = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  /* ---------- Loading skeleton ---------- */
  if (loading && posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-20 text-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500">Loading the journal…</p>
      </div>
    );
  }

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
            Clinician-written essays on heart health, nutrition, mental wellness,
            and public health — evidence in plain language, no clickbait.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative max-w-xl mx-auto"
          >
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
            <input
              type="text"
              placeholder="Search hypertension, anxiety, sleep…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition text-[15px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
            <span className="text-xs uppercase tracking-wider">Trending</span>
            {["Hypertension", "Gut Health", "Anxiety", "Sleep"].map((t) => (
              <button
                key={t}
                onClick={() => setSearchQuery(t)}
                className="hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700 hover:decoration-current"
              >
                {t}
              </button>
            ))}
          </div>

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
      {isBrowsingEverything && featuredPost && (
        <section className="max-w-6xl mx-auto px-5 pt-12 md:pt-16">
          <Link
            to={`/blog/post/${featuredPost.slug || featuredPost._id}`}
            className="group block"
          >
            <div className="overflow-hidden rounded-lg">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full aspect-[16/9] object-cover group-hover:opacity-95 transition"
              />
            </div>
            <div className="pt-6 max-w-4xl">
              <PostMeta
                post={featuredPost}
                category={
                  featuredPost.category
                    ? { name: featuredPost.category, slug: slugify(featuredPost.category) }
                    : null
                }
              />
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-stone-900 dark:text-stone-50 mt-3 mb-4 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                {featuredPost.title}
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3 mb-5">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-3">
                <Avatar author={featuredPost.author} />
                <div className="text-sm">
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {featuredPost.author?.name}
                  </p>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                    <FaEye className="text-[9px]" />
                    {(featuredPost.views || 0).toLocaleString()} reads
                  </p>
                </div>
              </div>
            </div>
          </Link>
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
            onClick={() => setActiveCategory("all")}
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
              onClick={() => setActiveCategory(cat.slug || cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === (cat.slug || cat.id)
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
                className={`text-[10px] transition-transform ${showAllCategories ? "rotate-180" : ""}`}
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
              {posts.length}
            </strong>{" "}
            {posts.length === 1 ? "story" : "stories"}
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

        {posts.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map((post, i) => {
              const cat = post.category
                ? { name: post.category, slug: slugify(post.category) }
                : null;
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
                  className="group"
                >
                  <Link to={`/blog/post/${post.slug || post.id}`}>
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
                        <Avatar author={post.author} size="sm" />
                        <div className="text-xs">
                          <p className="font-medium text-stone-800 dark:text-stone-200">
                            {post.author?.name}
                          </p>
                          <p className="text-stone-500 flex items-center gap-1.5">
                            <FaEye className="text-[9px]" />
                            {(post.views || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- BROWSE BY TOPIC ---------- */}
      {trendingTags.length > 0 && (
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
      )}

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
                        Episode {podcasts[0].episodeNumber} · {podcasts[0].duration}
                      </p>
                      <h3 className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-100 line-clamp-2">
                        {podcasts[0].title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2">
                    {podcasts[0].description}
                  </p>
                  <audio controls src={podcasts[0].audioUrl} className="w-full" />
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
   NEWSLETTER
============================================================ */

const JournalNewsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await blogAPI.subscribe({ email: email.trim(), source: "footer" });
      setSubscribed(true);
      setEmail("");
    } catch {
      /* show nothing — keep UX clean */
    } finally {
      setLoading(false);
    }
  };

  return (
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
        {subscribed ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            You're on the list. Watch your inbox.
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
        <p className="text-xs text-stone-400 mt-4">
          Unsubscribe anytime. We never share your email.
        </p>
      </div>
    </section>
  );
};

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
          <div className="md:col-span-2">
            <Link
              to="/blog"
              className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50"
            >
              The Alveoly Journal
            </Link>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-4 max-w-sm leading-relaxed">
              A clinician-written publication on heart health, nutrition, mental
              wellness, and public health. Evidence in plain language, reviewed
              for accuracy, free of clickbait.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>

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
            The content is educational only and not a substitute for medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ============================================================
   ROOT — /blog
============================================================ */

const Blog = () => (
  <div className="min-h-screen bg-white dark:bg-stone-950">
    <BlogNav />
    <BlogIndex />
    <JournalNewsletter />
    <JournalFooter />
  </div>
);

export default Blog;