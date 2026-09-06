// src/pages/BlogAuthor.jsx
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
  FaUserCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Mock API - Replace with actual API calls
const fetchAuthorData = async (authorId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const authors = {
    '1': {
      id: 1,
      name: "Dr. Sarah Mitchell",
      title: "Chief Nursing Officer, Alveoly Academy",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      bio: "Dr. Mitchell is a leading expert in nursing informatics with over 20 years of experience in healthcare innovation. She has published extensively on the intersection of technology and patient care, and is passionate about preparing the next generation of nurses for a digital healthcare future.",
      joinedDate: "2024-03-15",
      social: {
        twitter: "https://twitter.com/drsarahmitchell",
        linkedin: "https://linkedin.com/in/drsarahmitchell",
        email: "sarah.mitchell@alveoly.com"
      },
      expertise: ["Nursing Informatics", "Healthcare Technology", "Patient Care", "AI in Healthcare"],
      stats: {
        posts: 24,
        followers: 3847,
        likes: 2456
      }
    },
    '2': {
      id: 2,
      name: "Prof. James Anderson",
      title: "Research Director, Alveoly Academy",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Prof. Anderson is a distinguished researcher in evidence-based nursing practice. With over 25 years of experience in clinical research and education, he has helped shape nursing curricula across multiple institutions.",
      joinedDate: "2023-08-01",
      social: {
        twitter: "https://twitter.com/profjamesanderson",
        linkedin: "https://linkedin.com/in/profjamesanderson",
        email: "james.anderson@alveoly.com"
      },
      expertise: ["Evidence-Based Practice", "Clinical Research", "Nursing Education", "Research Methodology"],
      stats: {
        posts: 18,
        followers: 2156,
        likes: 1876
      }
    }
  };
  
  return authors[authorId] || {
    id: parseInt(authorId),
    name: "Guest Author",
    title: "Contributor",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face",
    bio: "Guest author contributing to Alveoly Academy's healthcare blog.",
    joinedDate: "2025-01-01",
    social: {
      twitter: "#",
      linkedin: "#",
      email: "#"
    },
    expertise: ["Healthcare", "Nursing", "Patient Care"],
    stats: {
      posts: 5,
      followers: 342,
      likes: 156
    }
  };
};

const fetchAuthorPosts = async (authorId, page = 1) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const allPosts = [
    {
      id: 1,
      title: "The Future of Nursing: AI-Powered Patient Care in 2026",
      subtitle: "How artificial intelligence is revolutionizing healthcare delivery",
      category: "Healthcare Technology",
      tags: ["AI", "Nursing", "Healthcare"],
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
      featuredImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
      publishDate: "2026-01-10",
      readTime: 7,
      views: 2341,
      likes: 156,
      comments: 67
    }
  ];
  
  // Filter by author (in real API, this would be done on the server)
  const filtered = allPosts;
  
  const limit = 6;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);
  
  return {
    posts: paginated,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
    currentPage: page
  };
};

const BlogAuthor = () => {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch author data
        const authorData = await fetchAuthorData(authorId);
        setAuthor(authorData);
        
        // Fetch author posts
        const postsResult = await fetchAuthorPosts(authorId, currentPage);
        setPosts(postsResult.posts);
        setTotalPages(postsResult.totalPages);
        
      } catch (error) {
        console.error('Error fetching author data:', error);
        toast.error('Failed to load author');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    window.scrollTo(0, 0);
  }, [authorId, currentPage]);

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

  const handleFollow = () => {
    setFollowed(!followed);
    toast.success(followed ? 'Unfollowed' : 'Followed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading author...</p>
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
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 object-cover"
                />
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {author.name}
                  </h1>
                  <p className="text-white/80 text-lg">{author.title}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1.5">
                      <FaUser />
                      {author.stats.posts} articles
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaFire />
                      {author.stats.followers} followers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaHeart />
                      {author.stats.likes} likes
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
              <p className="text-gray-700 leading-relaxed">{author.bio}</p>
              
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
            </div>
            
            <div className="md:w-48">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Connect</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={author.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#1da1f2] text-white rounded-lg hover:shadow-lg transition"
                >
                  <FaTwitter className="text-lg" />
                </a>
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#0a66c2] text-white rounded-lg hover:shadow-lg transition"
                >
                  <FaLinkedin className="text-lg" />
                </a>
                <a
                  href={`mailto:${author.social.email}`}
                  className="p-2 bg-[#ea4335] text-white rounded-lg hover:shadow-lg transition"
                >
                  <FaEnvelope className="text-lg" />
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Joined {formatDate(author.joinedDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== POSTS ===== */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Articles by {author.name}
        </h2>
        
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
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {post.readTime} min read
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {post.subtitle}
                      </p>
                      <div className="flex items-center gap-4 text-gray-400 text-sm">
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

export default BlogAuthor;