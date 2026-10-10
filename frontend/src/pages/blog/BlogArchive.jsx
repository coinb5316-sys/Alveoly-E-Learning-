// src/pages/blog/BlogArchive.jsx — THE ALVEOLY JOURNAL ARCHIVE
// Standalone editorial archive. Mock data. No Navbar/Footer components.
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaClock, FaEye, FaHome, FaSearch,
  FaChevronDown, FaChevronUp, FaMicrophone, FaVideo,
  FaArchive, FaStream, FaTag, FaTwitter, FaLinkedin,
  FaInstagram, FaYoutube, FaRss,
} from "react-icons/fa";
import {
  posts as allPosts,
  authors,
  categories,
} from "../../data/blogData";

/* ============================================================
   UTILITIES
============================================================ */

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const groupByMonth = (posts) => {
  const groups = {};
  posts.forEach((post) => {
    const date = new Date(post.publishedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(post);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
};

const formatMonthHeading = (key) => {
  const [year, month] = key.split("-");
  return {
    month: new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "long",
    }),
    year,
  };
};

/* ============================================================
   PRIMITIVES
============================================================ */

const JournalNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/blog", label: "Home" },
    { to: "/blog/archive", label: "Archive", active: true },
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
   MAIN — Archive page
============================================================ */

const BlogArchive = () => {
  const [expandedMonths, setExpandedMonths] = useState(() => {
    // By default, expand the most recent month
    const grouped = groupByMonth(allPosts);
    return grouped.length > 0 ? new Set([grouped[0][0]]) : new Set();
  });
  const [yearFilter, setYearFilter] = useState("all");

  const grouped = useMemo(() => groupByMonth(allPosts), []);

  const years = useMemo(() => {
    const set = new Set(
      grouped.map(([key]) => key.split("-")[0])
    );
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [grouped]);

  const filtered = useMemo(() => {
    if (yearFilter === "all") return grouped;
    return grouped.filter(([key]) => key.startsWith(yearFilter));
  }, [grouped, yearFilter]);

  const totalInView = filtered.reduce(
    (sum, [, list]) => sum + list.length,
    0
  );

  const toggleMonth = (key) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Year index — quick jump
  const yearCounts = useMemo(() => {
    const map = new Map();
    grouped.forEach(([key, list]) => {
      const y = key.split("-")[0];
      map.set(y, (map.get(y) || 0) + list.length);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [grouped]);

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
            Archive
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed mb-8">
            Every story we've published, filed by month. A record of how the
            journal has grown — and of what the healthcare conversation looked
            like when each piece went to print.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-500 pt-6 border-t border-stone-200 dark:border-stone-800">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {allPosts.length}
              </strong>{" "}
              stories total
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {grouped.length}
              </strong>{" "}
              {grouped.length === 1 ? "month" : "months"}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {years.length}
              </strong>{" "}
              {years.length === 1 ? "year" : "years"}
            </span>
          </div>
        </div>
      </header>

      {/* ---------- QUICK YEAR INDEX + LAYOUT ---------- */}
      <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* ---------- YEAR INDEX (left rail) ---------- */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-4">
                Jump to year
              </p>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => setYearFilter("all")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition ${
                      yearFilter === "all"
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-medium"
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
                    }`}
                  >
                    <span>All years</span>
                    <span
                      className={`text-xs ${
                        yearFilter === "all"
                          ? "opacity-70"
                          : "text-stone-400 dark:text-stone-600"
                      }`}
                    >
                      {allPosts.length}
                    </span>
                  </button>
                </li>
                {yearCounts.map(([year, count]) => (
                  <li key={year}>
                    <button
                      onClick={() => setYearFilter(year)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition ${
                        yearFilter === year
                          ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-medium"
                          : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
                      }`}
                    >
                      <span>{year}</span>
                      <span
                        className={`text-xs ${
                          yearFilter === year
                            ? "opacity-70"
                            : "text-stone-400 dark:text-stone-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
                <Link
                  to="/blog/search"
                  className="inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                >
                  <FaSearch className="text-xs" />
                  Search the archive
                </Link>
              </div>

              <div className="mt-4">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                >
                  <FaArrowLeft className="text-xs" />
                  Back to all stories
                </Link>
              </div>
            </div>
          </aside>

          {/* ---------- MONTH GROUPS ---------- */}
          <div className="lg:col-span-9 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Showing{" "}
                <strong className="font-semibold text-stone-900 dark:text-stone-100">
                  {totalInView}
                </strong>{" "}
                {totalInView === 1 ? "story" : "stories"}
                {yearFilter !== "all" && (
                  <>
                    {" "}
                    from{" "}
                    <strong className="font-semibold text-stone-900 dark:text-stone-100">
                      {yearFilter}
                    </strong>
                  </>
                )}
              </p>
              {yearFilter !== "all" && (
                <button
                  onClick={() => setYearFilter("all")}
                  className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="space-y-6">
              {filtered.map(([key, monthPosts]) => {
                const isExpanded = expandedMonths.has(key);
                const { month, year } = formatMonthHeading(key);
                return (
                  <motion.section
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-stone-200 dark:border-stone-800 pt-6 first:border-t-0 first:pt-0"
                  >
                    <button
                      onClick={() => toggleMonth(key)}
                      className="w-full flex items-baseline justify-between gap-4 group text-left"
                    >
                      <div className="flex items-baseline gap-4 min-w-0">
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                          {month}
                        </h2>
                        <span className="text-sm text-stone-500 dark:text-stone-500">
                          {year}
                        </span>
                        <span className="text-xs text-stone-400 dark:text-stone-600">
                          ·{" "}
                          <strong className="font-medium">
                            {monthPosts.length}
                          </strong>{" "}
                          {monthPosts.length === 1 ? "story" : "stories"}
                        </span>
                      </div>
                      <span className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition flex-shrink-0">
                        {isExpanded ? (
                          <FaChevronUp className="text-xs" />
                        ) : (
                          <FaChevronDown className="text-xs" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <ul className="mt-6 divide-y divide-stone-100 dark:divide-stone-900">
                            {monthPosts.map((post) => {
                              const author = authors.find(
                                (a) => a.id === post.authorId
                              );
                              const category = categories.find(
                                (c) => c.id === post.categoryId
                              );
                              const day = new Date(
                                post.publishedAt
                              ).toLocaleDateString("en-US", {
                                day: "2-digit",
                              });
                              return (
                                <li key={post.id}>
                                  <Link
                                    to={`/blog/${post.slug}`}
                                    className="group flex items-start gap-5 py-5"
                                  >
                                    <div className="w-12 flex-shrink-0 text-right pt-0.5">
                                      <span className="font-serif text-2xl font-bold text-stone-300 dark:text-stone-700 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                                        {day}
                                      </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      {category && (
                                        <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
                                          {category.name}
                                        </p>
                                      )}
                                      <h3 className="font-serif text-lg md:text-xl font-bold leading-snug text-stone-900 dark:text-stone-50 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2 mb-2">
                                        {post.title}
                                      </h3>
                                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-3">
                                        {post.excerpt}
                                      </p>
                                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-500">
                                        <span className="font-medium text-stone-700 dark:text-stone-300">
                                          {author?.name}
                                        </span>
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

                                    {post.image && (
                                      <img
                                        src={post.image}
                                        alt={post.title}
                                        loading="lazy"
                                        className="hidden sm:block w-24 h-24 rounded-md object-cover flex-shrink-0"
                                      />
                                    )}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.section>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-20 text-center max-w-md mx-auto">
                  <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                    Nothing filed under {yearFilter}
                  </p>
                  <p className="text-stone-500 dark:text-stone-400 mb-6">
                    We haven't published anything in that year yet. Try a
                    different year.
                  </p>
                  <button
                    onClick={() => setYearFilter("all")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
                  >
                    <FaArrowLeft className="text-xs" />
                    Show all years
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- BROWSE BY TOPIC ---------- */}
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
            <FaTag className="text-xs" />
            Browse by topic
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
            Thematic index
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
            Prefer browsing by subject rather than date? Every category in the
            journal, in one place.
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const count = allPosts.filter(
                (p) => p.categoryId === c.id
              ).length;
              return (
                <Link
                  key={c.id}
                  to={`/blog/category/${c.slug || slugify(c.name)}`}
                  className="inline-flex items-baseline gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-stone-400">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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

export default BlogArchive;