// src/pages/BlogCategory.jsx - EDITORIAL REDESIGN
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft, FaClock, FaHeart, FaComment, FaEye,
  FaFire, FaBookmark, FaRegBookmark, FaShareAlt,
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
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-2/3" />
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

const BlogCategory = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Category metadata
        const categoryResponse = await blogAPI.getCategoryBySlug(category);
        if (categoryResponse.success) {
          setCategoryInfo(categoryResponse.data);
        } else {
          const fallbackName = category
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          setCategoryInfo({
            name: fallbackName,
            description: `Essays and reports filed under ${fallbackName}.`,
            count: 0,
          });
        }

        // Posts in this category
        const postsResponse = await blogAPI.getPostsByCategory(category, {
          page: currentPage,
          limit: 6,
          sort: sortBy,
        });

        if (postsResponse.success) {
          setPosts(postsResponse.data.posts || []);
          setTotalPages(postsResponse.data.pagination?.totalPages || 1);
          setTotalPosts(postsResponse.data.pagination?.total || 0);
        } else {
          toast.error(postsResponse.message || 'Failed to load posts');
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        toast.error('Could not load this category');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [category, currentPage, sortBy]);

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

  const categoryName = categoryInfo?.name || category;
  const categoryDescription =
    categoryInfo?.description ||
    `Essays and reports filed under ${categoryName}.`;

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* ============ MASTHEAD ============ */}
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
            Category
          </p>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1] mb-5">
            {categoryName}
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed mb-8">
            {categoryDescription}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-stone-200 dark:border-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {loading
                ? 'Loading…'
                : `${totalPosts} ${totalPosts === 1 ? 'story' : 'stories'}`}
            </p>

            <div className="flex items-center gap-3">
              <label className="text-sm text-stone-500 dark:text-stone-400">
                Sort
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm bg-transparent border-none text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 focus:outline-none cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most read</option>
                <option value="trending">Trending</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* ============ POSTS ============ */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        {loading ? (
          <Skeleton />
        ) : posts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Nothing here yet
            </p>
            <p className="text-stone-500 dark:text-stone-400 mb-6">
              We haven't published anything in this category. Try another topic
              or browse everything.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
            >
              Browse all stories
              <FaArrowRightIcon className="text-xs" />
            </Link>
          </div>
        ) : (
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
                  {/* Image */}
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

                  {/* Content */}
                  <div className="pt-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mb-3">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        {post.category || categoryName}
                      </span>
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

                    {/* Author + meta row */}
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
                            {post.author?.name || post.authorName || 'Anonymous'}
                          </Link>
                          <p className="text-xs text-stone-500 flex items-center gap-1.5">
                            <FaClock className="text-[9px]" />
                            {post.readingTime || post.readTime || 5} min
                            <span className="text-stone-300 dark:text-stone-700">·</span>
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
    </div>
  );
};

export default BlogCategory;