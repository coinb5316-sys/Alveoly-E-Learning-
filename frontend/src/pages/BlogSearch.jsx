// src/pages/BlogSearch.jsx - EDITORIAL REDESIGN
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft, FaSearch, FaClock, FaEye, FaHeart, FaComment,
  FaBookmark, FaRegBookmark, FaTimes, FaShareAlt,
  FaArrowRight as FaArrowRightIcon,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';

// ==================== HELPERS ====================

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse space-y-4">
        <div className="bg-stone-200 dark:bg-stone-800 rounded-lg aspect-[16/10]" />
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/4" />
        <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full" />
      </div>
    ))}
  </div>
);

const AuthorAvatar = ({ author, authorName }) => {
  const name = author?.name || authorName || 'A';
  const img = author?.avatar || author?.image;
  if (img) {
    return (
      <img
        src={img}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center text-xs font-medium flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

// ==================== MAIN ====================

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
  const [suggestions, setSuggestions] = useState({
    titles: [],
    tags: [],
    categories: [],
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const inputRef = useRef(null);

  // Keep input synced with URL
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setPosts([]);
        setTotalResults(0);
        setSuggestions({ titles: [], tags: [], categories: [] });
        setLoading(false);
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

        if (response.success) {
          setPosts(response.data.posts || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalResults(response.data.pagination?.total || 0);
          setSuggestions(
            response.data.suggestions || { titles: [], tags: [], categories: [] }
          );
        } else {
          toast.error(response.message || 'Search failed');
        }
      } catch (err) {
        console.error('Error searching posts:', err);
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentPage, categoryFilter, tagFilter]);

  // Reset page when query changes
  useEffect(() => {
    setCurrentPage(1);
    setCategoryFilter('');
    setTagFilter('');
  }, [query]);

  const submitSearch = (e) => {
    e.preventDefault();
    const term = searchQuery.trim();
    if (!term) return;
    setSearchParams({ q: term });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const applySuggestion = (term) => {
    setSearchQuery(term);
    setSearchParams({ q: term });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    inputRef.current?.focus();
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setTagFilter('');
    setCurrentPage(1);
  };

  const handleBookmark = (postId) => {
    const isB = bookmarks.includes(postId);
    setBookmarks((prev) =>
      isB ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    toast.success(isB ? 'Removed from your list' : 'Saved to your list');
  };

  const handleShare = (post) => {
    const url = `${window.location.origin}/blog/post/${post.slug || post._id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.subtitle, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied');
    }
  };

  const hasActiveFilters = Boolean(categoryFilter || tagFilter);
  const hasSuggestions =
    suggestions.titles.length > 0 ||
    suggestions.tags.length > 0 ||
    suggestions.categories.length > 0;

  // ---------- Shared masthead ----------
  const Masthead = () => (
    <header className="border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 pb-10 md:pb-14">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition mb-8"
        >
          <FaArrowLeft className="text-xs" />
          All stories
        </Link>

        <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
          Search
        </p>

        {query ? (
          <>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15] mb-3">
              Results for{' '}
              <span className="text-rose-600 dark:text-rose-400">"{query}"</span>
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              {loading
                ? 'Searching…'
                : totalResults === 0
                ? 'No stories found'
                : `${totalResults} ${totalResults === 1 ? 'story' : 'stories'} found`}
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15] mb-3">
              Search the journal
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              Find essays, field reports, and clinical notes by title, topic, or author.
            </p>
          </>
        )}

        {/* Search form */}
        <form onSubmit={submitSearch} className="relative mt-8 max-w-2xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, topics, authors…"
            className="w-full pl-11 pr-24 py-3.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition text-[15px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-[90px] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition p-1"
              aria-label="Clear"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </form>

        {/* Suggestions for the current query */}
        {query && hasSuggestions && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mr-1">
              Try
            </span>
            {suggestions.tags.slice(0, 3).map((tag) => (
              <button
                key={`tag-${tag}`}
                onClick={() => applySuggestion(tag)}
                className="px-3 py-1 text-sm rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
              >
                #{tag}
              </button>
            ))}
            {suggestions.categories.slice(0, 2).map((cat) => (
              <button
                key={`cat-${cat}`}
                onClick={() => applySuggestion(cat)}
                className="px-3 py-1 text-sm rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
              >
                {cat}
              </button>
            ))}
            {suggestions.titles.slice(0, 2).map((title) => (
              <button
                key={`title-${title}`}
                onClick={() => applySuggestion(title)}
                className="px-3 py-1 text-sm rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition max-w-[240px] truncate"
              >
                "{title}"
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Masthead />

      {/* ============ ACTIVE FILTERS BAR ============ */}
      {query && hasActiveFilters && (
        <div className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
          <div className="max-w-5xl mx-auto px-5 py-3 flex items-center flex-wrap gap-3">
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Filters
            </span>

            {categoryFilter && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300">
                {categoryFilter}
                <button
                  onClick={() => setCategoryFilter('')}
                  className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  aria-label="Remove category filter"
                >
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}

            {tagFilter && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300">
                #{tagFilter}
                <button
                  onClick={() => setTagFilter('')}
                  className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  aria-label="Remove tag filter"
                >
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 transition"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* ============ RESULTS ============ */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        {loading ? (
          <Skeleton />
        ) : !query ? (
          /* ------- No query: gentle prompt ------- */
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              What are you curious about?
            </p>
            <p className="text-stone-500 dark:text-stone-400 mb-8">
              Search across every story we've published — by title, topic, or author.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['AI in nursing', 'Patient care', 'Telehealth', 'Leadership', 'Mental health'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => applySuggestion(term)}
                    className="px-3.5 py-2 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 text-sm hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        ) : posts.length === 0 ? (
          /* ------- Query, but no results ------- */
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Nothing matches "{query}"
            </p>
            <p className="text-stone-500 dark:text-stone-400 mb-8">
              Try a different phrase, or explore one of these topics.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['Nursing', 'Healthcare', 'Technology', 'Research', 'Patient care'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => applySuggestion(term)}
                    className="px-3.5 py-2 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 text-sm hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
            >
              Browse all stories
              <FaArrowRightIcon className="text-xs" />
            </Link>
          </div>
        ) : (
          /* ------- Results grid ------- */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {posts.map((post, i) => (
                <motion.article
                  key={post._id || post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.35 }}
                  className="group"
                >
                  <Link
                    to={`/blog/post/${post.slug || post._id}`}
                    className="block"
                  >
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full aspect-[16/10] object-cover rounded-md group-hover:opacity-95 transition"
                      />
                    ) : (
                      <div className="w-full aspect-[16/10] rounded-md bg-stone-100 dark:bg-stone-900" />
                    )}
                  </Link>

                  <div className="pt-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mb-3">
                      {post.category && (
                        <>
                          <Link
                            to={`/blog/category/${post.category
                              .toLowerCase()
                              .replace(/\s+/g, '-')}`}
                            className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                          >
                            {post.category}
                          </Link>
                          <span className="text-stone-300 dark:text-stone-700">
                            ·
                          </span>
                        </>
                      )}
                      <time>{formatDate(post.publishDate)}</time>
                    </div>

                    <Link to={`/blog/post/${post.slug || post._id}`}>
                      <h3 className="font-serif text-xl md:text-2xl font-bold leading-snug text-stone-900 dark:text-stone-50 mb-3 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                        {post.title}
                      </h3>
                    </Link>

                    {post.subtitle && (
                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4 line-clamp-2">
                        {post.subtitle}
                      </p>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-2.5">
                        <AuthorAvatar
                          author={post.author}
                          authorName={post.authorName}
                        />
                        <div className="text-sm leading-tight">
                          <Link
                            to={`/blog/author/${
                              post.author?._id || post.author?.id || 'unknown'
                            }`}
                            className="font-medium text-stone-800 dark:text-stone-200 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          >
                            {post.author?.name ||
                              post.authorName ||
                              'Anonymous'}
                          </Link>
                          <p className="text-xs text-stone-500 flex items-center gap-1.5">
                            <FaClock className="text-[9px]" />
                            {post.readingTime || post.readTime || 5} min
                            <span className="text-stone-300 dark:text-stone-700">
                              ·
                            </span>
                            <span className="flex items-center gap-1">
                              <FaEye className="text-[9px]" />
                              {post.views || 0}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-stone-400 text-sm">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleBookmark(post._id || post.id);
                          }}
                          className="hover:text-amber-500 transition"
                          title="Save"
                        >
                          {bookmarks.includes(post._id || post.id) ? (
                            <FaBookmark className="text-amber-500" />
                          ) : (
                            <FaRegBookmark />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleShare(post);
                          }}
                          className="hover:text-stone-900 dark:hover:text-stone-100 transition"
                          title="Share"
                        >
                          <FaShareAlt className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* ============ PAGINATION ============ */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <FaArrowLeft className="text-xs" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next
                  <FaArrowRightIcon className="text-xs" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ============ RELATED SEARCHES ============ */}
      {query && posts.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-10">
            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-4">
              Related searches
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'AI in nursing',
                'Patient care technology',
                'Nursing research',
                'Healthcare innovation',
                'Evidence-based practice',
              ].map((term) => (
                <Link
                  key={term}
                  to={`/blog/search?q=${encodeURIComponent(term)}`}
                  className="px-3.5 py-2 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 text-sm hover:bg-stone-200 dark:hover:bg-stone-800 transition"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ NEWSLETTER ============ */}
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Letter
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-4 leading-tight">
            A weekly letter on nursing and healthcare education.
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
            Original reporting, clinical insights, and thoughtful essays — no noise.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success('Thanks for subscribing');
            }}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-stone-400 mt-4">
            Unsubscribe anytime. We never share your email.
          </p>
        </div>
      </section>
    </div>
  );
};

export default BlogSearch;