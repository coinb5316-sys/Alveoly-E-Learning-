// src/pages/BlogPostPage.jsx - PROFESSIONAL REDESIGN
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  FaHeart, FaRegHeart, FaShareAlt, FaBookmark, FaRegBookmark,
  FaComment, FaClock, FaCalendarAlt, FaUser, FaTag, FaEye,
  FaTwitter, FaLinkedin, FaFacebook, FaWhatsapp, FaEnvelope,
  FaLink, FaCheckCircle, FaGraduationCap, FaVideo, FaImage,
  FaFileAlt, FaThumbsUp, FaArrowLeft, FaArrowRight, FaLightbulb,
  FaChartLine, FaUserCircle, FaSpinner, FaFire, FaHeadphones,
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaInstagram,
  FaYoutube, FaGlobe, FaAward, FaBriefcase, FaQuoteLeft,
  FaCopy, FaPrint, FaEllipsisH, FaChevronUp, FaChevronDown,
  FaListUl, FaParagraph, FaExternalLinkAlt, FaRegClock,
  FaRegEye, FaRegComment, FaRegBookmark as FaRegBookmarkAlt,
  FaStickyNote, FaHighlighter, FaSearchPlus, FaSearchMinus
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

// ==================== UTILITY COMPONENTS ====================

const ReadingProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 origin-left z-50"
      style={{ scaleX }}
    />
  );
};

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Parse headings from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4');
    
    const parsedHeadings = Array.from(headingElements).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1))
    }));
    
    setHeadings(parsedHeadings);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block fixed right-8 top-32 w-64">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-5"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3"
        >
          <span className="flex items-center gap-2">
            <FaListUl className="text-blue-600" />
            Table of Contents
          </span>
          {isOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-1 overflow-hidden"
            >
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`block text-sm py-1.5 px-2 rounded-lg transition-all duration-200 ${
                    activeId === heading.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                >
                  {heading.text}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ShareMenu = ({ post, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shareOptions = [
    { icon: FaTwitter, label: 'Twitter', color: '#1da1f2', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}` },
    { icon: FaLinkedin, label: 'LinkedIn', color: '#0a66c2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}` },
    { icon: FaFacebook, label: 'Facebook', color: '#1877f2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
    { icon: FaWhatsapp, label: 'WhatsApp', color: '#25d366', url: `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}` },
    { icon: FaEnvelope, label: 'Email', color: '#ea4335', url: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}` },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
      >
        <FaShareAlt className="text-sm" />
        <span className="text-sm font-medium">Share</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 min-w-[200px] z-50"
          >
            {shareOptions.map((option) => (
              <a
                key={option.label}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <option.icon style={{ color: option.color }} className="text-lg" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </a>
            ))}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full"
            >
              <FaLink className="text-lg text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Copy link</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthorCard = ({ author, postAuthorName, postAuthorTitle, postAuthorBio, postAuthorImage }) => {
  const name = author?.name || postAuthorName || 'Unknown Author';
  const title = author?.title || postAuthorTitle || 'Contributor';
  const bio = author?.bio || postAuthorBio || '';
  const image = author?.avatar || author?.image || postAuthorImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-start gap-4">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 dark:border-blue-900/50"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{name}</h4>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{title}</p>
          {bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">{bio}</p>
          )}
        </div>
      </div>

      {/* Author Stats */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{author?.postCount || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Articles</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{author?.totalLikes || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{author?.totalViews || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
        </div>
      </div>

      {/* Social Links */}
      {author?.social && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {author.social.twitter && (
            <a href={author.social.twitter} target="_blank" rel="noopener noreferrer"
               className="p-2 text-gray-400 hover:text-[#1da1f2] transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <FaTwitter />
            </a>
          )}
          {author.social.linkedin && (
            <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer"
               className="p-2 text-gray-400 hover:text-[#0a66c2] transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <FaLinkedin />
            </a>
          )}
          {author.social.website && (
            <a href={author.social.website} target="_blank" rel="noopener noreferrer"
               className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <FaGlobe />
            </a>
          )}
        </div>
      )}

      <Link
        to={`/blog/author/${author?._id || author?.id}`}
        className="block text-center mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
      >
        View all articles →
      </Link>
    </motion.div>
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
  const [activeTab, setActiveTab] = useState('content');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState('base');
  const [showTOC, setShowTOC] = useState(false);
  const audioRef = useRef(null);
  const contentRef = useRef(null);

  // Fetch post data
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
          toast.error(response.message || 'Failed to load blog post');
          navigate('/blog');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error(error.response?.data?.message || 'Failed to load blog post');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
    window.scrollTo(0, 0);
  }, [id, navigate, user, isAuthenticated]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const totalHeight = element.scrollHeight - element.clientHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add IDs to headings for TOC
  useEffect(() => {
    if (post?.content && contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4');
      headings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }
  }, [post]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    
    try {
      const response = await blogAPI.toggleLike(post._id);
      if (response.success) {
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
      } else {
        toast.error(response.message || 'Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark posts');
      return;
    }
    
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    
    try {
      setSubmittingComment(true);
      const response = await blogAPI.addComment(post._id, {
        content: commentText.trim(),
        authorName: user.name,
        authorEmail: user.email
      });
      
      if (response.success) {
        const newComment = {
          ...response.data,
          authorName: user.name,
          authorAvatar: user.avatar || null
        };
        setComments([newComment, ...comments]);
        setCommentText('');
        toast.success('Comment posted successfully');
      } else {
        toast.error(response.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-base';
      case 'lg': return 'text-xl';
      default: return 'text-lg';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Article Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
            <FaArrowLeft />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const authorName = post.author?.name || post.authorName || 'Unknown';
  const authorTitle = post.author?.title || post.authorTitle || 'Contributor';
  const authorImage = post.author?.avatar || post.author?.image || post.authorImage;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Table of Contents */}
      <TableOfContents content={post.content} />

      {/* ==================== HERO SECTION ==================== */}
      <header className="relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 h-[70vh]">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-950 via-black/60 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-white/70 mb-6"
            >
              <Link to="/" className="hover:text-white transition">Home</Link>
              <span className="text-white/40">/</span>
              <Link to="/blog" className="hover:text-white transition">Blog</Link>
              <span className="text-white/40">/</span>
              <span className="text-white/60 truncate max-w-[200px]">{post.category || 'Article'}</span>
            </motion.nav>

            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                to={`/blog/category/${post.category?.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium hover:bg-white/30 transition mb-6"
              >
                {post.category || 'Uncategorized'}
              </Link>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              {post.title}
            </motion.h1>

            {/* Subtitle */}
            {post.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl mb-8"
              >
                {post.subtitle}
              </motion.p>
            )}

            {/* Author & Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap items-center gap-6"
            >
              {/* Author */}
              <div className="flex items-center gap-3">
                {authorImage ? (
                  <img
                    src={authorImage}
                    alt={authorName}
                    className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white/30 flex items-center justify-center text-white text-lg font-bold">
                    {authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{authorName}</p>
                  <p className="text-sm text-white/60">{authorTitle}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-white/50" />
                  {formatDate(post.publishDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-white/50" />
                  {post.readingTime || 5} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <FaEye className="text-white/50" />
                  {viewsCount.toLocaleString()} views
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
          {/* Article Content */}
          <article className="lg:w-2/3 xl:w-3/5">
            {/* Reading Tools Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-4 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 mb-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Reading Progress */}
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {Math.round(readingProgress)}%
                  </span>
                </div>

                {/* Font Size Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize('sm')}
                    className={`p-1.5 rounded-lg transition ${fontSize === 'sm' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Small text"
                  >
                    <FaSearchMinus className="text-xs" />
                  </button>
                  <button
                    onClick={() => setFontSize('base')}
                    className={`p-1.5 rounded-lg transition ${fontSize === 'base' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Normal text"
                  >
                    <FaParagraph className="text-xs" />
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    className={`p-1.5 rounded-lg transition ${fontSize === 'lg' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Large text"
                  >
                    <FaSearchPlus className="text-xs" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied!');
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="Copy link"
                  >
                    <FaCopy className="text-sm" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="Print"
                  >
                    <FaPrint className="text-sm" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Audio Player */}
            {post.audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-100 dark:border-blue-800/50"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleAudio}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 flex-shrink-0"
                  >
                    {audioPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Listen to this article
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {post.readingTime || 5} min listen • AI narrated
                    </p>
                    <audio
                      ref={audioRef}
                      src={post.audioUrl}
                      onEnded={() => setAudioPlaying(false)}
                      className="hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaVolumeUp className="text-gray-400" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Article Body */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-gray-800"
            >
              {/* Content */}
              <div
                ref={contentRef}
                className={`prose prose-lg max-w-none dark:prose-invert ${getFontSizeClass()}
                  prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                  prose-headings:font-bold prose-headings:scroll-mt-24
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:italic
                  prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:rounded-xl prose-pre:shadow-lg
                  prose-img:rounded-2xl prose-img:shadow-lg
                  prose-li:text-gray-700 dark:prose-li:text-gray-300
                  prose-hr:border-gray-200 dark:prose-hr:border-gray-800`}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Statistics */}
              {post.statistics && post.statistics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-10">
                  {post.statistics.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-5 text-center border border-blue-100 dark:border-blue-800/50"
                    >
                      <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Gallery Images */}
              {post.galleryImages && post.galleryImages.length > 0 && (
                <div className="my-10">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {post.galleryImages.map((img, index) => (
                      <motion.img
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        className="rounded-xl object-cover h-48 w-full hover:scale-105 transition duration-300 cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Objectives */}
              {post.learningObjectives && post.learningObjectives.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 my-10 border border-blue-100 dark:border-blue-800/50">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                    <FaGraduationCap className="text-blue-600" />
                    Learning Objectives
                  </h3>
                  <ul className="space-y-3">
                    {post.learningObjectives.map((obj, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Video Embed */}
              {post.videoUrl && (
                <div className="my-10">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FaVideo className="text-red-500" />
                    Video
                  </h3>
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
                    <iframe
                      src={post.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video content"
                    />
                  </div>
                </div>
              )}

              {/* References */}
              {post.references && post.references.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">References</h3>
                  <ol className="space-y-3">
                    {post.references.map((ref, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">[{index + 1}]</span>
                        <span>{ref}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog/search?q=${tag}`}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Engagement Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 mt-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Like & Bookmark */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      liked
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    {liked ? <FaHeart /> : <FaRegHeart />}
                    <span className="font-medium">{likesCount.toLocaleString()}</span>
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      bookmarked
                        ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 hover:text-yellow-600 dark:hover:text-yellow-400'
                    }`}
                  >
                    {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    <span className="font-medium">{bookmarked ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      showComments
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <FaComment />
                    <span className="font-medium">{comments.length}</span>
                  </button>
                </div>

                {/* Share */}
                <ShareMenu post={post} />
              </div>
            </motion.div>

            {/* Comments Section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 mt-6 overflow-hidden"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                    <FaComment className="text-blue-600" />
                    Comments ({comments.length})
                  </h3>

                  {isAuthenticated ? (
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                      <div className="flex gap-3">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user?.name?.charAt(0) || 'G'}
                          </div>
                        )}
                        <div className="flex-1">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-gray-700 dark:text-gray-300 min-h-[100px] transition"
                            rows={3}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              type="submit"
                              disabled={submittingComment || !commentText.trim()}
                              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {submittingComment ? (
                                <>
                                  <FaSpinner className="animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                'Post Comment'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          Login
                        </Link>{' '}
                        or{' '}
                        <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          Sign up
                        </Link>{' '}
                        to join the conversation
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-12">
                        <FaRegComment className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <motion.div
                          key={comment._id || comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                        >
                          {comment.authorAvatar || comment.avatar ? (
                            <img
                              src={comment.authorAvatar || comment.avatar}
                              alt={comment.authorName || comment.user}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {(comment.authorName || comment.user)?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {comment.authorName || comment.user}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(comment.createdAt || comment.date)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mt-1.5">{comment.content || comment.text}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <button className="text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                                <FaThumbsUp className="text-xs" />
                                Like
                              </button>
                              <button className="text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                                Reply
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Author Bio at End */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/30 rounded-3xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {authorImage ? (
                  <img
                    src={authorImage}
                    alt={authorName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {authorName.charAt(0)}
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Written by</p>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{authorName}</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{authorTitle}</p>
                  {(post.author?.bio || post.authorBio) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{post.author?.bio || post.authorBio}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-1/3 xl:w-2/5 space-y-6">
            {/* Author Card */}
            <AuthorCard
              author={post.author}
              postAuthorName={post.authorName}
              postAuthorTitle={post.authorTitle}
              postAuthorBio={post.authorBio}
              postAuthorImage={post.authorImage}
            />

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-6 text-white"
            >
              <h4 className="text-lg font-bold mb-2">Stay Updated</h4>
              <p className="text-white/80 text-sm mb-4">
                Get the latest healthcare insights delivered to your inbox
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition text-sm"
                />
                <button className="px-4 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm">
                  Subscribe
                </button>
              </div>
              <p className="text-white/50 text-xs mt-3">No spam. Unsubscribe anytime.</p>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
            >
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FaLightbulb className="text-yellow-500" />
                Related Articles
              </h4>
              <div className="space-y-4">
                {relatedPosts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No related articles</p>
                ) : (
                  relatedPosts.slice(0, 4).map((related) => (
                    <Link
                      key={related._id || related.id}
                      to={`/blog/post/${related.slug || related._id}`}
                      className="block group"
                    >
                      <div className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        {related.featuredImage ? (
                          <img
                            src={related.featuredImage}
                            alt={related.title}
                            className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                            <FaFileAlt className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2 text-sm">
                            {related.title}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <FaClock className="text-[10px]" />
                            {related.readingTime || 5} min read
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>

            {/* Popular Tags */}
            {post.tags && post.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
              >
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog/search?q=${tag}`}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer Navigation */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
          >
            <FaArrowLeft />
            Back to Blog
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
          >
            <FaChevronUp />
            Back to Top
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;