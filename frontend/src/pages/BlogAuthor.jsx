// src/pages/BlogAuthor.jsx - EDITORIAL REDESIGN
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft, FaClock, FaEye, FaHeart, FaComment,
  FaTwitter, FaLinkedin, FaEnvelope, FaBookmark,
  FaRegBookmark, FaShareAlt, FaGlobe, FaInstagram,
  FaYoutube, FaFacebook,
  FaArrowRight as FaArrowRightIcon,
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

// ==================== MAIN ====================

const BlogAuthor = () => {
  const { authorId } = useParams();
  const { user } = useAuth();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [followed, setFollowed] = useState(false);
  const [authorStats, setAuthorStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getPostsByAuthor(authorId, {
          page: currentPage,
          limit: 6,
        });

        if (response.success) {
          const data = response.data;
          setAuthor(data.author);
          setPosts(data.posts || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalPosts(data.pagination?.total || 0);
          setAuthorStats({
            totalPosts: data.stats?.totalPosts || 0,
            totalLikes: data.stats?.totalLikes || 0,
            totalViews: data.stats?.totalViews || 0,
          });
        } else {
          toast.error(response.message || 'Failed to load author');
        }
      } catch (err) {
        console.error('Error fetching author data:', err);
        toast.error('Could not load this author');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [authorId, currentPage]);

  const handleBookmark = (postId) => {
    const isB = bookmarks.includes(postId);
    setBookmarks((prev) =>
      isB ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    toast.success(isB ? 'Removed from your list' : 'Saved to your list');
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Sign in to follow authors');
      return;
    }
    setFollowed(!followed);
    toast.success(followed ? 'Unfollowed' : `Following ${author.name}`);
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

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="font-serif text-4xl mb-4 text-stone-400">404</p>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
            Author not found
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            This profile may have been removed or never existed.
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

  const authorName = author.name || 'Anonymous';
  const authorImage = author.avatar || author.image;

  const socialLinks = [
    author.social?.twitter && { icon: FaTwitter, href: author.social.twitter, label: 'Twitter' },
    author.social?.linkedin && { icon: FaLinkedin, href: author.social.linkedin, label: 'LinkedIn' },
    author.social?.instagram && { icon: FaInstagram, href: author.social.instagram, label: 'Instagram' },
    author.social?.youtube && { icon: FaYoutube, href: author.social.youtube, label: 'YouTube' },
    author.social?.facebook && { icon: FaFacebook, href: author.social.facebook, label: 'Facebook' },
    author.social?.website && { icon: FaGlobe, href: author.social.website, label: 'Website' },
    author.email && { icon: FaEnvelope, href: `mailto:${author.email}`, label: 'Email' },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* ============ PROFILE HEADER ============ */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 pb-12 md:pb-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition mb-10"
          >
            <FaArrowLeft className="text-xs" />
            All stories
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {authorImage ? (
                <img
                  src={authorImage}
                  alt={authorName}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center text-5xl font-serif font-bold">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-3">
                Contributor
              </p>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1] mb-3">
                {authorName}
              </h1>

              {author.title && (
                <p className="text-lg text-stone-600 dark:text-stone-400 mb-4">
                  {author.title}
                </p>
              )}

              {author.bio && (
                <p className="text-base md:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mb-6">
                  {author.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600 dark:text-stone-400 mb-6">
                <span>
                  <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                    {authorStats.totalPosts || author.postCount || 0}
                  </strong>{' '}
                  {authorStats.totalPosts === 1 || author.postCount === 1 ? 'story' : 'stories'}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                    {(authorStats.totalLikes || 0).toLocaleString()}
                  </strong>{' '}
                  likes
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                    {(authorStats.totalViews || 0).toLocaleString()}
                  </strong>{' '}
                  reads
                </span>
                {author.joinedDate && (
                  <>
                    <span className="text-stone-300 dark:text-stone-700">·</span>
                    <span>Joined {formatDate(author.joinedDate)}</span>
                  </>
                )}
              </div>

              {/* Actions row */}
              <div className="flex items-center flex-wrap gap-4">
                <button
                  onClick={handleFollow}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                    followed
                      ? 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                      : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-90'
                  }`}
                >
                  {followed ? 'Following' : 'Follow'}
                </button>

                {/* Social icons */}
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400">
                    {socialLinks.map((s, i) => (
                      <a
                        key={i}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.label}
                        className="hover:text-stone-900 dark:hover:text-stone-100 transition"
                      >
                        <s.icon />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expertise tags */}
          {author.expertise && author.expertise.length > 0 && (
            <div className="mt-10 pt-8 border-t border-stone-200 dark:border-stone-800">
              <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                Areas of expertise
              </p>
              <div className="flex flex-wrap gap-2">
                {author.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-sm rounded-full bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ============ STORIES ============ */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50">
            Stories by {authorName.split(' ')[0]}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {totalPosts} {totalPosts === 1 ? 'story' : 'stories'}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Nothing published yet
            </p>
            <p className="text-stone-500 dark:text-stone-400 mb-6">
              {authorName} hasn't published any stories here yet. Check back soon.
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
                  <Link to={`/blog/post/${post.slug || post._id}`} className="block">
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
                      {post.category && (
                        <>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            {post.category}
                          </span>
                          <span className="text-stone-300 dark:text-stone-700">·</span>
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

                    {/* Meta + actions */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-500">
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-[9px]" />
                          {post.readingTime || post.readTime || 5} min
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="flex items-center gap-1.5">
                          <FaHeart className="text-[9px]" />
                          {post.likes || 0}
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="flex items-center gap-1.5">
                          <FaComment className="text-[9px]" />
                          {post.comments || 0}
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="flex items-center gap-1.5">
                          <FaEye className="text-[9px]" />
                          {post.views || 0}
                        </span>
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

export default BlogAuthor;