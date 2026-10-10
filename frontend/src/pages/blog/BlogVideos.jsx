// src/pages/blog/BlogVideos.jsx — THE ALVEOLY JOURNAL VIDEO LIBRARY (LIVE API)
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaPlay, FaClock, FaHome, FaSearch, FaChevronDown,
  FaMicrophone, FaStream, FaTag, FaTwitter, FaLinkedin, FaInstagram,
  FaYoutube, FaRss, FaVideo, FaEye, FaBookOpen, FaCheckCircle,
} from "react-icons/fa";
import { publicBlogAPI as blogAPI } from "../../api/blogApi";

/* ============================================================
   UTILITIES
============================================================ */

const formatShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

const postImage = (p) => p.image || p.featuredImage || "";

/* ============================================================
   PRIMITIVES
============================================================ */

const SectionLabel = ({ icon: Icon, children }) => (
  <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
    {Icon && <Icon className="text-xs" />}
    {children}
  </p>
);

const JournalNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: "/blog", label: "Home" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts" },
    { to: "/blog/videos", label: "Videos", active: true },
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
                className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                  l.active
                    ? "text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-900"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900"
                }`}
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
                    className={`px-2 py-2.5 text-sm font-medium transition ${
                      l.active
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
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
            The content is educational only and not a substitute for medical
            advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ============================================================
   VIDEO EMBED
============================================================ */

const VideoEmbed = ({ video, autoplay = false }) => (
  <div className="aspect-video bg-black rounded-lg overflow-hidden">
    <iframe
      src={`https://www.youtube.com/embed/${video.youtubeId}${
        autoplay ? "?autoplay=1" : ""
      }`}
      title={video.title}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);

/* ============================================================
   MAIN — WIRED TO LIVE PUBLIC API
============================================================ */

const BlogVideos = () => {
  const [videos, setVideos] = useState([]);
  const [pairedArticles, setPairedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  /* ---------- Fetch videos + paired articles ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [vidsRes, postsRes] = await Promise.all([
          blogAPI.getVideos(),
          blogAPI.getPosts({ limit: 30, publishedOnly: true }),
        ]);
        if (cancelled) return;

        setVideos(vidsRes.data || []);
        const posts = postsRes.data?.posts || [];
        const reviewed = posts.filter((p) => p.medicallyReviewed);
        const pool = reviewed.length > 0 ? reviewed : posts;
        setPairedArticles(
          pool
            .sort(
              (a, b) =>
                new Date(b.publishedAt) - new Date(a.publishedAt)
            )
            .slice(0, 3)
        );
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setVideos([]);
          setPairedArticles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Derive category options ---------- */
  const videoCategories = useMemo(() => {
    const set = new Set();
    videos.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return ["all", ...[...set].sort()];
  }, [videos]);

  /* ---------- Filter + sort ---------- */
  const filtered = useMemo(() => {
    let list = [...videos];
    if (categoryFilter !== "all") {
      list = list.filter((v) => v.category === categoryFilter);
    }
    list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return list;
  }, [videos, categoryFilter]);

  const lead = filtered[0];
  const rest = filtered.slice(1);

  /* ---------- Total runtime ---------- */
  const totalRuntime = useMemo(() => {
    let total = 0;
    videos.forEach((v) => {
      if (!v.duration) return;
      const [m, s] = v.duration.split(":").map((x) => parseInt(x, 10));
      if (!isNaN(m) && !isNaN(s)) total += m * 60 + s;
    });
    return Math.round(total / 60);
  }, [videos]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <JournalNav />

      {/* MASTHEAD */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 pb-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition mb-8"
          >
            <FaArrowLeft className="text-xs" />
            All stories
          </Link>

          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Journal
          </p>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.08] mb-5">
            Video library
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed mb-8">
            Short, practical explainers from our clinical team — the same
            evidence you read in the journal, told in a few minutes of your
            time.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-500 pt-6 border-t border-stone-200 dark:border-stone-800">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {videos.length}
              </strong>{" "}
              {videos.length === 1 ? "video" : "videos"}
            </span>
            {videoCategories.length > 2 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {videoCategories.length - 1}
                  </strong>{" "}
                  {videoCategories.length - 1 === 1
                    ? "category"
                    : "categories"}
                </span>
              </>
            )}
            {totalRuntime > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {totalRuntime} min
                  </strong>{" "}
                  of viewing
                </span>
              </>
            )}
          </div>

          {/* Category strip */}
          {videoCategories.length > 2 && (
            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {videoCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                    categoryFilter === c
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  {c === "all" ? "All videos" : c}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* FEATURED + LIST */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        {!lead ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              No videos in this category
            </p>
            <p className="text-stone-500 dark:text-stone-400 mb-6">
              Try another category, or view the full video library.
            </p>
            <button
              onClick={() => setCategoryFilter("all")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              <FaArrowLeft className="text-xs" />
              All videos
            </button>
          </div>
        ) : (
          <>
            {/* FEATURED */}
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-16"
            >
              <SectionLabel icon={FaPlay}>Featured</SectionLabel>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
                <div className="lg:col-span-3">
                  <VideoEmbed video={lead} />
                </div>
                <div className="lg:col-span-2">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight text-stone-900 dark:text-stone-50 mb-4">
                    {lead.title}
                  </h2>
                  {lead.description && (
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                      {lead.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-stone-500 pb-6 border-b border-stone-200 dark:border-stone-800">
                    {lead.category && (
                      <>
                        <span className="uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400">
                          {lead.category}
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">
                          ·
                        </span>
                      </>
                    )}
                    <span className="flex items-center gap-1.5">
                      <FaClock className="text-[9px]" />
                      {lead.duration}
                    </span>
                    <span className="text-stone-300 dark:text-stone-700">
                      ·
                    </span>
                    <time>{formatShortDate(lead.publishedAt)}</time>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-500 mt-4 leading-relaxed">
                    Prefer reading? Every video has a companion article in the
                    journal — the same facts, in text.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/blog"
                      className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    >
                      Read the journal
                      <FaArrowLeft className="text-xs rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* REST */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                  <span className="text-xs uppercase tracking-widest text-stone-400">
                    Also in the library
                  </span>
                  <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                  {rest.map((video, i) => (
                    <motion.article
                      key={video._id || video.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: Math.min(i * 0.05, 0.35),
                      }}
                    >
                      <VideoEmbed video={video} />
                      <div className="pt-5">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mb-3">
                          {video.category && (
                            <>
                              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                {video.category}
                              </span>
                              <span className="text-stone-300 dark:text-stone-700">
                                ·
                              </span>
                            </>
                          )}
                          <span className="flex items-center gap-1.5">
                            <FaClock className="text-[9px]" />
                            {video.duration}
                          </span>
                          <span className="text-stone-300 dark:text-stone-700">
                            ·
                          </span>
                          <time>{formatShortDate(video.publishedAt)}</time>
                        </div>
                        <h3 className="font-serif text-xl font-bold leading-snug text-stone-900 dark:text-stone-50 mb-2">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* PAIRED ARTICLES */}
      {pairedArticles.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-14">
            <SectionLabel icon={FaBookOpen}>Read alongside</SectionLabel>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              The written version
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
              Every topic we cover in video, we cover in depth in writing.
              Here are three recent pieces worth a slow read.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {pairedArticles.map((post) => {
                const img = postImage(post);
                const catName =
                  post.categoryId?.name || post.category?.name || "";
                return (
                  <Link
                    key={post._id || post.id}
                    to={`/blog/${post.slug}`}
                    className="group"
                  >
                    {img && (
                      <img
                        src={img}
                        alt={post.title}
                        className="w-full aspect-[16/10] object-cover rounded-md mb-4 group-hover:opacity-95 transition"
                      />
                    )}
                    {catName && (
                      <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
                        {catName}
                      </p>
                    )}
                    <h3 className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5">
                      <FaClock className="text-[9px]" />
                      {post.readingTime} min read
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* OTHER MEDIA */}
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-6">
            Also on the journal
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              to="/blog/podcasts"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <FaMicrophone className="text-stone-400 group-hover:text-rose-600 transition text-lg mt-1" />
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Podcasts
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Conversations with the clinicians behind the writing.
                </p>
              </div>
            </Link>
            <Link
              to="/blog/archive"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <FaStream className="text-stone-400 group-hover:text-rose-600 transition text-lg mt-1" />
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Archive
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Every story we've published, filed by month.
                </p>
              </div>
            </Link>
            <Link
              to="/sitemap"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <FaStream className="text-stone-400 group-hover:text-rose-600 transition text-lg mt-1" />
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Sitemap
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  A structured index of everything the journal publishes.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <JournalFooter />
    </div>
  );
};

export default BlogVideos;