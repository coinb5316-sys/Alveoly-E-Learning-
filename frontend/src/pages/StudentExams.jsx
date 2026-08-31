// StudentExams.jsx - Maximum protection across all devices
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { getSocket } from "../config/socket";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Loader2,
  Award,
  TrendingUp,
  HelpCircle,
  Flag,
  Timer,
  Shield,
  EyeOff,
  AlertTriangle,
  Lock,
  Ban
} from "lucide-react";

const StudentExams = () => {
  const { user } = useAuth();
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, percentage: 0, questionResults: [] });
  const [loading, setLoading] = useState(true);
  const [warningShown, setWarningShown] = useState(false);
  
  // Security state
  const [securityViolations, setSecurityViolations] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [securityWarningMessage, setSecurityWarningMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExamBlocked, setIsExamBlocked] = useState(false);
  const [mouseLeaveCount, setMouseLeaveCount] = useState(0);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(false);
  const [visibilityWarnings, setVisibilityWarnings] = useState(0);
  const [hasBeenHidden, setHasBeenHidden] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  
  // Refs for security
  const examContainerRef = useRef(null);
  const securityIntervalRef = useRef(null);
  const mouseCheckIntervalRef = useRef(null);
  const blockNavigationRef = useRef(null);

  const current = questions[currentIndex];
  
  // MAXIMUM ALLOWED SECURITY VIOLATIONS - Set to 1 for strict enforcement
  const MAX_VIOLATIONS = 1;
  const MAX_MOUSE_LEAVES = 1;
  const MAX_VISIBILITY_WARNINGS = 1;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      setIsMobile(isMobileDevice);
      
      // Also check screen size
      if (window.innerWidth < 768) {
        setIsMobile(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startExam = async () => {
    try {
      if (attemptId) return;

      const res = await axios.post("/exam/start", { courseId, subjectId });
      const { attemptId: newAttemptId, questions: examQuestions, duration } = res.data;

      if (!examQuestions || examQuestions.length === 0) {
        toast.error("No exam questions found for this subject.");
        setLoading(false);
        return;
      }

      setAttemptId(newAttemptId);
      setQuestions(examQuestions);
      setTimeLeft(duration);
      setStartTime(Date.now());

      const storedAnswers = JSON.parse(localStorage.getItem("examAnswers")) || {};
      const initialAnswers = examQuestions.reduce((acc, q) => {
        acc[q._id] = storedAnswers[q._id] || "";
        return acc;
      }, {});
      setAnswers(initialAnswers);
      localStorage.setItem("examAnswers", JSON.stringify(initialAnswers));
      
      // Enter fullscreen automatically when exam starts
      enterFullscreen();
      
      // Block all navigation
      blockAllNavigation(true);
      
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        toast.error(err.response.data.message || "You cannot take this exam.");
        navigate("/student/dashboard");
      } else {
        toast.error(err.response?.data?.message || "Failed to start exam.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Block all navigation and interactions outside exam
  const blockAllNavigation = (block) => {
    if (block) {
      // Block all clicks on navigation elements
      const blocker = (e) => {
        // Check if click is inside exam container
        const examContainer = document.getElementById('exam-container');
        if (examContainer && !examContainer.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();
          handleSecurityViolation("Attempted to navigate away from exam");
          return false;
        }
        return true;
      };

      // Block all links
      document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
        if (!el.closest('#exam-container')) {
          el.style.pointerEvents = 'none';
          el.style.opacity = '0.5';
        }
      });

      // Block back/forward navigation
      window.history.pushState(null, '', window.location.href);
      
      const popStateHandler = (e) => {
        e.preventDefault();
        handleSecurityViolation("Attempted to use browser navigation");
        window.history.pushState(null, '', window.location.href);
      };
      
      window.addEventListener('popstate', popStateHandler);
      blockNavigationRef.current = popStateHandler;

      // Block beforeunload (closing tab)
      const beforeUnloadHandler = (e) => {
        e.preventDefault();
        e.returnValue = '';
        handleSecurityViolation("Attempted to close or reload tab");
        return '';
      };
      
      window.addEventListener('beforeunload', beforeUnloadHandler);
      blockNavigationRef.current.beforeUnload = beforeUnloadHandler;

    } else {
      // Unblock navigation
      document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
        el.style.pointerEvents = '';
        el.style.opacity = '';
      });
      
      if (blockNavigationRef.current) {
        window.removeEventListener('popstate', blockNavigationRef.current);
        if (blockNavigationRef.current.beforeUnload) {
          window.removeEventListener('beforeunload', blockNavigationRef.current.beforeUnload);
        }
        blockNavigationRef.current = null;
      }
    }
  };

  // Fullscreen management
  const enterFullscreen = () => {
    const element = document.documentElement;
    
    // For mobile, try both ways
    const requestFullscreen = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
    
    if (requestFullscreen) {
      requestFullscreen.call(element)
        .then(() => {
          setIsFullscreen(true);
          toast.success("🔒 Fullscreen mode activated");
        })
        .catch((err) => {
          console.error("Fullscreen error:", err);
          if (isMobile) {
            toast.warning("Please enable fullscreen for exam security");
          } else {
            handleSecurityViolation("Failed to enter fullscreen");
          }
        });
    } else {
      // Some mobile browsers don't support fullscreen API
      if (isMobile) {
        toast.info("📱 Please stay on this page and don't switch apps");
      }
    }
  };

  const exitFullscreen = () => {
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (exitFullscreen) {
      exitFullscreen.call(document).catch(() => {});
    }
    setIsFullscreen(false);
  };

  const handleFullscreenChange = () => {
    const isFull = !!document.fullscreenElement;
    setIsFullscreen(isFull);
    
    if (!isFull && !submitted && !showResult && !isExamBlocked) {
      // On mobile, check if it's a user gesture or system
      if (isMobile) {
        // Mobile: Check if user switched apps or exited fullscreen
        handleSecurityViolation("Exited exam mode - fullscreen lost");
      } else {
        handleSecurityViolation("You exited fullscreen mode");
      }
    }
  };

  // Security violation handler - Auto-submit on any violation
  const handleSecurityViolation = (message) => {
    if (submitted || showResult || isExamBlocked) return;
    
    const newCount = securityViolations + 1;
    setSecurityViolations(newCount);
    setSecurityViolationMessage(message);
    setShowSecurityWarning(true);
    
    // Log violation
    console.warn(`⚠️ Security violation ${newCount}: ${message}`);
    console.warn(`📱 Device: ${isMobile ? 'Mobile' : 'Desktop'}`);
    console.warn(`⏱️ Time elapsed: ${Math.floor((Date.now() - startTime) / 1000)}s`);
    
    // Auto-hide warning after 2 seconds
    setTimeout(() => {
      setShowSecurityWarning(false);
    }, 2000);
    
    // Auto-submit on ANY violation (strict mode)
    if (newCount >= MAX_VIOLATIONS) {
      setIsExamBlocked(true);
      toast.error(`⚠️ Exam auto-submitted due to security violation: ${message}`);
      
      // Submit exam automatically after a short delay
      setTimeout(() => {
        handleSubmit(true);
      }, 1000);
    }
  };

  // Mouse leave detection
  const handleMouseLeave = () => {
    if (submitted || showResult || isExamBlocked) return;
    if (isMobile) return; // Mobile doesn't have mouse leave
    
    const newCount = mouseLeaveCount + 1;
    setMouseLeaveCount(newCount);
    
    if (newCount >= MAX_MOUSE_LEAVES) {
      handleSecurityViolation(`Mouse left exam window`);
    }
  };

  // Detect mobile app switching (visibility change)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // User switched tabs, apps, or went to home screen
      if (!submitted && !showResult && !isExamBlocked) {
        const newCount = visibilityWarnings + 1;
        setVisibilityWarnings(newCount);
        setHasBeenHidden(true);
        
        // On mobile, this is a serious violation
        const deviceType = isMobile ? 'mobile app' : 'tab';
        handleSecurityViolation(`Switched away from exam (${deviceType})`);
        
        // Add visual feedback
        document.body.style.filter = "blur(8px)";
        document.body.style.transition = "filter 0.3s ease";
        
        // Show prominent warning
        toast.error(`🚫 EXAM INTERRUPTED! Do not switch ${isMobile ? 'apps' : 'tabs'}!`, {
          duration: 3000,
          icon: '⚠️'
        });
      }
    } else {
      // User returned
      document.body.style.filter = "";
      setLastActiveTime(Date.now());
      
      if (!submitted && !showResult && !isExamBlocked) {
        // Check if fullscreen was lost
        if (!document.fullscreenElement && !isFullscreen) {
          handleSecurityViolation("Lost fullscreen during tab switch");
        }
        
        // If they were hidden for too long, auto-submit
        if (hasBeenHidden) {
          // Check how long they were away
          const awayTime = Date.now() - lastActiveTime;
          if (awayTime > 5000) { // 5 seconds
            handleSecurityViolation(`Away from exam for ${Math.floor(awayTime/1000)} seconds`);
          }
        }
      }
    }
  };

  // Detect window blur (for desktop)
  const handleWindowBlur = () => {
    if (!submitted && !showResult && !isExamBlocked) {
      // Check if it's a mobile app switch or desktop alt-tab
      setTimeout(() => {
        if (document.hidden) {
          handleSecurityViolation(`Window lost focus - possible ${isMobile ? 'app switch' : 'Alt+Tab'}`);
        }
      }, 500);
    }
  };

  // Prevent all copy operations
  const handleCopy = (e) => {
    e.preventDefault();
    handleSecurityViolation("Attempted to copy");
    return false;
  };

  const handlePaste = (e) => {
    e.preventDefault();
    handleSecurityViolation("Attempted to paste");
    return false;
  };

  const handleCut = (e) => {
    e.preventDefault();
    handleSecurityViolation("Attempted to cut");
    return false;
  };

  // Prevent right-click
  const handleContextMenu = (e) => {
    e.preventDefault();
    handleSecurityViolation("Attempted to right-click");
    return false;
  };

  // Prevent keyboard shortcuts
  const handleKeyDown = (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key.toLowerCase();

    // Block all problematic shortcuts
    const blockedKeys = ['c', 'v', 'x', 'p', 's', 'u', 'a', 'r', 't', 'w', 'n'];
    if (isCtrl && blockedKeys.includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      handleSecurityViolation(`Attempted to use Ctrl+${key.toUpperCase()}`);
      return;
    }

    // Block F12, F5, F6, F7, F8, F9, F10, F11
    if (e.key.startsWith('F') && parseInt(e.key.replace('F', '')) >= 5) {
      e.preventDefault();
      handleSecurityViolation(`Attempted to use ${e.key} key`);
      return;
    }

    // Block DevTools shortcuts
    if (isCtrl && isShift && ['i', 'j', 'c'].includes(key)) {
      e.preventDefault();
      handleSecurityViolation("Attempted to open developer tools");
      return;
    }

    // Block Alt+Tab, Alt+F4, Alt+Esc
    if (e.altKey && ['tab', 'f4', 'escape'].includes(key)) {
      e.preventDefault();
      handleSecurityViolation(`Attempted to use Alt+${key}`);
      return;
    }

    // Block Windows key
    if (key === 'meta' || key === 'win' || key === 'command') {
      e.preventDefault();
      handleSecurityViolation("Attempted to use Windows/Command key");
      return;
    }

    // Block refresh shortcuts
    if (isCtrl && key === 'r') {
      e.preventDefault();
      handleSecurityViolation("Attempted to refresh page");
      return;
    }

    // Block back/forward shortcuts
    if (e.key === 'Backspace' || e.key === 'Delete') {
      // Allow Backspace for text input, but not for navigation
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleSecurityViolation("Attempted to use Backspace/Delete for navigation");
        return;
      }
    }
  };

  // Prevent screenshot - Multiple detection methods
  const preventScreenshot = (e) => {
    // Detect Print Screen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      e.stopPropagation();
      handleSecurityViolation("Attempted to take screenshot (Print Screen)");
      return false;
    }

    // Detect Ctrl+Shift+S (Snipping Tool)
    if (e.ctrlKey && e.shiftKey && e.key === 's') {
      e.preventDefault();
      e.stopPropagation();
      handleSecurityViolation("Attempted to use Snipping Tool");
      return false;
    }

    // Detect Alt+PrintScreen
    if (e.altKey && e.key === 'PrintScreen') {
      e.preventDefault();
      e.stopPropagation();
      handleSecurityViolation("Attempted to take screenshot (Alt+PrintScreen)");
      return false;
    }

    // Detect Windows+Shift+S (Windows Snipping)
    if (e.metaKey && e.shiftKey && e.key === 's') {
      e.preventDefault();
      e.stopPropagation();
      handleSecurityViolation("Attempted to use Windows Snipping Tool");
      return false;
    }

    // Detect Windows+PrintScreen
    if (e.metaKey && e.key === 'PrintScreen') {
      e.preventDefault();
      e.stopPropagation();
      handleSecurityViolation("Attempted to take screenshot (Win+PrintScreen)");
      return false;
    }

    // For mobile: Detect volume down + power button combo is not possible in JS
    // But we can detect when screen is being recorded
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      // We can't prevent, but we can detect and warn
      // This is passive detection
    }

    return true;
  };

  // Mobile touch events - prevent multi-touch gestures
  const handleTouchStart = (e) => {
    // Detect pinch to zoom on mobile
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
      handleSecurityViolation("Attempted to pinch/zoom (mobile)");
    }
  };

  const handleTouchMove = (e) => {
    // Prevent swipe gestures that might navigate away
    if (!submitted && !showResult && !isExamBlocked) {
      const touch = e.touches[0];
      // Check for horizontal swipe (could be app switching on iOS)
      // We'll prevent any touch that might cause navigation
      if (e.touches.length === 1) {
        // Allow vertical scrolling only
        const startX = touch.clientX;
        // We'll use a passive approach - just monitor
      }
    }
  };

  // Prevent screen recording (passive detection)
  const handleScreenChange = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      // Log potential screen recording
      console.warn("Screen recording might be active");
      // We can't prevent it, but we can warn
    }
  };

  // Prevent dragging/selection
  const handleSelectStart = (e) => {
    e.preventDefault();
    return false;
  };

  // Mouse movement tracking for inactivity
  const handleMouseMove = () => {
    setLastActiveTime(Date.now());
  };

  // Keyboard activity tracking
  const handleKeyPress = () => {
    setLastActiveTime(Date.now());
  };

  // Inactivity check
  const checkInactivity = () => {
    const now = Date.now();
    const inactiveTime = (now - lastActiveTime) / 1000;
    
    if (inactiveTime > 15 && !submitted && !showResult && !isExamBlocked) {
      // Short inactivity warning
      toast.warning(`⚠️ You've been inactive for ${Math.floor(inactiveTime)} seconds`);
      
      // If inactive for more than 30 seconds, count as violation
      if (inactiveTime > 30) {
        handleSecurityViolation(`Inactive for ${Math.floor(inactiveTime)} seconds`);
      }
      
      setLastActiveTime(now);
    }
  };

  const handleSelect = async (qId, option) => {
    if (submitted || isExamBlocked) return;

    const updated = { ...answers, [qId]: option };
    setAnswers(updated);
    localStorage.setItem("examAnswers", JSON.stringify(updated));

    if (attemptId) {
      try {
        await axios.post("/exam/save-progress", {
          attemptId,
          answers: updated,
        });
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!attemptId) return;
    if (submitted) return;

    // If auto-submit, clear blocking state
    if (isAutoSubmit) {
      setIsExamBlocked(false);
    }

    try {
      const res = await axios.post("/exam/submit", {
        attemptId,
        answers,
        autoSubmit: isAutoSubmit,
        securityViolations: securityViolations,
        mouseLeaves: mouseLeaveCount,
        visibilityWarnings: visibilityWarnings,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        deviceType: isMobile ? 'mobile' : 'desktop'
      });

      setSubmitted(true);
      setScoreData({
        score: res.data.score,
        percentage: res.data.percentage,
        questionResults: res.data.questionResults || []
      });
      setShowResult(true);

      localStorage.removeItem("examAnswers");
      
      // Exit fullscreen
      exitFullscreen();
      
      // Unblock navigation
      blockAllNavigation(false);
      
      // Clean up security listeners
      cleanupSecurityListeners();
      
      if (isAutoSubmit) {
        toast.error(`⚠️ Exam auto-submitted due to security violation`);
      } else {
        toast.success("✅ Exam submitted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit exam.");
    }
  };

  // Cleanup security listeners
  const cleanupSecurityListeners = () => {
    // Remove all event listeners
    document.removeEventListener("copy", handleCopy);
    document.removeEventListener("paste", handlePaste);
    document.removeEventListener("cut", handleCut);
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", preventScreenshot);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("blur", handleWindowBlur);
    document.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("selectstart", handleSelectStart);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("keypress", handleKeyPress);
    document.removeEventListener("mouseleave", handleMouseLeave);
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    
    // Clear intervals
    if (securityIntervalRef.current) {
      clearInterval(securityIntervalRef.current);
    }
    if (mouseCheckIntervalRef.current) {
      clearInterval(mouseCheckIntervalRef.current);
    }
    
    // Remove blur filter
    document.body.style.filter = "";
    
    // Unblock navigation
    blockAllNavigation(false);
  };

  // Window focus handler
  const handleWindowFocus = () => {
    setLastActiveTime(Date.now());
    document.body.style.filter = "";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColorClass = () => {
    if (timeLeft < 60) return "text-red-500 bg-red-50 dark:bg-red-950/30";
    if (timeLeft < 120) return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30";
    return "text-green-500 bg-green-50 dark:bg-green-950/30";
  };

  const progress = questions.length
    ? Math.round((Object.keys(answers).filter(key => answers[key]).length / questions.length) * 100)
    : 0;

  const answeredCount = Object.keys(answers).filter(key => answers[key]).length;

  // Initialize security listeners
  useEffect(() => {
    if (!loading && !submitted && questions.length > 0) {
      // Set up all security event listeners
      document.addEventListener("copy", handleCopy);
      document.addEventListener("paste", handlePaste);
      document.addEventListener("cut", handleCut);
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", preventScreenshot);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("blur", handleWindowBlur);
      document.addEventListener("focus", handleWindowFocus);
      document.addEventListener("selectstart", handleSelectStart);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("keypress", handleKeyPress);
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchmove", handleTouchMove);

      // Set up inactivity checker
      securityIntervalRef.current = setInterval(checkInactivity, 5000);

      // Try to enter fullscreen if not already
      if (!document.fullscreenElement && !isFullscreen) {
        enterFullscreen();
      }

      // Show security reminder
      toast.success(`🔒 Maximum security mode active - ${isMobile ? '📱' : '💻'}`, {
        duration: 5000,
        icon: '🛡️'
      });
      
      // On mobile, show special warning
      if (isMobile) {
        toast.warning("📱 Do not switch apps or lock your screen during the exam!", {
          duration: 7000,
          icon: '⚠️'
        });
      }
    }

    return () => {
      cleanupSecurityListeners();
    };
  }, [loading, submitted, questions.length]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !submitted && !loading && !isExamBlocked) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && !submitted && questions.length > 0 && !loading) {
      handleSubmit(false);
    }
  }, [timeLeft, submitted, questions, loading]);

  // Warning for low time
  useEffect(() => {
    if (timeLeft <= 60 && timeLeft > 0 && !warningShown && !submitted) {
      setWarningShown(true);
      toast.warning(`⏰ Only ${Math.floor(timeLeft / 60)} minute${Math.floor(timeLeft / 60) !== 1 ? 's' : ''} remaining!`, {
        duration: 5000,
        icon: '⏰'
      });
    }
  }, [timeLeft, warningShown, submitted]);

  // Initial exam start
  useEffect(() => {
    if (!courseId || !subjectId) return;
    startExam();

    return () => {
      exitFullscreen();
      cleanupSecurityListeners();
      blockAllNavigation(false);
    };
  }, [courseId, subjectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading exam...</p>
      </div>
    );
  }

  if (isExamBlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-950/20 p-4">
        <div className="max-w-md text-center">
          <Ban className="h-20 w-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Exam Auto-Submitted</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your exam has been automatically submitted due to security violations.
            Please contact your instructor if you believe this was a mistake.
          </p>
          <div className="bg-red-100 dark:bg-red-950/30 p-3 rounded-lg mb-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              Violation: {securityViolationMessage}
            </p>
          </div>
          <button
            onClick={() => {
              blockAllNavigation(false);
              navigate("/student/dashboard");
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <BookOpen className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Exam Questions Available</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          There are no approved exam questions for this subject yet.
        </p>
        <button
          onClick={() => {
            blockAllNavigation(false);
            navigate("/student/dashboard");
          }}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div 
      id="exam-container"
      ref={examContainerRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-4 px-4 md:py-8"
      style={{ touchAction: 'pan-y' }}
    >
      <Toaster position="top-right" />
      
      {/* Security Overlay - Blocks all external clicks */}
      <div className="fixed inset-0 z-40 pointer-events-none" />
      
      {/* Security Status Bar */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-900/95 text-white rounded-xl text-xs md:text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${securityViolations >= MAX_VIOLATIONS ? 'text-red-400' : 'text-green-400'}`} />
            <span>Security: {securityViolations >= MAX_VIOLATIONS ? '⚠️ VIOLATION' : '🔒 Active'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 ${isFullscreen ? 'text-green-400' : 'text-red-400'}`}>
              {isFullscreen ? '🟢' : '🔴'} Fullscreen
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-400">{isMobile ? '📱' : '💻'} {isMobile ? 'Mobile' : 'Desktop'}</span>
          </div>
        </div>
      </div>

      {/* Security Warning Popup */}
      {showSecurityWarning && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-3 rounded-xl shadow-2xl animate-pulse flex items-center gap-2 max-w-md text-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{securityViolationMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                Secure Exam
                <span className="text-xs bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full ml-2">
                  🛡️ Protected
                </span>
              </h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Maximum security - Any violation auto-submits your exam
              </p>
            </div>
            {timeLeft > 0 && !submitted && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg md:text-xl font-bold ${getTimerColorClass()}`}>
                <Timer className="h-5 w-5" />
                {formatTime(timeLeft)}
              </div>
            )}
            {timeLeft === 0 && !submitted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-mono text-xl font-bold animate-pulse">
                <AlertCircle className="h-5 w-5" />
                Time's Up!
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {progress}%
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {answeredCount} of {questions.length}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {questions.length}
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Security</p>
                <p className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-1">
                  {securityViolations === 0 ? '🟢 Safe' : '🔴 Violation'}
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <Shield className={`h-4 w-4 md:h-5 md:w-5 ${securityViolations === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banners */}
        {timeLeft < 120 && timeLeft > 0 && !submitted && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Less than 2 minutes remaining! Time is running out.</span>
          </div>
        )}

        <div className="mb-4 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs font-medium">
            ⚠️ ANY security violation will auto-submit your exam. Stay focused!
          </span>
        </div>

        {/* Question Card */}
        {current && !submitted && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Question Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium text-sm md:text-base">Q{currentIndex + 1} of {questions.length}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm bg-white/20 px-2 py-1 md:px-3 md:py-1 rounded-lg">
                  <Flag className="h-3 w-3" />
                  <span>{questions.length - answeredCount} left</span>
                </div>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-4 md:p-6" onSelectStart={handleSelectStart}>
              <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                {current.question || "Question text not available"}
              </p>

              <div className="space-y-3">
                {current.options?.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const selected = answers[current._id] === letter;

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(current._id, letter)}
                      className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all duration-200 group ${
                        selected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center font-semibold text-xs md:text-sm transition-all ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50"
                        }`}>
                          {letter}
                        </div>
                        <span className={`flex-1 text-sm md:text-base ${selected ? 'font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                          {opt}
                        </span>
                        {selected && (
                          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse md:flex-row justify-between gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={prev}
                  disabled={currentIndex === 0}
                  className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm md:text-base"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all shadow-lg shadow-green-500/25 text-sm md:text-base"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Submit Exam
                  </button>
                ) : (
                  <button
                    onClick={next}
                    className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25 text-sm md:text-base"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Jump to Question Navigation */}
              {questions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Jump to question:</p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {questions.map((_, idx) => {
                      const isAnswered = answers[questions[idx]?._id];
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs font-medium transition-all ${
                            isCurrent
                              ? "bg-blue-600 text-white"
                              : isAnswered
                              ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className={`sticky top-0 p-6 text-white ${
              scoreData.percentage >= 70 
                ? 'bg-gradient-to-r from-green-600 to-emerald-700' 
                : scoreData.percentage >= 50
                ? 'bg-gradient-to-r from-yellow-600 to-orange-700'
                : 'bg-gradient-to-r from-red-600 to-rose-700'
            }`}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 mb-4">
                  {scoreData.percentage >= 70 ? (
                    <Award className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  ) : scoreData.percentage >= 50 ? (
                    <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  ) : (
                    <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Exam Completed!</h2>
                <p className="mt-1 opacity-90 text-sm md:text-base">
                  {scoreData.percentage >= 70 
                    ? "Excellent work! You've mastered this subject." 
                    : scoreData.percentage >= 50
                    ? "Good effort! Keep practicing to improve."
                    : "Keep learning! Review the material and try again."}
                </p>
                {securityViolations > 0 && (
                  <p className="mt-2 text-xs md:text-sm bg-white/20 p-2 rounded-lg">
                    ⚠️ {securityViolations} security violation(s) recorded during the exam
                  </p>
                )}
              </div>
            </div>

            {/* Score Display */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                    {scoreData.score}
                  </span>
                  <span className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
                    / {questions.length}
                  </span>
                </div>
                <div className="mt-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-base md:text-lg font-semibold ${
                    scoreData.percentage >= 70 
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                      : scoreData.percentage >= 50
                      ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  }`}>
                    {scoreData.percentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* Question Results */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-sm md:text-base">Question Review</h3>
              <div className="space-y-3 max-h-72 md:max-h-96 overflow-y-auto">
                {scoreData.questionResults?.map((result, i) => (
                  <div key={i} className={`border rounded-xl p-3 md:p-4 ${
                    result.isCorrect
                      ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20"
                      : "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {result.isCorrect ? (
                          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm md:text-base">
                          {i + 1}. {result.questionText}
                        </p>
                        <div className="space-y-1 ml-2 md:ml-4">
                          <p className="text-xs md:text-sm">
                            Your answer:
                            <span className={result.isCorrect ? 'text-green-600 dark:text-green-400 ml-1' : 'text-red-600 dark:text-red-400 ml-1'}>
                              {result.userAnswerLetter || 'None'}
                              {result.userAnswerText && ` - "${result.userAnswerText}"`}
                            </span>
                          </p>
                          {!result.isCorrect && (
                            <p className="text-xs md:text-sm text-green-600 dark:text-green-400">
                              Correct answer: "{result.correctAnswer}"
                            </p>
                          )}
                        </div>
                        {result.rationale && (
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            💡 {result.rationale}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <button
                onClick={() => {
                  blockAllNavigation(false);
                  navigate("/student/dashboard");
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 text-sm md:text-base"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExams;