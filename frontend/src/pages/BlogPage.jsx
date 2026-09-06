// src/pages/BlogPage.jsx
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
  FaArrowRight as FaArrowRightIcon
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';

// Mock API service - Replace with actual API calls
const blogAPI = {
  getPosts: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Sample data
    const posts = [
      {
        id: 1,
        title: "The Future of Nursing: AI-Powered Patient Care in 2026",
        subtitle: "How artificial intelligence is revolutionizing healthcare delivery and nursing practice",
        content: "Artificial intelligence is no longer a concept of the future...",
        category: "Healthcare Technology",
        tags: ["AI", "Nursing", "Healthcare", "Technology"],
        author: {
          id: 1,
          name: "Dr. Sarah Mitchell",
          title: "Chief Nursing Officer",
          image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
        },
        featuredImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
        publishDate: "2026-01-15",
        readTime: 8,
        views: 1247,
        likes: 89,
        comments: 34,
        featured: true,
        trending: true
      },
      {
        id: 2,
        title: "Evidence-Based Practice: Bridging Research and Clinical Care",
        subtitle: "How to implement evidence-based practice in daily nursing routines",
        category: "Nursing Practice",
        tags: ["Evidence-Based Practice", "Nursing", "Research", "Clinical Care"],
        author: {
          id: 2,
          name: "Prof. James Anderson",
          title: "Research Director",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
        },
        featuredImage: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&q=80",
        publishDate: "2026-01-12",
        readTime: 6,
        views: 856,
        likes: 67,
        comments: 28,
        featured: false,
        trending: true
      },
      {
        id: 3,
        title: "Mental Health in Healthcare Workers: Strategies for Self-Care",
        subtitle: "Essential wellness practices for nurses and healthcare professionals",
        category: "Mental Health",
        tags: ["Mental Health", "Wellness", "Self-Care", "Healthcare"],
        author: {
          id: 3,
          name: "Dr. Emily Chen",
          title: "Clinical Psychologist",
          image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face"
        },
        featuredImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
        publishDate: "2026-01-10",
        readTime: 7,
        views: 2341,
        likes: 156,
        comments: 67,
        featured: false,
        trending: true
      },
      {
        id: 4,
        title: "Telehealth: The New Normal in Patient Care",
        subtitle: "Best practices for virtual nursing consultations",
        category: "Telehealth",
        tags: ["Telehealth", "Virtual Care", "Technology", "Patient Care"],
        author: {
          id: 4,
          name: "Dr. Michael Roberts",
          title: "Telehealth Specialist",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        },
        featuredImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
        publishDate: "2026-01-08",
        readTime: 5,
        views: 632,
        likes: 45,
        comments: 19,
        featured: false,
        trending: false
      },
      {
        id: 5,
        title: "Cultural Competence in Nursing: Providing Inclusive Care",
        subtitle: "Understanding and respecting cultural differences in healthcare",
        category: "Patient Care",
        tags: ["Culture", "Diversity", "Patient Care", "Nursing"],
        author: {
          id: 5,
          name: "Dr. Maria Santos",
          title: "Patient Advocacy Director",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
        },
        featuredImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80",
        publishDate: "2026-01-05",
        readTime: 9,
        views: 978,
        likes: 78,
        comments: 42,
        featured: false,
        trending: false
      },
      {
        id: 6,
        title: "Nursing Leadership in the Digital Age",
        subtitle: "How nurse leaders can leverage technology for better outcomes",
        category: "Nursing Leadership",
        tags: ["Leadership", "Technology", "Management", "Innovation"],
        author: {
          id: 6,
          name: "Dr. Robert Kim",
          title: "Chief Nurse Executive",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
        },
        featuredImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
        publishDate: "2026-01-03",
        readTime: 7,
        views: 743,
        likes: 56,
        comments: 23,
        featured: false,
        trending: false
      }
    ];
    
    // Apply filters
    let filtered = [...posts];
    
    if (params.category && params.category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === params.category.toLowerCase());
    }
    
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.subtitle.toLowerCase().includes(search) ||
        p.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 6;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);
    
    return {
      posts: paginated,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      currentPage: page,
      featuredPost: filtered.find(p => p.featured) || filtered[0]
    };
  },
  
  getCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 1, name: "Healthcare Technology", slug: "healthcare-technology", count: 12 },
      { id: 2, name: "Nursing Practice", slug: "nursing-practice", count: 8 },
      { id: 3, name: "Mental Health", slug: "mental-health", count: 6 },
      { id: 4, name: "Telehealth", slug: "telehealth", count: 5 },
      { id: 5, name: "Patient Care", slug: "patient-care", count: 9 },
      { id: 6, name: "Nursing Leadership", slug: "nursing-leadership", count: 7 }
    ];
  },
  
  getTrendingTags: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      { name: "AI", count: 45 },
      { name: "Nursing", count: 38 },
      { name: "Healthcare", count: 32 },
      { name: "Technology", count: 28 },
      { name: "Patient Care", count: 25 },
      { name: "Innovation", count: 20 },
      { name: "Research", count: 18 },
      { name: "Mental Health", count: 15 }
    ];
  }
};

const BlogPage = () => {
  const navigate = useNavigate();
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch posts
        const postsResult = await blogAPI.getPosts({
          page: currentPage,
          limit: 6,
          category: selectedCategory,
          search: searchTerm,
          sort: sortBy
        });
        
        setPosts(postsResult.posts);
        setFeaturedPost(postsResult.featuredPost);
        setTotalPages(postsResult.totalPages);
        setTotalPosts(postsResult.total);
        
        // Fetch categories
        const categoriesResult = await blogAPI.getCategories();
        setCategories(categoriesResult);
        
        // Fetch trending tags
        const tagsResult = await blogAPI.getTrendingTags();
        setTrendingTags(tagsResult);
        
      } catch (error) {
        console.error('Error fetching blog data:', error);
        toast.error('Failed to load blog posts');
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

  // Handle bookmark toggle
  const handleBookmark = (postId) => {
    setBookmarks(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    toast.success(bookmarks.includes(postId) ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Truncate text
  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-2xl h-48"></div>
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navbar is included globally - this page renders within the layout */}
      
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
          className="bg-white rounded-2xl shadow-xl p-4 md:p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                placeholder="Search articles by title, topic, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition text-gray-700"
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
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition"
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
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === category.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                className="lg:hidden mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.slug)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        selectedCategory === category.slug
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{totalPosts} articles found</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
                    viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
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
                  {featuredPost.author.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt />
                  {formatDate(featuredPost.publishDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock />
                  {featuredPost.readTime} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <FaEye />
                  {featuredPost.views} views
                </span>
              </div>
              <Link
                to={`/blog/post/${featuredPost.id}`}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
            }>
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group ${
                    viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                  }`}
                >
                  <Link to={`/blog/post/${post.id}`} className={`block ${viewMode === 'list' ? 'md:w-2/5' : ''}`}>
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
                      {bookmarks.includes(post.id) && (
                        <div className="absolute top-3 right-3 p-1.5 bg-yellow-500 rounded-full">
                          <FaBookmark className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className={`p-6 ${viewMode === 'list' ? 'md:w-3/5 md:flex md:flex-col md:justify-between' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 flex-wrap">
                        <Link 
                          to={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
                          className="font-medium text-blue-600 hover:text-blue-700 transition"
                        >
                          {post.category}
                        </Link>
                        <span>•</span>
                        <span>{formatDate(post.publishDate)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {post.readTime} min read
                        </span>
                      </div>
                      <Link to={`/blog/post/${post.id}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {truncateText(post.subtitle)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Link
                            key={tag}
                            to={`/blog/search?q=${tag}`}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Link to={`/blog/author/${post.author.id}`} className="flex items-center gap-2 group">
                          <img
                            src={post.author.image}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-blue-600 transition">
                            {post.author.name}
                          </span>
                        </Link>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handleBookmark(post.id);
                            }}
                            className="hover:text-yellow-500 transition"
                          >
                            {bookmarks.includes(post.id) ? (
                              <FaBookmark className="text-yellow-500" />
                            ) : (
                              <FaRegBookmark />
                            )}
                          </button>
                          <span className="flex items-center gap-1">
                            <FaHeart className="text-red-400" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaComment className="text-blue-400" />
                            {post.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye className="text-gray-400" />
                            {post.views}
                          </span>
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Trending Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Link
                key={tag.name}
                to={`/blog/search?q=${tag.name}`}
                className="group px-3 py-2 bg-gray-50 rounded-full hover:bg-blue-50 transition border border-gray-200 hover:border-blue-300"
              >
                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition font-medium">
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