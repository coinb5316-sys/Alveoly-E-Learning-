// StudentLessons.jsx - Complete with beautiful content viewer backgrounds
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Lock,
  FileText,
  PlayCircle,
  X,
  HelpCircle,
  CheckCircle,
  Video,
  Image,
  FileQuestion,
  Clock,
  DollarSign,
  Eye,
  Sparkles,
  Award,
  TrendingUp,
  Loader2,
  Shield,
  Zap,
  BookOpen,
  GraduationCap,
  List,
  ChevronDown,
  ChevronUp,
  Hash,
  Tag,
  FolderOpen,
  AlertCircle,
  Calendar,
  User,
  ChevronRight,
  Home,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  Download,
  Share2,
  Layers,
  Palette,
  Grid3x3
} from "lucide-react";

const StudentLessons = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessonQuizzes, setLessonQuizzes] = useState({});
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [unlockedContents, setUnlockedContents] = useState([]);
  const [hoveredContent, setHoveredContent] = useState(null);
  const [subject, setSubject] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfScale, setPdfScale] = useState(1);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [showPdfControls, setShowPdfControls] = useState(true);
  const pdfContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
    lessonId: null,
  });

  // Beautiful gradient backgrounds for content viewer
  const viewerGradients = [
    "from-indigo-900 via-purple-900 to-pink-900",
    "from-blue-900 via-cyan-900 to-teal-900",
    "from-purple-900 via-pink-900 to-rose-900",
    "from-green-900 via-emerald-900 to-teal-900",
    "from-orange-900 via-amber-900 to-yellow-900",
    "from-red-900 via-rose-900 to-pink-900",
    "from-blue-950 via-indigo-950 to-purple-950",
    "from-cyan-950 via-blue-950 to-indigo-950",
    "from-emerald-950 via-green-950 to-lime-950",
    "from-fuchsia-950 via-purple-950 to-violet-950",
    "from-amber-950 via-orange-950 to-red-950",
    "from-teal-950 via-cyan-950 to-blue-950",
  ];

  // Decorative pattern overlays for viewer
  const viewerPatterns = [
    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3Ccircle cx='0' cy='0' r='3'/%3E%3Ccircle cx='40' cy='0' r='3'/%3E%3Ccircle cx='0' cy='40' r='3'/%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
  ];

  // Animated gradient backgrounds for viewer
  const animatedGradients = [
    "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    "bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900",
    "bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900",
    "bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900",
  ];

  const [viewerGradientIndex, setViewerGradientIndex] = useState(0);

  // Rotate viewer background gradient every few seconds
  useEffect(() => {
    if (viewer.open) {
      const interval = setInterval(() => {
        setViewerGradientIndex((prev) => (prev + 1) % viewerGradients.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [viewer.open]);

  const [viewerPatternIndex, setViewerPatternIndex] = useState(0);

  useEffect(() => {
    if (viewer.open) {
      const interval = setInterval(() => {
        setViewerPatternIndex((prev) => (prev + 1) % viewerPatterns.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [viewer.open]);

  // Fetch subject details
  const fetchSubjectDetails = async () => {
    try {
      const res = await axios.get(`/subjects/${subjectId}`);
      setSubject(res.data);
    } catch (err) {
      console.error("Error fetching subject:", err);
    }
  };

  // Fetch contents and check for quizzes
  const fetchContentsAndQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`/content?subjectId=${subjectId}`);
      const contentsData = res.data;
      
      const unlockedIds = [];
      for (const content of contentsData) {
        if (content.isPaid) {
          try {
            const accessRes = await axios.get(`/content-payments/check/${content._id}`);
            if (accessRes.data.hasAccess) {
              unlockedIds.push(content._id);
            }
          } catch (err) {
            console.error(`Error checking access for ${content.title}:`, err);
          }
        }
      }
      setUnlockedContents(unlockedIds);
      
      const contentsWithUnlockStatus = contentsData.map(content => ({
        ...content,
        isUnlocked: !content.isPaid || unlockedIds.includes(content._id)
      }));
      
      setContents(contentsWithUnlockStatus);
      
      const quizStatus = {};
      for (const lesson of contentsWithUnlockStatus) {
        if (lesson.type === "quiz") {
          quizStatus[lesson._id] = true;
        } else {
          try {
            const quizRes = await axios.get(`/lesson-quiz/lesson/${lesson._id}`);
            const hasQuiz = quizRes.data && quizRes.data.length > 0;
            quizStatus[lesson._id] = hasQuiz;
          } catch (err) {
            quizStatus[lesson._id] = false;
          }
        }
      }
      setLessonQuizzes(quizStatus);
      
    } catch (err) {
      console.error("Error fetching contents:", err);
      setError("Failed to load lessons. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchSubjectDetails();
      fetchContentsAndQuizzes();
    } else {
      setError("No subject selected");
      setLoading(false);
    }
  }, [subjectId]);

  const toggleTopics = () => {
    setExpandedTopics(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const filterByTopic = (topicId) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId);
    setViewMode(topicId === selectedTopic ? 'all' : 'topic');
  };

  const getFilteredContents = () => {
    if (selectedTopic && viewMode === 'topic') {
      return contents.filter(c => c.topicId === selectedTopic);
    }
    return contents;
  };

  const filteredContents = getFilteredContents();

  useEffect(() => {
    const checkRecentPayment = async () => {
      const reference = localStorage.getItem('pending_payment_reference');
      if (reference) {
        console.log("Recent payment detected, waiting for verification");
      }
    };
    
    checkRecentPayment();
  }, []);

  useEffect(() => {
    const checkPaymentCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');
      const contentId = urlParams.get('contentId');
      const sessionId = localStorage.getItem('payment_session_id');
      
      if (reference) {
        setProcessingPayment(true);
        toast.loading("Verifying payment...", { id: "payment-verification" });
        
        try {
          const verifyRes = await axios.post("/content-payments/verify", {
            reference: reference,
            contentId: contentId || sessionId,
          });
          
          if (verifyRes.data.success) {
            toast.success("Payment verified! Content unlocked.", { id: "payment-verification" });
            await fetchContentsAndQuizzes();
          } else {
            toast.error("Payment verification failed. Please contact support.", { id: "payment-verification" });
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          toast.error("Failed to verify payment. Please contact support.", { id: "payment-verification" });
        } finally {
          setProcessingPayment(false);
          window.history.replaceState({}, document.title, window.location.pathname);
          localStorage.removeItem('payment_session_id');
          localStorage.removeItem('current_subject_id');
        }
      }
    };
    
    checkPaymentCallback();
  }, []);

  // Content protection effects
  useEffect(() => {
    let blurTimeout;
    let devToolsInterval;

    const getViewer = () => document.getElementById("secure-viewer");

    const triggerBlur = (duration = 2000) => {
      const viewerEl = getViewer();
      if (!viewerEl) return;
      viewerEl.style.filter = "blur(25px)";
      viewerEl.style.transition = "0.3s";
      clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        if (viewerEl) viewerEl.style.filter = "none";
      }, duration);
    };

    const handleKeyDown = (e) => {
      if (!getViewer()) return;
      if (e.key === "PrintScreen") {
        e.preventDefault();
        triggerBlur(3000);
        toast.error("⚠️ Screenshot is blocked", { position: "top-center" });
      }
      if ((e.ctrlKey && ["s", "u", "c", "p"].includes(e.key.toLowerCase())) ||
          (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        triggerBlur(2000);
        toast.error("⚠️ Action not allowed", { position: "top-center" });
      }
    };

    const handleVisibilityChange = () => {
      if (getViewer() && document.hidden) triggerBlur(5000);
    };

    const detectDevTools = () => {
      if (!getViewer()) return;
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        triggerBlur(5000);
      }
    };

    if (viewer.open) {
      devToolsInterval = setInterval(detectDevTools, 1000);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      if (devToolsInterval) clearInterval(devToolsInterval);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (blurTimeout) clearTimeout(blurTimeout);
    };
  }, [viewer.open]);

  const handleUnlock = async (c) => {
    try {
      localStorage.setItem('current_subject_id', subjectId);
      localStorage.setItem('current_content_id', c._id);
      localStorage.setItem('current_content_title', c.title);
      
      const res = await axios.post("/content-payments/initiate", {
        contentId: c._id,
      });
      
      if (res.data.authorizationUrl) {
        if (res.data.reference) {
          localStorage.setItem('pending_payment_reference', res.data.reference);
        }
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment failed: " + (err.response?.data?.message || "Please try again"));
      localStorage.removeItem('current_subject_id');
      localStorage.removeItem('current_content_id');
      localStorage.removeItem('current_content_title');
      localStorage.removeItem('pending_payment_reference');
    }
  };

  const openViewer = async (c) => {
    if (c.isPaid && !c.isUnlocked) {
      toast.error("This content is locked. Please purchase to unlock.");
      return;
    }
    
    if (c.type === "quiz") {
      navigate(`/student/lessons/${c._id}/quiz`);
      return;
    }
    
    setPdfScale(1);
    setIsPdfLoading(true);
    setPdfError(false);
    setShowPdfControls(true);
    
    setViewer({
      open: true,
      type: c.type,
      url: c.fileUrl,
      title: c.title,
      lessonId: c._id,
    });
  };

  const closeViewer = () => {
    setIsFullscreen(false);
    setViewer({
      open: false,
      type: "",
      url: "",
      title: "",
      lessonId: null,
    });
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleTakeQuiz = () => {
    closeViewer();
    navigate(`/student/lessons/${viewer.lessonId}/quiz`);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const zoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.2, 3));
    setShowPdfControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowPdfControls(false);
    }, 3000);
  };

  const zoomOut = () => {
    setPdfScale(prev => Math.max(prev - 0.2, 0.5));
    setShowPdfControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowPdfControls(false);
    }, 3000);
  };

  const resetZoom = () => {
    setPdfScale(1);
    setShowPdfControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowPdfControls(false);
    }, 3000);
  };

  const toggleControls = () => {
    setShowPdfControls(prev => !prev);
    if (showPdfControls) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowPdfControls(false);
      }, 3000);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "video": return <Video className="h-5 w-5" />;
      case "pdf": return <FileText className="h-5 w-5" />;
      case "image": return <Image className="h-5 w-5" />;
      case "quiz": return <FileQuestion className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "video": return "from-blue-500 to-cyan-600";
      case "pdf": return "from-red-500 to-rose-600";
      case "image": return "from-green-500 to-emerald-600";
      case "quiz": return "from-purple-500 to-indigo-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const unlockedCount = contents.filter(c => c.isUnlocked).length;
  const lockedCount = contents.filter(c => c.isPaid && !c.isUnlocked).length;
  const freeCount = contents.filter(c => !c.isPaid).length;
  const topics = subject?.topics || [];
  const totalTopics = topics.length;

  const handlePdfLoad = () => {
    setIsPdfLoading(false);
    setPdfError(false);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowPdfControls(false);
    }, 3000);
  };

  const handlePdfError = () => {
    setIsPdfLoading(false);
    setPdfError(true);
  };

  if (loading || processingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-44 bg-gray-200 dark:bg-gray-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <button 
              onClick={() => navigate('/student/subjects')} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm"
            >
              <Home className="h-3.5 w-3.5" />
              Subjects
            </button>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px] bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
              {subject?.name || "Lessons"}
            </span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                {subject?.name || "Learning Materials"}
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>Access videos, documents, and quizzes for this subject</span>
                {totalTopics > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                      <List className="h-3 w-3" />
                      {totalTopics} {totalTopics === 1 ? 'topic' : 'topics'}
                    </span>
                  </>
                )}
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <GraduationCap className="h-3 w-3" />
                  {contents.length} items
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {unlockedCount}/{contents.length} Unlocked
                </span>
              </div>
              {selectedTopic && (
                <button
                  onClick={() => filterByTopic(selectedTopic)}
                  className="px-3 py-2 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-950/70 transition-all flex items-center gap-1 shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Stats Summary - Enhanced Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {contents.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unlocked</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {unlockedCount}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Locked</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {lockedCount}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Free Access</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {freeCount}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Topics Section - Enhanced Design */}
          {totalTopics > 0 && (
            <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden shadow-sm mb-8">
              <button
                onClick={toggleTopics}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Topics in this Subject
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {totalTopics} {totalTopics === 1 ? 'topic' : 'topics'} • Click to explore
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <span className="text-sm">{expandedTopics[subjectId] ? 'Hide' : 'Show'}</span>
                  {expandedTopics[subjectId] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>
              
              {expandedTopics[subjectId] && (
                <div className="px-6 pb-6 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {topics.map((topic) => {
                      const topicContentCount = contents.filter(c => c.topicId === topic._id).length;
                      const isActive = selectedTopic === topic._id;
                      
                      return (
                        <div 
                          key={topic._id} 
                          onClick={() => filterByTopic(topic._id)}
                          className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 border-2 border-purple-400 dark:border-purple-600 shadow-lg shadow-purple-500/10'
                              : 'bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-purple-600 shadow-lg shadow-purple-500/50' : 'bg-purple-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold break-words ${
                              isActive ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {topic.name}
                            </p>
                            {topic.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 break-words mt-0.5">
                                {topic.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                isActive 
                                  ? 'bg-purple-200 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {topicContentCount} item{topicContentCount !== 1 ? 's' : ''}
                              </span>
                              {isActive && (
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Active Filter
                                </span>
                              )}
                            </div>
                          </div>
                          {isActive && (
                            <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Grid */}
          {filteredContents.length === 0 ? (
            <div className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-16 text-center">
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedTopic ? 'No Content in this Topic' : 'No Lessons Available'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  {selectedTopic 
                    ? `There are no learning materials in "${topics.find(t => t._id === selectedTopic)?.name || 'this topic'}" yet.`
                    : 'Check back later for new content!'}
                </p>
                {selectedTopic && (
                  <button
                    onClick={() => filterByTopic(selectedTopic)}
                    className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredContents.map((content) => {
                const isHovered = hoveredContent === content._id;
                const hasQuiz = lessonQuizzes[content._id];
                const isUnlocked = content.isUnlocked;
                const isPaid = content.isPaid;
                const topicName = topics.find(t => t._id === content.topicId)?.name;
                
                return (
                  <div
                    key={content._id}
                    onMouseEnter={() => setHoveredContent(content._id)}
                    onMouseLeave={() => setHoveredContent(null)}
                    onClick={() => openViewer(content)}
                    className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-sm ${
                      isUnlocked
                        ? "border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 hover:shadow-2xl hover:-translate-y-2"
                        : "border-gray-200/50 dark:border-gray-700/50 bg-gray-50/60 dark:bg-gray-800/60"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className={`relative h-48 w-full bg-gradient-to-br ${getTypeColor(content.type)}`}>
                      {content.type === "quiz" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <HelpCircle className="text-white/80 text-6xl mb-3" />
                          <span className="text-white font-semibold text-sm">Interactive Quiz</span>
                        </div>
                      ) : (
                        <>
                          <img
                            src={content.thumbnailUrl || "/api/placeholder/400/200"}
                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                            alt={content.title}
                            onError={(e) => { e.target.src = "/api/placeholder/400/200"; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-14 w-14 text-white drop-shadow-2xl" />
                          </div>
                        </>
                      )}

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-xl text-white text-xs font-medium flex items-center gap-1.5">
                        {getTypeIcon(content.type)}
                        <span className="capitalize">{content.type}</span>
                      </div>

                      {/* Quiz Badge */}
                      {hasQuiz && content.type !== "quiz" && (
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-green-500/25">
                          <FileQuestion className="h-3 w-3" />
                          Quiz
                        </div>
                      )}

                      {/* Topic Badge */}
                      {topicName && (
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-purple-600/80 backdrop-blur-sm rounded-xl text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-purple-500/25">
                          <Hash className="h-3 w-3" />
                          {topicName}
                        </div>
                      )}

                      {/* Price Badge */}
                      {isPaid && (
                        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-yellow-500/25">
                          <DollarSign className="h-3 w-3" />
                          ₵{content.price}
                        </div>
                      )}

                      {/* Lock Overlay */}
                      {isPaid && !isUnlocked && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                          <Lock className="h-12 w-12 text-white mb-3 drop-shadow-2xl" />
                          <p className="text-white text-sm font-semibold mb-1">Premium Content</p>
                          <p className="text-white/80 text-xs mb-4">₵{content.price} to unlock</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlock(content);
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xl shadow-purple-500/25 hover:shadow-2xl"
                          >
                            Unlock Now
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content Info */}
                    <div className="p-5">
                      <h3 className={`font-semibold text-base line-clamp-2 mb-2 transition-colors ${
                        isUnlocked 
                          ? "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {content.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <User className="h-3.5 w-3.5" />
                        <span>By: {content.lecturerName || "Admin"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Self-paced</span>
                        {hasQuiz && content.type !== "quiz" && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">Includes assessment</span>
                          </>
                        )}
                        {isUnlocked && isPaid && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">Unlocked</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Secure Viewer Modal - Enhanced with Beautiful Animated Gradient Background */}
      {viewer.open && (
        <div 
          id="secure-viewer" 
          className="fixed inset-0 z-50 flex flex-col"
          onContextMenu={(e) => e.preventDefault()}
          onClick={viewer.type === "pdf" ? toggleControls : undefined}
        >
          {/* Animated Gradient Background */}
          <div className={`absolute inset-0 ${viewerGradients[viewerGradientIndex]} transition-all duration-1000 ease-in-out`}>
            {/* Pattern Overlay */}
            <div 
              className="absolute inset-0 opacity-30 transition-all duration-1000"
              style={{ backgroundImage: viewerPatterns[viewerPatternIndex] }}
            ></div>
            
            {/* Animated Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
              
              {/* Floating Particles */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float"></div>
                <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-white/15 rounded-full animate-float-delay"></div>
                <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/25 rounded-full animate-float-delay-2"></div>
                <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-white/10 rounded-full animate-float-delay-3"></div>
              </div>
            </div>
          </div>

          {/* Top Header - Always visible */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 p-3 text-white bg-black/50 backdrop-blur-lg flex-shrink-0 border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                {viewer.type === "video" ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </div>
              <h3 className="font-semibold text-sm sm:text-base truncate text-white drop-shadow-lg">
                {viewer.title}
              </h3>
            </div>
            
            <div className="flex gap-1 flex-shrink-0">
              {lessonQuizzes[viewer.lessonId] && viewer.type !== "quiz" && (
                <button
                  onClick={handleTakeQuiz}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-lg shadow-green-500/25"
                >
                  <FileQuestion className="h-4 w-4" />
                  <span className="hidden sm:inline">Take Quiz</span>
                </button>
              )}
              <button 
                onClick={closeViewer} 
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0 overflow-hidden">
            {/* Loading State */}
            {isPdfLoading && viewer.type === "pdf" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse"></div>
                    <Loader2 className="h-12 w-12 text-blue-400 animate-spin relative z-10" />
                  </div>
                  <p className="text-white/80 text-sm font-medium drop-shadow-lg">Loading document...</p>
                </div>
              </div>
            )}

            {/* PDF Error State */}
            {pdfError && viewer.type === "pdf" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full animate-pulse"></div>
                    <AlertCircle className="h-16 w-16 text-red-400 relative z-10" />
                  </div>
                  <h3 className="text-white font-semibold text-lg drop-shadow-lg">Unable to Load PDF</h3>
                  <p className="text-white/70 text-sm drop-shadow">
                    The document couldn't be loaded. Please try again or contact support.
                  </p>
                  <button
                    onClick={() => {
                      setIsPdfLoading(true);
                      setPdfError(false);
                      const iframe = document.querySelector('#pdf-viewer');
                      if (iframe) {
                        iframe.src = iframe.src;
                      }
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-xl shadow-purple-500/25"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {viewer.type === "video" && (
              <video
                src={viewer.url}
                controls
                controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                disablePictureInPicture
                autoPlay
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border-2 border-white/10 backdrop-blur-sm"
              />
            )}

            {viewer.type === "image" && (
              <img
                src={viewer.url}
                alt={viewer.title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-w-full max-h-full rounded-2xl select-none shadow-2xl object-contain border-2 border-white/10 backdrop-blur-sm"
              />
            )}

            {viewer.type === "pdf" && (
              <div 
                ref={pdfContainerRef}
                className="w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${pdfScale})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <iframe
                  id="pdf-viewer"
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(viewer.url)}&embedded=true`}
                  title={viewer.title}
                  className="w-full h-full min-h-[400px] sm:min-h-[500px] rounded-2xl shadow-2xl bg-white border-2 border-white/10 backdrop-blur-sm"
                  onContextMenu={(e) => e.preventDefault()}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onLoad={handlePdfLoad}
                  onError={handlePdfError}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '500px',
                    border: 'none',
                    touchAction: 'pinch-zoom'
                  }}
                />
              </div>
            )}
          </div>

          {/* FLOATING PDF CONTROLS - Always visible and on top */}
          {viewer.type === "pdf" && (
            <div 
              className={`relative z-30 transition-all duration-300 ${
                showPdfControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-lg rounded-full px-4 py-2.5 border border-white/20 shadow-2xl mx-auto mb-4 w-fit">
                <button
                  onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                
                <span className="text-white text-sm font-mono min-w-[50px] text-center font-medium">
                  {Math.round(pdfScale * 100)}%
                </span>
                
                <button
                  onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                
                <div className="w-px h-6 bg-white/20" />
                
                <button
                  onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  title="Reset Zoom"
                >
                  <Move className="h-5 w-5" />
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Mobile Instructions - With controls visibility indicator */}
          {viewer.type === "pdf" && (
            <div className={`relative z-10 flex-shrink-0 p-2 text-center text-white/60 text-xs border-t border-white/10 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
              showPdfControls ? 'opacity-100' : 'opacity-0'
            }`}>
              <span className="flex items-center justify-center gap-2 drop-shadow-lg">
                <ZoomIn className="h-3 w-3" />
                Tap screen to show/hide controls • Pinch to zoom
                <ZoomOut className="h-3 w-3" />
              </span>
            </div>
          )}

          {/* Watermark - Now with gradient text */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 rotate-[-30deg]">
                {[...Array(9)].map((_, i) => (
                  <p key={i} className="text-white/10 text-base sm:text-lg font-bold whitespace-nowrap drop-shadow-2xl" style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                    PROTECTED • ALVEOLY
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentLessons;