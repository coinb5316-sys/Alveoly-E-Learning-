// src/pages/BlogPostPage.jsx - PROFESSIONAL v3 (Production Ready)
import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaBookmark,
  FaRegBookmark,
  FaComment,
  FaClock,
  FaCalendarAlt,
  FaEye,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaWhatsapp,
  FaLink,
  FaCheckCircle,
  FaGraduationCap,
  FaVideo,
  FaFileAlt,
  FaArrowLeft,
  FaArrowRight,
  FaLightbulb,
  FaSpinner,
  FaHeadphones,
  FaPlay,
  FaPause,
  FaInstagram,
  FaYoutube,
  FaGlobe,
  FaChevronRight,
  FaListUl,
  FaChevronUp,
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

const ReactPlayer = lazy(() => import('react-player'));

// ============================================================
// UTILITIES
// ============================================================
const formatDate = (dateString, style = 'long') => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    if (style === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return formatDate(dateString, 'short');
  } catch {
    return 'N/A';
  }
};

const getInitials = (name) => {
  if (!name) return 'A';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const categorySlug = (cat) =>
  (cat || 'general').toString().toLowerCase().trim().replace(/\s+/g, '-');

/** Reading progress bar hook */
const useReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      const pct = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
};

// ============================================================
// SUB-COMPONENTS
// ============================================================
const AuthorAvatar = ({ author, name, size = 'md' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-2xl',
  };
  const avatar = author?.avatar || author?.image;
  const displayName = author?.name || name || 'Unknown';
  const sizeClass = sizes[size] || sizes.md;

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={displayName}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-gray-900`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-gray-900 flex-shrink-0`}
    >
      {getInitials(displayName)}
    </div>
  );
};

const AuthorSocialRow = ({ author }) => {
  if (!author?.social) return null;
  const list = [
    { key: 'twitter', icon: FaTwitter, url: author.social.twitter, label: 'Twitter' },
    { key: 'linkedin', icon: FaLinkedin, url: author.social.linkedin, label: 'LinkedIn' },
    { key: 'facebook', icon: FaFacebook, url: author.social.facebook, label: 'Facebook' },
    { key: 'instagram', icon: FaInstagram, url: author.social.instagram, label: 'Instagram' },
    { key: 'youtube', icon: FaYoutube, url: author.social.youtube, label: 'YouTube' },
    { key: 'website', icon: FaGlobe, url: author.social.website, label: 'Website' },
  ].filter((s) => s.url);

  if (!list.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {list.map(({ key, icon: Icon, url, label }) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="p-2 rounded-full transition text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
};

/** Floating share rail (desktop only) */
const ShareRail = ({ post, onCopy }) => {
  if (typeof window === 'undefined') return null;
  const url = window.location.href;
  const title = post?.title || '';
  const links = [
    {
      key: 'twitter',
      icon: FaTwitter,
      label: 'Share on Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'hover:text-[#1da1f2] hover:border-[#1da1f2]',
    },
    {
      key: 'linkedin',
      icon: FaLinkedin,
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:text-[#0a66c2] hover:border-[#0a66c2]',
    },
    {
      key: 'facebook',
      icon: FaFacebook,
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-[#1877f2] hover:border-[#1877f2]',
    },
    {
      key: 'whatsapp',
      icon: FaWhatsapp,
      label: 'Share on WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      color: 'hover:text-[#25d366] hover:border-[#25d366]',
    },
  ];

  return (
    <div className="hidden xl:flex flex-col items-center gap-2 sticky top-32 self-start">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
        Share
      </span>
      {links.map(({ key, icon: Icon, href, label, color }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`p-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 ${color} transition`}
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy link"
        className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-700 hover:border-blue-400 transition"
      >
        <FaLink className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

/** Loading skeleton */
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-gray-950">
    <div className="container mx-auto px-4 sm:px-6 py-24 max-w-3xl">
      <div className="animate-pulse space-y-6">
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full" />
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/** Empty state */
const NotFoundState = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
    <div className="text-center max-w-md px-6">
      <div className="text-5xl mb-4 opacity-50">📄</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Article not found</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        The article you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/blog"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition"
      >
        <FaArrowLeft className="w-3.5 h-3.5" /> Back to Journal
      </Link>
    </div>
  </div>
);

// ============================================================
// MAIN PAGE
// ============================================================
const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const progress = useReadingProgress();

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
  const [activeTab, setActiveTab] = useState('content');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const audioRef = useRef(null);

  // -------- FETCH POST --------
  useEffect(() => {
    let cancelled = false;
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getPostBySlug(id);
        if (cancelled) return;
        if (response?.success) {
          const data = response.data || {};
          setPost(data);
          setRelatedPosts(Array.isArray(data.relatedPosts) ? data.relatedPosts : []);
          setComments(Array.isArray(data.comments) ? data.comments : []);
          setLikesCount(data.likes || 0);
          setViewsCount(data.views || 0);
          if (isAuthenticated && user && Array.isArray(data.likedBy)) {
            setLiked(data.likedBy.includes(user._id));
          }
          if (isAuthenticated && user && Array.isArray(data.bookmarkedBy)) {
            setBookmarked(data.bookmarkedBy.includes(user._id));
          }
          if (data._id) {
            blogAPI.incrementViews(data._id).catch(() => {});
          }
        } else {
          toast.error(response?.message || 'Failed to load blog post');
          navigate('/blog');
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || 'Failed to load blog post');
          navigate('/blog');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [id, navigate, user, isAuthenticated]);

  // -------- BACK TO TOP LISTENER --------
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleNativeShare = async () => {
    if (!post) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.subtitle, url: shareUrl });
      } else {
        handleCopyLink();
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like this article');
      return;
    }
    if (!post?._id) return;
    try {
      const response = await blogAPI.toggleLike(post._id);
      if (response?.success) {
        setLiked((v) => !v);
        setLikesCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
      }
    } catch {
      toast.error('Failed to like post');
    }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save articles');
      return;
    }
    setBookmarked((v) => !v);
    toast.success(bookmarked ? 'Removed from your reading list' : 'Saved to your reading list');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!post?._id) return;
    try {
      setSubmittingComment(true);
      const response = await blogAPI.addComment(post._id, {
        content: commentText.trim(),
        authorName: user?.name,
        authorEmail: user?.email,
      });
      if (response?.success) {
        setComments((prev) => [
          { ...response.data, authorName: user?.name, authorAvatar: user?.avatar },
          ...prev,
        ]);
        setCommentText('');
        toast.success('Comment submitted for review');
      }
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setAudioPlaying((v) => !v);
  };

  // -------- RENDER STATES --------
  if (loading) return <LoadingSkeleton />;
  if (!post) return <NotFoundState />;

  const authorName = post.author?.name || post.authorName || 'Editorial Team';
  const authorTitle = post.author?.title || post.authorTitle || 'Contributor';
  const authorBio = post.author?.bio || post.authorBio;
  const postCategory = post.category || 'General';

  const hasExtraTabs =
    Boolean(post.videoUrl) ||
    Boolean(post.audioUrl) ||
    (Array.isArray(post.references) && post.references.length > 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ============ READING PROGRESS BAR ============ */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-40 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ============ MASTHEAD ============ */}
      <header className="border-b border-gray-100 dark:border-gray-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Alveoly <span className="text-blue-700 dark:text-blue-400">Journal</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Link to="/blog" className="hover:text-blue-700 dark:hover:text-blue-400 transition">
              Latest
            </Link>
            <Link
              to="/blog/search?q="
              className="hover:text-blue-700 dark:hover:text-blue-400 transition"
            >
              Search
            </Link>
            <Link to="/" className="hover:text-blue-700 dark:hover:text-blue-400 transition">
              Courses
            </Link>
          </nav>
          <Link
            to="/blog"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <FaArrowLeft className="w-3 h-3" /> Back
          </Link>
        </div>
      </header>

      {/* ============ ARTICLE ============ */}
      <article className="container mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-8 flex-wrap">
            <Link
              to="/"
              className="hover:text-blue-700 dark:hover:text-blue-400 transition hover:underline"
            >
              Home
            </Link>
            <FaChevronRight className="w-2 h-2" />
            <Link
              to="/blog"
              className="hover:text-blue-700 dark:hover:text-blue-400 transition hover:underline"
            >
              Journal
            </Link>
            <FaChevronRight className="w-2 h-2" />
            <Link
              to={`/blog/category/${categorySlug(postCategory)}`}
              className="text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600"
            >
              {postCategory}
            </Link>
          </nav>

          {/* Category + featured */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Link
              to={`/blog/category/${categorySlug(postCategory)}`}
              className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider rounded-full underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600"
            >
              {postCategory}
            </Link>
            {post.featured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <HiOutlineSparkles className="w-3.5 h-3.5" /> Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-gray-900 dark:text-gray-100 leading-[1.15] tracking-tight mb-5">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {post.subtitle}
            </p>
          )}

          {/* Author + meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-gray-100 dark:border-gray-900">
            <div className="flex items-center gap-3">
              <AuthorAvatar author={post.author} name={post.authorName} size="lg" />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {authorName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{authorTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="w-3 h-3" /> {formatDate(post.publishDate, 'short')}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="w-3 h-3" /> {post.readingTime || 5} min read
              </span>
              <span className="flex items-center gap-1.5">
                <FaEye className="w-3 h-3" /> {viewsCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ============ TABS ============ */}
          {hasExtraTabs && (
            <div className="flex flex-wrap gap-2 mt-8 mb-8">
              {[
                { key: 'content', label: 'Article', icon: FaFileAlt },
                post.videoUrl && { key: 'videos', label: 'Watch', icon: FaVideo },
                post.audioUrl && { key: 'audio', label: 'Listen', icon: FaHeadphones },
                Array.isArray(post.references) &&
                  post.references.length > 0 && {
                    key: 'references',
                    label: 'References',
                    icon: FaListUl,
                  },
              ]
                .filter(Boolean)
                .map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
                      activeTab === key
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
            </div>
          )}

          {/* ============ CONTENT ============ */}
          {activeTab === 'content' && (
            <>
              {post.featuredImage && (
                <motion.figure
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="my-8"
                >
                  <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </motion.figure>
              )}

              {post.audioUrl && (
                <div className="mb-10 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={toggleAudio}
                    aria-label={audioPlaying ? 'Pause audio' : 'Play audio'}
                    className="w-11 h-11 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center flex-shrink-0 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition"
                  >
                    {audioPlaying ? (
                      <FaPause className="w-3.5 h-3.5" />
                    ) : (
                      <FaPlay className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Listen to this article
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {post.title}
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

              {/* Body */}
              <div className="relative">
                <div className="xl:absolute xl:-left-20 xl:top-0 xl:h-full">
                  <ShareRail post={post} onCopy={handleCopyLink} />
                </div>

                <div
                  className="
                    prose prose-lg max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-li:text-gray-700 dark:prose-li:text-gray-300
                    prose-a:text-blue-700 dark:prose-a:text-blue-400
                    prose-a:font-medium
                    prose-a:underline
                    prose-a:decoration-blue-300
                    prose-a:decoration-2
                    prose-a:underline-offset-4
                    hover:prose-a:decoration-blue-600
                    prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/20
                    prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                    prose-img:rounded-2xl prose-img:shadow-sm
                    prose-hr:border-gray-200 dark:prose-hr:border-gray-800
                    prose-code:text-blue-700 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-table:text-sm
                  "
                  dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />
              </div>

              {/* Gallery */}
              {Array.isArray(post.galleryImages) && post.galleryImages.length > 0 && (
                <section className="mt-12">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                    Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {post.galleryImages.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                      >
                        <img
                          src={img}
                          alt={`Gallery image ${i + 1}`}
                          className="aspect-square w-full object-cover group-hover:scale-[1.05] transition duration-500"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Statistics */}
              {Array.isArray(post.statistics) && post.statistics.length > 0 && (
                <section className="my-12 py-8 border-y border-gray-100 dark:border-gray-900">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6 text-center">
                    Key Numbers
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {post.statistics.map((stat, i) => (
                      <div key={i} className="text-center">
                        <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Learning objectives */}
              {Array.isArray(post.learningObjectives) && post.learningObjectives.length > 0 && (
                <section className="my-12 p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                  <div className="flex items-center gap-2 mb-5">
                    <FaGraduationCap className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      What you&apos;ll learn
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {post.learningObjectives.map((obj, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                      >
                        <FaCheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-400 mt-1 flex-shrink-0" />
                        <span className="leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Tags */}
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-900">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                    Related Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog/search?q=${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600 transition border border-gray-100 dark:border-gray-800"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============ VIDEO TAB ============ */}
          {activeTab === 'videos' && post.videoUrl && (
            <div className="mt-8">
              <div className="rounded-2xl overflow-hidden bg-black aspect-video">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <FaSpinner className="animate-spin text-white text-3xl" />
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
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Video presentation of this article
              </p>
            </div>
          )}

          {/* ============ AUDIO TAB ============ */}
          {activeTab === 'audio' && post.audioUrl && (
            <div className="mt-8 p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center mx-auto mb-4">
                <FaHeadphones className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Listen to this article
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Narrated version of &ldquo;{post.title}&rdquo;
              </p>
              <button
                type="button"
                onClick={toggleAudio}
                className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto hover:bg-blue-700 transition"
                aria-label={audioPlaying ? 'Pause' : 'Play'}
              >
                {audioPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
          )}

          {/* ============ REFERENCES TAB ============ */}
          {activeTab === 'references' &&
            Array.isArray(post.references) &&
            post.references.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">
                  References
                </h3>
                <ol className="space-y-3">
                  {post.references.map((ref, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                    >
                      <span className="text-blue-700 dark:text-blue-400 font-semibold flex-shrink-0 w-6">
                        {i + 1}.
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: ref }} />
                    </li>
                  ))}
                </ol>
              </div>
            )}

          {/* ============ ENGAGEMENT BAR ============ */}
          <div className="mt-14 pt-8 border-t border-gray-100 dark:border-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
                    liked
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50'
                      : 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                >
                  {liked ? (
                    <FaHeart className="w-3.5 h-3.5" />
                  ) : (
                    <FaRegHeart className="w-3.5 h-3.5" />
                  )}
                  <span>{likesCount.toLocaleString()}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBookmark}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
                    bookmarked
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                      : 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-900/50 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                >
                  {bookmarked ? (
                    <FaBookmark className="w-3.5 h-3.5" />
                  ) : (
                    <FaRegBookmark className="w-3.5 h-3.5" />
                  )}
                  <span>{bookmarked ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowComments((v) => !v)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
                    showComments
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                      : 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-900/50 hover:text-blue-700 dark:hover:text-blue-400'
                  }`}
                >
                  <FaComment className="w-3.5 h-3.5" />
                  <span>{comments.length}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-900/50 hover:text-blue-700 dark:hover:text-blue-400 transition"
              >
                <FaShareAlt className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* ============ AUTHOR BIO ============ */}
          <div className="mt-12 p-6 sm:p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-5">
              <AuthorAvatar author={post.author} name={post.authorName} size="xl" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                  Written by
                </p>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{authorName}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{authorTitle}</p>
                {authorBio && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                    {authorBio}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {post.author?._id && (
                    <Link
                      to={`/blog/author/${post.author._id}`}
                      className="text-sm font-medium text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600"
                    >
                      View all articles
                    </Link>
                  )}
                  <AuthorSocialRow author={post.author} />
                </div>
              </div>
            </div>
          </div>

          {/* ============ COMMENTS ============ */}
          <AnimatePresence initial={false}>
            {showComments && (
              <motion.section
                key="comments-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-12 overflow-hidden"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
                  Discussion ({comments.length})
                </h3>

                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} className="mb-8">
                    <div className="flex gap-3">
                      <AuthorAvatar
                        author={{ name: user?.name, avatar: user?.avatar }}
                        name={user?.name}
                        size="md"
                      />
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your perspective…"
                          rows={3}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
                        />
                        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Comments are reviewed before publishing.
                          </p>
                          <button
                            type="submit"
                            disabled={submittingComment || !commentText.trim()}
                            className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            {submittingComment && (
                              <FaSpinner className="animate-spin w-3 h-3" />
                            )}
                            Post comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <Link
                        to="/login"
                        className="font-semibold text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600"
                      >
                        Sign in
                      </Link>{' '}
                      or{' '}
                      <Link
                        to="/signup"
                        className="font-semibold text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600"
                      >
                        create an account
                      </Link>{' '}
                      to join the discussion.
                    </p>
                  </div>
                )}

                <div className="space-y-5">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No comments yet. Be the first to share your thoughts.
                    </p>
                  ) : (
                    comments.map((c, i) => (
                      <motion.div
                        key={c._id || c.id || i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <AuthorAvatar
                          author={{
                            name: c.authorName || c.user,
                            avatar: c.authorAvatar || c.avatar,
                          }}
                          name={c.authorName || c.user}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {c.authorName || c.user}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(c.createdAt || c.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                            {c.content || c.text}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </article>

      {/* ============ RELATED ARTICLES ============ */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                <FaLightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  Continue reading
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.slice(0, 3).map((r) => (
                  <Link
                    key={r._id || r.id || r.slug}
                    to={`/blog/post/${r.slug || r._id}`}
                    className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all duration-300"
                  >
                    {r.featuredImage && (
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={r.featuredImage}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">
                        {r.category || 'Article'}
                      </p>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition line-clamp-2 leading-snug">
                        {r.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        {r.readingTime || 5} min read
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ FOOTER CTA ============ */}
      <section className="border-t border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition"
            >
              <FaArrowLeft className="w-3 h-3" /> Back to Journal
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition"
            >
              Explore more articles <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ BACK TO TOP ============ */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition"
            aria-label="Back to top"
          >
            <FaChevronUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPostPage;