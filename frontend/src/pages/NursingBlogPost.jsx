// src/pages/NursingBlogPost.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCalendarAlt, FaUser, FaEye, FaHeart, FaHeartBroken,
  FaShare, FaArrowRight, FaTrophy, FaClock, FaTag,
  FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaCopy,
  FaSpinner, FaCheckCircle, FaTimesCircle, FaCommentDots,
  FaBookmark, FaRegBookmark, FaRss, FaArrowLeft, FaUserCircle,
  FaGraduationCap, FaQuoteLeft, FaReply, FaThumbsUp,
  FaStethoscope, FaSyringe, FaHeartbeat, FaMicroscope,
  FaUniversity, FaAward, FaChartLine, FaFileAlt,
  FaVideo, FaPodcast, FaDownload, FaPrint
} from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineAcademicCap } from "react-icons/hi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ============================================================
// COMPLETE NURSING BLOG POST - PREMIUM UI
// Google AdSense Compliant | Health & Wellness Category
// ============================================================

const NursingBlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentRef = useRef(null);
  
  // State Management
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
  const [estimatedReadTime, setEstimatedReadTime] = useState(8);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [activeHeading, setActiveHeading] = useState("");
  const [headings, setHeadings] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);

  // Effects
  useEffect(() => {
    fetchBlog();
    fetchApprovedComments();
    checkBookmark();
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadingProgress(progress);
      
      // Track active heading for TOC
      if (headings.length > 0) {
        let current = "";
        headings.forEach(h => {
          const element = document.getElementById(h.id);
          if (element && element.getBoundingClientRect().top <= 100) {
            current = h.id;
          }
        });
        setActiveHeading(current);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  useEffect(() => {
    if (blog) {
      checkUserLiked();
      extractHeadings();
    }
  }, [blog]);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getImageUrl = (blogData) => {
    if (!blogData?.featuredImage) return "/nursing-blog-default.jpg";
    if (typeof blogData.featuredImage === 'string') return blogData.featuredImage;
    if (blogData.featuredImage?.url) return blogData.featuredImage.url;
    return "/nursing-blog-default.jpg";
  };

  const getExcerpt = (blogData) => {
    if (blogData?.excerpt) return blogData.excerpt;
    if (blogData?.content) {
      const plainText = blogData.content.replace(/<[^>]*>/g, '');
      return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
    }
    return "An in-depth nursing guide for healthcare professionals...";
  };

  const extractHeadings = () => {
    if (!blog?.content) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = blog.content;
    const headingElements = tempDiv.querySelectorAll('h2, h3');
    const extracted = [];
    headingElements.forEach((el, index) => {
      const id = `heading-${index}`;
      el.id = id;
      extracted.push({
        id,
        text: el.textContent,
        level: el.tagName.toLowerCase()
      });
    });
    setHeadings(extracted);
  };

  const formatDate = (date) => {
    if (!date) return "Recent";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ============================================================
  // API CALLS
  // ============================================================

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/blogs/public/${slug}`);
      setBlog(res.data);
      setLikesCount(res.data.likes || 0);
      
      if (res.data.content) {
        const plainText = res.data.content.replace(/<[^>]*>/g, '');
        const words = plainText.split(/\s+/).filter(w => w.length > 0);
        const time = Math.max(3, Math.ceil(words.length / 200));
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

  // ============================================================
  // INTERACTION HANDLERS
  // ============================================================

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

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  // ============================================================
  // SEO STRUCTURED DATA
  // ============================================================

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
        "name": blog.author?.name || "Alveoly Nursing Academy",
        "jobTitle": "Nursing Educator",
        "affiliation": {
          "@type": "Organization",
          "name": "Alveoly e-Learning Academy"
        }
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
      },
      "about": {
        "@type": "Thing",
        "name": "Nursing Education"
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Nursing Students and Healthcare Professionals"
      }
    };
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <FaSpinner className="text-6xl text-blue-600 animate-spin" />
            <FaStethoscope className="text-3xl text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg animate-pulse">
            Loading nursing article...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) return null;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* ==========================================================
          STRUCTURED DATA
          ========================================================== */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>

      <Navbar />

      {/* ==========================================================
          READING PROGRESS BAR - Premium
          ========================================================== */}
      <div className="fixed top-16 left-0 right-0 z-50 h-1.5 bg-gray-200 dark:bg-gray-700 shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-r-full"
          style={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* ==========================================================
          HERO SECTION - Cinematic Premium
          ========================================================== */}
      <div className="relative min-h-[70vh] lg:min-h-[80vh] overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url(${getImageUrl(blog)})`,
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-purple-900/40" />
        
        {/* Animated Mesh Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)`
          }} />
        </div>

        {/* Floating Medical Icons - Decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-10 text-white/10 text-6xl"
          >
            <FaStethoscope />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-40 right-20 text-white/10 text-7xl"
          >
            <FaHeartbeat />
          </motion.div>
          <motion.div
            animate={{ x: [0, 30, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, delay: 4 }}
            className="absolute top-1/2 left-1/4 text-white/10 text-5xl"
          >
            <FaMicroscope />
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 h-full min-h-[70vh] flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* Breadcrumb - Premium */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 font-light tracking-wide" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-white/30">/</span>
              <Link to="/blog" className="hover:text-white transition-colors">Nursing Blog</Link>
              <span className="text-white/30">/</span>
              <span className="text-white/50 line-clamp-1">{blog.category || "Nursing Education"}</span>
            </nav>

            {/* Category Badge */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-5 py-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium tracking-wide flex items-center gap-2">
                <FaGraduationCap className="text-blue-300" />
                {blog.category || "Nursing Education"}
              </span>
              {blog.tags?.slice(0, 4).map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white/80 text-xs font-light">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Title - Premium Typography */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              {blog.title}
            </h1>
            
            {/* Excerpt */}
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mb-8 leading-relaxed font-light">
              {blog.excerpt}
            </p>

            {/* Author & Meta Info - Premium Card */}
            <div className="flex flex-wrap items-center gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl ring-4 ring-white/20">
                    {blog.author?.name?.charAt(0) || 'N'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">
                    {blog.author?.name || 'Nursing Academy'}
                  </p>
                  <p className="text-sm text-blue-200 flex items-center gap-1">
                    <FaAward className="text-yellow-400" />
                    Registered Nurse Educator
                  </p>
                </div>
              </div>
              
              <div className="flex-1 h-px bg-white/10" />
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-blue-400" />
                  {formatDate(blog.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-purple-400" />
                  {estimatedReadTime} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <FaEye className="text-pink-400" />
                  {blog.views?.toLocaleString() || 0} views
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-sm">
            <div className="w-1.5 h-4 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* ==========================================================
          MAIN CONTENT AREA
          ========================================================== */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ==========================================================
              LEFT SIDEBAR - Table of Contents (Desktop)
              ========================================================== */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <HiOutlineDocumentText className="text-xl" />
                    Table of Contents
                  </h3>
                </div>
                <nav className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {headings.length > 0 ? (
                    <ul className="space-y-2">
                      {headings.map((heading) => (
                        <li key={heading.id}>
                          <a
                            href={`#${heading.id}`}
                            className={`block text-sm transition-all hover:pl-2 ${
                              heading.level === 'h3' ? 'pl-4 text-gray-500 dark:text-gray-400' : ''
                            } ${
                              activeHeading === heading.id 
                                ? 'text-blue-600 dark:text-blue-400 font-medium border-l-2 border-blue-600 pl-2' 
                                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              const element = document.getElementById(heading.id);
                              if (element) {
                                const offset = 100;
                                const elementPosition = element.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - offset;
                                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                              }
                            }}
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No sections available</p>
                  )}
                </nav>
              </div>

              {/* Quick Stats Card */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FaChartLine className="text-blue-500" />
                  Article Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Reading Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">{estimatedReadTime} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Total Views</span>
                    <span className="font-medium text-gray-900 dark:text-white">{blog.views?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Likes</span>
                    <span className="font-medium text-gray-900 dark:text-white">{likesCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Comments</span>
                    <span className="font-medium text-gray-900 dark:text-white">{comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ==========================================================
              MAIN ARTICLE CONTENT
              ========================================================== */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">

              {/* ==========================================================
                  ACTION BAR - Premium Sticky
                  ========================================================== */}
              <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-100 dark:border-gray-700 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/blog')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Back to blog"
                  >
                    <FaArrowLeft className="text-lg" />
                  </button>
                  
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      liked 
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-500 border border-red-200 dark:border-red-800' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-label={liked ? "Unlike this post" : "Like this post"}
                  >
                    {liked ? (
                      <FaHeart className="text-red-500 fill-current animate-pulse" />
                    ) : (
                      <FaHeartBroken className="text-gray-500" />
                    )}
                    <span className="font-medium">{likesCount}</span>
                  </button>

                  <button
                    onClick={toggleBookmark}
                    className={`p-2 rounded-xl transition-colors ${
                      isBookmarked 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  >
                    {isBookmarked ? <FaBookmark className="text-lg" /> : <FaRegBookmark className="text-lg" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-400"
                    aria-label="Print article"
                  >
                    <FaPrint className="text-lg" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                      aria-expanded={showShareMenu}
                    >
                      <FaShare /> Share
                    </button>

                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                        >
                          <div className="p-2 space-y-1">
                            <button onClick={() => shareOnSocial('facebook')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl flex items-center gap-3 text-sm transition-colors">
                              <FaFacebook className="text-blue-600 text-xl" /> Facebook
                            </button>
                            <button onClick={() => shareOnSocial('twitter')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl flex items-center gap-3 text-sm transition-colors">
                              <FaTwitter className="text-blue-400 text-xl" /> Twitter
                            </button>
                            <button onClick={() => shareOnSocial('linkedin')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl flex items-center gap-3 text-sm transition-colors">
                              <FaLinkedin className="text-blue-700 text-xl" /> LinkedIn
                            </button>
                            <button onClick={() => shareOnSocial('whatsapp')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl flex items-center gap-3 text-sm transition-colors">
                              <FaWhatsapp className="text-green-500 text-xl" /> WhatsApp
                            </button>
                            <button onClick={copyToClipboard} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl flex items-center gap-3 text-sm border-t border-gray-100 dark:border-gray-700 transition-colors">
                              <FaCopy className="text-gray-500 text-lg" /> Copy Link
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ==========================================================
                  ARTICLE BODY - Premium Typography
                  ========================================================== */}
              <article 
                ref={contentRef}
                className="p-6 sm:p-8 lg:p-12"
                itemScope 
                itemType="https://schema.org/Article"
              >
                {/* Mobile TOC Toggle */}
                <div className="lg:hidden mb-6">
                  <button
                    onClick={() => setShowTableOfContents(!showTableOfContents)}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    <HiOutlineDocumentText />
                    {showTableOfContents ? 'Hide' : 'Show'} Table of Contents
                  </button>
                  <AnimatePresence>
                    {showTableOfContents && headings.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 overflow-hidden"
                      >
                        <ul className="space-y-2">
                          {headings.map((heading) => (
                            <li key={heading.id}>
                              <a
                                href={`#${heading.id}`}
                                className={`text-sm ${
                                  heading.level === 'h3' ? 'pl-4 text-gray-500 dark:text-gray-400' : ''
                                } text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const element = document.getElementById(heading.id);
                                  if (element) {
                                    const offset = 100;
                                    const elementPosition = element.getBoundingClientRect().top;
                                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                                    setShowTableOfContents(false);
                                  }
                                }}
                              >
                                {heading.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Premium Content Styling */}
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert 
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-4xl prose-h1:text-gray-900 dark:prose-h1:text-white
                    prose-h2:text-3xl prose-h2:text-gray-800 dark:prose-h2:text-gray-100 prose-h2:mt-12 prose-h2:mb-4
                    prose-h3:text-2xl prose-h3:text-gray-800 dark:prose-h3:text-gray-200 prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                    prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-li:mb-2
                    prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30 
                    prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                    prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                    prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:shadow-xl
                    prose-table:border-collapse prose-table:w-full
                    prose-th:bg-gray-100 dark:prose-th:bg-gray-700 prose-th:p-3 prose-th:text-left
                    prose-td:p-3 prose-td:border-b prose-td:border-gray-200 dark:prose-td:border-gray-700
                  "
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                  itemProp="articleBody"
                />

                {/* ==========================================================
                    CALL TO ACTION - Premium Nursing CTA
                    ========================================================== */}
                <div className="my-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                  </div>
                  <div className="relative z-10 text-center">
                    <FaStethoscope className="text-5xl mx-auto mb-4 text-blue-200" />
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                      Advance Your Nursing Career
                    </h3>
                    <p className="text-blue-100 max-w-2xl mx-auto mb-6 text-lg leading-relaxed">
                      Join thousands of nursing professionals who are advancing their careers 
                      through our evidence-based education programs.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Link
                        to="/programs"
                        className="px-8 py-3.5 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 transform"
                      >
                        Explore Programs
                      </Link>
                      <Link
                        to="/contact"
                        className="px-8 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl font-semibold hover:bg-white/30 transition-all"
                      >
                        Talk to an Advisor
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* ==========================================================
                  TAGS SECTION - Premium
                  ========================================================== */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-6 sm:px-8 lg:px-12 py-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <FaTag className="text-gray-400 text-sm" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Topics:</span>
                    {blog.tags.map((tag, i) => (
                      <Link
                        key={i}
                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors hover:shadow-md"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ==========================================================
                  AUTHOR BIO - Premium
                  ========================================================== */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-6 sm:px-8 lg:px-12 py-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white dark:ring-gray-800 shadow-xl flex-shrink-0">
                    {blog.author?.name?.charAt(0) || 'N'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {blog.author?.name || 'Nursing Academy'}
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 flex items-center gap-2 text-sm">
                      <FaAward className="text-yellow-500" />
                      Registered Nurse | Nursing Educator | Author
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                      Dedicated to advancing nursing education through evidence-based practice, 
                      clinical excellence, and compassionate patient care. 
                      Over 15 years of experience in healthcare education.
                    </p>
                  </div>
                </div>
              </div>

              {/* ==========================================================
                  COMMENTS SECTION - Premium
                  ========================================================== */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-6 sm:px-8 lg:px-12 py-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <FaCommentDots className="text-blue-500" />
                  Comments ({comments.length})
                </h3>
                
                {comments.length > 0 && (
                  <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {comments.map((commentItem, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              {commentItem.userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {commentItem.userName || 'Anonymous'}
                              </span>
                              {commentItem.userEmail && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">{commentItem.userEmail}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(commentItem.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 ml-13 leading-relaxed">
                          {commentItem.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                    <FaUserCircle className="text-blue-500 text-2xl" />
                    Join the Discussion
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                    Share your thoughts, ask questions, or contribute to the conversation.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={comment.name}
                      onChange={(e) => setComment({ ...comment, name: e.target.value })}
                      className="px-5 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email (optional)"
                      value={comment.email}
                      onChange={(e) => setComment({ ...comment, email: e.target.value })}
                      className="px-5 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    />
                  </div>
                  <textarea
                    rows="4"
                    placeholder="Share your nursing insights, questions, or feedback... *"
                    value={comment.content}
                    onChange={(e) => setComment({ ...comment, content: e.target.value })}
                    className="w-full px-5 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors resize-none"
                    required
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 hover:scale-105 transform duration-200"
                    >
                      {submittingComment ? <FaSpinner className="animate-spin mx-auto" /> : "Post Comment"}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FaQuoteLeft className="text-blue-400 text-xs" />
                      All comments are moderated for quality.
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* ==========================================================
                RELATED POSTS - Premium Grid
                ========================================================== */}
            {relatedPosts.length > 0 && (
              <section className="mt-12" aria-label="Related nursing articles">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <FaRss className="text-blue-500" />
                    Related Nursing Articles
                  </h3>
                  <Link to="/blog" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center gap-1">
                    View all <FaArrowRight className="text-xs" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.slice(0, 3).map(post => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link to={`/blog/${post.slug}`} className="group block h-full">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 h-full border border-gray-100 dark:border-gray-700">
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={getImageUrl(post)} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          </div>
                          <div className="p-5">
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-blue-500" />
                                {formatDate(post.publishedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaClock className="text-blue-500" />
                                {post.readingTime || '5'} min
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {post.excerpt || 'Explore this nursing insight...'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* ==========================================================
          FOOTER - Premium
          ========================================================== */}
      <Footer />
    </div>
  );
};

export default NursingBlogPost;