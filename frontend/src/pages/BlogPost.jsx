// src/components/BlogPost.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaBookmark,
  FaRegBookmark,
  FaComment,
  FaUserMd,
  FaClock,
  FaCalendarAlt,
  FaPlay,
  FaPause,
  FaExpand,
  FaVolumeUp,
  FaVolumeMute,
  FaDownload,
  FaPrint,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaLink,
  FaCheckCircle,
  FaStar,
  FaGraduationCap,
  FaVideo,
  FaImage,
  FaFileAlt,
  FaQuoteLeft,
  FaArrowLeft,
  FaArrowRight,
  FaThumbsUp,
  FaThumbsDown,
  FaUserCircle,
  FaSearch,
  FaTimes,
  FaFilter,
  FaLightbulb,
  FaClipboardList,
  FaChartLine,
  FaStethoscope,
  FaHeartbeat,
  FaBrain,
  FaLungs,
  FaBone,
  FaEye,
  FaBell
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Sample blog post data
const blogData = {
  id: 1,
  title: "The Future of Nursing: AI-Powered Patient Care in 2026",
  subtitle: "How artificial intelligence is revolutionizing healthcare delivery and nursing practice",
  author: {
    name: "Dr. Sarah Mitchell",
    title: "Chief Nursing Officer, Alveoly Academy",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    bio: "Dr. Mitchell is a leading expert in nursing informatics with over 20 years of experience in healthcare innovation."
  },
  publishDate: "2026-01-15",
  readTime: 8,
  category: "Healthcare Technology",
  tags: ["AI", "Nursing", "Healthcare", "Technology", "Innovation"],
  featuredImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
  images: [
    "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&q=80",
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80"
  ],
  content: `
    <p>Artificial intelligence is no longer a concept of the future—it's transforming the way nurses deliver care today. From predictive analytics that identify patient deterioration early, to smart monitoring systems that free up valuable nursing time, AI is reshaping the healthcare landscape.</p>
    
    <h2>The Rise of Smart Patient Monitoring</h2>
    <p>Modern healthcare facilities are increasingly adopting AI-powered monitoring systems that can predict patient deterioration up to 24 hours before traditional methods would detect it. This early warning capability is saving lives and reducing ICU admissions by up to 30% in hospitals that have implemented these systems.</p>
    
    <blockquote>"AI is not replacing nurses—it's empowering them to focus on what matters most: direct patient care and compassion."</blockquote>
    
    <h2>AI-Assisted Clinical Decision Making</h2>
    <p>Nurses are now using AI tools that analyze vast amounts of patient data to provide real-time insights and recommendations. These systems help identify potential drug interactions, suggest evidence-based interventions, and flag unusual patterns in vital signs.</p>
    
    <h3>Key Benefits for Nursing Practice</h3>
    <ul>
      <li>Reduced documentation time by 40%</li>
      <li>Improved patient outcomes and safety</li>
      <li>Enhanced clinical decision support</li>
      <li>More time for direct patient interaction</li>
    </ul>
    
    <h2>Challenges and Considerations</h2>
    <p>While AI offers tremendous benefits, successful implementation requires careful consideration of ethical implications, data privacy concerns, and the need for comprehensive staff training. Nurses must maintain their essential role as patient advocates while embracing these powerful new tools.</p>
  `,
  statistics: [
    { value: "40%", label: "Reduced Documentation Time" },
    { value: "85%", label: "Accuracy in Patient Monitoring" },
    { value: "30%", label: "Fewer ICU Admissions" },
    { value: "95%", label: "Patient Satisfaction" }
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  learningObjectives: [
    "Understand the role of AI in modern nursing practice",
    "Identify key applications of AI in patient monitoring",
    "Evaluate the impact of AI on nursing workflow and patient outcomes",
    "Recognize ethical considerations in AI implementation"
  ],
  references: [
    "Smith, J. et al. (2025). AI in Healthcare: A Systematic Review. Journal of Medical Informatics.",
    "Johnson, M. (2024). The Future of Nursing: AI Integration. Healthcare Technology Review.",
    "Williams, R. (2025). Patient Monitoring with Artificial Intelligence. Critical Care Nursing."
  ]
};

// Featured Videos
const featuredVideos = [
  {
    id: 1,
    title: "AI in Nursing: A Practical Guide",
    description: "Learn how AI tools are being implemented in healthcare",
    thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
    duration: "15:23"
  },
  {
    id: 2,
    title: "Smart Monitoring Systems",
    description: "Understanding AI-powered patient monitoring",
    thumbnail: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&q=80",
    duration: "12:45"
  },
  {
    id: 3,
    title: "Future Trends in Healthcare",
    description: "What's next for nursing and AI",
    thumbnail: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80",
    duration: "18:30"
  }
];

// Related Blog Posts
const relatedPosts = [
  {
    id: 1,
    title: "The Evolution of Nursing Practice",
    excerpt: "From bedside care to technology-driven healthcare...",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80",
    date: "2026-01-10",
    readTime: 6
  },
  {
    id: 2,
    title: "Mental Health in Healthcare Workers",
    excerpt: "Supporting the well-being of our healthcare heroes...",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80",
    date: "2026-01-08",
    readTime: 7
  },
  {
    id: 3,
    title: "Telehealth: The New Normal",
    excerpt: "How virtual care is transforming patient engagement...",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80",
    date: "2026-01-05",
    readTime: 5
  }
];

const BlogPost = () => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Emily Johnson, RN",
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=50&h=50&fit=crop&crop=face",
      text: "This article perfectly captures the transformative power of AI in nursing. I've personally seen how these tools improve patient care!",
      date: "2 hours ago",
      likes: 24
    },
    {
      id: 2,
      user: "Dr. Michael Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      text: "Excellent breakdown of the challenges and opportunities. The ethical considerations are particularly crucial.",
      date: "4 hours ago",
      likes: 18
    }
  ]);
  const [activeTab, setActiveTab] = useState('content');

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        user: "Guest User",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face",
        text: commentText.trim(),
        date: "Just now",
        likes: 0
      };
      setComments([...comments, newComment]);
      setCommentText('');
    }
  };

  // Share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blogData.title,
        text: blogData.subtitle,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* ===== HERO SECTION - Billion Dollar Design ===== */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-white/80 text-sm mb-6"
            >
              <Link to="/" className="hover:text-white transition">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-white transition">Blog</Link>
              <span>/</span>
              <span className="text-white/60">{blogData.category}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                {blogData.category}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {blogData.title}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-2xl mb-8">
                {blogData.subtitle}
              </p>

              {/* Author Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-3">
                  <img
                    src={blogData.author.image}
                    alt={blogData.author.name}
                    className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{blogData.author.name}</p>
                    <p className="text-sm text-white/70">{blogData.author.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-white/60" />
                    {new Date(blogData.publishDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaClock className="text-white/60" />
                    {blogData.readTime} min read
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
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
              className="flex flex-wrap gap-2 bg-white rounded-2xl shadow-sm p-1.5 border border-gray-100"
            >
              {['content', 'videos', 'images', 'references'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'content' && <FaFileAlt />}
                  {tab === 'videos' && <FaVideo />}
                  {tab === 'images' && <FaImage />}
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
                className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100"
              >
                {/* Featured Image */}
                <div className="relative rounded-2xl overflow-hidden mb-8">
                  <img
                    src={blogData.featuredImage}
                    alt={blogData.title}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    {blogData.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div
                  className="prose prose-lg prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: blogData.content }}
                />

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                  {blogData.statistics.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 text-center border border-blue-100/50"
                    >
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Learning Objectives */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mt-8 border border-blue-100/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <FaGraduationCap className="text-blue-600" />
                    Learning Objectives
                  </h3>
                  <ul className="space-y-2">
                    {blogData.learningObjectives.map((obj, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
                  {blogData.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-700 text-sm font-medium hover:bg-blue-100 hover:text-blue-600 transition cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Featured Video */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="relative aspect-video bg-black">
                    <ReactPlayer
                      url={blogData.videoUrl}
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
                    {/* Custom controls overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
                      >
                        {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
                      </button>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
                      >
                        {isMuted ? <FaVolumeMute className="text-white" /> : <FaVolumeUp className="text-white" />}
                      </button>
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition ml-auto"
                      >
                        <FaExpand className="text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">AI in Nursing: Full Presentation</h3>
                    <p className="text-gray-600 mt-1">Watch this comprehensive overview of AI applications in modern nursing practice.</p>
                  </div>
                </div>

                {/* Video Playlist */}
                <div className="grid gap-4">
                  {featuredVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col sm:flex-row"
                    >
                      <div className="relative sm:w-48 flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-32 sm:h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <FaPlay className="text-white text-xl" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                          {video.duration}
                        </span>
                      </div>
                      <div className="p-4 flex-1">
                        <h4 className="font-semibold text-gray-900">{video.title}</h4>
                        <p className="text-sm text-gray-600">{video.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {blogData.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group rounded-2xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={image}
                      alt={`Healthcare image ${index + 1}`}
                      className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                      <span className="text-white text-sm font-medium">View Full Size</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* References Tab */}
            {activeTab === 'references' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">References & Sources</h3>
                <ul className="space-y-4">
                  {blogData.references.map((ref, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition"
                    >
                      <span className="text-blue-600 font-bold text-sm">[{index + 1}]</span>
                      <span className="text-gray-700">{ref}</span>
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
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
            >
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    liked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  {liked ? <FaHeart className="text-red-600" /> : <FaRegHeart />}
                  <span>{liked ? 'Liked' : 'Like'}</span>
                </button>

                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    bookmarked ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                >
                  {bookmarked ? <FaBookmark className="text-yellow-600" /> : <FaRegBookmark />}
                  <span>{bookmarked ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                >
                  <FaShareAlt />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    showComments ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <FaComment />
                  <span>Comments ({comments.length})</span>
                </button>
              </div>
            </motion.div>

            {/* Comments Section */}
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Comments ({comments.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts on this article..."
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-gray-700 min-h-[80px] transition"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 p-4 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={comment.avatar}
                        alt={comment.user}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{comment.user}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{comment.date}</span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="text-sm text-gray-400 hover:text-blue-600 transition flex items-center gap-1">
                            <FaThumbsUp /> {comment.likes > 0 && comment.likes}
                          </button>
                          <button className="text-sm text-gray-400 hover:text-blue-600 transition">Reply</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
            >
              <div className="text-center">
                <img
                  src={blogData.author.image}
                  alt={blogData.author.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-100"
                />
                <h4 className="text-lg font-bold text-gray-900 mt-4">{blogData.author.name}</h4>
                <p className="text-sm text-blue-600 font-medium">{blogData.author.title}</p>
                <p className="text-sm text-gray-600 mt-2">{blogData.author.bio}</p>
                <div className="flex justify-center gap-3 mt-4">
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">
                    <FaTwitter className="text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">
                    <FaLinkedin className="text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">
                    <FaEnvelope className="text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full px-4 py-3 pl-12 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
            >
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaLightbulb className="text-yellow-500" />
                Related Articles
              </h4>
              <div className="space-y-4">
                {relatedPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.id}`} className="block group">
                    <div className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                      />
                      <div>
                        <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                          {post.title}
                        </h5>
                        <p className="text-xs text-gray-500 mt-1">{post.readTime} min read</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
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

            {/* Popular Tags */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
            >
              <h4 className="text-lg font-bold text-gray-900 mb-4">Popular Tags</h4>
              <div className="flex flex-wrap gap-2">
                {['Nursing', 'AI', 'Healthcare', 'Technology', 'Patient Care', 'Innovation', 'Medical', 'Digital Health', 'Nursing Education', 'Research'].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-700 text-sm font-medium hover:bg-blue-100 hover:text-blue-600 transition cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Alveoly <span className="text-blue-400">Academy</span></h3>
              <p className="text-gray-400 text-sm">Empowering the next generation of healthcare professionals through world-class education and technology.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/programs" className="hover:text-white transition">Programs</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/support" className="hover:text-white transition">Support</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition text-xl"><FaFacebook /></a>
                <a href="#" className="text-gray-400 hover:text-white transition text-xl"><FaTwitter /></a>
                <a href="#" className="text-gray-400 hover:text-white transition text-xl"><FaLinkedin /></a>
                <a href="#" className="text-gray-400 hover:text-white transition text-xl"><FaWhatsapp /></a>
                <a href="#" className="text-gray-400 hover:text-white transition text-xl"><FaEnvelope /></a>
              </div>
              <p className="text-gray-400 text-sm mt-4">© 2026 Alveoly Academy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;