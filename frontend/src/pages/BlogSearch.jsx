// src/pages/BlogSearch.jsx - PROFESSIONAL REDESIGN
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaShareAlt,
  FaFire,
  FaTimes,
  FaChevronRight,
  FaLightbulb,
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';

// ============================================================
// UTILITIES
// ============================================================
const formatDate = (dateString, style = 'short') => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  if (style === 'long') {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getInitials = (name) => {
  if (!name) return 'A';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

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

/** Editorial article card for search results */
const SearchResultCard = ({ post, isBookmarked, onBookmark, onShare, index }) => {
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

          {post.trending && (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full inline-flex items-center gap-1">
              <FaFire className="w-2.5 h-2.5" />
              Trending
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
          <div className="flex items-center gap-2.5 min-w-0">
            <AuthorAvatar author={post.author} name={post.authorName} size="sm" />
            <div className="leading-tight min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                {authorName}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {formatDate(post.publishDate)} · {post.readingTime || post.readTime || 5} min read
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
    </div>
  </div>
);

/** Suggested search terms shown on empty state */
const SUGGESTED_TERMS = [
  'NCLEX-RN',
  'Clinical Judgment',
  'Next Generation NCLEX',
  'Nursing Pharmacology',
  'Study Plan',
  'Nursing Leadership',
];

/** Related searches shown at bottom of a results page */
const RELATED_SEARCHES = [
  'NCLEX-RN study plan',
  'clinical judgment framework',
  'nursing exam strategies',
  'med-surg nursing',
  'nursing test-taking tips',
];

// ============================================================
// MAIN PAGE
// ============================================================
const BlogSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState(query);
  const [bookmarks, setBookmarks] = useState([]);
  const [suggestions, setSuggestions] = useState({ titles: [], tags: [], categories: [] });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

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

  // Sync search input with URL when query changes externally
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  // Reset page when query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, categoryFilter, tagFilter]);

  // Fetch search results
  useEffect(() => {
    let cancelled = false;

    const fetchResults = async () => {
      if (!query || query.trim().length < 2) {
        if (!cancelled) {
          setPosts([]);
          setTotalPages(1);
          setTotalResults(0);
          setSuggestions({ titles: [], tags: [], categories: [] });
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 6,
          category: categoryFilter || undefined,
          tag: tagFilter || undefined,
        };

        const response = await blogAPI.searchPosts(query, params);

        if (cancelled) return;

        if (response?.success) {
          const data = response.data || {};
          setPosts(Array.isArray(data.posts) ? data.posts : []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalResults(data.pagination?.total || 0);
          setSuggestions(
            data.suggestions || { titles: [], tags: [], categories: [] }
          );
        } else {
          toast.error(response?.message || 'Search failed');
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || 'Search failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [query, currentPage, categoryFilter, tagFilter]);

  // Scroll to top when query changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
    setCategoryFilter('');
    setTagFilter('');
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSearchParams({ q: suggestion });
    setCategoryFilter('');
    setTagFilter('');
  };

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
      /* cancelled */
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setCategoryFilter('');
    setTagFilter('');
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setTagFilter('');
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

  const hasSuggestions =
    suggestions.titles.length > 0 ||
    suggestions.tags.length > 0 ||
    suggestions.categories.length > 0;

  const showResults = Boolean(query) && !loading;
  const noResults = showResults && posts.length === 0;

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
              className="text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-2 underline-offset-4"
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

      {/* ============ SEARCH HEADER ============ */}
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
            <span className="text-gray-500 dark:text-gray-400">Search</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400 mb-3">
              The Alveoly Journal
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-[1.15] tracking-tight mb-6">
              Search the Journal
            </h1>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mb-8">
              Find articles, guides, and clinical perspectives across every topic in the
              Journal.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by topic, author, or keyword…"
                className="w-full pl-11 pr-32 py-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-24 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                Search
              </button>
            </form>

            {/* Quick stats */}
            {query && !loading && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {totalResults === 0
                  ? `No results for "${query}"`
                  : `${totalResults} ${totalResults === 1 ? 'result' : 'results'} for "${query}"`}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ============ SUGGESTIONS ============ */}
      {query && hasSuggestions && !loading && (
        <section className="border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
            <div className="flex items-start gap-3">
              <HiOutlineSparkles className="w-4 h-4 text-blue-700 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                  Related to your search
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.titles.slice(0, 3).map((title) => (
                    <button
                      key={`t-${title}`}
                      type="button"
                      onClick={() => handleSuggestionClick(title)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition"
                    >
                      {title}
                    </button>
                  ))}
                  {suggestions.tags.slice(0, 4).map((tag) => (
                    <button
                      key={`g-${tag}`}
                      type="button"
                      onClick={() => handleSuggestionClick(tag)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-700 hover:underline transition"
                    >
                      #{tag}
                    </button>
                  ))}
                  {suggestions.categories.slice(0, 3).map((category) => (
                    <button
                      key={`c-${category}`}
                      type="button"
                      onClick={() => handleSuggestionClick(category)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ ACTIVE FILTERS ============ */}
      {query && (categoryFilter || tagFilter) && (
        <section className="border-b border-gray-100 dark:border-gray-900">
          <div className="container mx-auto px-4 sm:px-6 py-4 max-w-4xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Filters
              </span>
              {categoryFilter && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  Category: {categoryFilter}
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('')}
                    aria-label="Remove category filter"
                    className="hover:opacity-70"
                  >
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {tagFilter && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  Tag: #{tagFilter}
                  <button
                    type="button"
                    onClick={() => setTagFilter('')}
                    aria-label="Remove tag filter"
                    className="hover:opacity-70"
                  >
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-2 underline-offset-4 hover:decoration-blue-600"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============ RESULTS ============ */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Empty state — no query at all */}
          {!query && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl mb-10">
                <div className="text-5xl mb-4 opacity-50">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  What are you looking for?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Search by title, author, category, or keyword. Try one of the suggestions
                  below to get started.
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 text-center">
                  Popular searches
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSuggestionClick(term)}
                      className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-700 hover:underline transition"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {query && loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="max-w-2xl mx-auto text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
              <div className="text-5xl mb-4 opacity-50">😕</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No results found for &ldquo;{query}&rdquo;
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Try a different keyword, or explore one of the searches below.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {SUGGESTED_TERMS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSuggestionClick(term)}
                    className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-700 hover:underline transition"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition"
              >
                <FaArrowLeft className="w-3 h-3" /> Browse all articles
              </Link>
            </div>
          )}

          {/* Results */}
          {showResults && posts.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <SearchResultCard
                    key={post._id || post.id || post.slug}
                    post={post}
                    index={index}
                    isBookmarked={bookmarks.includes(post._id || post.id)}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                  />
                ))}
              </div>

              {/* Pagination */}
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

      {/* ============ RELATED SEARCHES ============ */}
      {showResults && posts.length > 0 && (
        <section className="border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
            <div className="flex items-center gap-2 mb-5">
              <FaLightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                Related searches
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {RELATED_SEARCHES.map((term) => (
                <Link
                  key={term}
                  to={`/blog/search?q=${encodeURIComponent(term)}`}
                  className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-700 hover:underline transition"
                >
                  {term}
                </Link>
              ))}
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

export default BlogSearch;