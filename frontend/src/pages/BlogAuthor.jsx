// src/pages/BlogAuthor.jsx - COMPLETE WITH API INTEGRATION
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaBookmark,
  FaRegBookmark,
  FaFire,
  FaUserCircle,
  FaSpinner,
  FaShareAlt,
  FaFacebook,
  FaWhatsapp
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

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
    totalViews: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch author data and posts from API
        const response = await blogAPI.getPostsByAuthor(authorId, {
          page: currentPage,
          limit: 6
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
            totalViews: data.stats?.totalViews || 0
          });
        } else {
          toast.error(response.message || 'Failed to load author');
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        toast.error(error.response?.data?.message || 'Failed to load author');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    window.scrollTo(0, 0);
  }, [authorId, currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleBookmark = (postId) => {
    setBookmarks(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    toast.success(bookmarks.includes(postId) ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleFollow = async () => {
    try {
      // If user is not logged in, redirect to login
      if (!user) {
        toast.error('Please login to follow authors');
        return;
      }
      
      // Toggle follow status
      setFollowed(!followed);
      toast.success(followed ? 'Unfollowed' : 'Followed');
      
      // In a real implementation, you would call an API to follow/unfollow
      // await blogAPI.followAuthor(authorId);
    } catch (error) {
      console.error('Error following author:', error);
      toast.error('Failed to follow author');
      setFollowed(!followed); // Revert on error
    }
  };

  const handleShare = (post) => {
    const url = `${window.location.origin}/blog/post/${post.id || post._id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.subtitle,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading author...</p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Author Not Found</h2>
          <p className="text-gray-600 mt-2">The author you're looking for doesn't exist.</p>
          <Link to="/blog" className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* ===== HEADER SECTION ===== */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-8"
              >
                <FaArrowLeft />
                <span>Back to Blog</span>
              </Link>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                {author.avatar || author.image ? (
                  <img
                    src={author.avatar || author.image}
                    alt={author.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white/30 flex items-center justify-center text-white text-5xl font-bold">
                    {author.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {author.name}
                  </h1>
                  <p className="text-white/80 text-lg">{author.title || 'Contributor'}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1.5">
                      <FaUser />
                      {authorStats.totalPosts || author.postCount || 0} articles
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaFire />
                      {author.followers || 0} followers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaHeart />
                      {authorStats.totalLikes || 0} likes
                    </span>
                  </div>
                  <button
                    onClick={handleFollow}
                    className={`mt-4 px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                      followed
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-white text-blue-600 hover:shadow-lg'
                    }`}
                  >
                    {followed ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== AUTHOR BIO ===== */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About {author.name}</h2>
              <p className="text-gray-700 leading-relaxed">{author.bio || 'No bio available'}</p>
              
              {author.expertise && author.expertise.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {author.expertise.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="md:w-48">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {author.social?.twitter && (
                  <a
                    href={author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#1da1f2] text-white rounded-lg hover:shadow-lg transition"
                  >
                    <FaTwitter className="text-lg" />
                  </a>
                )}
                {author.social?.linkedin && (
                  <a
                    href={author.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#0a66c2] text-white rounded-lg hover:shadow-lg transition"
                  >
                    <FaLinkedin className="text-lg" />
                  </a>
                )}
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="p-2 bg-[#ea4335] text-white rounded-lg hover:shadow-lg transition"
                  >
                    <FaEnvelope className="text-lg" />
                  </a>
                )}
              </div>
              {author.joinedDate && (
                <p className="text-xs text-gray-500 mt-3">
                  Joined {formatDate(author.joinedDate)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== POSTS ===== */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Articles by {author.name}
          </h2>
          <span className="text-sm text-gray-500">
            {totalPosts} {totalPosts === 1 ? 'article' : 'articles'}
          </span>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No articles yet</h3>
            <p className="text-gray-600">This author hasn't published any articles yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.article
                  key={post._id || post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <Link to={`/blog/post/${post.slug || post._id}`} className="block">
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleBookmark(post._id || post.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition"
                      >
                        {bookmarks.includes(post._id || post.id) ? (
                          <FaBookmark className="text-yellow-400 text-sm" />
                        ) : (
                          <FaRegBookmark className="text-white text-sm" />
                        )}
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="font-medium text-blue-600">{post.category}</span>
                        <span>•</span>
                        <span>{formatDate(post.publishDate)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {post.readTime || 5} min read
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {post.subtitle}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          <span className="flex items-center gap-1">
                            <FaHeart className="text-red-400" />
                            {post.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaComment className="text-blue-400" />
                            {post.comments || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye className="text-gray-400" />
                            {post.views || 0}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleShare(post);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition"
                        >
                          <FaShareAlt />
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl transition ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogAuthor;