// StudentLessons.jsx - Professional styling with dark mode
import { useEffect, useState } from "react";
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
  GraduationCap
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

  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
    lessonId: null,
  });

  // Fetch contents and check for quizzes
  const fetchContentsAndQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`/content?subjectId=${subjectId}`);
      const contentsData = res.data;
      
      // Check which contents are unlocked
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
      
      // Add unlocked status to content objects
      const contentsWithUnlockStatus = contentsData.map(content => ({
        ...content,
        isUnlocked: !content.isPaid || unlockedIds.includes(content._id)
      }));
      
      setContents(contentsWithUnlockStatus);
      
      // Check which lessons have quizzes
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
      fetchContentsAndQuizzes();
    } else {
      setError("No subject selected");
      setLoading(false);
    }
  }, [subjectId]);

  // Add this useEffect to check for recent payment on mount
useEffect(() => {
  // Check if there was a recent payment
  const checkRecentPayment = async () => {
    const reference = localStorage.getItem('pending_payment_reference');
    if (reference) {
      // Don't auto-verify here, let the success page handle it
      console.log("Recent payment detected, waiting for verification");
    }
  };
  
  checkRecentPayment();
}, []);

// Also add a refresh function that can be called after payment
const refreshContent = async () => {
  await fetchContentsAndQuizzes();
};

  // Check for payment callback on page load
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
    // Store the subjectId and contentId before redirect
    localStorage.setItem('current_subject_id', subjectId);
    localStorage.setItem('current_content_id', c._id);
    localStorage.setItem('current_content_title', c.title);
    
    const res = await axios.post("/content-payments/initiate", {
      contentId: c._id,
    });
    
    if (res.data.authorizationUrl) {
      // Store the reference for later verification
      if (res.data.reference) {
        localStorage.setItem('pending_payment_reference', res.data.reference);
      }
      // Redirect to Paystack
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
    
    setViewer({
      open: true,
      type: c.type,
      url: c.fileUrl,
      title: c.title,
      lessonId: c._id,
    });
  };

  const closeViewer = () => {
    setViewer({
      open: false,
      type: "",
      url: "",
      title: "",
      lessonId: null,
    });
  };

  const handleTakeQuiz = () => {
    closeViewer();
    navigate(`/student/lessons/${viewer.lessonId}/quiz`);
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

  if (loading || processingPayment) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
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
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Error</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <BookOpen className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No Lessons Available</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later for new content!</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Learning Materials
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Access videos, documents, and quizzes for this subject
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {contents.length} Items
              </span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {contents.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unlocked</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
                  {unlockedCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Locked</p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
                  {lockedCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Free Access</p>
                <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
                  {freeCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((content) => {
            const isHovered = hoveredContent === content._id;
            const hasQuiz = lessonQuizzes[content._id];
            const isUnlocked = content.isUnlocked;
            const isPaid = content.isPaid;
            
            return (
              <div
                key={content._id}
                onMouseEnter={() => setHoveredContent(content._id)}
                onMouseLeave={() => setHoveredContent(null)}
                onClick={() => openViewer(content)}
                className={`group cursor-pointer rounded-xl border transition-all duration-300 overflow-hidden ${
                  isUnlocked
                    ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:-translate-y-1"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
                }`}
              >
                {/* Thumbnail */}
                <div className={`relative h-44 w-full bg-gradient-to-br ${getTypeColor(content.type)}`}>
                  {content.type === "quiz" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <HelpCircle className="text-white/80 text-5xl mb-2" />
                      <span className="text-white font-medium text-sm">Interactive Quiz</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={content.thumbnailUrl || "/api/placeholder/400/200"}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        alt={content.title}
                        onError={(e) => { e.target.src = "/api/placeholder/400/200"; }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-12 w-12 text-white" />
                      </div>
                    </>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 rounded-lg text-white text-xs flex items-center gap-1">
                    {getTypeIcon(content.type)}
                    <span className="capitalize">{content.type}</span>
                  </div>

                  {/* Quiz Badge */}
                  {hasQuiz && content.type !== "quiz" && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                      <FileQuestion className="h-3 w-3" />
                      Quiz Available
                    </div>
                  )}

                  {/* Price Badge */}
                  {isPaid && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-yellow-500 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ₵{content.price}
                    </div>
                  )}

                  {/* Lock Overlay */}
                  {isPaid && !isUnlocked && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                      <Lock className="h-10 w-10 text-white mb-2" />
                      <p className="text-white text-sm font-medium mb-1">Premium Content</p>
                      <p className="text-white/80 text-xs mb-3">₵{content.price} to unlock</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlock(content);
                        }}
                        className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg"
                      >
                        Unlock Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <h3 className={`font-semibold text-base line-clamp-2 mb-2 transition-colors ${
                    isUnlocked 
                      ? "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {content.title}
                  </h3>

                  {/* Add this after the h3 title in the content card */}
<div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
  <GraduationCap className="h-3 w-3" />
  <span>By: {content.lecturerName || "Admin"}</span>
</div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>Self-paced</span>
                    {hasQuiz && content.type !== "quiz" && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400">Includes assessment</span>
                      </>
                    )}
                    {isUnlocked && isPaid && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400">Unlocked</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secure Viewer Modal */}
      {viewer.open && (
        <div 
          id="secure-viewer" 
          className="fixed inset-0 bg-black/98 z-50 flex flex-col"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex justify-between items-center p-4 text-white bg-black/50 flex-shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {viewer.type === "video" ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </div>
              <h3 className="font-semibold text-lg truncate max-w-md">
                {viewer.title}
              </h3>
            </div>
            <div className="flex gap-3">
              {lessonQuizzes[viewer.lessonId] && viewer.type !== "quiz" && (
                <button
                  onClick={handleTakeQuiz}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-500/25"
                >
                  <FileQuestion className="h-4 w-4" />
                  Take Quiz
                </button>
              )}
              <button 
                onClick={closeViewer} 
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            {viewer.type === "video" && (
              <video
                src={viewer.url}
                controls
                controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                disablePictureInPicture
                autoPlay
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
              />
            )}

            {viewer.type === "image" && (
              <img
                src={viewer.url}
                alt={viewer.title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-w-full max-h-full rounded-lg select-none shadow-2xl object-contain"
              />
            )}

            {viewer.type === "pdf" && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(viewer.url)}&embedded=true`}
                title={viewer.title}
                className="w-full h-full rounded-lg shadow-2xl"
                onContextMenu={(e) => e.preventDefault()}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            )}
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="grid grid-cols-3 gap-8 rotate-[-30deg] opacity-5">
                {[...Array(9)].map((_, i) => (
                  <p key={i} className="text-white text-lg font-bold whitespace-nowrap">
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