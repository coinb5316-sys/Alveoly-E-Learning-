// src/pages/blog/BlogPost.jsx — WIRED TO LIVE API
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock, FaEye, FaHeart, FaRegHeart, FaCheckCircle, FaUserMd,
  FaCalendarAlt, FaTag, FaArrowLeft, FaShareAlt, FaBookmark,
  FaRegBookmark, FaPrint, FaLink, FaTwitter, FaLinkedin, FaFacebook,
  FaWhatsapp, FaEnvelope, FaHome, FaSearch, FaChevronDown, FaChevronUp,
  FaListUl, FaTimes, FaMicrophone, FaVideo, FaStream, FaInstagram,
  FaYoutube, FaRss, FaArrowUp, FaBookOpen, FaGraduationCap,
} from "react-icons/fa";
import { publicBlogAPI as blogAPI } from "../../api/blogApi";

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

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

const injectHeadingIds = (html) => {
  if (!html) return html;
  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h\1>/g,
    (match, level, attrs, inner) => {
      const raw = inner.replace(/<[^>]+>/g, "");
      const id =
        slugify(raw) || `section-${Math.random().toString(36).slice(2, 8)}`;
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
   NAV + FOOTER
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
            <Link to="/blog" className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50">
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
   READING PROGRESS
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
   SHARE BAR
============================================================ */

const ShareBar = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(post.title);

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
        return;
      } catch {
        /* user cancelled */
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
   COMMENT SECTION — hits /api/blog/posts/:id/comments
============================================================ */

const CommentSection = ({ postId, initialComments }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await blogAPI.addComment(postId, {
        content: body.trim(),
        authorName: name.trim() || "Anonymous reader",
        authorEmail: "",
      });
      if (res.success) {
        setComments((c) => [res.data, ...c]);
        setName("");
        setBody("");
      }
    } catch {
      /* silently ignored */
    } finally {
      setSubmitting(false);
    }
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
            disabled={submitting || !body.trim()}
            className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting…" : "Post response"}
          </button>
        </div>
      </form>

      <div className="space-y-8">
        {comments.map((c) => (
          <div
            key={c._id || c.id}
            className="flex gap-4 pb-8 border-b border-stone-100 dark:border-stone-900 last:border-0 last:pb-0"
          >
            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-medium text-sm flex-shrink-0">
              {initials(c.authorName || c.name || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                  {c.authorName || c.name}
                </p>
                {c.authorRole && (
                  <>
                    <span className="text-stone-300 dark:text-stone-700">·</span>
                    <p className="text-xs text-stone-500">{c.authorRole}</p>
                  </>
                )}
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <p className="text-xs text-stone-500">
                  {formatRelative(c.createdAt || c.date)}
                </p>
              </div>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed mt-2">
                {c.body || c.content}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
                <button className="hover:text-rose-600 transition">
                  ♥ {c.likes || 0}
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
  const contentRef = useRef(null);

  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMobileTOC, setShowMobileTOC] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);

  /* ---------- Load ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await blogAPI.getPostBySlug(slug);

        if (res.success && res.data) {
          const p = res.data;
          setPost({
            ...p,
            id: p._id,
            author: p.author || p.authorId,
            reviewer: p.reviewer || p.reviewedBy,
            category: p.categoryId?.name || p.category || "",
            categorySlug: p.categoryId?.slug || "",
          });
          setRelatedPosts(p.related || []);
          setComments(p.comments || []);
          setNotFound(false);

          blogAPI.incrementViews(p._id).catch(() => {});
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  /* ---------- Derived ---------- */
  const author = post?.author;
  const reviewer = post?.reviewer;
  const category = useMemo(
    () =>
      post?.category
        ? {
            name: post.category,
            slug: post.categorySlug || slugify(post.category),
          }
        : null,
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

  /* ---------- Handlers ---------- */
  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await blogAPI.toggleLike(post.id);
      if (res.success) {
        setLiked(res.liked);
        setPost((prev) => ({ ...prev, likes: res.likes }));
      }
    } catch {
      /* user not logged in */
    }
  };

  const onShare = async () => {
    if (!post) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin" />
      </div>
    );
  }

  /* ---------- Not found ---------- */
  if (notFound || !post) {
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
            It may have been moved, retitled, or retracted. Browse the journal instead.
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

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <ReadingProgress />
      <JournalNav />

      {/* STICKY ACTION BAR */}
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
                <span className="hidden sm:inline text-stone-300 dark:text-stone-700">·</span>
                <Link
                  to={`/blog/category/${category.slug}`}
                  className="hidden sm:inline text-xs uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  {category.name}
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                liked ? "text-rose-600" : "hover:text-rose-600"
              }`}
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
              <span className="hidden sm:inline">
                {(post.likes || 0).toLocaleString()}
              </span>
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                saved ? "text-amber-600" : "hover:text-amber-600"
              }`}
            >
              {saved ? <FaBookmark /> : <FaRegBookmark />}
            </button>
            <button
              onClick={onShare}
              className="inline-flex items-center gap-1.5 text-sm hover:text-stone-900 dark:hover:text-stone-100 transition"
            >
              <FaShareAlt className="text-xs" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="max-w-3xl mx-auto px-5 pt-12 md:pt-20 pb-6">
        <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400 mb-6">
          {category && (
            <>
              <Link
                to={`/blog/category/${category.slug}`}
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
                to={`/blog/author/${author?._id || author?.id}`}
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
                {(post.views || 0).toLocaleString()}
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

      {/* FEATURED IMAGE */}
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
            {post.title}
          </p>
        </div>
      )}

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-5 pb-12">
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

        <div className="hidden lg:block">
          <TableOfContents headings={headings} />
        </div>

        {post.medicallyReviewed && reviewer && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 my-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0">
              <FaUserMd className="text-emerald-700 dark:text-emerald-400 text-lg" />
            </div>
            <div>
              <p className="font-medium text-emerald-900 dark:text-emerald-200 text-sm mb-1">
                Medically reviewed by{" "}
                <Link
                  to={`/blog/author/${reviewer._id || reviewer.id}`}
                  className="underline underline-offset-4 hover:text-emerald-700"
                >
                  {reviewer.name}
                </Link>
                {reviewer.credentials ? `, ${reviewer.credentials}` : ""}
              </p>
              <p className="text-emerald-800/80 dark:text-emerald-300/80 text-xs">
                Last reviewed on{" "}
                {formatLongDate(post.updatedAt || post.publishedAt)}
              </p>
            </div>
          </div>
        )}

        <div
          ref={contentRef}
          className="prose-editorial text-[17px] sm:text-[19px]"
          dangerouslySetInnerHTML={{ __html: htmlWithIds }}
        />

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

        <div className="mt-10 pt-8 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-stone-500 dark:text-stone-400 italic">
            If this helped you, it will probably help someone else.
          </p>
          <ShareBar post={post} />
        </div>

        <div className="my-14 flex items-center justify-center gap-4">
          <span className="w-12 h-px bg-stone-300 dark:bg-stone-700" />
          <span className="text-stone-400 dark:text-stone-600 text-xs tracking-widest">
            ◆
          </span>
          <span className="w-12 h-px bg-stone-300 dark:bg-stone-700" />
        </div>

        {author && (
          <div className="p-6 md:p-8 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-start gap-5">
              <Avatar author={author} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                  Written by
                </p>
                <Link
                  to={`/blog/author/${author._id || author.id}`}
                  className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 hover:text-rose-700 dark:hover:text-rose-400 transition"
                >
                  {author.name}
                </Link>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                  {author.role}
                  {author.credentials ? ` · ${author.credentials}` : ""}
                </p>
                {author.bio && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                    {author.bio}
                  </p>
                )}

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
                    to={`/blog/author/${author._id || author.id}`}
                    className="ml-1 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition underline underline-offset-4"
                  >
                    All articles →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
            <SectionLabel>Keep reading</SectionLabel>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              More in {category?.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((r) => (
                <Link
                  key={r._id || r.id}
                  to={`/blog/post/${r.slug || r._id}`}
                  className="group"
                >
                  {r.image && (
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full aspect-[16/10] object-cover rounded-md mb-3 group-hover:opacity-95 transition"
                    />
                  )}
                  <h4 className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2 mb-2">
                    {r.title}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {r.readingTime || 5} min read
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <CommentSection postId={post.id} initialComments={comments} />

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

      <JournalFooter />
    </div>
  );
};

export default BlogPost;