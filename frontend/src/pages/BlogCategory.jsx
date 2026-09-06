// src/pages/BlogCategory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
  FaTag,
  FaFire,
  FaBookmark,
  FaRegBookmark,
  FaSearch
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Mock API - Replace with actual API calls
const fetchCategoryPosts = async (categorySlug, page = 1) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const allPosts = [
    {
      id: 1,
      title: "The Future of Nursing: AI-Powered Patient Care in 2026",
      subtitle: "How artificial intelligence is revolutionizing healthcare delivery",
      category: "Healthcare Technology",
      slug: "healthcare-technology",
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
      slug: "nursing-practice",
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
      slug: "mental-health",
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
      slug: "telehealth",
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
      slug: "patient-care",
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
      slug: "nursing-leadership",
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

  // Filter by category slug
  const filtered = allPosts.filter(post => post.slug === categorySlug);
  
  // Pagination
  const limit = 6;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);
  
  return {
    posts: paginated,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
    currentPage: page,
    categoryName: filtered.length > 0 ? filtered[0].category : categorySlug
  };
};

const getCategoryInfo = async (slug) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const categories = {
    'healthcare-technology': {
      name: 'Healthcare Technology',
      description: 'Exploring the latest innovations in healthcare technology and their impact on nursing practice.',
      icon: '💻',
      count: 12
    },
    'nursing-practice': {
      name: 'Nursing Practice',
      description: 'Best practices, clinical guidelines, and evidence-based approaches to nursing care.',
      icon: '🏥',
      count: 8
    },
    'mental-health': {
      name: 'Mental Health',
      description: 'Understanding mental health issues, wellness strategies, and support for healthcare workers.',
      icon: '🧠',
      count: 6
    },
    'telehealth': {
      name: 'Telehealth',
      description: 'The future of virtual care, telemedicine technologies, and remote patient monitoring.',
      icon: '📱',
      count: 5
    },
    'patient-care': {
      name: 'Patient Care',
      description: 'Comprehensive approaches to patient-centered care and improving patient outcomes.',
      icon: '❤️',
      count: 9
    },
    'nursing-leadership': {
      name: 'Nursing Leadership',
      description: 'Leadership strategies, management skills, and career development for nursing professionals.',
      icon: '👔',
      count: 7
    }
  };
  
  return categories[slug] || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    description: 'Articles in this category',
    icon: '📚',
    count: 0
  };
};

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch category info
        const info = await getCategoryInfo(category);
        setCategoryInfo(info);
        
        // Fetch posts
        const result = await fetchCategoryPosts(category, currentPage);
        setPosts(result.posts);
        setTotalPages(result.totalPages);
        setTotalPosts(result.total);
        
      } catch (error) {
        console.error('Error fetching category data:', error);
        toast.error('Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    window.scrollTo(0, 0);
  }, [category, currentPage]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
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
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
              >
                <FaArrowLeft />
                <span>Back to Blog</span>
              </Link>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{categoryInfo?.icon || '📚'}</span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    {categoryInfo?.name || category}
                  </h1>
                  <p className="text-white/80 text-lg mt-2">
                    {categoryInfo?.description || 'Articles in this category'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <FaTag />
                  {totalPosts} articles
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== POSTS GRID ===== */}
      <div className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles in this category</h3>
            <p className="text-gray-600">Check back later for new content</p>
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
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl transition ${
                      currentPage === i + 1
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
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
    </div>
  );
};

export default BlogCategory;