// src/pages/BlogPost.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaCalendarAlt, FaUser, FaEye, FaHeart, FaShare, 
  FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle,
  FaBookOpen, FaTrophy, FaChartLine, FaClock, FaTag,
  FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaCopy,
  FaSpinner, FaGraduationCap
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [comment, setComment] = useState({ name: "", email: "", content: "" });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  const getImageUrl = (blog) => {
  if (!blog?.featuredImage) return "/blog-default.jpg";
  if (typeof blog.featuredImage === 'string') return blog.featuredImage;
  if (blog.featuredImage.url) return blog.featuredImage.url;
  return "/blog-default.jpg";
};

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/blogs/public/${slug}`);
      setBlog(res.data);
      
      // Fetch related posts
      const relatedRes = await API.get(`/blogs/public/${slug}/related`);
      setRelatedPosts(relatedRes.data);
    } catch (err) {
      console.error("Error fetching blog:", err);
      if (err.response?.status === 404) {
        navigate("/blog");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      await API.post(`/blogs/public/${slug}/like`, { userId: user?._id });
      setLiked(true);
      setBlog(prev => ({ ...prev, likes: prev.likes + 1 }));
    } catch (err) {
      console.error("Error liking:", err);
    }
  };

  const handleQuizSubmit = async () => {
    const answers = {};
    blog.quiz?.questions.forEach((_, index) => {
      const selected = document.querySelector(`input[name="q${index}"]:checked`);
      if (selected) {
        answers[index] = parseInt(selected.value);
      }
    });
    
    if (Object.keys(answers).length !== blog.quiz?.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    setSubmittingQuiz(true);
    try {
      const res = await API.post(`/blogs/public/${slug}/quiz`, {
        answers,
        userName: user?.name || "Anonymous",
        userId: user?._id
      });
      setQuizResult(res.data);
      setQuizSubmitted(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.name || !comment.content) {
      alert("Please enter your name and comment");
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
      alert("Comment submitted for approval!");
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("Failed to submit comment");
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
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FaSpinner className="text-5xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] bg-cover bg-center" style={{ backgroundImage: `url(${getImageUrl(blog)})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <div className="mb-4">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm">
                {blog.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{blog.title}</h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-200">
              <span className="flex items-center gap-2">
                <FaCalendarAlt />
                {formatDate(blog.publishedAt)}
              </span>
              <span className="flex items-center gap-2">
                <FaClock />
                {blog.readingTime} min read
              </span>
              <span className="flex items-center gap-2">
                <FaEye />
                {blog.views} views
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Author & Meta */}
          <div className="border-b border-gray-100 p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {blog.author?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{blog.author?.name || 'Alveoly Admin'}</p>
                <p className="text-sm text-gray-500">Health Sciences Educator</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaHeart className={liked ? 'fill-red-500' : ''} />
                {blog.likes}
              </button>
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
                  <FaShare /> Share
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2 space-y-1">
                    <button onClick={() => shareOnSocial('facebook')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2">📘 Facebook</button>
                    <button onClick={() => shareOnSocial('twitter')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2">🐦 Twitter</button>
                    <button onClick={() => shareOnSocial('linkedin')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2">🔗 LinkedIn</button>
                    <button onClick={() => shareOnSocial('whatsapp')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2">💬 WhatsApp</button>
                    <button onClick={copyToClipboard} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2">📋 Copy Link</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-8 prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="border-t border-gray-100 p-6">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Section */}
          {blog.hasQuiz && blog.quiz && (
            <div className="border-t border-gray-100 p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="text-center mb-6">
                <FaTrophy className="text-4xl text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">{blog.quiz.title}</h3>
                <p className="text-gray-600">{blog.quiz.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Passing score: {blog.quiz.passingScore}% • {blog.quiz.questions?.length} questions
                </p>
              </div>

              {!quizSubmitted ? (
                <div>
                  {!showQuiz ? (
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Take the Quiz
                    </button>
                  ) : (
                    <div className="space-y-6">
                      {blog.quiz.questions?.map((q, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                          <p className="font-semibold text-gray-900 mb-4">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((option, optIdx) => (
                              <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`q${idx}`}
                                  value={optIdx}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleQuizSubmit}
                        disabled={submittingQuiz}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {submittingQuiz ? <FaSpinner className="animate-spin mx-auto" /> : "Submit Quiz"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`text-center p-6 rounded-xl ${quizResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="text-6xl mb-4">{quizResult.passed ? '🎉' : '📚'}</div>
                  <h4 className="text-xl font-bold mb-2">
                    You scored {quizResult.score}/{quizResult.total} ({Math.round(quizResult.percentage)}%)
                  </h4>
                  <p className="mb-4">
                    {quizResult.passed 
                      ? "Congratulations! You passed the quiz!" 
                      : `You needed ${quizResult.passingScore}% to pass. Keep learning and try again!`}
                  </p>
                  {!quizResult.passed && (
                    <button
                      onClick={() => {
                        setShowQuiz(false);
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Leave a Comment</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={comment.name}
                  onChange={(e) => setComment({ ...comment, name: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email (optional)"
                  value={comment.email}
                  onChange={(e) => setComment({ ...comment, email: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <textarea
                rows="4"
                placeholder="Your Comment *"
                value={comment.content}
                onChange={(e) => setComment({ ...comment, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {submittingComment ? <FaSpinner className="animate-spin mx-auto" /> : "Post Comment"}
              </button>
            </form>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map(post => (
                <Link key={post._id} to={`/blog/${post.slug}`} className="group">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all">
                    <img src={post.featuredImage} alt={post.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                      <p className="text-sm text-gray-500">{formatDate(post.publishedAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;