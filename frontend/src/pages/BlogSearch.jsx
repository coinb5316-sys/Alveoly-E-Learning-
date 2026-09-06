// src/pages/BlogSearch.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
  FaFire,
  FaBookmark,
  FaRegBookmark,
  FaFilter,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Mock API - Replace with actual API calls
const searchPosts = async (query, params = {}) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const allPosts = [
    {
      id: 1,
      title: "The Future of Nursing: AI-Powered Patient Care in 2026",
      subtitle: "How artificial intelligence is revolutionizing healthcare delivery",
      category: "Healthcare Technology",
      tags: ["AI", "Nursing", "Healthcare"],
      author: {
        id: 1,
        name: "Dr. Sarah Mitchell",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
      },
      featuredImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      publishDate: "2026-01-15",
      readTime: 8,
      views: 1247,
      likes: 89,
      comments: 34
    },
    {
      id: 2,
      title: "Evidence-Based Practice: Bridging Research and Clinical Care",
      subtitle: "How to implement evidence-based practice in daily nursing routines",
      category: "Nursing Practice",
      tags: ["Evidence-Based Practice", "Nursing", "Research"],
      author: {
        id: 2,
        name: "Prof. James Anderson",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      featuredImage: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&q=80",
      publishDate: "2026-01-12",
      readTime: 6,
      views: 856,
      likes: 67,
      comments: 28
    },
    {
      id: 3,
      title: "Mental Health in Healthcare Workers: Strategies for Self-Care",
      subtitle: "Essential wellness practices for nurses and healthcare professionals",
      category: "Mental Health",
      tags: ["Mental Health", "Wellness", "Self-Care"],
      author: {
        id: 3,
        name: "Dr. Emily Chen",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face"
      },
      featuredImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
      publishDate: "2026-01-10",
      readTime: 7,
      views: 2341,
      likes: 156,
      comments: 67
    },
    {
      id: 4,
      title: "Telehealth: The New Normal in Patient Care",
      subtitle: "Best practices for virtual nursing consultations",
      category: "Telehealth",
      tags: ["Telehealth", "Virtual Care", "Technology"],
      author: {
        id: 4,
        name: "Dr. Michael Roberts",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      },
      featuredImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
      publishDate: "2026-01-08",
      readTime: 5,
      views: 632,
      likes: 45,
      comments: 19
    },
    {
      id: 5,
      title: "Cultural Competence in Nursing: Providing Inclusive Care",
      subtitle: "Understanding and respecting cultural differences in healthcare",
      category: "Patient Care",
      tags: ["Culture", "Diversity", "Patient Care"],
      author: {
        id: 5,
        name: "Dr. Maria Santos",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      },
      featuredImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80",
      publishDate: "2026-01-05",
      readTime: 9,
      views: 978,
      likes: 78,
      comments: 42
    },
    {
      id: 6,
      title: "Nursing Leadership in the Digital Age",
      subtitle: "How nurse leaders can leverage technology for better outcomes",
      category: "Nursing Leadership",
      tags: ["Leadership", "Technology", "Management"],
      author: {
        id: 6,
        name: "Dr. Robert Kim",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
      },
      featuredImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      publishDate: "2026-01-03",
      readTime: 7,
      views: 743,
      likes: 56,
      comments: 23
    }
  ];

  // Search filter
  const searchLower = query.toLowerCase();
  const filtered = allPosts.filter(post => 
    post.title.toLowerCase().includes(searchLower) ||
    post.subtitle.toLowerCase().includes(searchLower) ||
    post.category.toLowerCase().includes(searchLower) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
    post.author.name.toLowerCase().includes(searchLower)
  );

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
    query: query
  };
};

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

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const result = await searchPosts(query, { page: currentPage });
        setPosts(result.posts);
        setTotalPages(result.totalPages);
        setTotalResults(result.total);
      } catch (error) {
        console.error('Error searching posts:', error);
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
    window.scrollTo(0, 0);
  }, [query, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setCurrentPage(1);
    }
  };

  const formatDate = (dateString) => {
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

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* ===== HEADER SECTION ===== */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 py-12 md:py-16 overflow-hidden">
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
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
              >
                <FaArrowLeft />
                <span>Back to Blog</span>
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Search Results
              </h1>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="relative max-w-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for articles, topics, or authors..."
                  className="w-full px-6 py-4 pl-14 pr-12 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition text-lg"
                />
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 text-xl" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-medium hover:bg-white/30 transition"
                >
                  Search
                </button>
              </form>
              
              {query && (
                <p className="text-white/80 mt-4">
                  {totalResults} results for "{query}"
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== RESULTS ===== */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          </div>
        ) : !query ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Search for articles</h3>
            <p className="text-gray-600">Enter a search term above to find articles</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              We couldn't find any articles matching "{query}". Try different keywords.
            </p>
            <Link
              to="/blog"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Browse all articles
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <Link to={`/blog/post/${post.id}`} className="block">
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleBookmark(post.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition"
                      >
                        {bookmarks.includes(post.id) ? (
                          <FaBookmark className="text-yellow-400 text-sm" />
                        ) : (
                          <FaRegBookmark className="text-white text-sm" />
                        )}
                      </button>
                      {post.trending && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-red-500 rounded-full text-white text-xs font-medium flex items-center gap-1">
                          <FaFire className="text-red-300" />
                          Trending
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="font-medium text-blue-600">{post.category}</span>
                        <span>•</span>
                        <span>{formatDate(post.publishDate)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {post.subtitle}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.author.image}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700">{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
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
                  </Link>
                </motion.article>
              ))}
            </div>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
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

      {/* ===== RELATED SEARCH SUGGESTIONS ===== */}
      {query && posts.length > 0 && (
        <div className="container mx-auto px-4 py-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Related searches</h3>
          <div className="flex flex-wrap gap-2">
            {['AI in nursing', 'patient care technology', 'nursing research', 'healthcare innovation', 'evidence-based practice'].map((suggestion) => (
              <Link
                key={suggestion}
                to={`/blog/search?q=${encodeURIComponent(suggestion)}`}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSearch;