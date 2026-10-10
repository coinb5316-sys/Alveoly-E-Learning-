// src/pages/BlogCategory.jsx - PROFESSIONAL REDESIGN
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaFire,
  FaTag,
  FaSpinner,
  FaChevronRight,
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';

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

const prettyFromSlug = (slug) =>
  (slug || '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

// ============================================================
// SUB-COMPONENTS
// ============================================================
const AuthorAvatar = ({ author, name, size = 'sm' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
  };
  const avatar = author?.avatar || author?.image;
  const displayName = author?.name || name || 'Unknown';

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={displayName}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-900`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-gray-900 flex-shrink-0`}
    >
      {getInitials(displayName)}
    </div>
  );
};

/** Editorial category article card */
const CategoryArticleCard = ({ post, isBookmarked, onBookmark, onShare, index }) => {
  const href = `/blog/post/${post.slug || post._id}`;
  const authorName = post.author?.name || post.authorName || 'Editorial Team';
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
            {isBookmarked ? (
              <FaBookmark className="text-yellow-500" />
            ) : (
              <FaRegBookmark />
            )}
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
          <div className="flex items-center gap-2.5 min-w-0">
            <AuthorAvatar author={post.author} name={post.authorName} size="sm" />
            <div className="leading-tight min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                {authorName}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {formatDate(post.publishDate, 'short')} · {post.readingTime || post.readTime || 5} min read
              </p>
            </div>
          </div>
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
const BlogCategory = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [sortBy, setSortBy] = useState('latest');

  // Load bookmarks from localStorage
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

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  // Fetch all categories once for the "explore" section
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await blogAPI.getCategories();
        if (!cancelled && res?.success) {
          setAllCategories(res.data || []);
        }
      } catch {
        /* noop */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch category + posts
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch category info
        try {
          const categoryResponse = await blogAPI.getCategoryBySlug(category);
          if (cancelled) return;
          if (categoryResponse?.success) {
            setCategoryInfo(categoryResponse.data);
          } else {
            const fallbackName = prettyFromSlug(category);
            setCategoryInfo({
              name: fallbackName,
              description: `Articles, insights, and clinical perspectives in ${fallbackName}.`,
              icon: '📚',
              count: 0,
            });
          }
        } catch {
          const fallbackName = prettyFromSlug(category);
          setCategoryInfo({
            name: fallbackName,
            description: `Articles, insights, and clinical perspectives in ${fallbackName}.`,
            icon: '📚',
            count: 0,
          });
        }

        // Fetch posts
        const postsResponse = await blogAPI.getPostsByCategory(category, {
          page: currentPage,
          limit: 6,
          sort: sortBy,
        });

        if (cancelled) return;

        if (postsResponse?.success) {
          setPosts(postsResponse.data?.posts || []);
          setTotalPages(postsResponse.data?.pagination?.totalPages || 1);
          setTotalPosts(postsResponse.data?.pagination?.total || 0);
        } else {
          toast.error(postsResponse?.message || 'Failed to load posts');
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || 'Failed to load category');
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
  }, [category, currentPage, sortBy]);

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

  // Pagination page numbers
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

  // Other categories (excluding current) for "explore" section
  const otherCategories = useMemo(
    () => allCategories.filter((c) => c.slug !== category).slice(0, 6),
    [allCategories, category]
  );

  const displayName = categoryInfo?.name || prettyFromSlug(category);
  const displayDescription =
    categoryInfo?.description ||
    `Articles, insights, and clinical perspectives in ${displayName}.`;

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

      {/* ============ CATEGORY HEADER ============ */}
      <section className="border-b border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16 max-w-4xl">
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
            <span className="text-gray-500 dark:text-gray-400">{displayName}</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider rounded-full">
                <HiOutlineSparkles className="w-3.5 h-3.5" />
                Topic
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-[1.15] tracking-tight mb-4">
              {displayName}
            </h1>

            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mb-6">
              {displayDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <FaTag className="w-3 h-3" />
                {totalPosts} {totalPosts === 1 ? 'article' : 'articles'}
              </span>
              {categoryInfo?.count > totalPosts && (
                <span className="inline-flex items-center gap-1.5">
                  <FaFire className="w-3 h-3 text-orange-500" />
                  {categoryInfo.count} total posts
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FILTER BAR ============ */}
      <section className="border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing the {sortBy === 'latest' ? 'latest' : sortBy} articles in this category
            </p>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
              >
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-white dark:bg-gray-900 rounded-lg text-sm border border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-500 outline-none text-gray-700 dark:text-gray-300"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Read</option>
                <option value="trending">Trending</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ============ POSTS GRID ============ */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl mx-auto">
              <div className="text-5xl mb-4 opacity-50">📭</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No articles in this category yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                New content is added regularly. In the meantime, explore our latest articles
                across all topics.
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
                  <CategoryArticleCard
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

      {/* ============ EXPLORE OTHER TOPICS ============ */}
      {otherCategories.length > 0 && (
        <section className="border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 py-14">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <FaFire className="text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  Explore other topics
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {otherCategories.map((cat) => (
                  <Link
                    key={cat._id || cat.slug}
                    to={`/blog/category/${cat.slug}`}
                    className="group inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-700 transition-all"
                  >
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400 group-hover:underline">
                      {cat.name}
                    </span>
                    {typeof cat.count === 'number' && cat.count > 0 && (
                      <span className="text-xs text-gray-500 group-hover:text-blue-600 transition">
                        {cat.count}
                      </span>
                    )}
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
    </div>
  );
};

export default BlogCategory;