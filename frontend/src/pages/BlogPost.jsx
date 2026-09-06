// src/pages/BlogPost.jsx - PROFESSIONAL COMPLETE VERSION
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaCalendarAlt, FaUser, FaEye, FaHeart, FaHeartBroken,
  FaShare, FaArrowRight, FaTrophy, FaClock, FaTag,
  FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaCopy,
  FaSpinner, FaCheckCircle, FaTimesCircle, FaCommentDots,
  FaBookmark, FaRegBookmark, FaRss, FaArrowLeft, FaUserCircle,
  FaGraduationCap, FaQuoteLeft, FaReply, FaThumbsUp
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [comment, setComment] = useState({ name: "", email: "", content: "" });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(5);

  useEffect(() => {
    fetchBlog();
    fetchApprovedComments();
    checkBookmark();
    window.scrollTo(0, 0);
    
    // Reading progress tracking
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadingProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  useEffect(() => {
    if (blog) {
      checkUserLiked();
    }
  }, [blog]);

  const getImageUrl = (blogData) => {
    if (!blogData?.featuredImage) return "/blog-default.jpg";
    if (typeof blogData.featuredImage === 'string') return blogData.featuredImage;
    if (blogData.featuredImage?.url) return blogData.featuredImage.url;
    return "/blog-default.jpg";
  };

  const getExcerpt = (blogData) => {
    if (blogData?.excerpt) return blogData.excerpt;
    if (blogData?.content) {
      const plainText = blogData.content.replace(/<[^>]*>/g, '');
      return plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText;
    }
    return "Read more about this insightful article...";
  };

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/blogs/public/${slug}`);
      setBlog(res.data);
      setLikesCount(res.data.likes || 0);
      
      // Calculate reading time from content
      if (res.data.content) {
        const plainText = res.data.content.replace(/<[^>]*>/g, '');
        const words = plainText.split(/\s+/).filter(w => w.length > 0);
        const time = Math.max(1, Math.ceil(words.length / 200));
        setEstimatedReadTime(time);
      }
      
      const relatedRes = await API.get(`/blogs/public/${slug}/related`);
      setRelatedPosts(relatedRes.data || []);
    } catch (err) {
      console.error("Error fetching blog:", err);
      if (err.response?.status === 404) {
        toast.error("Blog post not found");
        navigate("/blog");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedComments = async () => {
    try {
      const res = await API.get(`/blogs/public/${slug}/comments`);
      setComments(res.data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const checkUserLiked = async () => {
    try {
      const res = await API.get(`/blogs/public/${slug}/liked`);
      setLiked(res.data.liked === true);
    } catch (err) {
      console.error("Error checking like status:", err);
    }
  };

  const checkBookmark = () => {
    try {
      const saved = localStorage.getItem('bookmarkedPosts');
      if (saved) {
        const bookmarks = JSON.parse(saved);
        setIsBookmarked(bookmarks.includes(blog?._id));
      }
    } catch (e) {}
  };

  const toggleBookmark = () => {
    try {
      const saved = localStorage.getItem('bookmarkedPosts');
      const bookmarks = saved ? JSON.parse(saved) : [];
      const newBookmarks = isBookmarked 
        ? bookmarks.filter(id => id !== blog._id) 
        : [...bookmarks, blog._id];
      localStorage.setItem('bookmarkedPosts', JSON.stringify(newBookmarks));
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? "Bookmark removed" : "Bookmark added");
    } catch (e) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleLike = async () => {
    const previousLiked = liked;
    const previousCount = likesCount;
    setLiked(!liked);
    setLikesCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      const res = await API.post(`/blogs/public/${slug}/like`, {});
      setLiked(res.data.liked === true);
      setLikesCount(res.data.likes);
    } catch (err) {
      setLiked(previousLiked);
      setLikesCount(previousCount);
      console.error("Error toggling like:", err);
      toast.error(err.response?.data?.message || "Failed to update like");
    }
  };

  const handleQuizSubmit = async () => {
    if (!blog?.quiz?.questions) return;
    
    const answers = {};
    let allAnswered = true;
    
    blog.quiz.questions.forEach((_, index) => {
      const selected = document.querySelector(`input[name="q${index}"]:checked`);
      if (selected) {
        answers[index] = parseInt(selected.value);
      } else {
        allAnswered = false;
      }
    });
    
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    
    setSubmittingQuiz(true);
    try {
      const res = await API.post(`/blogs/public/${slug}/quiz`, {
        answers,
        userName: user?.name || "Anonymous",
        userId: user?._id,
        userEmail: user?.email || ""
      });
      setQuizResult(res.data);
      setQuizSubmitted(true);
      toast.success(`You scored ${res.data.score}/${res.data.total}!`);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.name || !comment.content) {
      toast.error("Please enter your name and comment");
      return;
    }
    
    setSubmittingComment(true);
    try {
      await API.post(`/blogs/public/${slug}/comment`, {
        userName: comment.name,
        userEmail: comment.email,
        content: comment.content,
        userId: user?._id
      });
      setComment({ name: "", email: "", content: "" });
      toast.success("Comment submitted for approval!");
      fetchApprovedComments();
    } catch (err) {
      console.error("Error submitting comment:", err);
      toast.error("Failed to submit comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const shareOnSocial = (platform) => {
    const url = window.location.href;
    const text = blog?.title;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
    };
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
    setShowShareMenu(false);
  };

  const formatDate = (date) => {
    if (!date) return "Recent";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate Schema.org structured data for SEO
  const generateStructuredData = () => {
    if (!blog) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": blog.title,
      "description": blog.excerpt,
      "image": getImageUrl(blog),
      "datePublished": blog.publishedAt,
      "dateModified": blog.updatedAt || blog.publishedAt,
      "author": {
        "@type": "Person",
        "name": blog.author?.name || "Alveoly Admin"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Alveoly e-Learning Academy",
        "logo": {
          "@type": "ImageObject",
          "url": "https://alveoly-elearning.academy/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FaSpinner className="text-5xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>

      <Navbar />

      {/* Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Hero Section - Optimized for SEO */}
      <div className="relative min-h-[60vh] bg-cover bg-center" style={{ backgroundImage: `url(${getImageUrl(blog)})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/10 dark:from-gray-900/20 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 h-full min-h-[60vh] flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full text-white"
          >
            <nav className="flex items-center gap-2 text-sm text-white/70 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <span>›</span>
              <span className="text-white/50 line-clamp-1">{blog.category}</span>
            </nav>

            <div className="flex flex-wrap gap-2 mb-4">
              {blog.category && (
                <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs font-medium">
                  {blog.category}
                </span>
              )}
              {blog.tags?.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mb-6 leading-relaxed">
              {blog.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {blog.author?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-medium text-white">{blog.author?.name || 'Alveoly Admin'}</p>
                  <p className="text-xs text-white/50">Health Sciences Educator</p>
                </div>
              </div>
              
              <span className="hidden md:block w-px h-8 bg-white/20" />
              
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-blue-400" />
                  {formatDate(blog.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-blue-400" />
                  {estimatedReadTime} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <FaEye className="text-blue-400" />
                  {blog.views || 0} views
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Action Bar - Sticky on scroll */}
          <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/blog')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                aria-label="Back to blog"
              >
                <FaArrowLeft />
              </button>
              
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  liked 
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-500' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label={liked ? "Unlike this post" : "Like this post"}
              >
                {liked ? (
                  <FaHeart className="text-red-500 fill-current animate-pulse" />
                ) : (
                  <FaHeartBroken className="text-gray-500" />
                )}
                <span>{likesCount}</span>
              </button>

              <button
                onClick={toggleBookmark}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                {isBookmarked ? <FaBookmark className="text-blue-600" /> : <FaRegBookmark />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-gray-600 dark:text-gray-300"
                aria-expanded={showShareMenu}
              >
                <FaShare /> Share
              </button>

              {showShareMenu && (
                <div className="absolute right-4 top-14 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-40">
                  <div className="p-2 space-y-1">
                    <button onClick={() => shareOnSocial('facebook')} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm">
                      <FaFacebook className="text-blue-600 text-lg" /> Facebook
                    </button>
                    <button onClick={() => shareOnSocial('twitter')} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm">
                      <FaTwitter className="text-blue-400 text-lg" /> Twitter
                    </button>
                    <button onClick={() => shareOnSocial('linkedin')} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm">
                      <FaLinkedin className="text-blue-700 text-lg" /> LinkedIn
                    </button>
                    <button onClick={() => shareOnSocial('whatsapp')} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm">
                      <FaWhatsapp className="text-green-500 text-lg" /> WhatsApp
                    </button>
                    <button onClick={copyToClipboard} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 text-sm border-t border-gray-100 dark:border-gray-700">
                      <FaCopy className="text-gray-500" /> Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <article className="p-6 md:p-8 lg:p-10" itemScope itemType="https://schema.org/Article">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl prose-img:shadow-lg prose-pre:bg-gray-900 prose-pre:text-gray-100"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              itemProp="articleBody"
            />
          </article>

          {/* Tags Section */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <FaTag className="text-gray-400 text-sm" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags:</span>
                {blog.tags.map((tag, i) => (
                  <Link
                    key={i}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Section */}
          {blog.hasQuiz && blog.quiz && blog.quiz.questions?.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-6 md:p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <div className="text-center mb-6">
                <FaTrophy className="text-4xl text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{blog.quiz.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{blog.quiz.description}</p>
                <div className="flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-500 mt-2">
                  <span>Passing score: {blog.quiz.passingScore}%</span>
                  <span>•</span>
                  <span>{blog.quiz.questions.length} questions</span>
                </div>
              </div>

              {!quizSubmitted ? (
                <div>
                  {!showQuiz ? (
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-lg"
                    >
                      Take the Quiz
                    </button>
                  ) : (
                    <div className="space-y-6">
                      {blog.quiz.questions.map((q, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                          <p className="font-semibold text-gray-900 dark:text-white mb-4">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((option, optIdx) => (
                              <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`q${idx}`}
                                  value={optIdx}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleQuizSubmit}
                        disabled={submittingQuiz}
                        className="w-full py-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-lg"
                      >
                        {submittingQuiz ? <FaSpinner className="animate-spin mx-auto" /> : "Submit Quiz"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`text-center p-8 rounded-xl ${quizResult?.passed ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                  <div className="text-6xl mb-4">{quizResult?.passed ? '🎉' : '📚'}</div>
                  <h4 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    You scored {quizResult?.score}/{quizResult?.total} ({Math.round(quizResult?.percentage || 0)}%)
                  </h4>
                  <p className="mb-4 text-gray-600 dark:text-gray-400 text-lg">
                    {quizResult?.passed 
                      ? "Congratulations! You passed the quiz!" 
                      : `You needed ${quizResult?.passingScore}% to pass. Keep learning and try again!`}
                  </p>
                  {!quizResult?.passed && (
                    <button
                      onClick={() => {
                        setShowQuiz(false);
                        setQuizSubmitted(false);
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <FaCommentDots className="text-blue-500" />
              Comments ({comments.length})
            </h3>
            
            {comments.length > 0 && (
              <div className="space-y-4 mb-8">
                {comments.map((commentItem, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {commentItem.userName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {commentItem.userName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(commentItem.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 ml-11">{commentItem.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaUserCircle className="text-blue-500" />
                Leave a Comment
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={comment.name}
                  onChange={(e) => setComment({ ...comment, name: e.target.value })}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email (optional)"
                  value={comment.email}
                  onChange={(e) => setComment({ ...comment, email: e.target.value })}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                />
              </div>
              <textarea
                rows="4"
                placeholder="Share your thoughts... *"
                value={comment.content}
                onChange={(e) => setComment({ ...comment, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors resize-none"
                required
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submittingComment ? <FaSpinner className="animate-spin mx-auto" /> : "Post Comment"}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <FaQuoteLeft className="inline mr-1" />
                  Your comment will be visible after admin approval.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12" aria-label="Related articles">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <FaRss className="text-blue-500" />
              Related Articles
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map(post => (
                <Link key={post._id} to={`/blog/${post.slug}`} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all">
                    <img 
                      src={getImageUrl(post)} 
                      alt={post.title} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                      loading="lazy"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.publishedAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;