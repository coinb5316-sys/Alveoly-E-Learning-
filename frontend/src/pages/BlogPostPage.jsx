// src/pages/BlogPostPage.jsx - EDITORIAL + RESPONSIVE + ADMIN RELATED POSTS
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  FaHeart, FaRegHeart, FaShareAlt, FaBookmark, FaRegBookmark,
  FaComment, FaClock, FaCalendarAlt, FaEye, FaTwitter, FaLinkedin,
  FaFacebook, FaWhatsapp, FaEnvelope, FaLink, FaCheckCircle,
  FaGraduationCap, FaVideo, FaFileAlt, FaArrowLeft, FaLightbulb,
  FaSpinner, FaHeadphones, FaPlay, FaPause, FaInstagram, FaYoutube,
  FaGlobe, FaChevronUp, FaChevronDown, FaListUl, FaTimes, FaRegClock,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

const ReactPlayer = lazy(() => import('react-player'));

// ==================== READING PROGRESS ====================
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-rose-500 origin-left z-50"
      style={{ scaleX }}
    />
  );
};

// ==================== TABLE OF CONTENTS ====================
const TableOfContents = ({ content, onClose }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!content) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const els = doc.querySelectorAll('h2, h3');
    const parsed = Array.from(els).map((el, i) => ({
      id: `section-${i}`,
      text: el.textContent,
      level: parseInt(el.tagName.charAt(1)),
    }));
    setHeadings(parsed);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          In this article
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 lg:hidden p-1"
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>
      <nav className="space-y-1.5">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
              onClose?.();
            }}
            className={`block text-sm leading-snug py-1 transition-colors ${
              activeId === h.id
                ? 'text-rose-600 dark:text-rose-400 font-medium'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            style={{ paddingLeft: h.level === 3 ? '1rem' : '0' }}
          >
            {activeId === h.id && <span className="mr-1.5">→</span>}
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

// ==================== SHARE DROPDOWN ====================
const ShareDropdown = ({ title }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { icon: FaTwitter, label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`, color: 'hover:text-sky-500' },
    { icon: FaLinkedin, label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, color: 'hover:text-blue-600' },
    { icon: FaFacebook, label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, color: 'hover:text-blue-700' },
    { icon: FaWhatsapp, label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encoded}`, color: 'hover:text-green-500' },
    { icon: FaEnvelope, label: 'Email', href: `mailto:?subject=${encodedTitle}&body=${encoded}`, color: 'hover:text-rose-500' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
      >
        <FaShareAlt className="text-xs" />
        <span className="hidden sm:inline">Share</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 p-1.5 min-w-[180px] z-40"
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${l.color}`}
              >
                <l.icon className="text-sm" />
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success('Link copied');
                setOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors w-full"
            >
              <FaLink className="text-sm" />
              Copy link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== RELATED POST CARD ====================
// ⬅️ NEW — a single reusable card for related posts (mobile + desktop)
const RelatedPostCard = ({ post, variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <Link
        to={`/blog/post/${post.slug || post._id}`}
        className="group block"
      >
        <div className="flex gap-3 items-start">
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <h5 className="font-serif text-sm font-medium leading-snug text-stone-900 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition line-clamp-2">
              {post.title}
            </h5>
            <p className="text-xs text-stone-500 mt-1">
              {post.readingTime || 5} min read
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/post/${post.slug || post._id}`}
      className="group block border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden hover:border-stone-400 dark:hover:border-stone-600 transition"
    >
      {post.featuredImage ? (
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full aspect-[16/9] object-cover"
        />
      ) : (
        <div className="w-full aspect-[16/9] bg-stone-100 dark:bg-stone-900" />
      )}
      <div className="p-4">
        {post.category && (
          <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-2">
            {post.category}
          </p>
        )}
        <h5 className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2 mb-2">
          {post.title}
        </h5>
        {post.subtitle && (
          <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
            {post.subtitle}
          </p>
        )}
        <p className="text-xs text-stone-500 mt-3">
          {post.readingTime || 5} min read
        </p>
      </div>
    </Link>
  );
};

// ==================== MAIN COMPONENT ====================
const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [relatedPosts, setRelatedPosts] = useState([]); // ⬅️ admin-curated
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [fontSize, setFontSize] = useState('base');
  const [showTOC, setShowTOC] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  const audioRef = useRef(null);
  const contentRef = useRef(null);

  // ---------- Fetch Post ----------
  // ⬅️ CHANGED — guard against undefined id AND load admin-curated related posts
  useEffect(() => {
    // Defense: don't call the API with a broken id
    if (!id || id === 'undefined' || id === 'null') {
      toast.error('Invalid article link');
      navigate('/blog', { replace: true });
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getPostBySlug(id);

        if (response.success) {
          const data = response.data;
          setPost(data);
          setComments(data.comments || []);
          setLikesCount(data.likes || 0);
          setViewsCount(data.views || 0);

          if (isAuthenticated && user && data.likedBy) {
            setLiked(data.likedBy.includes(user._id));
          }
          if (isAuthenticated && user && data.bookmarkedBy) {
            setBookmarked(data.bookmarkedBy.includes(user._id));
          }

          // ⬅️ NEW — resolve admin-curated related posts
          // The admin form stores `relatedPosts` as an array of IDs on the post.
          // We need to fetch each one to get its full data (title, image, slug).
          const rawRelated = data.relatedPosts || [];
          const populatedRelated = rawRelated.filter((r) => r && (r._id || r.slug || r.title));

          if (populatedRelated.length > 0) {
            // If backend already populates them, use them
            setRelatedPosts(populatedRelated);
          } else if (rawRelated.length > 0) {
            // Otherwise fetch each by id
            try {
              const fetched = await Promise.all(
                rawRelated.slice(0, 6).map(async (rid) => {
                  try {
                    const r = await blogAPI.getPostById(rid);
                    return r.success ? r.data : null;
                  } catch {
                    return null;
                  }
                })
              );
              setRelatedPosts(fetched.filter(Boolean));
            } catch (err) {
              console.warn('Could not fetch related posts:', err);
              setRelatedPosts([]);
            }
          } else {
            // Fallback to backend suggestions
            setRelatedPosts(data.suggestedPosts || data.related || []);
          }

          await blogAPI.incrementViews(data._id);
        } else {
          toast.error(response.message || 'Failed to load post');
          navigate('/blog', { replace: true });
        }
      } catch (err) {
        console.error(err);
        toast.error('Could not load this article');
        navigate('/blog', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id, navigate, user, isAuthenticated]);

  // ---------- Heading IDs for TOC ----------
  useEffect(() => {
    if (post?.content && contentRef.current) {
      const els = contentRef.current.querySelectorAll('h2, h3');
      els.forEach((el, i) => {
        el.id = `section-${i}`;
        el.style.scrollMarginTop = '5rem';
      });
    }
  }, [post]);

  // ---------- Reading time ----------
  useEffect(() => {
    if (post?.content) {
      const text = post.content.replace(/<[^>]*>/g, '');
      const words = text.trim().split(/\s+/).length;
      setReadingTime(Math.max(1, Math.ceil(words / 220)));
    }
  }, [post]);

  // ---------- Handlers ----------
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to like this article');
      return;
    }
    try {
      const response = await blogAPI.toggleLike(post._id);
      if (response.success) {
        setLiked(!liked);
        setLikesCount((p) => (liked ? p - 1 : p + 1));
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to save articles');
      return;
    }
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Removed from your list' : 'Saved to your list');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      toast.error('Sign in to join the discussion');
      return;
    }
    try {
      setSubmittingComment(true);
      const response = await blogAPI.addComment(post._id, {
        content: commentText.trim(),
        authorName: user.name,
        authorEmail: user.email,
      });
      if (response.success) {
        setComments([
          { ...response.data, authorName: user.name, authorAvatar: user.avatar || null },
          ...comments,
        ]);
        setCommentText('');
        toast.success('Comment posted');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setAudioPlaying(!audioPlaying);
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

  const formatTimeAgo = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(d);
  };

  // ⬅️ CHANGED — font size scales down on mobile
  const fontSizeClass =
    fontSize === 'sm'
      ? 'text-[16px] sm:text-[17px]'
      : fontSize === 'lg'
      ? 'text-[19px] sm:text-[21px]'
      : 'text-[17px] sm:text-[19px]';

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Loading story…</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="font-serif text-4xl mb-4 text-stone-400">404</p>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
            Story not found
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            This article may have been moved or deleted.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
          >
            <FaArrowLeft className="text-xs" />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const authorName = post.author?.name || post.authorName || 'Anonymous';
  const authorTitle = post.author?.title || post.authorTitle || '';
  const authorImage = post.author?.avatar || post.author?.image || post.authorImage;
  const authorBio = post.author?.bio || post.authorBio || '';

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 overflow-x-hidden">
      <ReadingProgress />

      {/* ============ TOP NAV ============ */}
      <div className="sticky top-0 z-40 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800/70">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition flex-shrink-0"
          >
            <FaArrowLeft className="text-xs" />
            <span className="hidden sm:inline">All stories</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Font size */}
            <div className="hidden sm:flex items-center gap-1 border border-stone-200 dark:border-stone-800 rounded-full p-0.5">
              <button
                onClick={() => setFontSize('sm')}
                className={`w-7 h-7 rounded-full text-xs font-medium transition ${
                  fontSize === 'sm'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                aria-label="Small text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`w-7 h-7 rounded-full text-sm font-medium transition ${
                  fontSize === 'base'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                aria-label="Medium text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`w-7 h-7 rounded-full text-base font-medium transition ${
                  fontSize === 'lg'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                aria-label="Large text"
              >
                A
              </button>
            </div>

            <button
              onClick={() => setShowTOC(true)}
              className="lg:hidden text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition p-2"
              aria-label="Table of contents"
            >
              <FaListUl />
            </button>
            <ShareDropdown title={post.title} />
          </div>
        </div>
      </div>

      {/* ============ HEADER ============ */}
      {/* ⬅️ CHANGED — tighter padding on mobile */}
      <header className="max-w-3xl mx-auto px-4 sm:px-5 pt-10 sm:pt-12 md:pt-20 pb-6 sm:pb-8">
        {/* Category + Date */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-5 sm:mb-6">
          {post.category && (
            <>
              <Link
                to={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="uppercase tracking-wider text-[11px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
              >
                {post.category}
              </Link>
              <span className="text-stone-300 dark:text-stone-700">·</span>
            </>
          )}
          <time>{formatDate(post.publishDate)}</time>
        </div>

        {/* Title */}
        {/* ⬅️ CHANGED — fluid type scale for phones */}
        <h1 className="font-serif text-[28px] leading-[1.15] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-stone-900 dark:text-stone-50 mb-4 sm:mb-6">
          {post.title}
        </h1>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="text-lg sm:text-xl md:text-2xl text-stone-600 dark:text-stone-400 leading-relaxed font-light mb-6 sm:mb-8">
            {post.subtitle}
          </p>
        )}

        {/* Author row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3 min-w-0">
            {authorImage ? (
              <img
                src={authorImage}
                alt={authorName}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-stone-100 dark:ring-stone-800 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-medium text-stone-700 dark:text-stone-300 flex-shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-sm min-w-0">
              <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
                {authorName}
              </p>
              <p className="text-stone-500 dark:text-stone-500 flex items-center flex-wrap gap-x-1.5 text-xs">
                <FaRegClock className="text-[10px]" />
                {readingTime} min
                <span className="text-stone-300 dark:text-stone-700">·</span>
                {viewsCount.toLocaleString()} views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-stone-500 dark:text-stone-400 flex-shrink-0">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                liked ? 'text-rose-600' : 'hover:text-rose-600'
              }`}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
              <span className="hidden sm:inline">{likesCount}</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                bookmarked ? 'text-amber-600' : 'hover:text-amber-600'
              }`}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </div>
        </div>
      </header>

      {/* ============ FEATURED IMAGE ============ */}
      {post.featuredImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-5 mb-8 sm:mb-12">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto rounded-lg"
          />
          {post.imageCaption && (
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-500 mt-3 text-center italic">
              {post.imageCaption}
            </p>
          )}
        </div>
      )}

      {/* ============ BODY ============ */}
      {/* ⬅️ CHANGED — grid collapses earlier on md, gap scales */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Desktop left rail */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 flex flex-col items-center gap-5 text-stone-400 dark:text-stone-500">
              <button
                onClick={handleLike}
                className={`transition hover:text-rose-600 ${liked ? 'text-rose-600' : ''}`}
                title="Like"
              >
                {liked ? <FaHeart /> : <FaRegHeart />}
                <span className="block text-[10px] mt-0.5 text-center">
                  {likesCount}
                </span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="transition hover:text-stone-900 dark:hover:text-stone-100"
                title="Comments"
              >
                <FaComment />
                <span className="block text-[10px] mt-0.5 text-center">
                  {comments.length}
                </span>
              </button>

              <button
                onClick={handleBookmark}
                className={`transition hover:text-amber-600 ${bookmarked ? 'text-amber-600' : ''}`}
                title="Save"
              >
                {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              </button>

              <div className="w-px h-8 bg-stone-200 dark:bg-stone-800" />

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-sky-500"
                title="Share on Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-blue-600"
                title="Share on LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-blue-700"
                title="Share on Facebook"
              >
                <FaFacebook />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied');
                }}
                className="transition hover:text-stone-900 dark:hover:text-stone-100"
                title="Copy link"
              >
                <FaLink />
              </button>
            </div>
          </aside>

          {/* Article */}
          <article className="lg:col-span-8 xl:col-span-7 min-w-0">
            {/* Audio player */}
            {post.audioUrl && (
              <div className="mb-8 sm:mb-10 p-3 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3 sm:gap-4">
                <button
                  onClick={toggleAudio}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center hover:opacity-90 transition flex-shrink-0"
                  aria-label={audioPlaying ? 'Pause' : 'Play'}
                >
                  {audioPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <FaHeadphones className="text-xs text-stone-400" />
                    Listen to this story
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Narrated · {readingTime} min
                  </p>
                </div>
                <audio
                  ref={audioRef}
                  src={post.audioUrl}
                  onEnded={() => setAudioPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

            {/* Content */}
            <div
              ref={contentRef}
              className={`prose-editorial ${fontSizeClass}`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Statistics */}
            {post.statistics?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-10 sm:my-12 py-6 sm:py-8 border-y border-stone-200 dark:border-stone-800">
                {post.statistics.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
                      {stat.value}
                    </p>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-500 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery */}
            {post.galleryImages?.length > 0 && (
              <div className="my-10 sm:my-12">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {post.galleryImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Fig. ${i + 1}`}
                      className="rounded-lg object-cover w-full h-40 sm:h-56 hover:opacity-95 transition cursor-zoom-in"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-500 mt-3 italic">
                  Figures from the article
                </p>
              </div>
            )}

            {/* Video */}
            {post.videoUrl && (
              <div className="my-10 sm:my-12">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        <FaSpinner className="animate-spin text-white text-2xl" />
                      </div>
                    }
                  >
                    <ReactPlayer
                      url={post.videoUrl}
                      width="100%"
                      height="100%"
                      controls
                      config={{
                        youtube: { playerVars: { modestbranding: 1, rel: 0 } },
                      }}
                    />
                  </Suspense>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 mt-3 italic">
                  Watch the video
                </p>
              </div>
            )}

            {/* Learning objectives */}
            {post.learningObjectives?.length > 0 && (
              <div className="my-10 sm:my-12 p-4 sm:p-6 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-lg">
                <p className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <FaGraduationCap className="text-amber-600" />
                  What you'll learn
                </p>
                <ul className="space-y-2">
                  {post.learningObjectives.map((obj, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm sm:text-base text-stone-700 dark:text-stone-300"
                    >
                      <FaCheckCircle className="text-amber-600 mt-1 text-sm flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* References */}
            {post.references?.length > 0 && (
              <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-stone-900 dark:text-stone-100">
                  References
                </h3>
                <ol className="space-y-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                  {post.references.map((ref, i) => (
                    <li key={i} className="flex gap-3 leading-relaxed">
                      <span className="text-stone-400 font-mono text-xs pt-0.5 flex-shrink-0">
                        [{i + 1}]
                      </span>
                      <span className="break-words">{ref}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mt-10 sm:mt-12 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog/search?q=${tag}`}
                    className="text-xs sm:text-sm px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="my-12 sm:my-16 flex items-center justify-center gap-4">
              <span className="w-10 sm:w-12 h-px bg-stone-300 dark:bg-stone-700" />
              <span className="text-stone-400 dark:text-stone-600 text-xs tracking-widest">
                ◆
              </span>
              <span className="w-10 sm:w-12 h-px bg-stone-300 dark:bg-stone-700" />
            </div>

            {/* Author bio card */}
            <div className="p-5 sm:p-6 md:p-8 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                {authorImage ? (
                  <img
                    src={authorImage}
                    alt={authorName}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-stone-300 dark:bg-stone-700 flex items-center justify-center text-2xl font-serif font-bold text-stone-700 dark:text-stone-300 flex-shrink-0">
                    {authorName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                    Written by
                  </p>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                    {authorName}
                  </h3>
                  {authorTitle && (
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                      {authorTitle}
                    </p>
                  )}
                  {authorBio && (
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                      {authorBio}
                    </p>
                  )}

                  {post.author?.social && (
                    <div className="flex items-center gap-3 mt-4">
                      {post.author.social.twitter && (
                        <a
                          href={post.author.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-sky-500 transition"
                        >
                          <FaTwitter />
                        </a>
                      )}
                      {post.author.social.linkedin && (
                        <a
                          href={post.author.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-blue-600 transition"
                        >
                          <FaLinkedin />
                        </a>
                      )}
                      {post.author.social.website && (
                        <a
                          href={post.author.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                        >
                          <FaGlobe />
                        </a>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/blog/author/${post.author?._id || post.author?.id}`}
                    className="inline-block mt-4 text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    More from {authorName.split(' ')[0]}
                  </Link>
                </div>
              </div>
            </div>

            {/* Interaction bar */}
            <div className="mt-8 sm:mt-10 flex items-center justify-between flex-wrap gap-4 py-4 sm:py-5 border-y border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-5 sm:gap-6 text-sm text-stone-600 dark:text-stone-400">
                <button
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 transition ${
                    liked ? 'text-rose-600' : 'hover:text-rose-600'
                  }`}
                >
                  {liked ? <FaHeart /> : <FaRegHeart />}
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="inline-flex items-center gap-2 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  <FaComment />
                  {comments.length}
                </button>
              </div>
              <ShareDropdown title={post.title} />
            </div>

            {/* Comments */}
            <section className="mt-8 sm:mt-10" id="comments">
              <AnimatePresence>
                {(showComments || comments.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="font-serif text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-stone-900 dark:text-stone-100">
                      Discussion
                    </h3>

                    {isAuthenticated ? (
                      <form onSubmit={handleCommentSubmit} className="mb-8 sm:mb-10">
                        <div className="flex gap-3">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-medium text-stone-700 dark:text-stone-300 flex-shrink-0 text-sm">
                              {user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Add to the discussion…"
                              rows={3}
                              className="w-full px-3 sm:px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm sm:text-base text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition resize-none"
                            />
                            <div className="flex justify-end mt-3">
                              <button
                                type="submit"
                                disabled={submittingComment || !commentText.trim()}
                                className="px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {submittingComment ? 'Posting…' : 'Post comment'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="mb-8 sm:mb-10 p-4 sm:p-5 rounded-xl bg-stone-50 dark:bg-stone-900 text-center text-sm text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                        <Link
                          to="/login"
                          className="font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4"
                        >
                          Sign in
                        </Link>{' '}
                        to share your thoughts
                      </div>
                    )}

                    <div className="space-y-5 sm:space-y-6">
                      {comments.length === 0 ? (
                        <p className="text-center text-stone-500 py-8 text-sm">
                          No comments yet. Be the first to write.
                        </p>
                      ) : (
                        comments.map((c) => (
                          <div
                            key={c._id || c.id}
                            className="flex gap-3 pb-5 sm:pb-6 border-b border-stone-100 dark:border-stone-800 last:border-0"
                          >
                            {c.authorAvatar || c.avatar ? (
                              <img
                                src={c.authorAvatar || c.avatar}
                                alt={c.authorName}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-medium text-stone-700 dark:text-stone-300 flex-shrink-0 text-sm">
                                {(c.authorName || c.user)?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="font-medium text-stone-900 dark:text-stone-100">
                                  {c.authorName || c.user}
                                </span>
                                <span className="text-stone-400 text-xs">
                                  {formatTimeAgo(c.createdAt || c.date)}
                                </span>
                              </div>
                              <p className="mt-1.5 text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed break-words">
                                {c.content || c.text}
                              </p>
                              <button className="mt-2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition">
                                Reply
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* ⬅️ NEW — ADMIN-CURATED RELATED POSTS (inline, mobile-friendly) */}
            {relatedPosts.length > 0 && (
              <section className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-stone-900 dark:text-stone-100">
                  Related reading
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {relatedPosts.slice(0, 4).map((r) => (
                    <RelatedPostCard key={r._id || r.slug} post={r} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          {/* ⬅️ CHANGED — hidden on lg breakpoint below xl, sticky only on xl */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-4 lg:sticky lg:top-24 lg:self-start space-y-6 sm:space-y-8">
            <TableOfContents content={post.content} />

            {/* Related posts (sidebar) — uses same admin list */}
            {relatedPosts.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">
                  More stories
                </h4>
                <div className="space-y-5">
                  {relatedPosts.slice(0, 4).map((r) => (
                    <RelatedPostCard
                      key={r._id || r.slug}
                      post={r}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="p-5 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
              <p className="font-serif text-base sm:text-lg font-bold mb-2">
                Get stories worth reading.
              </p>
              <p className="text-xs sm:text-sm opacity-80 mb-4">
                A weekly letter on healthcare and nursing education. No noise.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/10 dark:bg-stone-900/10 border border-white/20 dark:border-stone-900/20 text-sm placeholder-white/50 dark:placeholder-stone-900/50 focus:outline-none focus:border-white/60 dark:focus:border-stone-900/60 transition"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile TOC drawer */}
      <AnimatePresence>
        {showTOC && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTOC(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-white dark:bg-stone-950 z-50 p-5 overflow-y-auto lg:hidden"
            >
              <TableOfContents
                content={post.content}
                onClose={() => setShowTOC(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPostPage;