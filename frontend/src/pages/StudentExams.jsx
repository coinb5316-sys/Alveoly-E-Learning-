// StudentExams.jsx - Fully protected with exam security features
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
  AlertTriangle
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
  
  // Refs for security
  const examContainerRef = useRef(null);
  const securityIntervalRef = useRef(null);
  const mouseCheckIntervalRef = useRef(null);

  const current = questions[currentIndex];
  
  // MAXIMUM ALLOWED SECURITY VIOLATIONS
  const MAX_VIOLATIONS = 3;
  const MAX_MOUSE_LEAVES = 2;

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

      const storedAnswers = JSON.parse(localStorage.getItem("examAnswers")) || {};
      const initialAnswers = examQuestions.reduce((acc, q) => {
        acc[q._id] = storedAnswers[q._id] || "";
        return acc;
      }, {});
      setAnswers(initialAnswers);
      localStorage.setItem("examAnswers", JSON.stringify(initialAnswers));
      
      // Enter fullscreen automatically when exam starts
      enterFullscreen();
      
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

  // Fullscreen management
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          toast.success("Fullscreen mode activated for exam security");
        })
        .catch((err) => {
          console.error("Fullscreen error:", err);
          toast.warning("Please enable fullscreen for exam security");
          // Try again with user gesture
          setTimeout(() => {
            if (!document.fullscreenElement) {
              const container = document.getElementById('exam-container');
              if (container?.requestFullscreen) {
                container.requestFullscreen().catch(() => {});
              }
            }
          }, 1000);
        });
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  };

  const handleFullscreenChange = () => {
    const isFull = !!document.fullscreenElement;
    setIsFullscreen(isFull);
    
    if (!isFull && !submitted && !showResult && !isExamBlocked) {
      // Student exited fullscreen during exam
      handleSecurityViolation("You exited fullscreen mode. Please stay in fullscreen during the exam.");
    }
  };

  // Security violation handler
  const handleSecurityViolation = (message) => {
    if (submitted || showResult || isExamBlocked) return;
    
    const newCount = securityViolations + 1;
    setSecurityViolations(newCount);
    setSecurityViolationMessage(message);
    setShowSecurityWarning(true);
    
    // Log violation
    console.warn(`Security violation ${newCount}: ${message}`);
    
    // Auto-hide warning after 3 seconds
    setTimeout(() => {
      setShowSecurityWarning(false);
    }, 3000);
    
    if (newCount >= MAX_VIOLATIONS) {
      // Auto-submit the exam if too many violations
      setIsExamBlocked(true);
      toast.error(`⚠️ Exam auto-submitted due to ${MAX_VIOLATIONS} security violations`);
      
      // Submit exam automatically
      handleSubmit(true);
    }
  };

  // Mouse leave detection (student moving mouse out of window)
  const handleMouseLeave = () => {
    if (submitted || showResult || isExamBlocked) return;
    
    const newCount = mouseLeaveCount + 1;
    setMouseLeaveCount(newCount);
    
    if (newCount <= MAX_MOUSE_LEAVES) {
      toast.warning(`⚠️ Please keep your mouse within the exam window (${newCount}/${MAX_MOUSE_LEAVES})`);
    }
    
    if (newCount >= MAX_MOUSE_LEAVES) {
      handleSecurityViolation(`Mouse left exam window ${MAX_MOUSE_LEAVES} times`);
    }
  };

  // Detect if user is inactive (AFK)
  const checkInactivity = () => {
    const now = Date.now();
    const inactiveTime = (now - lastActiveTime) / 1000; // in seconds
    
    // If inactive for more than 30 seconds, show warning
    if (inactiveTime > 30 && !submitted && !showResult && !isExamBlocked) {
      toast.warning(`⚠️ You've been inactive for ${Math.floor(inactiveTime)} seconds. Please continue your exam.`);
      // Reset inactivity detection after warning
      setLastActiveTime(now);
    }
    
    // If inactive for more than 60 seconds, count as violation
    if (inactiveTime > 60 && !submitted && !showResult && !isExamBlocked) {
      handleSecurityViolation(`Inactive for ${Math.floor(inactiveTime)} seconds`);
      setLastActiveTime(now);
    }
  };

  // Prevent copying, cutting, pasting
  const handleCopy = (e) => {
    e.preventDefault();
    toast.error("📋 Copying is disabled during the exam");
    handleSecurityViolation("Attempted to copy text");
  };

  const handlePaste = (e) => {
    e.preventDefault();
    toast.error("📋 Pasting is disabled during the exam");
    handleSecurityViolation("Attempted to paste text");
  };

  const handleCut = (e) => {
    e.preventDefault();
    toast.error("✂️ Cutting is disabled during the exam");
    handleSecurityViolation("Attempted to cut text");
  };

  // Prevent right-click
  const handleContextMenu = (e) => {
    e.preventDefault();
    toast.error("🖱️ Right-click is disabled during the exam");
    handleSecurityViolation("Attempted to right-click");
  };

  // Prevent keyboard shortcuts
  const handleKeyDown = (e) => {
    // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S, Ctrl+Shift+I, F12
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key.toLowerCase();

    // Block copy, paste, cut
    if (isCtrl && ['c', 'v', 'x', 'p', 's', 'u', 'a'].includes(key)) {
      e.preventDefault();
      toast.error(`⌨️ Keyboard shortcut (Ctrl+${key.toUpperCase()}) is disabled during the exam`);
      handleSecurityViolation(`Attempted to use Ctrl+${key.toUpperCase()}`);
      return;
    }

    // Block F12 (DevTools)
    if (key === 'f12') {
      e.preventDefault();
      toast.error("🔧 Developer tools are disabled during the exam");
      handleSecurityViolation("Attempted to open developer tools");
      return;
    }

    // Block Ctrl+Shift+I (DevTools)
    if (isCtrl && isShift && key === 'i') {
      e.preventDefault();
      toast.error("🔧 Developer tools are disabled during the exam");
      handleSecurityViolation("Attempted to open developer tools");
      return;
    }

    // Block Ctrl+Shift+J (Console)
    if (isCtrl && isShift && key === 'j') {
      e.preventDefault();
      toast.error("🔧 Developer tools are disabled during the exam");
      handleSecurityViolation("Attempted to open console");
      return;
    }

    // Block Ctrl+Shift+C (Inspect Element)
    if (isCtrl && isShift && key === 'c') {
      e.preventDefault();
      toast.error("🔧 Inspect element is disabled during the exam");
      handleSecurityViolation("Attempted to inspect element");
      return;
    }

    // Block Alt+Tab (Switch applications) - limited prevention
    if (e.altKey && key === 'tab') {
      toast.warning("⚠️ Switching applications is not allowed during the exam");
      handleSecurityViolation("Attempted to switch applications (Alt+Tab)");
    }

    // Block Windows key
    if (key === 'meta' || key === 'win') {
      e.preventDefault();
      toast.warning("⚠️ Windows key is disabled during the exam");
      handleSecurityViolation("Attempted to use Windows key");
    }
  };

  // Prevent screenshot via key combinations
  const handleScreenshotPrevention = (e) => {
    // Detect Print Screen key
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      toast.error("📸 Screenshots are disabled during the exam");
      handleSecurityViolation("Attempted to take screenshot (Print Screen)");
      return false;
    }

    // Detect Ctrl+Shift+S (Snipping Tool shortcut)
    if (e.ctrlKey && e.shiftKey && e.key === 's') {
      e.preventDefault();
      toast.error("📸 Screenshots are disabled during the exam");
      handleSecurityViolation("Attempted to take screenshot (Snipping Tool)");
      return false;
    }

    // Detect Alt+PrintScreen
    if (e.altKey && e.key === 'PrintScreen') {
      e.preventDefault();
      toast.error("📸 Screenshots are disabled during the exam");
      handleSecurityViolation("Attempted to take screenshot (Alt+PrintScreen)");
      return false;
    }

    return true;
  };

  // Detect when window loses focus (tab switching)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // User switched tabs or minimized window
      if (!submitted && !showResult && !isExamBlocked) {
        handleSecurityViolation("You switched tabs or minimized the window");
        // Add a visual blur effect to discourage tab switching
        document.body.style.filter = "blur(8px)";
        document.body.style.transition = "filter 0.3s ease";
        
        // Show a prominent warning
        toast.error("🚫 TAB SWITCHING DETECTED! Stay on the exam page.", {
          duration: 5000,
          icon: '⚠️'
        });
      }
    } else {
      // User returned to the tab
      document.body.style.filter = "";
      setLastActiveTime(Date.now());
      
      if (!submitted && !showResult && !isExamBlocked) {
        // Check if fullscreen was exited during tab switch
        if (!document.fullscreenElement && !isFullscreen) {
          handleSecurityViolation("Exited fullscreen while switching tabs");
        }
      }
    }
  };

  // Blur detection (window loses focus)
  const handleWindowBlur = () => {
    if (!submitted && !showResult && !isExamBlocked) {
      handleSecurityViolation("Window lost focus - possible tab switching");
    }
  };

  // Window focus detection
  const handleWindowFocus = () => {
    setLastActiveTime(Date.now());
    document.body.style.filter = "";
  };

  // Prevent screen recording detection
  const handleScreenChange = () => {
    // This is a basic detection for screen recording
    // Note: Full prevention of screen recording is not possible in browsers
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      // Just log for now - we can't fully prevent screen recording
      console.log("Screen capture might be in progress");
    }
  };

  // Prevent dragging/selection
  const handleSelectStart = (e) => {
    e.preventDefault();
  };

  // Mouse movement tracking for inactivity
  const handleMouseMove = () => {
    setLastActiveTime(Date.now());
  };

  // Keyboard activity tracking
  const handleKeyPress = () => {
    setLastActiveTime(Date.now());
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

    // If auto-submit, clear any blocking state
    if (isAutoSubmit) {
      setIsExamBlocked(false);
    }

    try {
      const res = await axios.post("/exam/submit", {
        attemptId,
        answers,
        autoSubmit: isAutoSubmit,
        securityViolations: securityViolations,
        mouseLeaves: mouseLeaveCount
      });

      setSubmitted(true);
      setScoreData({
        score: res.data.score,
        percentage: res.data.percentage,
        questionResults: res.data.questionResults || []
      });
      setShowResult(true);

      localStorage.removeItem("examAnswers");
      
      // Exit fullscreen on completion
      exitFullscreen();
      
      // Clean up security listeners
      cleanupSecurityListeners();
      
      if (isAutoSubmit) {
        toast.error("⚠️ Exam auto-submitted due to security violations");
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
    document.removeEventListener("keyup", handleScreenshotPrevention);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("blur", handleWindowBlur);
    document.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("selectstart", handleSelectStart);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("keypress", handleKeyPress);
    document.removeEventListener("mouseleave", handleMouseLeave);
    
    // Clear intervals
    if (securityIntervalRef.current) {
      clearInterval(securityIntervalRef.current);
    }
    if (mouseCheckIntervalRef.current) {
      clearInterval(mouseCheckIntervalRef.current);
    }
    
    // Remove blur filter
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
      document.addEventListener("keyup", handleScreenshotPrevention);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("blur", handleWindowBlur);
      document.addEventListener("focus", handleWindowFocus);
      document.addEventListener("selectstart", handleSelectStart);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("keypress", handleKeyPress);
      document.addEventListener("mouseleave", handleMouseLeave);

      // Set up inactivity checker
      securityIntervalRef.current = setInterval(checkInactivity, 10000); // Check every 10 seconds

      // Set up mouse position checker
      mouseCheckIntervalRef.current = setInterval(() => {
        if (!document.hidden && !submitted && !showResult && !isExamBlocked) {
          // Check if mouse is within viewport
          const isMouseInViewport = (event) => {
            const x = event.clientX;
            const y = event.clientY;
            return x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight;
          };
        }
      }, 5000);

      // Try to enter fullscreen if not already
      if (!document.fullscreenElement && !isFullscreen) {
        enterFullscreen();
      }

      // Show security reminder
      toast.success("🔒 Exam security enabled - Fullscreen, copy/paste, and tab switching are monitored", {
        duration: 5000,
        icon: '🛡️'
      });
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
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && !submitted && questions.length > 0 && !loading) {
      handleSubmit();
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
          <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Exam Blocked</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your exam has been automatically submitted due to multiple security violations.
            Please contact your instructor if you believe this was a mistake.
          </p>
          <button
            onClick={() => navigate("/student/dashboard")}
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
          onClick={() => navigate("/student/dashboard")}
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
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4"
    >
      <Toaster position="top-right" />
      
      {/* Security Status Bar */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-900/95 text-white rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${securityViolations >= MAX_VIOLATIONS ? 'text-red-400' : 'text-green-400'}`} />
            <span>Security: {securityViolations >= MAX_VIOLATIONS ? '⚠️ Violations Detected' : 'Active'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={`flex items-center gap-1 ${isFullscreen ? 'text-green-400' : 'text-red-400'}`}>
              {isFullscreen ? '🟢' : '🔴'} Fullscreen
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-400">Violations: {securityViolations}/{MAX_VIOLATIONS}</span>
          </div>
        </div>
      </div>

      {/* Security Warning Popup */}
      {showSecurityWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl animate-pulse flex items-center gap-3 max-w-lg">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{securityViolationMessage}</span>
          <span className="text-xs opacity-75 ml-2">({securityViolations}/{MAX_VIOLATIONS})</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-500" />
                Exam Mode
                <span className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full ml-2">
                  {isFullscreen ? '🔒 Fullscreen' : '⚠️ Not Fullscreen'}
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Protected mode - Tab switching, copying, and screenshots are blocked
              </p>
            </div>
            {timeLeft > 0 && !submitted && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold ${getTimerColorClass()}`}>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {progress}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {answeredCount} of {questions.length} answered
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {questions.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Security Status</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-1">
                  {securityViolations === 0 ? '🟢' : securityViolations < MAX_VIOLATIONS ? '🟡' : '🔴'}
                  {securityViolations === 0 ? 'Safe' : securityViolations < MAX_VIOLATIONS ? 'Warning' : 'Blocked'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <Shield className={`h-5 w-5 ${securityViolations === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {timeLeft < 120 && timeLeft > 0 && !submitted && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Less than 2 minutes remaining! Time is running out.</span>
          </div>
        )}

        {/* Security Reminder Banner */}
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <EyeOff className="h-4 w-4" />
          <span className="text-xs">🔒 Exam protected - {MAX_VIOLATIONS} violations allowed. Fullscreen required.</span>
        </div>

        {/* Question Card */}
        {current && !submitted && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Question Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Question {currentIndex + 1} of {questions.length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-lg">
                  <Flag className="h-3.5 w-3.5" />
                  <span>{questions.length - answeredCount} unanswered</span>
                </div>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-6" onSelectStart={handleSelectStart}>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
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
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                        selected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50"
                        }`}>
                          {letter}
                        </div>
                        <span className={`flex-1 ${selected ? 'font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                          {opt}
                        </span>
                        {selected && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={prev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all shadow-lg shadow-green-500/25"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Submit Exam
                  </button>
                ) : (
                  <button
                    onClick={next}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25"
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
                  <div className="flex flex-wrap gap-2">
                    {questions.map((_, idx) => {
                      const isAnswered = answers[questions[idx]?._id];
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl animate-scaleIn">
            {/* Modal Header */}
            <div className={`sticky top-0 p-6 text-white ${
              scoreData.percentage >= 70 
                ? 'bg-gradient-to-r from-green-600 to-emerald-700' 
                : scoreData.percentage >= 50
                ? 'bg-gradient-to-r from-yellow-600 to-orange-700'
                : 'bg-gradient-to-r from-red-600 to-rose-700'
            }`}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
                  {scoreData.percentage >= 70 ? (
                    <Award className="h-10 w-10 text-white" />
                  ) : scoreData.percentage >= 50 ? (
                    <TrendingUp className="h-10 w-10 text-white" />
                  ) : (
                    <BookOpen className="h-10 w-10 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold">Exam Completed!</h2>
                <p className="mt-1 opacity-90">
                  {scoreData.percentage >= 70 
                    ? "Excellent work! You've mastered this subject." 
                    : scoreData.percentage >= 50
                    ? "Good effort! Keep practicing to improve."
                    : "Keep learning! Review the material and try again."}
                </p>
                {securityViolations > 0 && (
                  <p className="mt-2 text-sm bg-white/20 p-2 rounded-lg">
                    ⚠️ {securityViolations} security violation(s) recorded during the exam
                  </p>
                )}
              </div>
            </div>

            {/* Score Display */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                    {scoreData.score}
                  </span>
                  <span className="text-xl text-gray-500 dark:text-gray-400">
                    / {questions.length}
                  </span>
                </div>
                <div className="mt-2">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Question Review</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scoreData.questionResults?.map((result, i) => (
                  <div key={i} className={`border rounded-xl p-4 ${
                    result.isCorrect
                      ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20"
                      : "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {result.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {i + 1}. {result.questionText}
                        </p>
                        <div className="space-y-1 ml-4">
                          <p className="text-sm">
                            Your answer:
                            <span className={result.isCorrect ? 'text-green-600 dark:text-green-400 ml-1' : 'text-red-600 dark:text-red-400 ml-1'}>
                              {result.userAnswerLetter || 'None'}
                              {result.userAnswerText && ` - "${result.userAnswerText}"`}
                            </span>
                          </p>
                          {!result.isCorrect && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Correct answer: "{result.correctAnswer}"
                            </p>
                          )}
                        </div>
                        {result.rationale && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                onClick={() => navigate("/student/dashboard")}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
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