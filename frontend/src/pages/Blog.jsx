// src/pages/Blog.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, FaNewspaper, FaCalendarAlt, FaUser, FaTag, 
  FaEye, FaHeart, FaClock, FaArrowRight, FaSpinner,
  FaFilter, FaTimes, FaBookOpen, FaGraduationCap,
  FaRss, FaEnvelope, FaShareAlt, FaBookmark, FaRegBookmark
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import API from "../api/axios";
import blogBg from "../images/programs-bg.jpg";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  useEffect(() => {
    fetchBlogs();
    loadBookmarks();
  }, [currentPage, selectedCategory]);

  const loadBookmarks = () => {
    try {
      const saved = localStorage.getItem('bookmarkedPosts');
      if (saved) setBookmarkedPosts(JSON.parse(saved));
    } catch (e) {}
  };

  const toggleBookmark = (postId) => {
    setBookmarkedPosts(prev => {
      const newBookmarks = prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId];
      localStorage.setItem('bookmarkedPosts', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(selectedCategory !== "all" && { category: selectedCategory })
      });
      
      const res = await API.get(`/blogs/public?${params}`);
      const blogData = res.data.blogs || [];
      setBlogs(blogData);
      setCategories(res.data.categories || []);
      setTotalPages(res.data.totalPages || 1);
      
      // Set featured post (first post with image)
      if (blogData.length > 0 && !featuredPost) {
        const featured = blogData.find(b => b.featuredImage && b.featuredImage !== "/blog-default.jpg") || blogData[0];
        setFeaturedPost(featured);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recent";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (blog) => {
    if (!blog?.featuredImage) return "/blog-default.jpg";
    if (typeof blog.featuredImage === 'string') return blog.featuredImage;
    if (blog.featuredImage?.url) return blog.featuredImage.url;
    return "/blog-default.jpg";
  };

  const getExcerpt = (blog) => {
    if (blog.excerpt) return blog.excerpt;
    if (blog.content) {
      const plainText = blog.content.replace(/<[^>]*>/g, '');
      return plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText;
    }
    return "Read more about this insightful article...";
  };

  const getReadingTime = (blog) => {
    if (blog.readingTime) return blog.readingTime;
    if (blog.content) {
      const plainText = blog.content.replace(/<[^>]*>/g, '');
      const words = plainText.split(/\s+/).filter(w => w.length > 0);
      return Math.max(1, Math.ceil(words.length / 200));
    }
    return 5;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!subscriberEmail) {
      toast.error("Please enter your email address");
      return;
    }
    if (!emailPattern.test(subscriberEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setSubscribing(true);
    try {
      const response = await API.post("/blogs/subscribe", { email: subscriberEmail });
      if (response.data.success) {
        toast.success(response.data.message || "Successfully subscribed!");
        setSubscriberEmail("");
      } else {
        toast.error(response.data.message || "Subscription failed");
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      const errorMessage = err.response?.data?.message || "Failed to subscribe. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubscribing(false);
    }
  };

  // Filter blogs by search term
  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get the actual featured post from filtered results
  const actualFeaturedPost = featuredPost && filteredBlogs.some(b => b._id === featuredPost._id) 
    ? featuredPost 
    : filteredBlogs[0];

  const remainingPosts = actualFeaturedPost 
    ? filteredBlogs.filter(b => b._id !== actualFeaturedPost._id)
    : filteredBlogs;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Hero Section - Professional & SEO Optimized */}
      <header className="relative min-h-[50vh] flex items-center justify-center bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ backgroundImage: `url(${blogBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-purple-900/90 to-indigo-900/95" />
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-10" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/10">
              <FaNewspaper className="text-blue-300" />
              <span className="text-white text-sm font-medium tracking-wide">Knowledge Hub</span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span className="text-blue-200 text-sm">Health Sciences Insights</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Latest <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Insights</span>
              <br />
              <span className="text-2xl md:text-3xl font-light text-blue-100">for Health Sciences Education</span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Expert articles, study tips, and the latest updates in health sciences education — 
              curated for students, educators, and professionals.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>1,000+ Readers</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <FaBookOpen className="text-blue-300" />
                <span>50+ Articles</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <FaGraduationCap className="text-purple-300" />
                <span>Expert Authors</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Search and Filter Section - Sticky & Accessible */}
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-md border-b border-gray-200/50 dark:border-gray-700/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all text-base"
                aria-label="Search blog posts"
              />
            </div>
            
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              aria-expanded={showMobileFilters}
            >
              <FaFilter /> Filters {selectedCategory !== "all" && `(${selectedCategory})`}
            </button>

            <div className={`${showMobileFilters ? 'flex flex-wrap' : 'hidden'} md:flex flex-wrap gap-2`}>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                aria-current={selectedCategory === "all" ? "page" : undefined}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat._id);
                    setShowMobileFilters(false);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${
                    selectedCategory === cat._id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {cat._id} <span className="text-xs opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Grid Section */}
      <section className="py-12 md:py-16 px-4" aria-label="Blog posts">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Loading...' : `${filteredBlogs.length} article${filteredBlogs.length !== 1 ? 's' : ''} found`}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="text-5xl text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading articles...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <FaBookOpen className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No articles found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filter</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="mt-4 px-6 py-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all articles
              </button>
            </div>
          ) : (
            <>
              {/* Featured Post - Featured Card */}
              {actualFeaturedPost && (
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <Link to={`/blog/${actualFeaturedPost.slug}`} className="block md:grid md:grid-cols-2">
                    <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
                      <img 
                        src={getImageUrl(actualFeaturedPost)} 
                        alt={actualFeaturedPost.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        loading="eager"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-full shadow-lg">
                          Featured
                        </span>
                      </div>
                      {actualFeaturedPost.category && (
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                            {actualFeaturedPost.category}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-blue-500" />
                          {formatDate(actualFeaturedPost.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-blue-500" />
                          {getReadingTime(actualFeaturedPost)} min read
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaEye className="text-blue-500" />
                          {actualFeaturedPost.views || 0}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                        {actualFeaturedPost.title}
                      </h2>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-base leading-relaxed">
                        {getExcerpt(actualFeaturedPost)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {actualFeaturedPost.author?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {actualFeaturedPost.author?.name || 'Alveoly Admin'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Health Sciences Educator
                            </p>
                          </div>
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 hover:gap-3 transition-all group">
                          Read Full Article 
                          <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              )}

              {/* Blog Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <AnimatePresence>
                  {remainingPosts.map((blog, index) => (
                    <motion.article
                      key={blog._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 dark:border-gray-700/50"
                    >
                      <Link to={`/blog/${blog.slug}`} className="block">
                        <div className="relative h-52 overflow-hidden">
                          <img 
                            src={getImageUrl(blog)} 
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "/blog-default.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          
                          {blog.category && (
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-full shadow-lg">
                                {blog.category}
                              </span>
                            </div>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleBookmark(blog._id);
                            }}
                            className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-md"
                            aria-label={bookmarkedPosts.includes(blog._id) ? "Remove bookmark" : "Add bookmark"}
                          >
                            {bookmarkedPosts.includes(blog._id) ? (
                              <FaBookmark className="text-blue-600" />
                            ) : (
                              <FaRegBookmark className="text-gray-600 dark:text-gray-300" />
                            )}
                          </button>
                        </div>
                        
                        <div className="p-5">
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-blue-500 text-xs" />
                              {formatDate(blog.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-blue-500 text-xs" />
                              {getReadingTime(blog)} min
                            </span>
                          </div>
                          
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {blog.title}
                          </h2>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {getExcerpt(blog)}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <FaEye className="text-gray-400 text-xs" />
                                <span>{blog.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <FaHeart className="text-red-400 text-xs" />
                                <span>{blog.likes || 0}</span>
                              </div>
                            </div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                              Read More <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Pagination - SEO Friendly */}
          {totalPages > 1 && (
            <nav className="flex justify-center mt-12" aria-label="Blog pagination">
              <ul className="flex gap-2 flex-wrap">
                <li>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                </li>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  let pageNum = i + 1;
                  // Show pages around current
                  if (totalPages > 7) {
                    if (i === 0) pageNum = 1;
                    else if (i === 1) pageNum = currentPage > 3 ? '...' : 2;
                    else if (i === totalPages - 2) pageNum = currentPage < totalPages - 2 ? '...' : totalPages - 1;
                    else if (i === totalPages - 1) pageNum = totalPages;
                    else pageNum = currentPage + i - 2;
                  }
                  return (
                    <li key={i}>
                      {typeof pageNum === 'string' ? (
                        <span className="px-4 py-2.5 text-gray-400">…</span>
                      ) : (
                        <button
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                              : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                          aria-current={currentPage === pageNum ? "page" : undefined}
                        >
                          {pageNum}
                        </button>
                      )}
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </section>

      {/* Newsletter Section - Professional CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" aria-label="Newsletter subscription">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <FaEnvelope className="text-blue-200" />
              <span className="text-white text-sm font-medium">Newsletter</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Stay Updated with <span className="text-blue-200">Health Sciences</span> Insights
            </h2>
            
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Subscribe to our newsletter for the latest articles, study tips, and 
              exclusive content delivered straight to your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white bg-white/95 text-gray-900 placeholder-gray-400 text-base"
                  required
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 hover:scale-105 transform duration-200 text-base whitespace-nowrap"
              >
                {subscribing ? <FaSpinner className="animate-spin mx-auto" /> : "Subscribe Now"}
              </button>
            </form>
            
            <p className="text-blue-200/70 text-sm mt-4">
              No spam, unsubscribe anytime. Join 1,000+ subscribers.
            </p>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Blog;