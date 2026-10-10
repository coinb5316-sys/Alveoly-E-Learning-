// src/pages/Sitemap.jsx — THE ALVEOLY INDEX
// A structured map of everything on Alveoly. Mock data. No component imports.
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome, FaSearch, FaChevronDown, FaArrowLeft, FaTwitter,
  FaLinkedin, FaInstagram, FaYoutube, FaRss, FaStream,
  FaMicrophone, FaVideo, FaTag, FaBookOpen, FaCheckCircle,
} from "react-icons/fa";
import {
  posts as allPosts,
  categories,
  authors,
} from "../data/blogData";

/* ============================================================
   UTILITIES
============================================================ */

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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
   NAV + FOOTER — identical to every other journal page
============================================================ */

const JournalNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: "/blog", label: "Home" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts" },
    { to: "/blog/videos", label: "Videos" },
    { to: "/blog/search", label: "Search" },
    { to: "/sitemap", label: "Sitemap", active: true },
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
   SITEMAP DATA
============================================================ */

const ALVEOLY_SECTIONS = [
  {
    title: "Main Pages",
    links: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
      { name: "Programs", path: "/programs" },
      { name: "Admissions", path: "/admissions" },
      { name: "Pricing", path: "/pricing" },
      { name: "Contact", path: "/contact_us" },
    ],
  },
  {
    title: "Careers",
    links: [
      { name: "Careers Home", path: "/careers" },
      { name: "What We Do", path: "/careers/what-we-do" },
      { name: "Life at Alveoly", path: "/careers/life-at-alveoly" },
      { name: "Benefits", path: "/careers/benefits" },
      { name: "Open Roles", path: "/careers/jobs" },
    ],
  },
  {
    title: "Programs by Field",
    links: [
      { name: "Medical", path: "/medical" },
      { name: "Nursing", path: "/nursing" },
      { name: "Pharmacy", path: "/pharmacy" },
      { name: "Accounting", path: "/accounting" },
      { name: "Finance", path: "/finance" },
      { name: "High School", path: "/high-school" },
      { name: "Grad School", path: "/grad-school" },
      { name: "Legal", path: "/legal" },
    ],
  },
  {
    title: "Legal & Policies",
    links: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Disclaimer", path: "/disclaimer" },
      { name: "Cookie Policy", path: "/cookies" },
      { name: "Editorial Policy", path: "/editorial-policy" },
      { name: "Advertising Policy", path: "/advertising-policy" },
      { name: "Medical Review Policy", path: "/medical-review-policy" },
    ],
  },
];

const JOURNAL_SECTIONS = [
  {
    title: "The Journal",
    icon: FaBookOpen,
    links: [
      { name: "All stories", path: "/blog" },
      { name: "Archive", path: "/blog/archive" },
      { name: "Search", path: "/blog/search" },
      { name: "Sitemap", path: "/sitemap" },
    ],
  },
  {
    title: "Media",
    icon: FaMicrophone,
    links: [
      { name: "Podcasts", path: "/blog/podcasts" },
      { name: "Videos", path: "/blog/videos" },
    ],
  },
];

/* ============================================================
   MAIN
============================================================ */

const Sitemap = () => {
  /* Group journal articles by category for a proper editorial index */
  const postsByCategory = useMemo(() => {
    return categories
      .map((cat) => {
        const posts = allPosts
          .filter((p) => p.categoryId === cat.id)
          .sort(
            (a, b) =>
              new Date(b.publishedAt) - new Date(a.publishedAt)
          );
        return { category: cat, posts };
      })
      .filter((g) => g.posts.length > 0);
  }, []);

  const allTags = useMemo(() => {
    const map = new Map();
    allPosts.forEach((p) =>
      (p.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    );
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, []);

  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <JournalNav />

      {/* ---------- MASTHEAD ---------- */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition mb-8"
          >
            <FaArrowLeft className="text-xs" />
            Back to Alveoly
          </Link>

          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            Index
          </p>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.08] mb-5">
            Sitemap
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed mb-8">
            Every page on Alveoly, grouped by section. The Journal sits at the
            top; the platform proper — programs, admissions, careers — sits
            below it. Nothing is more than a click from here.
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-500 pt-6 border-t border-stone-200 dark:border-stone-800">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {allPosts.length}
              </strong>{" "}
              {allPosts.length === 1 ? "article" : "articles"}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {categories.length}
              </strong>{" "}
              {categories.length === 1 ? "section" : "sections"}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {authors.length}
              </strong>{" "}
              {authors.length === 1 ? "contributor" : "contributors"}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {allTags.length}
              </strong>{" "}
              topics
            </span>
          </div>
        </div>
      </header>

      {/* ---------- THE JOURNAL ---------- */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <SectionLabel icon={FaBookOpen}>The Journal</SectionLabel>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
          Everything we publish
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mb-10 max-w-2xl">
          All routes within The Alveoly Journal — articles, sections,
          contributors, media, and the structural pages that hold it together.
        </p>

        {/* Primary journal routes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-14">
          {JOURNAL_SECTIONS.map((s) => (
            <div key={s.title}>
              <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4 flex items-center gap-2">
                {s.icon && <s.icon className="text-xs" />}
                {s.title}
              </p>
              <ul className="space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="text-sm text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4 decoration-transparent hover:decoration-current"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-10">
          <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3">
            Sections
          </p>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">
            Every section in the journal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            {categories.map((c) => {
              const count = allPosts.filter(
                (p) => p.categoryId === c.id
              ).length;
              return (
                <Link
                  key={c.id}
                  to={`/blog/category/${c.slug || slugify(c.name)}`}
                  className="group flex items-baseline justify-between gap-3 py-2 border-b border-stone-100 dark:border-stone-900 hover:border-stone-300 dark:hover:border-stone-700 transition"
                >
                  <span className="font-serif text-base text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                    {c.name}
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-600">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Contributors */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-10 mt-14">
          <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3">
            Contributors
          </p>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">
            Everyone on the desk
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map((a) => {
              const aPosts = allPosts.filter((p) => p.authorId === a.id);
              return (
                <Link
                  key={a.id}
                  to={`/blog/author/${a.id}`}
                  className="group flex items-start gap-3 py-3 border-b border-stone-100 dark:border-stone-900 hover:border-stone-300 dark:hover:border-stone-700 transition"
                >
                  <Avatar author={a} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-base text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                      {a.name}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      {a.role}
                      {aPosts.length > 0 && (
                        <>
                          {" · "}
                          {aPosts.length}{" "}
                          {aPosts.length === 1 ? "story" : "stories"}
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Topics */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-10 mt-14">
          <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
            <FaTag className="text-xs" />
            Topics
          </p>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">
            Every tag the journal has used
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(({ name, count }) => (
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

      {/* ---------- ALL ARTICLES BY SECTION ---------- */}
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <SectionLabel icon={FaBookOpen}>Articles</SectionLabel>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
            Every article, by section
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-10 max-w-2xl">
            A full index of the journal's writing. Expand any section to see
            its stories.
          </p>

          <div className="border-t border-stone-200 dark:border-stone-800">
            {postsByCategory.map(({ category: cat, posts }) => {
              const isOpen = openSection === cat.id;
              return (
                <div
                  key={cat.id}
                  className="border-b border-stone-200 dark:border-stone-800"
                >
                  <button
                    onClick={() => setOpenSection(isOpen ? null : cat.id)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  >
                    <div className="flex items-baseline gap-4 min-w-0">
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-50 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                        {cat.name}
                      </h3>
                      <span className="text-xs text-stone-500 dark:text-stone-500">
                        {posts.length}{" "}
                        {posts.length === 1 ? "story" : "stories"}
                      </span>
                    </div>
                    <span className="text-stone-400 flex-shrink-0">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <ul className="pb-6 space-y-3">
                          {posts.map((p) => {
                            const a = authors.find(
                              (x) => x.id === p.authorId
                            );
                            return (
                              <li
                                key={p.id}
                                className="flex items-baseline justify-between gap-4"
                              >
                                <Link
                                  to={`/blog/${p.slug}`}
                                  className="text-sm text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 transition"
                                >
                                  {p.title}
                                </Link>
                                <span className="text-xs text-stone-400 dark:text-stone-600 whitespace-nowrap">
                                  {a?.name?.split(" ").slice(-1)[0]} ·{" "}
                                  {p.readingTime} min
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- ALVEOLY PROPER ---------- */}
      <section className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
            Alveoly
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
            The platform
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-10 max-w-2xl">
            Everything outside the journal — the academy, the careers, and
            the policies that govern the whole site.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
            {ALVEOLY_SECTIONS.map((s) => (
              <div key={s.title}>
                <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
                  {s.title}
                </p>
                <ul className="space-y-2.5">
                  {s.links.map((l) => (
                    <li key={l.path}>
                      <Link
                        to={l.path}
                        className="text-sm text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4 decoration-transparent hover:decoration-current"
                      >
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- EDITORIAL PROMISE ---------- */}
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
            <div className="flex items-start gap-3">
              <FaBookOpen className="text-stone-500 dark:text-stone-400 mt-0.5 text-sm" />
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                  No sponsored content
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  The journal does not accept paid placements or affiliate
                  copy.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaStream className="text-stone-500 dark:text-stone-400 mt-0.5 text-sm" />
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                  Corrections published openly
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Substantive changes are dated and noted on the article
                  itself.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JournalFooter />
    </div>
  );
};

export default Sitemap;