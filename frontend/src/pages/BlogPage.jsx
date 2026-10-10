// src/pages/BlogPage.jsx - PROFESSIONAL REDESIGN v2 (AdSense-Friendly)
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaClock,
  FaArrowRight,
  FaHeart,
  FaEye,
  FaShareAlt,
  FaBookmark,
  FaRegBookmark,
  FaEnvelope,
  FaFire,
  FaArrowLeft,
  FaArrowRight as FaArrowRightIcon,
  FaBars,
  FaThLarge,
} from 'react-icons/fa';
import { HiOutlineSparkles, HiOutlineTrendingUp } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

// ============================================================
// UTILITIES
// ============================================================
const formatDate = (dateString, style = 'long') => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
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

const readingTimeLabel = (min) => `${min || 5} min read`;

// ============================================================
// SUB-COMPONENTS
// ============================================================
const AuthorAvatar = ({ author, name, size = 'sm' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  const avatar = author?.avatar || author?.image;
  const displayName = author?.name || name || 'Unknown';

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={displayName}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-900`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-gray-900`}>
      {getInitials(displayName)}
    </div>
  );
};

/** Editorial article card */
const ArticleCard = ({ post, variant = 'grid', isBookmarked, onBookmark, onShare, isAuthenticated }) => {
  const href = `/blog/post/${post.slug || post._id}`;
  const authorName = post.author?.name || post.authorName || 'Editorial Team';
  const excerpt = post.subtitle || stripHtml(post.content).slice(0, 160);

  if (variant === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="group grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-6 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all duration-300 p-4 sm:p-5"
      >
        <Link to={href} className="block overflow-hidden rounded-xl">
          <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={post.featuredImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700"
              loading="lazy"
            />
          </div>
        </Link>
        <div className="flex flex-col justify-center py-2">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
            <span>{post.category || 'Article'}</span>
            {post.featured && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-amber-600 dark:text-amber-400">Featured</span>
              </>
            )}
          </div>
          <Link to={href}>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base line-clamp-2 mb-4">
            {excerpt}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <AuthorAvatar author={post.author} name={post.authorName} size="sm" />
              <div className="leading-tight">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{authorName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(post.publishDate, 'short')} · {readingTimeLabel(post.readingTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><FaEye /> {post.views || 0}</span>
              <span className="flex items-center gap-1"><FaHeart className="text-red-400" /> {post.likes || 0}</span>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  // Grid variant
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
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
          {isAuthenticated && (
            <button
              onClick={(e) => { e.preventDefault(); onBookmark(post._id || post.id); }}
              className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition opacity-0 group-hover:opacity-100"
              aria-label="Bookmark"
            >
              {isBookmarked ? <FaBookmark className="text-yellow-500" /> : <FaRegBookmark />}
            </button>
          )}
        </div>
      </Link>
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
          <span>{post.category || 'Article'}</span>
        </div>
        <Link to={href} className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-5">
            {excerpt}
          </p>
        </Link>
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <AuthorAvatar author={post.author} name={post.authorName} size="sm" />
            <div className="leading-tight min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{authorName}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {formatDate(post.publishDate, 'short')} · {readingTimeLabel(post.readingTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
            <span className="flex items-center gap-1"><FaEye /> {post.views || 0}</span>
            <button
              onClick={(e) => { e.preventDefault(); onShare(post); }}
              className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition"
              aria-label="Share"
            >
              <FaShareAlt />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

/** Featured hero — magazine style */
const FeaturedHero = ({ post }) => {
  if (!post) return null;
  const href = `/blog/post/${post.slug || post._id}`;
  const authorName = post.author?.name || post.authorName || 'Editorial Team';
  const excerpt = post.subtitle || stripHtml(post.content).slice(0, 220);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 py-8"
    >
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <Link to={href} className="group block order-2 lg:order-1">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-2xl shadow-blue-900/10">
            <img
              src={post.featuredImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700"
            />
          </div>
        </Link>

        <div className="order-1 lg:order-2">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md shadow-blue-500/20">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              Editor's Pick
            </span>
            <Link
              to={`/blog/category/${(post.category || 'general').toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600 transition"
            >
              {post.category || 'Article'}
            </Link>
          </div>

          <Link to={href}>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-gray-900 dark:text-gray-100 leading-[1.15] tracking-tight mb-5 hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-3">
              {post.title}
            </h2>
          </Link>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
            {excerpt}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <AuthorAvatar author={post.author} name={post.authorName} size="md" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{authorName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(post.publishDate)} · {readingTimeLabel(post.readingTime)} · {post.views || 0} views
              </p>
            </div>
          </div>

          <Link
            to={href}
            className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600 transition-all"
          >
            Read the full story
            <FaArrowRight className="text-sm" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

/** Skeleton loader */
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
    <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
      <div className="flex items-center gap-3 pt-4">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// MAIN PAGE
// ============================================================
const BlogPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarks, setBookmarks] = useState([]);
  const [sortBy, setSortBy] = useState('latest');

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('blog_bookmarks') || '[]');
      setBookmarks(saved);
    } catch { /* noop */ }
  }, []);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('blog_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsResult, categoriesResult] = await Promise.all([
          blogAPI.getPosts({
            page: currentPage,
            limit: 6,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchTerm || undefined,
            sort: sortBy,
            publishedOnly: true,
          }),
          blogAPI.getCategories(),
        ]);

        if (cancelled) return;

        if (postsResult.success) {
          setPosts(postsResult.data.posts || []);
          setFeaturedPost(postsResult.data.featuredPost || null);
          setTotalPages(postsResult.data.pagination?.totalPages || 1);
          setTotalPosts(postsResult.data.pagination?.total || 0);
          setTrendingTags(postsResult.data.trendingTags || []);
        }
        if (categoriesResult.success) {
          setCategories(categoriesResult.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching blog data:', error);
          toast.error(error.response?.data?.message || 'Failed to load blog posts');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [currentPage, selectedCategory, searchTerm, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/blog/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleCategoryFilter = (slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const handleBookmark = (postId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save articles');
      return;
    }
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
    } catch { /* cancelled */ }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

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
            <Link to="/blog" className="hover:text-blue-700 dark:hover:text-blue-400 transition">Latest</Link>
            <Link to="/blog/search?q=" className="hover:text-blue-700 dark:hover:text-blue-400 transition">Search</Link>
            <Link to="/" className="hover:text-blue-700 dark:hover:text-blue-400 transition">Courses</Link>
          </nav>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition hidden sm:block"
          >
            ← Back to Alveoly
          </button>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="border-b border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-4 sm:px-6 pt-16 pb-12 text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400 mb-4">
              The Alveoly Journal
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-[1.1] tracking-tight mb-6">
              Evidence-based insights for the modern nurse
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Clinical judgment, exam preparation, and career growth — written by educators, for the next generation of healthcare professionals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============ SEARCH / FILTERS ============ */}
      <section className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSearch} className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search articles by topic, author, or keyword…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-32 py-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all duration-300"
            >
              Search
            </button>
          </form>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 min-w-0">
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.slug}
                  onClick={() => handleCategoryFilter(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.slug
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border border-gray-200 dark:border-gray-800 focus:border-blue-500 outline-none text-gray-700 dark:text-gray-300"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Read</option>
                <option value="trending">Trending</option>
                <option value="oldest">Oldest</option>
              </select>
              <div className="hidden sm:flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition ${
                    viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="Grid view"
                >
                  <FaThLarge className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition ${
                    viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="List view"
                >
                  <FaBars className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURED POST ============ */}
      {!loading && featuredPost && <FeaturedHero post={featuredPost} />}

      {/* ============ ARTICLE GRID ============ */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {selectedCategory === 'all'
                  ? 'Latest Articles'
                  : categories.find((c) => c.slug === selectedCategory)?.name || 'Articles'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalPosts} {totalPosts === 1 ? 'article' : 'articles'} published
              </p>
            </div>
            {trendingTags.length > 0 && (
              <Link
                to="/blog/search?q=trending"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600 transition-all"
              >
                <HiOutlineTrendingUp className="w-4 h-4" />
                See what's trending
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
              <div className="text-5xl mb-4 opacity-50">📖</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No articles found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                We couldn't find any articles matching your filters. Try adjusting your search or browse all topics.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-5'}>
              {posts.map((post, index) => (
                <motion.div
                  key={post._id || post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3) }}
                >
                  <ArticleCard
                    post={post}
                    variant={viewMode === 'list' ? 'list' : 'grid'}
                    isBookmarked={bookmarks.includes(post._id || post.id)}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                    isAuthenticated={isAuthenticated}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* ============ PAGINATION ============ */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-14">
              <button
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <FaArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============ TRENDING TOPICS ============ */}
      {trendingTags.length > 0 && (
        <section className="border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 py-14">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <FaFire className="text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  Trending Topics
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {trendingTags.map((tag) => (
                  <Link
                    key={tag.name}
                    to={`/blog/search?q=${encodeURIComponent(tag.name)}`}
                    className="group inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-700 transition-all"
                  >
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400 group-hover:underline">
                      #{tag.name}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-blue-600 transition">
                      {tag.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ NEWSLETTER ============ */}
      <section className="border-t border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-6 shadow-lg shadow-blue-500/25">
              <FaEnvelope className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-3">
              The Weekly Brief
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              One email. Every Sunday. The most important nursing insights, exam tips, and clinical judgment frameworks — curated by our editorial team.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); toast.success('Thanks for subscribing!'); }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-blue-500 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;