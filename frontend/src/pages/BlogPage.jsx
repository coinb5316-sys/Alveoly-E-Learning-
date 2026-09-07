// src/pages/BlogPage.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaClock,
  FaArrowRight,
  FaHeart,
  FaComment,
  FaEye,
  FaShareAlt,
  FaBookmark,
  FaRegBookmark,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaWhatsapp,
  FaEnvelope,
  FaLightbulb,
  FaFire,
  FaTrendingUp,
  FaNewspaper,
  FaVideo,
  FaPodcast,
  FaFileAlt,
  FaImage,
  FaThumbsUp,
  FaRegThumbsUp,
  FaRegComment,
  FaRegEye,
  FaRegClock,
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight as FaArrowRightIcon,
  FaBars,
  FaThLarge
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const BlogPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Get auth state
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
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [selectedTags, setSelectedTags] = useState([]);
  const [authorStats, setAuthorStats] = useState([]);

  // Fetch data - NO AUTH REQUIRED
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch posts with filters - PUBLIC endpoint
        const postsResult = await blogAPI.getPosts({
          page: currentPage,
          limit: 6,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined,
          sort: sortBy,
          publishedOnly: true
        });
        
        if (postsResult.success) {
          setPosts(postsResult.data.posts || []);
          setFeaturedPost(postsResult.data.featuredPost || null);
          setTotalPages(postsResult.data.pagination?.totalPages || 1);
          setTotalPosts(postsResult.data.pagination?.total || 0);
          setTrendingTags(postsResult.data.trendingTags || []);
          setAuthorStats(postsResult.data.authorStats || []);
        } else {
          toast.error(postsResult.message || 'Failed to load posts');
        }
        
        // Fetch categories - PUBLIC endpoint
        const categoriesResult = await blogAPI.getCategories();
        if (categoriesResult.success) {
          setCategories(categoriesResult.data || []);
        }
        
      } catch (error) {
        console.error('Error fetching blog data:', error);
        toast.error(error.response?.data?.message || 'Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage, selectedCategory, searchTerm, sortBy]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/blog/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle tag toggle
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Handle bookmark toggle - requires auth
  const handleBookmark = (postId) => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark posts');
      return;
    }
    setBookmarks(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    toast.success(bookmarks.includes(postId) ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  // Handle share
  const handleShare = (post) => {
    const url = `${window.location.origin}/blog/post/${post.slug || post._id}`;
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Truncate text
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"></div>
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* ===== HEADER SECTION ===== */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Alveoly Health Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Insights, research, and perspectives on the future of healthcare and nursing education
          </motion.p>
        </div>
      </div>

      {/* ===== SEARCH AND FILTER SECTION ===== */}
      <div className="container mx-auto px-4 py-8 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 md:p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                placeholder="Search articles by title, topic, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-gray-700 dark:text-gray-300"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                Search
              </button>
            </form>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <FaFilter />
              <span>Filters</span>
              {showFilters ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {/* Filters - Desktop */}
            <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-2">
              <FaFilter className="text-gray-400" />
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category._id || category.id}
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === category.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Filters - Mobile Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id || category.id}
                      onClick={() => handleCategoryFilter(category.slug)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        selectedCategory === category.slug
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Sort and View Options */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{totalPosts} articles found</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-700 dark:text-gray-300"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="oldest">Oldest</option>
              </select>
              <div className="hidden sm:flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="Grid View"
                >
                  <FaThLarge className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="List View"
                >
                  <FaBars className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== FEATURED POST ===== */}
      {featuredPost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-20">
              <img
                src={featuredPost.featuredImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-8 md:p-12 max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                  Featured
                </span>
                {featuredPost.trending && (
                  <span className="inline-block px-3 py-1 bg-red-500/30 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
                    <FaFire className="text-red-400" />
                    Trending
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {featuredPost.title}
              </h2>
              <p className="text-white/90 text-lg mb-4">{featuredPost.subtitle}</p>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-6">
                <span className="flex items-center gap-1.5">
                  <FaUser />
                  {featuredPost.author?.name || 'Unknown'}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt />
                  {formatDate(featuredPost.publishDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock />
                  {featuredPost.readTime || 5} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <FaEye />
                  {featuredPost.views || 0} views
                </span>
              </div>
              <Link
                to={`/blog/post/${featuredPost.slug || featuredPost._id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group"
              >
                Read Article
                <FaArrowRight className="group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== BLOG GRID ===== */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          renderSkeleton()
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
            }>
              {posts.map((post, index) => (
                <motion.article
                  key={post._id || post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group ${
                    viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                  }`}
                >
                  <Link to={`/blog/post/${post.slug || post._id}`} className={`block ${viewMode === 'list' ? 'md:w-2/5' : ''}`}>
                    <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48' : 'h-56 md:h-full'}`}>
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {post.trending && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 rounded-full text-white text-xs font-medium flex items-center gap-1">
                          <FaFire className="text-red-300" />
                          Trending
                        </div>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-[10px]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {isAuthenticated && bookmarks.includes(post._id || post.id) && (
                        <div className="absolute top-3 right-3 p-1.5 bg-yellow-500 rounded-full">
                          <FaBookmark className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className={`p-6 ${viewMode === 'list' ? 'md:w-3/5 md:flex md:flex-col md:justify-between' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                        <Link 
                          to={`/blog/category/${post.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized'}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                        >
                          {post.category || 'Uncategorized'}
                        </Link>
                        <span>•</span>
                        <span>{formatDate(post.publishDate)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {post.readTime || 5} min read
                        </span>
                      </div>
                      <Link to={`/blog/post/${post.slug || post._id}`}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {truncateText(post.subtitle)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags?.slice(0, 3).map((tag) => (
                          <Link
                            key={tag}
                            to={`/blog/search?q=${tag}`}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Link to={`/blog/author/${post.author?._id || post.author?.id}`} className="flex items-center gap-2 group">
                          {post.author?.avatar || post.author?.image ? (
                            <img
                              src={post.author.avatar || post.author.image}
                              alt={post.author.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {post.author?.name?.charAt(0) || 'A'}
                            </div>
                          )}
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {post.author?.name || 'Unknown'}
                          </span>
                        </Link>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                          {isAuthenticated && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleBookmark(post._id || post.id);
                              }}
                              className="hover:text-yellow-500 transition"
                            >
                              {bookmarks.includes(post._id || post.id) ? (
                                <FaBookmark className="text-yellow-500" />
                              ) : (
                                <FaRegBookmark />
                              )}
                            </button>
                          )}
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
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleShare(post);
                            }}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            <FaShareAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaArrowLeft />
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
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                  className="px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <FaArrowRightIcon />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== TRENDING TAGS SECTION ===== */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Trending Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Link
                key={tag.name}
                to={`/blog/search?q=${tag.name}`}
                className="group px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30 transition border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition font-medium">
                  #{tag.name}
                </span>
                <span className="text-xs text-gray-400 ml-1 group-hover:text-blue-400 transition">
                  ({tag.count})
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ===== NEWSLETTER SECTION ===== */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
              Get the latest healthcare insights and nursing education updates delivered to your inbox
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              />
              <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;