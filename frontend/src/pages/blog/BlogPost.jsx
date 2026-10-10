// src/pages/blog/BlogPost.jsx — THE ALVEOLY JOURNAL ARTICLE
// Standalone editorial article page. Mock data. No component imports.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock, FaEye, FaHeart, FaRegHeart, FaCheckCircle, FaUserMd,
  FaCalendarAlt, FaTag, FaArrowLeft, FaShareAlt, FaBookmark,
  FaRegBookmark, FaPrint, FaLink, FaTwitter, FaLinkedin, FaFacebook,
  FaWhatsapp, FaEnvelope, FaHome, FaSearch, FaChevronDown, FaChevronUp,
  FaListUl, FaTimes, FaMicrophone, FaVideo, FaStream, FaInstagram,
  FaYoutube, FaRss, FaArrowUp, FaQuoteLeft, FaBookOpen, FaGraduationCap,
} from "react-icons/fa";
import {
  posts as allPosts,
  authors,
  categories,
} from "../../data/blogData";

/* ============================================================
   UTILITIES
============================================================ */

const formatLongDate = (d) =>
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

/* Injects stable IDs into H2/H3 tags and returns the rewritten HTML */
const injectHeadingIds = (html) => {
  if (!html) return html;
  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h\1>/g,
    (match, level, attrs, inner) => {
      const raw = inner.replace(/<[^>]+>/g, "");
      const id = slugify(raw) || `section-${Math.random().toString(36).slice(2, 8)}`;
      if (/id=/.test(attrs)) return match;
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    }
  );
};

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
      ? "w-20 h-20 text-xl"
      : "w-11 h-11 text-sm";
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
   READING PROGRESS BAR
============================================================ */

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const p = total > 0 ? (window.scrollY / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-50">
      <div
        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/* ============================================================
   TABLE OF CONTENTS
============================================================ */

const TableOfContents = ({ headings }) => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-90px 0px -70% 0px" }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="my-10 p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
      <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-4 flex items-center gap-2">
        <FaListUl className="text-xs" />
        In this article
      </p>
      <ol className="space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(h.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`text-sm leading-snug transition-colors block ${
                h.level === 3 ? "pl-5" : ""
              } ${
                activeId === h.id
                  ? "text-rose-600 dark:text-rose-400 font-medium"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {activeId === h.id && <span className="mr-1.5">→</span>}
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

/* ============================================================
   SHARE BUTTONS
============================================================ */

const ShareBar = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url =
    typeof window !== "undefined" ? window.location.href : "";
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(post.title);

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
        return;
      } catch (err) {
        /* user cancelled — fall through to dropdown */
      }
    }
    setOpen((o) => !o);
  };

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const links = [
    {
      icon: FaTwitter,
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
    },
    {
      icon: FaLinkedin,
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    },
    {
      icon: FaFacebook,
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    },
    {
      icon: FaWhatsapp,
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
    },
    {
      icon: FaEnvelope,
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encoded}`,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={nativeShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 dark:border-stone-800 text-sm font-medium text-stone-700 dark:text-stone-300 hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
      >
        <FaShareAlt className="text-xs" />
        Share
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-full mt-2 left-0 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 p-1.5 min-w-[200px] z-40"
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                onClick={() => setOpen(false)}
              >
                <l.icon className="text-xs" />
                {l.label}
              </a>
            ))}
            <button
              onClick={copy}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition w-full"
            >
              <FaLink className="text-xs" />
              {copied ? "Link copied" : "Copy link"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================
   COMMENT SECTION (mock, local)
============================================================ */

const CommentSection = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Ngozi A.",
      role: "RN, Lagos",
      avatar: null,
      body:
        "I read this twice. The section on lifestyle changes being as effective as medication for some people finally made me book the appointment I'd been putting off. Thank you for writing it plainly.",
      date: "2024-11-19T10:12:00Z",
      likes: 14,
    },
    {
      id: 2,
      name: "Dr. Samuel K.",
      role: "Family physician",
      avatar: null,
      body:
        "I recommend articles like this to my patients constantly. The DASH diet explanation is the clearest I've seen in a mainstream piece — no hand-waving, no overselling.",
      date: "2024-11-19T14:35:00Z",
      likes: 27,
    },
  ]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setComments((c) => [
      {
        id: Date.now(),
        name: name.trim() || "Anonymous reader",
        role: "",
        avatar: null,
        body: body.trim(),
        date: new Date().toISOString(),
        likes: 0,
      },
      ...c,
    ]);
    setName("");
    setBody("");
  };

  const formatRelative = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatShortDate(d);
  };

  return (
    <section className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
      <SectionLabel>Discussion</SectionLabel>
      <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-8">
        {comments.length} {comments.length === 1 ? "response" : "responses"}
      </h3>

      <form onSubmit={submit} className="mb-10 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full max-w-sm px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Add to the conversation…"
          className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!body.trim()}
            className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Post response
          </button>
        </div>
      </form>

      <div className="space-y-8">
        {comments.map((c) => (
          <div
            key={c.id}
            className="flex gap-4 pb-8 border-b border-stone-100 dark:border-stone-900 last:border-0 last:pb-0"
          >
            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-medium text-sm flex-shrink-0">
              {initials(c.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                  {c.name}
                </p>
                {c.role && (
                  <>
                    <span className="text-stone-300 dark:text-stone-700">
                      ·
                    </span>
                    <p className="text-xs text-stone-500">{c.role}</p>
                  </>
                )}
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <p className="text-xs text-stone-500">
                  {formatRelative(c.date)}
                </p>
              </div>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed mt-2">
                {c.body}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
                <button className="hover:text-rose-600 transition">
                  ♥ {c.likes}
                </button>
                <button className="hover:text-stone-900 dark:hover:text-stone-100 transition">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ============================================================
   MAIN
============================================================ */

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMobileTOC, setShowMobileTOC] = useState(false);

  /* ---------- Load post from mock data ---------- */
  useEffect(() => {
    const found = allPosts.find((p) => p.slug === slug);
    if (found) {
      setPost(found);
      setNotFound(false);
    } else {
      setPost(null);
      setNotFound(true);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  /* ---------- Derived ---------- */
  const author = useMemo(
    () => authors.find((a) => a.id === post?.authorId),
    [post]
  );
  const reviewer = useMemo(
    () =>
      post?.reviewedBy
        ? authors.find((a) => a.id === post.reviewedBy)
        : null,
    [post]
  );
  const category = useMemo(
    () => categories.find((c) => c.id === post?.categoryId),
    [post]
  );

  const htmlWithIds = useMemo(
    () => (post?.content ? injectHeadingIds(post.content) : ""),
    [post]
  );

  const headings = useMemo(() => {
    if (!post?.content) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlWithIds, "text/html");
    return Array.from(doc.querySelectorAll("h2, h3")).map((el) => ({
      id: el.id,
      text: el.textContent,
      level: parseInt(el.tagName.charAt(1)),
    }));
  }, [htmlWithIds, post]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter((p) => p.id !== post.id && p.categoryId === post.categoryId)
      .slice(0, 3);
  }, [post]);

  /* ---------- Handlers ---------- */
  const onShare = async () => {
    if (!post) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch {
        /* ignored */
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  /* ---------- Not found ---------- */
  if (notFound) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <JournalNav />
        <div className="max-w-3xl mx-auto px-5 py-24 md:py-32 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-4">
            That article isn't here anymore
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-md mx-auto mb-8">
            It may have been moved, retitled, or retracted. Browse the journal
            instead.
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

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <ReadingProgress />
      <JournalNav />

      {/* ---------- STICKY ACTION BAR ---------- */}
      <div className="sticky top-16 z-30 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800/70">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
            >
              <FaArrowLeft className="text-xs" />
              <span className="hidden sm:inline">All stories</span>
            </Link>
            {category && (
              <>
                <span className="hidden sm:inline text-stone-300 dark:text-stone-700">
                  ·
                </span>
                <Link
                  to={`/blog/category/${category.slug || slugify(category.name)}`}
                  className="hidden sm:inline text-xs uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  {category.name}
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400">
            <button
              onClick={() => setLiked((l) => !l)}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                liked ? "text-rose-600" : "hover:text-rose-600"
              }`}
              title="Like"
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
              <span className="hidden sm:inline">
                {(post.likes + (liked ? 1 : 0)).toLocaleString()}
              </span>
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                saved ? "text-amber-600" : "hover:text-amber-600"
              }`}
              title="Save"
            >
              {saved ? <FaBookmark /> : <FaRegBookmark />}
            </button>
            <button
              onClick={onShare}
              className="inline-flex items-center gap-1.5 text-sm hover:text-stone-900 dark:hover:text-stone-100 transition"
              title="Share"
            >
              <FaShareAlt className="text-xs" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------- ARTICLE HEADER ---------- */}
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
          <time>{formatLongDate(post.publishedAt)}</time>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-stone-900 dark:text-stone-50 mb-6"
        >
          {post.title}
        </motion.h1>

        <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 leading-relaxed mb-8 font-light">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <Avatar author={author} size="md" />
            <div className="text-sm">
              <Link
                to={`/blog/author/${author?.id}`}
                className="font-medium text-stone-900 dark:text-stone-100 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                {author?.name}
              </Link>
              <p className="text-xs text-stone-500 flex items-center flex-wrap gap-x-1.5">
                {author?.credentials}
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <FaClock className="text-[9px]" />
                {post.readingTime} min
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <FaEye className="text-[9px]" />
                {post.views.toLocaleString()}
              </p>
            </div>
          </div>

          {post.medicallyReviewed && reviewer && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full">
              <FaCheckCircle className="text-[11px]" />
              Medically reviewed
            </div>
          )}
        </div>
      </header>

      {/* ---------- FEATURED IMAGE ---------- */}
      {post.image && (
        <div className="max-w-5xl mx-auto px-5 mb-12">
          <motion.img
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={post.image}
            alt={post.title}
            className="w-full h-auto rounded-lg"
          />
          <p className="text-xs text-stone-500 dark:text-stone-500 mt-3 text-center italic">
            {post.title} · Photo via Unsplash
          </p>
        </div>
      )}

      {/* ---------- BODY ---------- */}
      <div className="max-w-3xl mx-auto px-5 pb-12">
        {/* Mobile TOC toggle */}
        {headings.length > 0 && (
          <button
            onClick={() => setShowMobileTOC((o) => !o)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 text-sm font-medium text-stone-700 dark:text-stone-300 mb-6"
          >
            <span className="flex items-center gap-2">
              <FaListUl className="text-xs text-rose-600 dark:text-rose-400" />
              Table of contents
            </span>
            {showMobileTOC ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}

        <AnimatePresence>
          {showMobileTOC && headings.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <TableOfContents headings={headings} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop TOC */}
        <div className="hidden lg:block">
          <TableOfContents headings={headings} />
        </div>

        {/* Medical review callout */}
        {post.medicallyReviewed && reviewer && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 my-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0">
              <FaUserMd className="text-emerald-700 dark:text-emerald-400 text-lg" />
            </div>
            <div>
              <p className="font-medium text-emerald-900 dark:text-emerald-200 text-sm mb-1">
                Medically reviewed by{" "}
                <Link
                  to={`/blog/author/${reviewer.id}`}
                  className="underline underline-offset-4 hover:text-emerald-700"
                >
                  {reviewer.name}
                </Link>
                , {reviewer.credentials}
              </p>
              <p className="text-emerald-800/80 dark:text-emerald-300/80 text-xs">
                Last reviewed on {formatLongDate(post.updatedAt || post.publishedAt)}
              </p>
            </div>
          </div>
        )}

        {/* Article body */}
        <div
          ref={contentRef}
          className="prose-editorial text-[17px] sm:text-[19px]"
          dangerouslySetInnerHTML={{ __html: htmlWithIds }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mr-1 flex items-center gap-1.5">
              <FaTag className="text-[10px]" />
              Tagged
            </span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog/tag/${slugify(tag)}`}
                className="text-sm px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Share bar */}
        <div className="mt-10 pt-8 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-stone-500 dark:text-stone-400 italic">
            If this helped you, it will probably help someone else.
          </p>
          <ShareBar post={post} />
        </div>

        {/* Divider */}
        <div className="my-14 flex items-center justify-center gap-4">
          <span className="w-12 h-px bg-stone-300 dark:bg-stone-700" />
          <span className="text-stone-400 dark:text-stone-600 text-xs tracking-widest">
            ◆
          </span>
          <span className="w-12 h-px bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* Author card */}
        {author && (
          <div className="p-6 md:p-8 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-start gap-5">
              <Avatar author={author} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                  Written by
                </p>
                <Link
                  to={`/blog/author/${author.id}`}
                  className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 hover:text-rose-700 dark:hover:text-rose-400 transition"
                >
                  {author.name}
                </Link>
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

        {/* Newsletter */}
        <div className="mt-10 p-6 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
          <SectionLabel icon={FaBookOpen}>
            <span className="text-rose-400 dark:text-rose-600">
              The Alveoly Letter
            </span>
          </SectionLabel>
          <p className="font-serif text-xl font-bold mb-2">
            Get stories worth reading.
          </p>
          <p className="text-sm opacity-80 mb-4 max-w-md">
            A weekly letter on healthcare and clinical practice — no noise, no
            miracle cures. Original reporting, clinical insight, thoughtful
            essays.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-2 max-w-md"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 dark:bg-stone-900/10 border border-white/20 dark:border-stone-900/20 text-sm placeholder-white/60 dark:placeholder-stone-900/60 focus:outline-none focus:border-white/60 dark:focus:border-stone-900/60 transition"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
            <SectionLabel>Keep reading</SectionLabel>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              More in {category?.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((r) => {
                const ra = authors.find((a) => a.id === r.authorId);
                const rc = categories.find((c) => c.id === r.categoryId);
                return (
                  <Link key={r.id} to={`/blog/${r.slug}`} className="group">
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
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection />

        {/* Back to top */}
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

export default BlogPost;