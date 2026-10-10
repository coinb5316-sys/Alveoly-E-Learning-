// src/pages/blog/BlogAuthor.jsx — THE ALVEOLY JOURNAL AUTHOR
// Standalone editorial author page. Mock data. No Navbar/Footer/BlogCard.
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaClock, FaEye, FaHome, FaSearch, FaChevronDown,
  FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaEnvelope,
  FaGlobe, FaRss, FaMicrophone, FaVideo, FaStream, FaTag,
  FaGraduationCap, FaCheckCircle, FaBookOpen,
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

/* ============================================================
   PRIMITIVES
============================================================ */

const Avatar = ({ author, size = "sm" }) => {
  const [broken, setBroken] = useState(false);
  const cls =
    size === "sm"
      ? "w-6 h-6 text-[10px]"
      : size === "lg"
      ? "w-16 h-16 text-lg"
      : size === "xl"
      ? "w-24 h-24 md:w-28 md:h-28 text-2xl"
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

const SectionLabel = ({ icon: Icon, children }) => (
  <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
    {Icon && <Icon className="text-xs" />}
    {children}
  </p>
);

/* ============================================================
   MAIN
============================================================ */

const BlogAuthor = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = authors.find((a) => a.id === id);
    if (found) {
      setAuthor(found);
      setNotFound(false);
    } else {
      setAuthor(null);
      setNotFound(true);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  const authorPosts = useMemo(() => {
    if (!author) return [];
    return allPosts
      .filter((p) => p.authorId === author.id)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [author]);

  const stats = useMemo(() => {
    if (!authorPosts.length) {
      return { posts: 0, views: 0, likes: 0, categories: 0, firstYear: null };
    }
    const views = authorPosts.reduce((s, p) => s + (p.views || 0), 0);
    const likes = authorPosts.reduce((s, p) => s + (p.likes || 0), 0);
    const cats = new Set(authorPosts.map((p) => p.categoryId));
    const sortedByDate = [...authorPosts].sort(
      (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
    );
    const firstYear = new Date(sortedByDate[0].publishedAt).getFullYear();
    return {
      posts: authorPosts.length,
      views,
      likes,
      categories: cats.size,
      firstYear,
    };
  }, [authorPosts]);

  const authorCategories = useMemo(() => {
    if (!authorPosts.length) return [];
    const ids = [...new Set(authorPosts.map((p) => p.categoryId))];
    return ids
      .map((cid) => categories.find((c) => c.id === cid))
      .filter(Boolean);
  }, [authorPosts]);

  const otherAuthors = useMemo(() => {
    if (!author) return authors.slice(0, 6);
    return authors.filter((a) => a.id !== author.id).slice(0, 6);
  }, [author]);

  const reviewedCount = useMemo(
    () =>
      authorPosts.filter((p) => p.medicallyReviewed && p.reviewedBy === author?.id)
        .length,
    [authorPosts, author]
  );

  /* ---------- NOT FOUND ---------- */
  if (notFound) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <JournalNav />
        <div className="max-w-3xl mx-auto px-5 py-24 md:py-32 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-4">
            We don't have that contributor on file
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-md mx-auto mb-8">
            They may not have published here, or the link may be outdated.
            Meet the desk instead.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
          >
            <FaArrowLeft className="text-xs" />
            Back to the journal
          </Link>
        </div>
        <JournalFooter />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <JournalNav />

      {/* ---------- AUTHOR MASTHEAD ---------- */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 pb-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition mb-8"
          >
            <FaArrowLeft className="text-xs" />
            All stories
          </Link>

          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-6">
            Contributor
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-6 md:gap-8">
            <Avatar author={author} size="xl" />

            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1] mb-3">
                {author.name}
              </h1>

              {author.role && (
                <p className="text-lg text-stone-700 dark:text-stone-300 font-medium mb-1">
                  {author.role}
                </p>
              )}

              {author.credentials && (
                <p className="text-sm text-stone-500 dark:text-stone-500 flex items-center gap-2 mb-4">
                  <FaGraduationCap className="text-xs" />
                  {author.credentials}
                </p>
              )}

              {author.bio && (
                <p className="text-base md:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mb-6">
                  {author.bio}
                </p>
              )}

              {/* Specialties */}
              {author.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {author.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 text-xs rounded-full bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Social links */}
              <div className="flex items-center gap-4 text-stone-400">
                {author.social?.twitter && (
                  <a
                    href={author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter"
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
                    title="LinkedIn"
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
                    title="Instagram"
                    className="hover:text-pink-500 transition"
                  >
                    <FaInstagram />
                  </a>
                )}
                {author.social?.youtube && (
                  <a
                    href={author.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="YouTube"
                    className="hover:text-red-600 transition"
                  >
                    <FaYoutube />
                  </a>
                )}
                {author.social?.website && (
                  <a
                    href={author.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Website"
                    className="hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    <FaGlobe />
                  </a>
                )}
                {author.social?.email && (
                  <a
                    href={`mailto:${author.social.email}`}
                    title="Email"
                    className="hover:text-rose-500 transition"
                  >
                    <FaEnvelope />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-500 pt-8 mt-8 border-t border-stone-200 dark:border-stone-800">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {stats.posts}
              </strong>{" "}
              {stats.posts === 1 ? "story" : "stories"} published
            </span>
            {stats.categories > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.categories}
                  </strong>{" "}
                  {stats.categories === 1 ? "section" : "sections"}
                </span>
              </>
            )}
            {stats.views > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.views.toLocaleString()}
                  </strong>{" "}
                  reads
                </span>
              </>
            )}
            {stats.likes > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.likes.toLocaleString()}
                  </strong>{" "}
                  likes
                </span>
              </>
            )}
            {stats.firstYear && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>Writing since {stats.firstYear}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---------- ARTICLES + SIDEBAR ---------- */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* ---------- ARTICLES ---------- */}
          <div className="lg:col-span-8 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200 dark:border-stone-800">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {authorPosts.length}
                </strong>{" "}
                {authorPosts.length === 1 ? "story" : "stories"} by{" "}
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {author.name}
                </strong>
              </p>
            </div>

            {authorPosts.length === 0 ? (
              <div className="py-20 text-center max-w-md mx-auto">
                <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                  Nothing published yet
                </p>
                <p className="text-stone-500 dark:text-stone-400 mb-6">
                  {author.name} is on the desk, but hasn't filed a story yet.
                  Check back soon.
                </p>
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
                  const [lead, ...rest] = authorPosts;
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
                            <time>{formatShortDate(lead.publishedAt)}</time>
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
                          <div className="flex items-center gap-3 text-xs text-stone-500">
                            <span className="flex items-center gap-1.5">
                              <FaEye className="text-[9px]" />
                              {lead.views.toLocaleString()} reads
                            </span>
                            {lead.medicallyReviewed && (
                              <>
                                <span className="text-stone-300 dark:text-stone-700">
                                  ·
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                  <FaCheckCircle className="text-[10px]" />
                                  Medically reviewed
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      </motion.article>

                      {rest.length > 0 && (
                        <>
                          <div className="flex items-center gap-4 mb-8">
                            <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                            <span className="text-xs uppercase tracking-widest text-stone-400">
                              Also by {author.name.split(" ").slice(-1)[0]}
                            </span>
                            <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                            {rest.map((post, i) => {
                              const cat = categories.find(
                                (c) => c.id === post.categoryId
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
                                        {cat && (
                                          <>
                                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                              {cat.name}
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
              {/* About this contributor */}
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <SectionLabel icon={FaBookOpen}>
                  About this contributor
                </SectionLabel>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {author.bio}
                </p>
                {author.specialties?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                    <p className="text-xs uppercase tracking-wider text-stone-500 mb-3">
                      Focus areas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {author.specialties.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sections this author writes in */}
              {authorCategories.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
                    Sections
                  </p>
                  <ul className="space-y-1.5">
                    {authorCategories.map((c) => {
                      const count = authorPosts.filter(
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

              {/* Editorial note if the author reviews */}
              {reviewedCount > 0 && (
                <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm" />
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                        On the medical review board
                      </p>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {author.name} has medically reviewed{" "}
                        <strong className="font-semibold">
                          {reviewedCount}
                        </strong>{" "}
                        {reviewedCount === 1 ? "article" : "articles"} for the
                        journal.
                      </p>
                    </div>
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
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- MEET THE REST OF THE DESK ---------- */}
      {otherAuthors.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-14">
            <SectionLabel icon={FaBookOpen}>
              Also on the desk
            </SectionLabel>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              Other contributors
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
              Every article in the journal is written or reviewed by a
              practicing clinician. These are the people who sign off on what
              you read.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherAuthors.map((a) => {
                const aPosts = allPosts.filter((p) => p.authorId === a.id);
                return (
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
                      <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                        {aPosts.length}{" "}
                        {aPosts.length === 1 ? "story" : "stories"}
                        {aPosts[0] && (
                          <>
                            <span className="text-stone-300 dark:text-stone-700">
                              ·
                            </span>
                            <span>
                              Latest {formatShortDate(aPosts[0].publishedAt)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
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

export default BlogAuthor;