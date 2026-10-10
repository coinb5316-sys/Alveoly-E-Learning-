// src/pages/BlogPostPage.jsx - EDITORIAL HUMAN-LIKE REDESIGN
import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  FaHeart, FaRegHeart, FaShareAlt, FaBookmark, FaRegBookmark,
  FaComment, FaClock, FaCalendarAlt, FaEye, FaTwitter, FaLinkedin,
  FaFacebook, FaWhatsapp, FaEnvelope, FaLink, FaCheckCircle,
  FaGraduationCap, FaVideo, FaFileAlt, FaThumbsUp, FaArrowLeft,
  FaArrowRight, FaLightbulb, FaSpinner, FaHeadphones, FaPlay,
  FaPause, FaInstagram, FaYoutube, FaGlobe, FaQuoteLeft,
  FaChevronUp, FaChevronDown, FaCopy, FaPrint, FaListUl,
  FaMinus, FaPlus, FaTimes, FaRegClock
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

const ReactPlayer = lazy(() => import('react-player'));

// ==================== HELPER: READING PROGRESS ====================
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

// ==================== HELPER: TABLE OF CONTENTS ====================
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
    <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          In this article
        </span>
        {onClose && (
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 lg:hidden">
            <FaTimes className="text-xs" />
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
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              onClose?.();
            }}
            className={`block text-sm leading-snug transition-colors ${
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

// ==================== HELPER: SHARE DROPDOWN ====================
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
        Share
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
  const [relatedPosts, setRelatedPosts] = useState([]);
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
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getPostBySlug(id);
        if (response.success) {
          const data = response.data;
          setPost(data);
          setRelatedPosts(data.relatedPosts || []);
          setComments(data.comments || []);
          setLikesCount(data.likes || 0);
          setViewsCount(data.views || 0);

          if (isAuthenticated && user && data.likedBy) {
            setLiked(data.likedBy.includes(user._id));
          }
          if (isAuthenticated && user && data.bookmarkedBy) {
            setBookmarked(data.bookmarkedBy.includes(user._id));
          }
          await blogAPI.incrementViews(data._id);
        } else {
          toast.error(response.message || 'Failed to load post');
          navigate('/blog');
        }
      } catch (err) {
        console.error(err);
        toast.error('Could not load this article');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id, navigate, user, isAuthenticated]);

  // ---------- Add heading IDs for TOC ----------
  useEffect(() => {
    if (post?.content && contentRef.current) {
      const els = contentRef.current.querySelectorAll('h2, h3');
      els.forEach((el, i) => {
        el.id = `section-${i}`;
        el.style.scrollMarginTop = '5rem';
      });
    }
  }, [post]);

  // ---------- Reading time calc ----------
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
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

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

  const fontSizeClass =
    fontSize === 'sm' ? 'text-[17px]' : fontSize === 'lg' ? 'text-[21px]' : 'text-[19px]';

  // ---------- Loading State ----------
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
          <p className="text-6xl mb-4">📄</p>
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
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <ReadingProgress />

      {/* ============ TOP NAV BAR ============ */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
          >
            <FaArrowLeft className="text-xs" />
            <span className="hidden sm:inline">All stories</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Font size controls */}
            <div className="hidden sm:flex items-center gap-1 border border-stone-200 dark:border-stone-800 rounded-full p-0.5">
              <button
                onClick={() => setFontSize('sm')}
                className={`w-7 h-7 rounded-full text-xs font-medium transition ${
                  fontSize === 'sm' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Small"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`w-7 h-7 rounded-full text-sm font-medium transition ${
                  fontSize === 'base' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Medium"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`w-7 h-7 rounded-full text-base font-medium transition ${
                  fontSize === 'lg' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Large"
              >
                A
              </button>
            </div>

            <button
              onClick={() => setShowTOC(true)}
              className="lg:hidden text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 transition"
            >
              <FaListUl />
            </button>
            <ShareDropdown title={post.title} />
          </div>
        </div>
      </div>

      {/* ============ ARTICLE HEADER ============ */}
      <header className="max-w-3xl mx-auto px-5 pt-12 md:pt-20 pb-8">
        {/* Category + Date */}
        <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400 mb-6">
          {post.category && (
            <>
              <Link
                to={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="uppercase tracking-wider text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
              >
                {post.category}
              </Link>
              <span className="text-stone-300 dark:text-stone-700">·</span>
            </>
          )}
          <time>{formatDate(post.publishDate)}</time>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] font-bold tracking-tight text-stone-900 dark:text-stone-50 mb-6">
          {post.title}
        </h1>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 leading-relaxed font-light mb-8">
            {post.subtitle}
          </p>
        )}

        {/* Author Row */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            {authorImage ? (
              <img
                src={authorImage}
                alt={authorName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-stone-100 dark:ring-stone-800"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-medium text-stone-700 dark:text-stone-300">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium text-stone-900 dark:text-stone-100">{authorName}</p>
              <p className="text-stone-500 dark:text-stone-500 flex items-center gap-1.5">
                <FaRegClock className="text-[10px]" />
                {readingTime} min read
                <span className="text-stone-300 dark:text-stone-700">·</span>
                {viewsCount.toLocaleString()} views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-stone-500 dark:text-stone-400">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                liked ? 'text-rose-600' : 'hover:text-rose-600'
              }`}
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
              <span className="hidden sm:inline">{likesCount}</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`inline-flex items-center gap-1.5 text-sm transition ${
                bookmarked ? 'text-amber-600' : 'hover:text-amber-600'
              }`}
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </div>
        </div>
      </header>

      {/* ============ FEATURED IMAGE ============ */}
      {post.featuredImage && (
        <div className="max-w-5xl mx-auto px-5 mb-12">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto rounded-lg shadow-sm"
          />
          {post.imageCaption && (
            <p className="text-sm text-stone-500 dark:text-stone-500 mt-3 text-center italic">
              {post.imageCaption}
            </p>
          )}
        </div>
      )}

      {/* ============ BODY LAYOUT ============ */}
      <div className="max-w-6xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left rail — desktop sharing */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 flex flex-col items-center gap-5 text-stone-400 dark:text-stone-500">
              <button
                onClick={handleLike}
                className={`transition hover:text-rose-600 ${liked ? 'text-rose-600' : ''}`}
                title="Like"
              >
                {liked ? <FaHeart /> : <FaRegHeart />}
                <span className="block text-[10px] mt-0.5 text-center">{likesCount}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="transition hover:text-stone-900 dark:hover:text-stone-100"
                title="Comments"
              >
                <FaComment />
                <span className="block text-[10px] mt-0.5 text-center">{comments.length}</span>
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
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-sky-500"
                title="Share on Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-blue-600"
                title="Share on LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
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

          {/* Main article */}
          <article className="lg:col-span-8 xl:col-span-7">
            {/* Audio Player */}
            {post.audioUrl && (
              <div className="mb-10 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-4">
                <button
                  onClick={toggleAudio}
                  className="w-12 h-12 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center hover:opacity-90 transition flex-shrink-0"
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

            {/* Article content */}
            <div
              ref={contentRef}
              className={`prose-editorial ${fontSizeClass}`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Statistics */}
            {post.statistics?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-12 py-8 border-y border-stone-200 dark:border-stone-800">
                {post.statistics.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
                      {stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-stone-500 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery */}
            {post.galleryImages?.length > 0 && (
              <div className="my-12">
                <div className="grid grid-cols-2 gap-3">
                  {post.galleryImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Fig. ${i + 1}`}
                      className="rounded-lg object-cover w-full h-56 hover:opacity-95 transition cursor-zoom-in"
                    />
                  ))}
                </div>
                <p className="text-sm text-stone-500 mt-3 italic">Figures from the article</p>
              </div>
            )}

            {/* Video */}
            {post.videoUrl && (
              <div className="my-12">
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
                      config={{ youtube: { playerVars: { modestbranding: 1, rel: 0 } } }}
                    />
                  </Suspense>
                </div>
                <p className="text-sm text-stone-500 mt-3 italic">Watch the video</p>
              </div>
            )}

            {/* Learning objectives */}
            {post.learningObjectives?.length > 0 && (
              <div className="my-12 p-6 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-lg">
                <p className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <FaGraduationCap className="text-amber-600" />
                  What you'll learn
                </p>
                <ul className="space-y-2">
                  {post.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-700 dark:text-stone-300">
                      <FaCheckCircle className="text-amber-600 mt-1 text-sm flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* References */}
            {post.references?.length > 0 && (
              <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-xl font-bold mb-5 text-stone-900 dark:text-stone-100">
                  References
                </h3>
                <ol className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
                  {post.references.map((ref, i) => (
                    <li key={i} className="flex gap-3 leading-relaxed">
                      <span className="text-stone-400 font-mono text-xs pt-0.5 flex-shrink-0">
                        [{i + 1}]
                      </span>
                      <span>{ref}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog/search?q=${tag}`}
                    className="text-sm px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="my-16 flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-stone-300 dark:bg-stone-700" />
              <span className="text-stone-400 dark:text-stone-600 text-xs tracking-widest">◆</span>
              <span className="w-12 h-px bg-stone-300 dark:bg-stone-700" />
            </div>

            {/* Author Bio Card */}
            <div className="p-6 md:p-8 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-start gap-5">
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
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">{authorTitle}</p>
                  )}
                  {authorBio && (
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                      {authorBio}
                    </p>
                  )}

                  {/* Social */}
                  {post.author?.social && (
                    <div className="flex items-center gap-3 mt-4">
                      {post.author.social.twitter && (
                        <a href={post.author.social.twitter} target="_blank" rel="noopener noreferrer"
                           className="text-stone-400 hover:text-sky-500 transition">
                          <FaTwitter />
                        </a>
                      )}
                      {post.author.social.linkedin && (
                        <a href={post.author.social.linkedin} target="_blank" rel="noopener noreferrer"
                           className="text-stone-400 hover:text-blue-600 transition">
                          <FaLinkedin />
                        </a>
                      )}
                      {post.author.social.website && (
                        <a href={post.author.social.website} target="_blank" rel="noopener noreferrer"
                           className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition">
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
            <div className="mt-10 flex items-center justify-between flex-wrap gap-4 py-5 border-y border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-6 text-sm text-stone-600 dark:text-stone-400">
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
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </button>
              </div>
              <ShareDropdown title={post.title} />
            </div>

            {/* Comments */}
            <section className="mt-10" id="comments">
              <AnimatePresence>
                {(showComments || comments.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="font-serif text-xl font-bold mb-6 text-stone-900 dark:text-stone-100">
                      Discussion
                    </h3>

                    {isAuthenticated ? (
                      <form onSubmit={handleCommentSubmit} className="mb-10">
                        <div className="flex gap-3">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.name}
                                 className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-medium text-stone-700 dark:text-stone-300 flex-shrink-0">
                              {user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="flex-1">
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Add to the discussion…"
                              rows={3}
                              className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition resize-none"
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
                      <div className="mb-10 p-5 rounded-xl bg-stone-50 dark:bg-stone-900 text-center text-sm text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                        <Link to="/login" className="font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4">
                          Sign in
                        </Link>{' '}
                        to share your thoughts
                      </div>
                    )}

                    <div className="space-y-6">
                      {comments.length === 0 ? (
                        <p className="text-center text-stone-500 py-8">
                          No comments yet. Be the first to write.
                        </p>
                      ) : (
                        comments.map((c) => (
                          <div key={c._id || c.id} className="flex gap-3 pb-6 border-b border-stone-100 dark:border-stone-800 last:border-0">
                            {c.authorAvatar || c.avatar ? (
                              <img src={c.authorAvatar || c.avatar} alt={c.authorName}
                                   className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-medium text-stone-700 dark:text-stone-300 flex-shrink-0">
                                {(c.authorName || c.user)?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-stone-900 dark:text-stone-100">
                                  {c.authorName || c.user}
                                </span>
                                <span className="text-stone-400 text-xs">
                                  {formatTimeAgo(c.createdAt || c.date)}
                                </span>
                              </div>
                              <p className="mt-1.5 text-stone-700 dark:text-stone-300 leading-relaxed">
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
          </article>

          {/* Right sidebar */}
          <aside className="lg:col-span-3 xl:col-span-4 lg:sticky lg:top-24 lg:self-start space-y-8">
            <TableOfContents content={post.content} />

            {relatedPosts.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">
                  More stories
                </h4>
                <div className="space-y-5">
                  {relatedPosts.slice(0, 4).map((r) => (
                    <Link
                      key={r._id || r.id}
                      to={`/blog/post/${r.slug || r._id}`}
                      className="group block"
                    >
                      <div className="flex gap-3">
                        {r.featuredImage && (
                          <img
                            src={r.featuredImage}
                            alt={r.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <h5 className="font-serif text-sm font-medium leading-snug text-stone-900 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition line-clamp-2">
                            {r.title}
                          </h5>
                          <p className="text-xs text-stone-500 mt-1">
                            {r.readingTime || 5} min read
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="p-5 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
              <p className="font-serif text-lg font-bold mb-2">
                Get stories worth reading.
              </p>
              <p className="text-sm opacity-80 mb-4">
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
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-white dark:bg-stone-950 z-50 p-5 overflow-y-auto lg:hidden"
            >
              <TableOfContents content={post.content} onClose={() => setShowTOC(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPostPage;