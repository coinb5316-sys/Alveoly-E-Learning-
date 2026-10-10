// src/pages/BlogPage.jsx - EDITORIAL LISTING REDESIGN
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaClock, FaArrowRight, FaHeart, FaComment, FaEye,
  FaShareAlt, FaBookmark, FaRegBookmark, FaTwitter, FaLinkedin,
  FaFacebook, FaInstagram, FaYoutube, FaGlobe, FaFire,
  FaChevronDown, FaChevronUp, FaArrowLeft,
  FaArrowRight as FaArrowRightIcon, FaBars, FaThLarge, FaTimes,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

// ==================== HELPERS ====================

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

const AuthorAvatar = ({ author, authorName, size = 'md' }) => {
  const name = author?.name || authorName || 'A';
  const img = author?.avatar || author?.image;
  const sizeClass =
    size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-xs';

  if (img) {
    return <img src={img} alt={name} className={`${sizeClass} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center font-medium flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const AuthorSocials = ({ author }) => {
  if (!author?.social) return null;
  const items = [
    ['twitter', FaTwitter],
    ['linkedin', FaLinkedin],
    ['facebook', FaFacebook],
    ['instagram', FaInstagram],
    ['youtube', FaYoutube],
    ['website', FaGlobe],
  ].filter(([k]) => author.social[k]);

  if (!items.length) return null;

  return (
    <div className="flex items-center gap-2">
      {items.map(([key, Icon]) => (
        <a
          key={key}
          href={author.social[key]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <Icon className="h-3 w-3" />
        </a>
      ))}
    </div>
  );
};

const Skeleton = () => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-4">
          <div className="bg-stone-200 dark:bg-stone-800 rounded-lg aspect-[16/10]" />
          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/4" />
          <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="bg-stone-200 dark:bg-stone-800 rounded-lg aspect-[16/10]" />
          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
          <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-5/6" />
        </div>
      ))}
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('latest');

  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const postsResult = await blogAPI.getPosts({
          page: currentPage,
          limit: 6,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined,
          sort: sortBy,
          publishedOnly: true,
        });

        if (postsResult.success) {
          setPosts(postsResult.data.posts || []);
          setFeaturedPost(postsResult.data.featuredPost || null);
          setTotalPages(postsResult.data.pagination?.totalPages || 1);
          setTotalPosts(postsResult.data.pagination?.total || 0);
          setTrendingTags(postsResult.data.trendingTags || []);
        } else {
          toast.error(postsResult.message || 'Failed to load posts');
        }

        const categoriesResult = await blogAPI.getCategories();
        if (categoriesResult.success) setCategories(categoriesResult.data || []);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        toast.error('Could not load the blog right now');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedCategory, searchTerm, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/blog/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowMobileFilters(false);
  };

  const handleBookmark = (postId) => {
    if (!isAuthenticated) {
      toast.error('Sign in to save articles');
      return;
    }
    const isBookmarked = bookmarks.includes(postId);
    setBookmarks((prev) =>
      isBookmarked ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    toast.success(isBookmarked ? 'Removed from your list' : 'Saved to your list');
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

  const activeCategories = [
    { slug: 'all', name: 'All' },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* ============ MASTHEAD ============ */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1] mb-5">
            Notes on healthcare and nursing education
          </h1>
          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Research, field reports, and long-form essays from the people building the future of care.
          </p>
        </div>
      </header>

      {/* ============ SEARCH + FILTER BAR ============ */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stories…"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
            />
          </form>

          {/* Desktop categories */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto">
            {activeCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryFilter(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                  selectedCategory === cat.slug
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition flex items-center gap-1.5"
          >
            Topics
            <FaChevronDown className="text-[10px]" />
          </button>
        </div>
      </div>

      {/* ============ FEATURED STORY ============ */}
      {!loading && featuredPost && (
        <section className="max-w-6xl mx-auto px-5 pt-12 md:pt-16">
          <Link
            to={`/blog/post/${featuredPost.slug || featuredPost._id}`}
            className="group grid md:grid-cols-5 gap-8 items-center"
          >
            {featuredPost.featuredImage && (
              <div className="md:col-span-3 overflow-hidden rounded-lg">
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.title}
                  className="w-full aspect-[4/3] md:aspect-[16/10] object-cover group-hover:scale-[1.02] transition duration-500"
                />
              </div>
            )}
            <div className={featuredPost.featuredImage ? 'md:col-span-2' : 'md:col-span-5'}>
              <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-4">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  {featuredPost.category || 'Featured'}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <time>{formatDate(featuredPost.publishDate)}</time>
              </div>

              <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] text-stone-900 dark:text-stone-50 mb-4 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                {featuredPost.title}
              </h2>

              {featuredPost.subtitle && (
                <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-6 line-clamp-3">
                  {featuredPost.subtitle}
                </p>
              )}

              <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
                <AuthorAvatar author={featuredPost.author} authorName={featuredPost.authorName} />
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  {featuredPost.author?.name || featuredPost.authorName || 'Anonymous'}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="flex items-center gap-1">
                  <FaClock className="text-[10px]" />
                  {featuredPost.readingTime || 5} min read
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ============ DIVIDER ============ */}
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex items-center gap-4">
          <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          <span className="text-xs uppercase tracking-widest text-stone-400">Latest</span>
          <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>

      {/* ============ POSTS GRID ============ */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        {/* Controls row */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {loading ? 'Loading…' : `${totalPosts} ${totalPosts === 1 ? 'story' : 'stories'}`}
          </p>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-transparent border-none text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 focus:outline-none cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most read</option>
              <option value="trending">Trending</option>
              <option value="oldest">Oldest</option>
            </select>
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'grid'
                    ? 'text-stone-900 dark:text-stone-100'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
                title="Grid"
              >
                <FaThLarge className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'list'
                    ? 'text-stone-900 dark:text-stone-100'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
                title="List"
              >
                <FaBars className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : posts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Nothing here yet
            </p>
            <p className="text-stone-500 dark:text-stone-400 mb-6">
              We haven't published anything matching this filter. Try another topic or clear your search.
            </p>
            {(selectedCategory !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12'
                  : 'space-y-12 divide-y divide-stone-100 dark:divide-stone-900'
              }
            >
              {posts.map((post, i) => (
                <motion.article
                  key={post._id || post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.35 }}
                  className={
                    viewMode === 'list'
                      ? 'grid md:grid-cols-3 gap-8 pt-12 first:pt-0'
                      : 'group'
                  }
                >
                  {/* Image */}
                  <Link
                    to={`/blog/post/${post.slug || post._id}`}
                    className={viewMode === 'list' ? 'md:col-span-1' : 'block'}
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

                  {/* Content */}
                  <div className={viewMode === 'list' ? 'md:col-span-2' : 'pt-5'}>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mb-3">
                      <Link
                        to={`/blog/category/${(post.category || 'uncategorized')
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                        className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                      >
                        {post.category || 'Uncategorized'}
                      </Link>
                      <span className="text-stone-300 dark:text-stone-700">·</span>
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

                    {/* Author + metrics */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-2.5">
                        <AuthorAvatar author={post.author} authorName={post.authorName} />
                        <div className="text-sm leading-tight">
                          <Link
                            to={`/blog/author/${post.author?._id || post.author?.id || 'unknown'}`}
                            className="font-medium text-stone-800 dark:text-stone-200 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          >
                            {post.author?.name || post.authorName || 'Anonymous'}
                          </Link>
                          <p className="text-xs text-stone-500 flex items-center gap-1.5">
                            {post.readingTime || 5} min read
                            <span className="text-stone-300 dark:text-stone-700">·</span>
                            <span className="flex items-center gap-1">
                              <FaEye className="text-[9px]" />
                              {post.views || 0}
                            </span>
                          </p>
                        </div>
                        {post.author?.social && <AuthorSocials author={post.author} />}
                      </div>

                      <div className="flex items-center gap-3 text-stone-400 text-sm">
                        {isAuthenticated && (
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
                        )}
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

            {/* Pagination */}
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
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* ============ TRENDING TAGS ============ */}
      {trendingTags.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-14">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6 flex items-center gap-2">
              <FaFire className="text-rose-600 text-lg" />
              Trending topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <Link
                  key={tag.name}
                  to={`/blog/search?q=${tag.name}`}
                  className="group inline-flex items-baseline gap-1.5 px-3.5 py-2 rounded-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
                >
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition">
                    #{tag.name}
                  </span>
                  <span className="text-xs text-stone-400 group-hover:text-stone-500">
                    {tag.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ NEWSLETTER ============ */}
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-5 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Letter
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-4 leading-tight">
            A weekly letter on nursing and healthcare education.
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
            Original reporting, clinical insights, and thoughtful essays — no noise, no sales pitches.
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

      {/* ============ MOBILE FILTER DRAWER ============ */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-950 rounded-t-2xl z-50 p-6 lg:hidden max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-lg font-bold">Topics</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryFilter(cat.slug)}
                    className={`px-4 py-2 rounded-full text-sm transition ${
                      selectedCategory === cat.slug
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPage;