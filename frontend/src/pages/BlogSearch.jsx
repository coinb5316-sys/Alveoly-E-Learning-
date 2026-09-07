// src/pages/BlogSearch.jsx - COMPLETE WITH API INTEGRATION
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
  FaSpinner,
  FaShareAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';

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

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 6,
          category: categoryFilter || undefined,
          tag: tagFilter || undefined
        };
        
        const response = await blogAPI.searchPosts(query, params);
        
        if (response.success) {
          setPosts(response.data.posts || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalResults(response.data.pagination?.total || 0);
          setSuggestions(response.data.suggestions || { titles: [], tags: [], categories: [] });
        } else {
          toast.error(response.message || 'Search failed');
        }
      } catch (error) {
        console.error('Error searching posts:', error);
        toast.error(error.response?.data?.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
    window.scrollTo(0, 0);
  }, [query, currentPage, categoryFilter, tagFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setCurrentPage(1);
      setCategoryFilter('');
      setTagFilter('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSearchParams({ q: suggestion });
    setCurrentPage(1);
  };

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

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setCategoryFilter('');
    setTagFilter('');
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setTagFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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

      {/* ===== SUGGESTIONS ===== */}
      {query && (suggestions.titles.length > 0 || suggestions.tags.length > 0 || suggestions.categories.length > 0) && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.titles.slice(0, 3).map((title) => (
                <button
                  key={title}
                  onClick={() => handleSuggestionClick(title)}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-950/50 transition"
                >
                  {title}
                </button>
              ))}
              {suggestions.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSuggestionClick(tag)}
                  className="px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-full text-sm hover:bg-purple-100 dark:hover:bg-purple-950/50 transition"
                >
                  #{tag}
                </button>
              ))}
              {suggestions.categories.slice(0, 3).map((category) => (
                <button
                  key={category}
                  onClick={() => handleSuggestionClick(category)}
                  className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full text-sm hover:bg-green-100 dark:hover:bg-green-950/50 transition"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== FILTERS ===== */}
      {query && posts.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-4">
              <FaFilter className="text-gray-400" />
              {categoryFilter && (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter('')} className="hover:text-blue-800">
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              {tagFilter && (
                <span className="flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                  Tag: #{tagFilter}
                  <button onClick={() => setTagFilter('')} className="hover:text-purple-800">
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(categoryFilter || tagFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-600 transition"
                >
                  Clear Filters
                </button>
              )}
              {!categoryFilter && !tagFilter && (
                <span className="text-sm text-gray-500 dark:text-gray-400">No filters applied</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== RESULTS ===== */}
      <div className="container mx-auto px-4 py-8">
        {!query ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Search for articles</h3>
            <p className="text-gray-600 dark:text-gray-400">Enter a search term above to find articles</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We couldn't find any articles matching "{query}". Try different keywords.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Try searching for:</span>
              {['AI', 'Nursing', 'Healthcare', 'Technology', 'Patient Care'].map((term) => (
                <button
                  key={term}
                  onClick={() => handleSuggestionClick(term)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {term}
                </button>
              ))}
            </div>
            <Link
              to="/blog"
              className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Browse all articles
            </Link>
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
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
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
                      {post.trending && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-red-500 rounded-full text-white text-xs font-medium flex items-center gap-1">
                          <FaFire className="text-red-300" />
                          Trending
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{post.category || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{formatDate(post.publishDate)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {post.readTime || 5} min read
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {post.subtitle}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
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
                          <span className="text-sm text-gray-700 dark:text-gray-300">{post.author?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
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
                  className="px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Related searches</h3>
          <div className="flex flex-wrap gap-2">
            {['AI in nursing', 'patient care technology', 'nursing research', 'healthcare innovation', 'evidence-based practice'].map((suggestion) => (
              <Link
                key={suggestion}
                to={`/blog/search?q=${encodeURIComponent(suggestion)}`}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
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