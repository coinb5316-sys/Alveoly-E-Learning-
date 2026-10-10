// src/pages/blog/BlogSearch.jsx — THE ALVEOLY JOURNAL SEARCH
// Standalone editorial search. Mock data. No component imports.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaArrowLeft, FaClock, FaEye, FaHome, FaChevronDown,
  FaTimes, FaMicrophone, FaVideo, FaStream, FaTag, FaTwitter,
  FaLinkedin, FaInstagram, FaYoutube, FaRss, FaBookOpen,
  FaCheckCircle,
} from "react-icons/fa";
import {
  posts as allPosts,
  authors,
  categories,
} from "../../data/blogData";

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

/* Score a post against the query.
   - Title match: 10
   - Excerpt match: 4
   - Tag match: 3
   - Author match: 6
   - Category match: 5
   Then add a small boost for recency, views, and likes. */
const scorePost = (post, query, authorName = "", categoryName = "") => {
  if (!query) return 0;
  const q = query.toLowerCase();
  let score = 0;

  if (post.title.toLowerCase().includes(q)) {
    score += 10;
    if (post.title.toLowerCase().startsWith(q)) score += 4;
  }
  if (post.excerpt.toLowerCase().includes(q)) score += 4;
  if (post.tags.some((t) => t.toLowerCase().includes(q))) score += 3;
  if (authorName.toLowerCase().includes(q)) score += 6;
  if (categoryName.toLowerCase().includes(q)) score += 5;

  if (score === 0) return 0;

  // Recency + popularity nudges
  const days =
    (Date.now() - new Date(post.publishedAt).getTime()) / 86400000;
  score += Math.max(0, 5 - days / 30);
  score += Math.min(4, (post.views || 0) / 5000);
  score += Math.min(2, (post.likes || 0) / 500);

  return score;
};

const highlight = (text, query) => {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

/* ============================================================
   PRIMITIVES
============================================================ */

const Avatar = ({ author, size = "sm" }) => {
  const [broken, setBroken] = useState(false);
  const cls =
    size === "sm" ? "w-6 h-6 text-[10px]" : "w-9 h-9 text-xs";
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

const JournalNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: "/blog", label: "Home" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts" },
    { to: "/blog/videos", label: "Videos" },
    { to: "/blog/search", label: "Search", active: true },
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
   MAIN
============================================================ */

const SUGGESTED_TOPICS = [
  "Hypertension",
  "Gut Health",
  "Anxiety",
  "Sleep",
  "Vaccination",
  "Diabetes",
  "Mental Health",
  "Public Health",
];

const BlogSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const inputRef = useRef(null);

  // keep input synced with URL
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [query]);

  /* ---------- Ranked results ---------- */
  const rankedResults = useMemo(() => {
    if (!query.trim()) return [];
    const scored = allPosts
      .map((post) => {
        const author = authors.find((a) => a.id === post.authorId);
        const category = categories.find((c) => c.id === post.categoryId);
        const score = scorePost(
          post,
          query.trim(),
          author?.name || "",
          category?.name || ""
        );
        return { post, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.map((r) => r.post);
  }, [query]);

  /* ---------- Suggested tags matching the query ---------- */
  const matchedTags = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const counts = new Map();
    allPosts.forEach((p) =>
      (p.tags || []).forEach((t) => {
        if (t.toLowerCase().includes(q)) {
          counts.set(t, (counts.get(t) || 0) + 1);
        }
      })
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [query]);

  /* ---------- Matched categories + authors ---------- */
  const matchedCategories = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 4);
  }, [query]);

  const matchedAuthors = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return authors
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.specialties || []).some((s) => s.toLowerCase().includes(q))
      )
      .slice(0, 3);
  }, [query]);

  const submit = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    if (!term) return;
    setSearchParams({ q: term });
  };

  const clear = () => {
    setSearchInput("");
    setSearchParams({});
    inputRef.current?.focus();
  };

  const runSuggestion = (term) => {
    setSearchInput(term);
    setSearchParams({ q: term });
  };

  const total = rankedResults.length;
  const plural = total === 1 ? "result" : "results";

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <JournalNav />

      {/* ---------- MASTHEAD ---------- */}
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
            {query ? (
              <>
                Results for{" "}
                <span className="text-rose-600 dark:text-rose-400">
                  "{query}"
                </span>
              </>
            ) : (
              "Search the journal"
            )}
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed mb-8">
            {query
              ? total === 0
                ? "Nothing in our archive matches that phrase yet. Try a different keyword, or start from a topic below."
                : `${total} ${plural} filed across every section — ranked by relevance to your search.`
              : "Find essays, field reports, and clinical notes by title, topic, or contributor."}
          </p>

          {/* Search form */}
          <form onSubmit={submit} className="relative max-w-2xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search hypertension, anxiety, sleep…"
              className="w-full pl-11 pr-28 py-3.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition text-[15px]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clear}
                className="absolute right-[96px] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition p-1"
                aria-label="Clear search"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
            <button
              type="submit"
              disabled={!searchInput.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>

          {/* Suggested topics — always visible */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
            <span className="text-xs uppercase tracking-wider">
              {query ? "Related" : "Try"}
            </span>
            {(matchedTags.length > 0
              ? matchedTags.map((t) => t.name)
              : SUGGESTED_TOPICS
            )
              .slice(0, 6)
              .map((t) => (
                <button
                  key={t}
                  onClick={() => runSuggestion(t)}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700 hover:decoration-current"
                >
                  {t}
                </button>
              ))}
          </div>

          {/* Inline matches for categories & authors */}
          {query && (matchedCategories.length > 0 || matchedAuthors.length > 0) && (
            <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-start gap-x-10 gap-y-4">
              {matchedCategories.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
                    Sections
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedCategories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/blog/category/${c.slug || slugify(c.name)}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 hover:border-stone-900 dark:hover:border-stone-100 transition"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {matchedAuthors.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
                    Contributors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedAuthors.map((a) => (
                      <Link
                        key={a.id}
                        to={`/blog/author/${a.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 hover:border-stone-900 dark:hover:border-stone-100 transition"
                      >
                        <Avatar author={a} size="sm" />
                        {a.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ---------- RESULTS / EMPTY ---------- */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        {!query ? (
          /* ---------- No query: gentle prompt ---------- */
          <div className="max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <Link
                to="/blog/archive"
                className="group flex flex-col justify-between p-6 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
              >
                <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3">
                  Browse
                </p>
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                  By date
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Every story we've published, filed by month.
                </p>
              </Link>
              <Link
                to="/blog"
                className="group flex flex-col justify-between p-6 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
              >
                <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3">
                  Browse
                </p>
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                  By section
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Heart health, nutrition, mental wellness, and more.
                </p>
              </Link>
              <Link
                to="/sitemap"
                className="group flex flex-col justify-between p-6 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
              >
                <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3">
                  Browse
                </p>
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                  The full index
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  A structured map of everything in the journal.
                </p>
              </Link>
            </div>
          </div>
        ) : total === 0 ? (
          /* ---------- Empty results ---------- */
          <div className="py-16 text-center max-w-lg mx-auto">
            <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Nothing matches "{query}"
            </p>
            <p className="text-stone-500 dark:text-stone-400 mb-8">
              We may not have written about that yet. Try a different phrase
              — or explore a topic below.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {SUGGESTED_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => runSuggestion(t)}
                  className="px-3.5 py-2 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 text-sm hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                >
                  {t}
                </button>
              ))}
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
            >
              <FaArrowLeft className="text-xs" />
              Browse all stories
            </Link>
          </div>
        ) : (
          /* ---------- Results list ---------- */
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-8 pb-5 border-b border-stone-200 dark:border-stone-800">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {total}
                </strong>{" "}
                {plural} for{" "}
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  "{query}"
                </strong>
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-500">
                Ranked by relevance
              </p>
            </div>

            <div className="space-y-10">
              {rankedResults.map((post, i) => {
                const author = authors.find((a) => a.id === post.authorId);
                const category = categories.find(
                  (c) => c.id === post.categoryId
                );
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(i * 0.04, 0.35),
                    }}
                    className="group grid grid-cols-1 sm:grid-cols-12 gap-6 pb-10 border-b border-stone-100 dark:border-stone-900 last:border-0 last:pb-0"
                  >
                    {/* Text */}
                    <div className="sm:col-span-8 min-w-0">
                      {category && (
                        <Link
                          to={`/blog/category/${category.slug || slugify(category.name)}`}
                          className="uppercase tracking-wider text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          {category.name}
                        </Link>
                      )}
                      <Link to={`/blog/${post.slug}`} className="block mt-2">
                        <h3 className="font-serif text-xl md:text-2xl font-bold leading-snug text-stone-900 dark:text-stone-50 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition mb-3">
                          {highlight(post.title, query)}
                        </h3>
                        <p className="text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
                          {highlight(post.excerpt, query)}
                        </p>
                      </Link>

                      {/* Tags inline — highlight matches */}
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.slice(0, 4).map((t) => (
                            <Link
                              key={t}
                              to={`/blog/tag/${slugify(t)}`}
                              className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                            >
                              #{highlight(t, query)}
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-500">
                        <Avatar author={author} size="sm" />
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          {author?.name}
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">
                          ·
                        </span>
                        <time>{formatShortDate(post.publishedAt)}</time>
                        <span className="text-stone-300 dark:text-stone-700">
                          ·
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-[9px]" />
                          {post.readingTime} min
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">
                          ·
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaEye className="text-[9px]" />
                          {post.views.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <Link
                      to={`/blog/${post.slug}`}
                      className="sm:col-span-4 order-first sm:order-last"
                    >
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full aspect-[16/10] object-cover rounded-md group-hover:opacity-95 transition"
                        />
                      )}
                    </Link>
                  </motion.article>
                );
              })}
            </div>

            {/* Inline CTA */}
            <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Didn't find what you were looking for?
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/blog"
                  className="text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
                >
                  Browse all stories
                </Link>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <Link
                  to="/blog/archive"
                  className="text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
                >
                  Browse the archive
                </Link>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ---------- SUGGESTED READS ---------- */}
      {!query && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-14">
            <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
              <FaBookOpen className="text-xs" />
              Start here
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              Editor's picks
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
              Three pieces our medical desk recommends if you're new to the
              journal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {allPosts
                .filter((p) => p.editorsPick && p.medicallyReviewed)
                .slice(0, 3)
                .map((post) => {
                  const a = authors.find((x) => x.id === post.authorId);
                  const c = categories.find((x) => x.id === post.categoryId);
                  return (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group"
                    >
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full aspect-[16/10] object-cover rounded-md mb-4 group-hover:opacity-95 transition"
                        />
                      )}
                      <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
                        {c?.name}
                      </p>
                      <h3 className="font-serif text-lg font-bold leading-snug text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2 mb-2">
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
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* ---------- ALSO ON THE JOURNAL ---------- */}
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
              to="/blog/videos"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <FaVideo className="text-stone-400 group-hover:text-rose-600 transition text-lg mt-1" />
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Videos
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Short, practical explainers from our medical desk.
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

export default BlogSearch;