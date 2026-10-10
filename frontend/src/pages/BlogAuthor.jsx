// src/pages/BlogAuthor.jsx - PROFESSIONAL REDESIGN
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaShareAlt,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaGlobe,
  FaEnvelope,
  FaFire,
  FaChevronRight,
  FaCheckCircle,
  FaGraduationCap,
  FaAward,
  FaBriefcase,
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

// ============================================================
// UTILITIES
// ============================================================
const formatDate = (dateString, style = 'long') => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  if (style === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const getInitials = (name) => {
  if (!name) return 'A';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Author avatar with graceful fallback */
const AuthorAvatar = ({ author, name, size = 'md' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-5xl',
  };
  const avatar = author?.avatar || author?.image;
  const displayName = author?.name || name || 'Unknown';
  const sizeClass = sizes[size] || sizes.md;

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={displayName}
        className={`${sizeClass} rounded-full object-cover ring-4 ring-white dark:ring-gray-900 shadow-xl`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ring-4 ring-white dark:ring-gray-900 shadow-xl flex-shrink-0`}
    >
      {getInitials(displayName)}
    </div>
  );
};

/** Article card used in author archive grid */
const AuthorArticleCard = ({ post, isBookmarked, onBookmark, onShare, index }) => {
  const href = `/blog/post/${post.slug || post._id}`;
  const excerpt = post.subtitle || stripHtml(post.content).slice(0, 160);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all duration-300"
    >
      <Link to={href} className="block overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={post.featuredImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

          {post.featured && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-[10px] font-bold uppercase tracking-wider rounded-full">
              Featured
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onBookmark(post._id || post.id);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition opacity-0 group-hover:opacity-100"
            aria-label="Bookmark article"
          >
            {isBookmarked ? <FaBookmark className="text-yellow-500" /> : <FaRegBookmark />}
          </button>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wider">
          <span>{post.category || 'Article'}</span>
        </div>

        <Link to={href} className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-3 mb-5">
            {excerpt}
          </p>
        </Link>

        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {formatDate(post.publishDate, 'short')} · {post.readingTime || post.readTime || 5} min read
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
            <span className="flex items-center gap-1">
              <FaEye /> {post.views || 0}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onShare(post);
              }}
              className="p-1.5 hover:text-blue-700 dark:hover:text-blue-400 transition"
              aria-label="Share article"
            >
              <FaShareAlt />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

/** Skeleton loader for grid */
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
    <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
    </div>
  </div>
);

// ============================================================
// MAIN PAGE
// ============================================================
const BlogAuthor = () => {
  const { authorId } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [authorStats, setAuthorStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
  });

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('blog_bookmarks') || '[]');
      setBookmarks(saved);
    } catch {
      /* noop */
    }
  }, []);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('blog_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Reset to page 1 when author changes
  useEffect(() => {
    setCurrentPage(1);
  }, [authorId]);

  // Fetch author + posts
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getPostsByAuthor(authorId, {
          page: currentPage,
          limit: 6,
        });

        if (cancelled) return;

        if (response?.success) {
          const data = response.data || {};
          setAuthor(data.author || null);
          setPosts(Array.isArray(data.posts) ? data.posts : []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalPosts(data.pagination?.total || 0);
          setAuthorStats({
            totalPosts: data.stats?.totalPosts || 0,
            totalLikes: data.stats?.totalLikes || 0,
            totalViews: data.stats?.totalViews || 0,
          });
        } else {
          toast.error(response?.message || 'Failed to load author');
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || 'Failed to load author');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [authorId, currentPage]);

  const handleBookmark = (postId) => {
    setBookmarks((prev) => {
      const exists = prev.includes(postId);
      toast.success(exists ? 'Removed from your reading list' : 'Saved to your reading list');
      return exists ? prev.filter((id) => id !== postId) : [...prev, postId];
    });
  };

  const handleShare = async (post) => {
    const url = `${window.location.origin}/blog/post/${post.slug || post._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.subtitle, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      /* user cancelled */
    }
  };

  // Pagination numbers
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  // Social list (for the sidebar)
  const authorSocials = useMemo(() => {
    if (!author?.social) return [];
    return [
      { key: 'twitter', icon: FaTwitter, url: author.social.twitter, label: 'Twitter' },
      { key: 'linkedin', icon: FaLinkedin, url: author.social.linkedin, label: 'LinkedIn' },
      { key: 'facebook', icon: FaFacebook, url: author.social.facebook, label: 'Facebook' },
      { key: 'instagram', icon: FaInstagram, url: author.social.instagram, label: 'Instagram' },
      { key: 'youtube', icon: FaYoutube, url: author.social.youtube, label: 'YouTube' },
      { key: 'website', icon: FaGlobe, url: author.social.website, label: 'Website' },
    ].filter((s) => s.url);
  }, [author]);

  // -------- LOADING --------
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <header className="border-b border-gray-100 dark:border-gray-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link to="/blog" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Alveoly <span className="text-blue-700 dark:text-blue-400">Journal</span>
              </span>
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition hidden sm:inline-flex items-center gap-1.5"
            >
              <FaArrowLeft className="w-3 h-3" /> Back
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="flex-1 space-y-3 w-full">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------- NOT FOUND --------
  if (!author) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4 opacity-50">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Author not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            The author you're looking for doesn't exist or has been removed.
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
  }

  const authorName = author.name || 'Editorial Team';
  const authorTitle = author.title || 'Contributor';
  const authorBio = author.bio;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
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

      {/* ============ AUTHOR HEADER ============ */}
      <section className="border-b border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16 max-w-5xl">
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
            <span className="text-gray-500 dark:text-gray-400">Authors</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              <AuthorAvatar author={author} name={authorName} size="2xl" />

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider rounded-full mb-3">
                  <HiOutlineSparkles className="w-3.5 h-3.5" />
                  Author
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-[1.15] tracking-tight mb-3">
                  {authorName}
                </h1>

                <p className="text-base sm:text-lg text-blue-700 dark:text-blue-400 font-medium mb-4">
                  {authorTitle}
                </p>

                {authorBio && (
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mb-6">
                    {authorBio}
                  </p>
                )}

                {/* Meta stats */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-sm text-gray-700 dark:text-gray-300">
                  <span className="inline-flex items-center gap-2">
                    <FaClock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {authorStats.totalPosts || totalPosts || 0}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {authorStats.totalPosts === 1 || totalPosts === 1
                        ? 'article'
                        : 'articles'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FaHeart className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {(authorStats.totalLikes || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">likes</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FaEye className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {(authorStats.totalViews || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">reads</span>
                  </span>
                </div>

                {/* Social + email row */}
                {(authorSocials.length > 0 || author.email) && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-6">
                    {authorSocials.map(({ key, icon: Icon, url, label }) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-800 transition"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    ))}
                    {author.email && (
                      <a
                        href={`mailto:${author.email}`}
                        aria-label="Email author"
                        className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-800 transition"
                      >
                        <FaEnvelope className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ EXPERTISE + BIO PANEL (if provided) ============ */}
      {(Array.isArray(author.expertise) && author.expertise.length > 0) ||
      (Array.isArray(author.education) && author.education.length > 0) ||
      (Array.isArray(author.certifications) && author.certifications.length > 0) ? (
        <section className="border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Expertise */}
              {Array.isArray(author.expertise) && author.expertise.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FaBriefcase className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                      Areas of expertise
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {author.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {Array.isArray(author.education) && author.education.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FaGraduationCap className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                      Education
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {author.education.map((edu, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                      >
                        <FaCheckCircle className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 mt-1 flex-shrink-0" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {Array.isArray(author.certifications) && author.certifications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FaAward className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                      Certifications
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {author.certifications.map((cert, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                      >
                        <FaCheckCircle className="w-3.5 h-3.5 text-amber-500 mt-1 flex-shrink-0" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ ARTICLES ============ */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Articles by {authorName.split(' ')[0]}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalPosts} {totalPosts === 1 ? 'article' : 'articles'} published
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl mx-auto">
              <div className="text-5xl mb-4 opacity-50">📝</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No articles from this author yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                New content is added regularly. In the meantime, explore the latest from our other
                contributors.
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition"
              >
                <FaArrowLeft className="w-3 h-3" /> Browse all articles
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <AuthorArticleCard
                    key={post._id || post.id || post.slug}
                    post={post}
                    index={index}
                    isBookmarked={bookmarks.includes(post._id || post.id)}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                  />
                ))}
              </div>

              {/* ============ PAGINATION ============ */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-14">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <FaArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition ${
                        currentPage === page
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <FaArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
    </div>
  );
};

export default BlogAuthor;