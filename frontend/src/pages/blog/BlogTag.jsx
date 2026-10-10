// src/pages/blog/BlogTag.jsx — THE ALVEOLY JOURNAL TAG
// Standalone editorial tag page. Mock data. No component imports.
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaClock, FaEye, FaHome, FaSearch, FaChevronDown,
  FaMicrophone, FaVideo, FaStream, FaTag, FaTwitter, FaLinkedin,
  FaInstagram, FaYoutube, FaRss, FaBookOpen, FaCheckCircle,
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

/* Try to find the canonical casing for a tag slug from the data. */
const findCanonicalTag = (slug) => {
  if (!slug) return "";
  const normalized = slug.replace(/-/g, " ").toLowerCase();
  const set = new Set();
  allPosts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
  const match = [...set].find(
    (t) => t.toLowerCase() === normalized || slugify(t) === slug
  );
  if (match) return match;
  // fallback: title-case the slug
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

const SectionLabel = ({ icon: Icon, children }) => (
  <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
    {Icon && <Icon className="text-xs" />}
    {children}
  </p>
);

/* ============================================================
   JOURNAL SHELL
============================================================ */

const JournalNav = () => {
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

const BlogTag = () => {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("newest");
  const [notFound, setNotFound] = useState(false);

  /* Canonical casing of the tag, e.g. "heart disease" → "Heart Disease" */
  const displayTag = useMemo(() => findCanonicalTag(tag), [tag]);

  useEffect(() => {
    // If the tag has no posts at all, we can still show a "nothing here" state
    setNotFound(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tag]);

  /* ---------- Posts that carry this tag ---------- */
  const tagPosts = useMemo(() => {
    if (!displayTag) return [];
    const normalized = displayTag.toLowerCase();
    let list = allPosts.filter((p) =>
      (p.tags || []).some((t) => t.toLowerCase() === normalized)
    );
    if (sortBy === "newest")
      list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    else if (sortBy === "popular") list.sort((a, b) => b.views - a.views);
    else if (sortBy === "liked") list.sort((a, b) => b.likes - a.likes);
    return list;
  }, [displayTag, sortBy]);

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    if (!tagPosts.length) {
      return { posts: 0, authors: 0, sections: 0, reads: 0, firstYear: null };
    }
    const uniqueAuthors = new Set(tagPosts.map((p) => p.authorId)).size;
    const uniqueSections = new Set(tagPosts.map((p) => p.categoryId)).size;
    const reads = tagPosts.reduce((s, p) => s + (p.views || 0), 0);
    const sortedAsc = [...tagPosts].sort(
      (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
    );
    const firstYear = new Date(sortedAsc[0].publishedAt).getFullYear();
    return {
      posts: tagPosts.length,
      authors: uniqueAuthors,
      sections: uniqueSections,
      reads,
      firstYear,
    };
  }, [tagPosts]);

  /* ---------- Related tags (co-occurring with this tag) ---------- */
  const relatedTags = useMemo(() => {
    if (!displayTag) return [];
    const normalized = displayTag.toLowerCase();
    const counts = new Map();
    tagPosts.forEach((p) =>
      (p.tags || []).forEach((t) => {
        if (t.toLowerCase() === normalized) return;
        counts.set(t, (counts.get(t) || 0) + 1);
      })
    );
    // Also pull in trending tags across the journal as fallback
    const globalCounts = new Map();
    allPosts.forEach((p) =>
      (p.tags || []).forEach((t) => {
        if (t.toLowerCase() === normalized) return;
        globalCounts.set(t, (globalCounts.get(t) || 0) + 1);
      })
    );
    const merged = new Map([...globalCounts, ...counts]);
    [...counts.entries()].forEach(([k, v]) => {
      merged.set(k, (merged.get(k) || 0) + v * 2);
    });
    return [...merged.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));
  }, [displayTag, tagPosts]);

  /* ---------- Sections represented in this tag ---------- */
  const involvedCategories = useMemo(() => {
    if (!tagPosts.length) return [];
    const ids = [...new Set(tagPosts.map((p) => p.categoryId))];
    return ids
      .map((cid) => categories.find((c) => c.id === cid))
      .filter(Boolean);
  }, [tagPosts]);

  /* ---------- Other tags to explore ---------- */
  const otherTags = useMemo(() => {
    if (!displayTag) return [];
    const normalized = displayTag.toLowerCase();
    const counts = new Map();
    allPosts.forEach((p) =>
      (p.tags || []).forEach((t) => {
        if (t.toLowerCase() === normalized) return;
        counts.set(t, (counts.get(t) || 0) + 1);
      })
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([name, count]) => ({ name, count }));
  }, [displayTag]);

  /* ---------- Similar tags (by string overlap) ---------- */
  const similarTags = useMemo(() => {
    if (!displayTag) return [];
    const normalized = displayTag.toLowerCase();
    const set = new Set();
    allPosts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return [...set]
      .filter((t) => t.toLowerCase() !== normalized)
      .filter((t) => {
        const words = normalized.split(/\s+/);
        const tWords = t.toLowerCase().split(/\s+/);
        return words.some((w) => w.length > 3 && tWords.includes(w));
      })
      .slice(0, 5);
  }, [displayTag]);

  /* ---------- No tag in URL ---------- */
  if (!tag) {
    navigate("/blog");
    return null;
  }

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
            Topic
          </p>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.08] mb-5">
            {displayTag}
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed mb-8">
            {tagPosts.length > 0
              ? `Every story in the journal filed under the topic "${displayTag}" — pulled from across sections and contributors.`
              : `We haven't filed anything under the topic "${displayTag}" yet. Try a related topic below.`}
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-500 pt-6 border-t border-stone-200 dark:border-stone-800">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {stats.posts}
              </strong>{" "}
              {stats.posts === 1 ? "story" : "stories"}
            </span>
            {stats.authors > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.authors}
                  </strong>{" "}
                  {stats.authors === 1 ? "contributor" : "contributors"}
                </span>
              </>
            )}
            {stats.sections > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.sections}
                  </strong>{" "}
                  {stats.sections === 1 ? "section" : "sections"}
                </span>
              </>
            )}
            {stats.reads > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.reads.toLocaleString()}
                  </strong>{" "}
                  reads
                </span>
              </>
            )}
            {stats.firstYear && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>Since {stats.firstYear}</span>
              </>
            )}
          </div>

          {/* Similar tags — refine the topic */}
          {similarTags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
              <span className="text-xs uppercase tracking-wider">
                Related:
              </span>
              {similarTags.map((t) => (
                <Link
                  key={t}
                  to={`/blog/tag/${slugify(t)}`}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700 hover:decoration-current"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ---------- MAIN LAYOUT ---------- */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* ---------- ARTICLE LIST ---------- */}
          <div className="lg:col-span-8 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200 dark:border-stone-800">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {tagPosts.length}
                </strong>{" "}
                {tagPosts.length === 1 ? "story" : "stories"} tagged{" "}
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  #{displayTag}
                </strong>
              </p>
              {tagPosts.length > 0 && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm bg-transparent border-none text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most read</option>
                  <option value="liked">Most liked</option>
                </select>
              )}
            </div>

            {tagPosts.length === 0 ? (
              /* ---------- Empty state ---------- */
              <div className="py-16 text-center max-w-md mx-auto">
                <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                  Nothing filed under "{displayTag}"
                </p>
                <p className="text-stone-500 dark:text-stone-400 mb-8">
                  The journal hasn't covered this topic yet — or it's filed
                  under a slightly different tag. Try one of these instead.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {otherTags.slice(0, 8).map(({ name, count }) => (
                    <Link
                      key={name}
                      to={`/blog/tag/${slugify(name)}`}
                      className="inline-flex items-baseline gap-1.5 px-3.5 py-2 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 text-sm hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                    >
                      <span>#{name}</span>
                      <span className="text-[10px] text-stone-400">
                        {count}
                      </span>
                    </Link>
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
              <>
                {/* Lead story */}
                {(() => {
                  const [lead, ...rest] = tagPosts;
                  const leadAuthor = authors.find(
                    (a) => a.id === lead.authorId
                  );
                  const leadCat = categories.find(
                    (c) => c.id === lead.categoryId
                  );
                  return (
                    <>
                      <motion.article
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="group mb-12"
                      >
                        <Link to={`/blog/${lead.slug}`} className="block">
                          {lead.image && (
                            <div className="overflow-hidden rounded-lg mb-6">
                              <img
                                src={lead.image}
                                alt={lead.title}
                                className="w-full aspect-[16/10] object-cover group-hover:opacity-95 transition"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-500 mb-3">
                            {leadCat && (
                              <>
                                <span className="uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold">
                                  {leadCat.name}
                                </span>
                                <span className="text-stone-300 dark:text-stone-700">
                                  ·
                                </span>
                              </>
                            )}
                            <time>
                              {formatShortDate(lead.publishedAt)}
                            </time>
                            <span className="text-stone-300 dark:text-stone-700">
                              ·
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FaClock className="text-[9px]" />
                              {lead.readingTime} min
                            </span>
                          </div>
                          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-stone-900 dark:text-stone-50 mb-4 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                            {lead.title}
                          </h2>
                          <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-5">
                            {lead.excerpt}
                          </p>
                          <div className="flex items-center gap-3">
                            <Avatar author={leadAuthor} size="sm" />
                            <div className="text-xs">
                              <p className="font-medium text-stone-800 dark:text-stone-200">
                                {leadAuthor?.name}
                              </p>
                              <p className="text-stone-500 flex items-center gap-1.5">
                                <FaEye className="text-[9px]" />
                                {lead.views.toLocaleString()} reads
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.article>

                      {rest.length > 0 && (
                        <>
                          <div className="flex items-center gap-4 mb-8">
                            <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                            <span className="text-xs uppercase tracking-widest text-stone-400">
                              Also tagged #{displayTag}
                            </span>
                            <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                            {rest.map((post, i) => {
                              const a = authors.find(
                                (x) => x.id === post.authorId
                              );
                              const c = categories.find(
                                (x) => x.id === post.categoryId
                              );
                              return (
                                <motion.article
                                  key={post.id}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.35,
                                    delay: Math.min(i * 0.05, 0.35),
                                  }}
                                  className="group"
                                >
                                  <Link
                                    to={`/blog/${post.slug}`}
                                    className="block"
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
                                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mb-2">
                                        {c && (
                                          <>
                                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                              {c.name}
                                            </span>
                                            <span className="text-stone-300 dark:text-stone-700">
                                              ·
                                            </span>
                                          </>
                                        )}
                                        <time>
                                          {formatShortDate(post.publishedAt)}
                                        </time>
                                      </div>
                                      <h3 className="font-serif text-xl font-bold leading-snug text-stone-900 dark:text-stone-50 mb-3 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2">
                                        {post.title}
                                      </h3>
                                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
                                        {post.excerpt}
                                      </p>
                                      <div className="flex items-center gap-3 text-xs text-stone-500">
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
                                  </Link>
                                </motion.article>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* About this topic */}
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <SectionLabel icon={FaTag}>About this topic</SectionLabel>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Every story filed under{" "}
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    #{displayTag}
                  </strong>{" "}
                  across the journal — regardless of section, contributor, or
                  date. Topics cut across the publication, so this is the
                  clearest way to follow a single thread through it.
                </p>
              </div>

              {/* Sections in this tag */}
              {involvedCategories.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
                    Sections in this topic
                  </p>
                  <ul className="space-y-1.5">
                    {involvedCategories.map((c) => {
                      const count = tagPosts.filter(
                        (p) => p.categoryId === c.id
                      ).length;
                      return (
                        <li key={c.id}>
                          <Link
                            to={`/blog/category/${c.slug || slugify(c.name)}`}
                            className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100 transition"
                          >
                            <span>{c.name}</span>
                            <span className="text-xs text-stone-400 dark:text-stone-600">
                              {count}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Related tags */}
              {relatedTags.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
                    Related topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {relatedTags.slice(0, 10).map(({ name, count }) => (
                      <Link
                        key={name}
                        to={`/blog/tag/${slugify(name)}`}
                        className="inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
                      >
                        <span>#{name}</span>
                        <span className="text-[10px] text-stone-400">
                          {count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="p-5 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
                <p className="font-serif text-base font-bold mb-2">
                  Get stories worth reading.
                </p>
                <p className="text-xs opacity-80 mb-4">
                  A weekly letter on healthcare and clinical practice. No
                  noise.
                </p>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-2"
                >
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/10 dark:bg-stone-900/10 border border-white/20 dark:border-stone-900/20 text-sm placeholder-white/60 dark:placeholder-stone-900/60 focus:outline-none focus:border-white/60 dark:focus:border-stone-900/60 transition"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-lg text-sm font-medium hover:opacity-90 transition"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Editorial promise */}
              <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm" />
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                      Every article medically reviewed
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      Written or reviewed by a practicing clinician before
                      publication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- OTHER TOPICS TO EXPLORE ---------- */}
      {otherTags.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-14">
            <SectionLabel icon={FaTag}>Keep browsing</SectionLabel>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              Other topics in the journal
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
              Every subject the journal has covered so far. Each one brings
              together stories from across sections and contributors.
            </p>
            <div className="flex flex-wrap gap-2">
              {otherTags.map(({ name, count }) => (
                <Link
                  key={name}
                  to={`/blog/tag/${slugify(name)}`}
                  className="inline-flex items-baseline gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  <span>#{name}</span>
                  <span className="text-[10px] text-stone-400">{count}</span>
                </Link>
              ))}
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

export default BlogTag;