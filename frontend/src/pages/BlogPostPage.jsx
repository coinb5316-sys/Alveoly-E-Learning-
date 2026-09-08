// src/pages/BlogPostPage.jsx - FIXED WITH AUDIO/PODCAST DISPLAY
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaBookmark,
  FaRegBookmark,
  FaComment,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaEye,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaWhatsapp,
  FaEnvelope,
  FaLink,
  FaCheckCircle,
  FaGraduationCap,
  FaVideo,
  FaImage,
  FaFileAlt,
  FaThumbsUp,
  FaArrowLeft,
  FaArrowRight,
  FaLightbulb,
  FaChartLine,
  FaUserCircle,
  FaSpinner,
  FaFire,
  FaHeadphones,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../api/blogApi';
import { useAuth } from '../context/AuthContext';

// Lazy load ReactPlayer
const ReactPlayer = lazy(() => import('react-player'));

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = React.useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        
        const response = await blogAPI.getPostBySlug(id);
        
        if (response.success) {
          const data = response.data;
          setPost(data);
          setRelatedPosts(data.relatedPosts || []);
          setComments(data.comments || []);
          setLikesCount(data.likes || 0);
          setViewsCount(data.views || 0);
          
          if (isAuthenticated && user && data.likedBy) {
            setLiked(data.likedBy.includes(user._id));
          }
          
          if (isAuthenticated && user && data.bookmarkedBy) {
            setBookmarked(data.bookmarkedBy.includes(user._id));
          }
          
          await blogAPI.incrementViews(data._id);
        } else {
          toast.error(response.message || 'Failed to load blog post');
          navigate('/blog');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error(error.response?.data?.message || 'Failed to load blog post');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
    window.scrollTo(0, 0);
  }, [id, navigate, user, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    
    try {
      const response = await blogAPI.toggleLike(post._id);
      if (response.success) {
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
      } else {
        toast.error(response.message || 'Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark posts');
      return;
    }
    
    try {
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Failed to bookmark post');
      setBookmarked(!bookmarked);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    
    try {
      setSubmittingComment(true);
      const response = await blogAPI.addComment(post._id, {
        content: commentText.trim(),
        authorName: user.name,
        authorEmail: user.email
      });
      
      if (response.success) {
        const newComment = {
          ...response.data,
          authorName: user.name,
          authorAvatar: user.avatar || null
        };
        setComments([newComment, ...comments]);
        setCommentText('');
        toast.success('Comment posted successfully');
      } else {
        toast.error(response.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
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

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Article Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* ===== HERO SECTION ===== */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-white/80 text-sm mb-6"
            >
              <Link to="/" className="hover:text-white transition">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-white transition">Blog</Link>
              <span>/</span>
              <span className="text-white/60">{post.category || 'Uncategorized'}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                {post.category || 'Uncategorized'}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {post.title}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-2xl mb-8">
                {post.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-3">
                  {post.author?.avatar || post.author?.image || post.authorImage ? (
                    <img
                      src={post.author?.avatar || post.author?.image || post.authorImage}
                      alt={post.author?.name || post.authorName}
                      className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white/30 flex items-center justify-center text-white text-lg font-bold">
                      {(post.author?.name || post.authorName)?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{post.author?.name || post.authorName || 'Unknown'}</p>
                    <p className="text-sm text-white/70">{post.author?.title || post.authorTitle || 'Contributor'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-white/60" />
                    {formatDate(post.publishDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaClock className="text-white/60" />
                    {post.readingTime || 5} min read
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaEye className="text-white/60" />
                    {viewsCount || 0} views
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      </div>

      {/* ===== CONTENT SECTION ===== */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3 space-y-8">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-1.5 border border-gray-100 dark:border-gray-800"
            >
              {['content', 'videos', 'audio', 'references'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab === 'content' && <FaFileAlt />}
                  {tab === 'videos' && <FaVideo />}
                  {tab === 'audio' && <FaHeadphones />}
                  {tab === 'references' && <FaBookmark />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </motion.div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 dark:border-gray-800"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="relative rounded-2xl overflow-hidden mb-8">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/blog/search?q=${tag}`}
                            className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium hover:bg-white/30 transition"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Audio/Podcast Player - Show in content tab too */}
                {post.audioUrl && (
                  <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                          <FaHeadphones className="text-xl" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Listen to this article</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={toggleAudio}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                          >
                            {audioPlaying ? <FaPause className="h-4 w-4" /> : <FaPlay className="h-4 w-4" />}
                          </button>
                          <audio
                            ref={audioRef}
                            src={post.audioUrl}
                            onEnded={() => setAudioPlaying(false)}
                            className="hidden"
                          />
                          <div className="flex-1">
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }} />
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Podcast</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gallery Images */}
                {post.galleryImages && post.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {post.galleryImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        className="rounded-lg object-cover h-48 w-full hover:scale-105 transition duration-300"
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <div
                  className="prose prose-lg prose-blue max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-xl prose-img:rounded-2xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Statistics Grid */}
                {post.statistics && post.statistics.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                    {post.statistics.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 text-center border border-blue-100 dark:border-blue-800/50"
                      >
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {stat.value}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Learning Objectives */}
                {post.learningObjectives && post.learningObjectives.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 mt-8 border border-blue-100 dark:border-blue-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                      <FaGraduationCap className="text-blue-600 dark:text-blue-400" />
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {post.learningObjectives.map((obj, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                          <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && post.videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
              >
                <div className="relative aspect-video bg-black">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <FaSpinner className="animate-spin text-white text-4xl" />
                    </div>
                  }>
                    <ReactPlayer
                      url={post.videoUrl}
                      width="100%"
                      height="100%"
                      playing={isPlaying}
                      muted={isMuted}
                      controls
                      config={{
                        youtube: {
                          playerVars: {
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0
                          }
                        }
                      }}
                    />
                  </Suspense>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Video Presentation</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Watch this comprehensive overview of {post.title}.</p>
                </div>
              </motion.div>
            )}

            {/* Audio Tab - Full podcast player */}
            {activeTab === 'audio' && post.audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
              >
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl mx-auto mb-4">
                    <FaHeadphones />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Podcast Episode</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Listen to the audio version of this article</p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center justify-center gap-6">
                      <button
                        onClick={toggleAudio}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-all duration-300"
                      >
                        {audioPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl ml-1" />}
                      </button>
                      <audio
                        ref={audioRef}
                        src={post.audioUrl}
                        onEnded={() => setAudioPlaying(false)}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">0:00</span>
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '0%' }} />
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">3:45</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Podcast</span>
                          <span>{post.title}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* References Tab */}
            {activeTab === 'references' && post.references && post.references.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">References & Sources</h3>
                <ul className="space-y-4">
                  {post.references.map((ref, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                    >
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">[{index + 1}]</span>
                      <span className="text-gray-700 dark:text-gray-300">{ref}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* ===== INTERACTION SECTION ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    liked ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                >
                  {liked ? <FaHeart className="text-red-600 dark:text-red-400" /> : <FaRegHeart />}
                  <span>{liked ? 'Liked' : 'Like'}</span>
                  <span className="ml-1 text-sm">{likesCount || 0}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    bookmarked ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 hover:text-yellow-600 dark:hover:text-yellow-400'
                  }`}
                >
                  {bookmarked ? <FaBookmark className="text-yellow-600 dark:text-yellow-400" /> : <FaRegBookmark />}
                  <span>{bookmarked ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                >
                  <FaShareAlt />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    showComments ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <FaComment />
                  <span>Comments ({comments.length})</span>
                </button>
              </div>
              
              {/* Share buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mr-2">Share:</span>
                <button className="p-2 bg-[#1877f2] text-white rounded-lg hover:shadow-lg transition">
                  <FaFacebook />
                </button>
                <button className="p-2 bg-[#1da1f2] text-white rounded-lg hover:shadow-lg transition">
                  <FaTwitter />
                </button>
                <button className="p-2 bg-[#0a66c2] text-white rounded-lg hover:shadow-lg transition">
                  <FaLinkedin />
                </button>
                <button className="p-2 bg-[#25d366] text-white rounded-lg hover:shadow-lg transition">
                  <FaWhatsapp />
                </button>
                <button className="p-2 bg-[#ea4335] text-white rounded-lg hover:shadow-lg transition">
                  <FaEnvelope />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 bg-gray-600 text-white rounded-lg hover:shadow-lg transition"
                >
                  <FaLink />
                </button>
              </div>
            </motion.div>

            {/* Comments Section */}
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Comments ({comments.length})
                </h3>

                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} className="mb-8">
                    <div className="flex gap-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user?.name?.charAt(0) || 'G'}
                        </div>
                      )}
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts on this article..."
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-gray-700 dark:text-gray-300 min-h-[80px] transition"
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            type="submit"
                            disabled={submittingComment || !commentText.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {submittingComment ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              'Post Comment'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        Login
                      </Link>{' '}
                      or{' '}
                      <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        Sign up
                      </Link>{' '}
                      to join the conversation
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                      <motion.div
                        key={comment._id || comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                      >
                        {comment.authorAvatar || comment.avatar ? (
                          <img
                            src={comment.authorAvatar || comment.avatar}
                            alt={comment.authorName || comment.user}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {(comment.authorName || comment.user)?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {comment.authorName || comment.user}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(comment.createdAt || comment.date)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content || comment.text}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                              <FaThumbsUp /> {comment.likes > 0 && comment.likes}
                            </button>
                            <button className="text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Reply</button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="lg:w-1/3 space-y-6">
            {/* Author Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
            >
              <div className="text-center">
                {post.author?.avatar || post.author?.image || post.authorImage ? (
                  <img
                    src={post.author?.avatar || post.author?.image || post.authorImage}
                    alt={post.author?.name || post.authorName}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-100 dark:border-blue-900/50"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto border-4 border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-white text-3xl font-bold">
                    {(post.author?.name || post.authorName)?.charAt(0) || 'A'}
                  </div>
                )}
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4">
                  {post.author?.name || post.authorName || 'Unknown'}
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {post.author?.title || post.authorTitle || 'Contributor'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {post.author?.bio || post.authorBio || 'No bio available'}
                </p>
                <Link
                  to={`/blog/author/${post.author?._id || post.author?.id}`}
                  className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
                >
                  View all articles
                </Link>
              </div>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-6 text-white"
            >
              <h4 className="text-lg font-bold mb-2">Subscribe to Alveoly</h4>
              <p className="text-white/90 text-sm mb-4">
                Get the latest healthcare insights delivered to your inbox
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                />
                <button className="px-4 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Subscribe Now
                </button>
              </div>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
            >
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FaLightbulb className="text-yellow-500" />
                Related Articles
              </h4>
              <div className="space-y-4">
                {relatedPosts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No related articles found</p>
                ) : (
                  relatedPosts.map((related) => (
                    <Link key={related._id || related.id} to={`/blog/post/${related.slug || related._id}`} className="block group">
                      <div className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        {related.featuredImage && (
                          <img
                            src={related.featuredImage}
                            alt={related.title}
                            className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                          />
                        )}
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                            {related.title}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{related.readingTime || 5} min read</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
              >
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog/search?q=${tag}`}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ===== BACK TO BLOG ===== */}
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <FaArrowLeft />
          <span>Back to Blog</span>
        </Link>
      </div>
    </div>
  );
};

export default BlogPostPage;