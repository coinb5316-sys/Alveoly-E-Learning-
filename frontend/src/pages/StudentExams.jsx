// StudentExams.jsx - Professional Exam Protection with Timer Persistence
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
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
  AlertTriangle,
  Lock,
  Ban,
  EyeOff
} from "lucide-react";

const StudentExams = () => {
  const { user } = useAuth();
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();

  // Core state
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
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [isScreenshotAttempted, setIsScreenshotAttempted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [blurActive, setBlurActive] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);

  // Refs
  const examContainerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const fullscreenAttemptedRef = useRef(false);
  const screenshotDetectionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const current = questions[currentIndex];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(ua);
      setIsMobile(isMobileDevice || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ============================================
  // TIMER PERSISTENCE - Fix refresh issue
  // ============================================

  // Save exam state to sessionStorage (clears on tab close, not on refresh)
  const saveExamState = useCallback(() => {
    try {
      const state = {
        questions,
        currentIndex,
        answers,
        attemptId,
        timeLeft,
        startTime,
        examStartTime,
        totalDuration,
        isScreenshotAttempted,
        submitted: false // Don't persist submitted state
      };
      sessionStorage.setItem('exam_state_' + attemptId, JSON.stringify(state));
    } catch (e) {
      // Silently fail
    }
  }, [questions, currentIndex, answers, attemptId, timeLeft, startTime, examStartTime, totalDuration, isScreenshotAttempted]);

  // Restore exam state on refresh
  const restoreExamState = useCallback(() => {
    try {
      if (!attemptId) return null;
      const saved = sessionStorage.getItem('exam_state_' + attemptId);
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if not submitted
        if (!state.submitted) {
          return state;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [attemptId]);

  // Clear exam state on completion
  const clearExamState = useCallback(() => {
    try {
      if (attemptId) {
        sessionStorage.removeItem('exam_state_' + attemptId);
      }
    } catch (e) {
      // Silently fail
    }
  }, [attemptId]);

  // ============================================
  // EFFECTIVE SCREENSHOT PROTECTION
  // ============================================

  // 1. Continuous Canvas Overlay
  const createScreenshotCanvas = useCallback(() => {
    try {
      const existing = document.getElementById('screenshot-canvas');
      if (existing) existing.remove();

      const canvas = document.createElement('canvas');
      canvas.id = 'screenshot-canvas';
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 99999;
        opacity: 0.001;
        display: block;
      `;

      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Fill with near-transparent pattern
      ctx.fillStyle = 'rgba(0,0,0,0.001)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw random pattern that corrupts screenshots
      for (let i = 0; i < 200; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        ctx.fillStyle = `rgba(${r},${g},${b},0.001)`;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const w = 20 + Math.random() * 80;
        const h = 20 + Math.random() * 80;
        ctx.fillRect(x, y, w, h);
      }

      // Add text that appears in screenshots
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,0,0,0.02)';
      ctx.fillText('📸 SCREENSHOT BLOCKED', canvas.width / 2, canvas.height / 2 - 50);
      ctx.fillText('EXAM PROTECTED', canvas.width / 2, canvas.height / 2 + 50);

      // Add diagonal lines that corrupt screenshots
      ctx.strokeStyle = 'rgba(255,0,0,0.001)';
      ctx.lineWidth = 2;
      for (let i = -canvas.height; i < canvas.width + canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + canvas.height, canvas.height);
        ctx.stroke();
      }

      document.body.appendChild(canvas);
      screenshotDetectionRef.current = canvas;

      const resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resizeHandler);
      canvas._resizeHandler = resizeHandler;

      return canvas;
    } catch (e) {
      console.warn("Canvas error:", e);
      return null;
    }
  }, []);

  // 2. CSS Protection
  const applyCSSProtection = useCallback(() => {
    const styleId = 'exam-protection-style';
    let style = document.getElementById(styleId);
    if (style) style.remove();

    style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @media print {
        body, #exam-container, .exam-content, * {
          display: none !important;
          visibility: hidden !important;
        }
        body::after {
          content: "📸 Screenshot Blocked" !important;
          display: block !important;
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          font-size: 24px !important;
          color: red !important;
          background: black !important;
          padding: 20px !important;
          z-index: 999999 !important;
        }
      }

      #exam-container, .exam-content, .exam-content * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-drag: none !important;
        -webkit-touch-callout: none !important;
      }

      #exam-blur-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 99998;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        color: white;
        text-align: center;
        cursor: pointer;
      }
      #exam-blur-overlay.active {
        display: flex !important;
      }
      #exam-blur-overlay .icon {
        font-size: 64px;
        margin-bottom: 20px;
      }
      #exam-blur-overlay .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      #exam-blur-overlay .subtitle {
        font-size: 16px;
        color: #aaa;
        max-width: 400px;
        padding: 0 20px;
        margin-bottom: 30px;
      }
      #exam-blur-overlay .tap-text {
        font-size: 14px;
        color: #666;
        animation: pulse 1.5s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }

      .exam-blurred {
        filter: blur(20px) !important;
        pointer-events: none !important;
        transition: filter 0.3s ease !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // 3. Blur overlay
  const showBlurOverlay = useCallback((message = "Exam Paused", icon = "🔒") => {
    let overlay = document.getElementById('exam-blur-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'exam-blur-overlay';
      overlay.innerHTML = `
        <div class="icon">${icon}</div>
        <div class="title" id="blur-title">${message}</div>
        <div class="subtitle">Tap anywhere to continue</div>
        <div class="tap-text">👆 Tap to resume</div>
      `;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', () => {
        overlay.classList.remove('active');
        setIsBlocked(false);
        setIsInactive(false);
        setBlurActive(false);
        setLastActivityTime(Date.now());
        const container = document.getElementById('exam-container');
        if (container) {
          container.classList.remove('exam-blurred');
        }
      });
    } else {
      const title = document.getElementById('blur-title');
      if (title) title.textContent = message;
    }
    overlay.classList.add('active');
    setIsBlocked(true);
    setBlurActive(true);
    const container = document.getElementById('exam-container');
    if (container) {
      container.classList.add('exam-blurred');
    }
  }, []);

  const hideBlurOverlay = useCallback(() => {
    const overlay = document.getElementById('exam-blur-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    setIsBlocked(false);
    setIsInactive(false);
    setBlurActive(false);
    const container = document.getElementById('exam-container');
    if (container) {
      container.classList.remove('exam-blurred');
    }
    setLastActivityTime(Date.now());
  }, []);

  // 4. Screenshot detection
  const handleScreenshotDetection = useCallback((e) => {
    const key = e.key;

    // Desktop screenshot keys - Note: Hardware screenshots on mobile CANNOT be intercepted
    if (key === 'PrintScreen' || key === 'Screen') {
      e.preventDefault();
      e.stopPropagation();
      setIsScreenshotAttempted(true);
      showBlurOverlay("📸 Screenshot Blocked", "🚫");
      setTimeout(() => {
        const overlay = document.getElementById('exam-blur-overlay');
        if (overlay) {
          overlay.classList.remove('active');
          setIsBlocked(false);
          setBlurActive(false);
          const container = document.getElementById('exam-container');
          if (container) {
            container.classList.remove('exam-blurred');
          }
        }
      }, 1500);
      return false;
    }

    // Ctrl+Shift+S, Win+Shift+S, Cmd+Shift+3/4/5
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      setIsScreenshotAttempted(true);
      showBlurOverlay("📸 Screenshot Blocked", "🚫");
      setTimeout(() => {
        const overlay = document.getElementById('exam-blur-overlay');
        if (overlay) {
          overlay.classList.remove('active');
          setIsBlocked(false);
          setBlurActive(false);
          const container = document.getElementById('exam-container');
          if (container) {
            container.classList.remove('exam-blurred');
          }
        }
      }, 1500);
      return false;
    }

    // Alt+PrintScreen, Win+PrintScreen
    if ((e.altKey || e.metaKey) && key === 'PrintScreen') {
      e.preventDefault();
      e.stopPropagation();
      setIsScreenshotAttempted(true);
      showBlurOverlay("📸 Screenshot Blocked", "🚫");
      setTimeout(() => {
        const overlay = document.getElementById('exam-blur-overlay');
        if (overlay) {
          overlay.classList.remove('active');
          setIsBlocked(false);
          setBlurActive(false);
          const container = document.getElementById('exam-container');
          if (container) {
            container.classList.remove('exam-blurred');
          }
        }
      }, 1500);
      return false;
    }

    return true;
  }, [showBlurOverlay]);

  // 5. Mobile app switch detection
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      if (!submitted && !showResult) {
        showBlurOverlay("📱 App Switch Detected", "📱");
        // For mobile, we don't auto-resume - user must tap
      }
    } else {
      if (!isBlocked) {
        hideBlurOverlay();
      }
    }
  }, [submitted, showResult, showBlurOverlay, hideBlurOverlay, isBlocked]);

  // ============================================
  // INACTIVITY DETECTION (30 seconds)
  // ============================================

  const handleActivity = useCallback(() => {
    setLastActivityTime(Date.now());
    if (isInactive) {
      hideBlurOverlay();
    }
  }, [isInactive, hideBlurOverlay]);

  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const inactiveTime = (now - lastActivityTime) / 1000;

    if (inactiveTime >= 30 && !submitted && !showResult) {
      if (!isInactive) {
        showBlurOverlay("⏳ Inactivity Detected", "⏳");
        toast.custom((t) => (
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            ⏳ Inactive for 30s - tap to resume
          </div>
        ), { duration: 3000 });
      }
    }
  }, [lastActivityTime, isInactive, submitted, showResult, showBlurOverlay]);

  // ============================================
  // KEYBOARD SHORTCUT BLOCKING
  // ============================================

  const handleKeyDown = useCallback((e) => {
    if (!handleScreenshotDetection(e)) return;

    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key.toLowerCase();

    const blockedKeys = ['c', 'v', 'x', 'p', 's', 'a', 'u', 'r', 't', 'w', 'n'];
    if (isCtrl && blockedKeys.includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      showBlurOverlay("⌨️ Shortcut Blocked", "⌨️");
      setTimeout(hideBlurOverlay, 1500);
      return;
    }

    if (e.key.startsWith('F') && parseInt(e.key.replace('F', '')) >= 5) {
      e.preventDefault();
      showBlurOverlay("⌨️ Function Key Blocked", "⌨️");
      setTimeout(hideBlurOverlay, 1500);
      return;
    }

    if (isCtrl && isShift && ['i', 'j', 'c'].includes(key)) {
      e.preventDefault();
      showBlurOverlay("🔧 DevTools Blocked", "🔧");
      setTimeout(hideBlurOverlay, 1500);
      return;
    }

    if (e.altKey && ['tab', 'f4'].includes(key)) {
      e.preventDefault();
      showBlurOverlay("⛔ Alt+Tab Blocked", "⛔");
      setTimeout(hideBlurOverlay, 1500);
      return;
    }

    if (key === 'meta' || key === 'win' || key === 'command') {
      e.preventDefault();
      showBlurOverlay("⌨️ System Key Blocked", "⌨️");
      setTimeout(hideBlurOverlay, 1500);
      return;
    }
  }, [handleScreenshotDetection, showBlurOverlay, hideBlurOverlay]);

  // ============================================
  // BLOCK NAVIGATION
  // ============================================

  const blockNavigation = useCallback((block) => {
    try {
      if (block) {
        document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
          if (!el.closest('#exam-container')) {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.3';
          }
        });

        window.history.pushState(null, '', window.location.href);
        const popHandler = (e) => {
          e.preventDefault();
          window.history.pushState(null, '', window.location.href);
          showBlurOverlay("⛔ Navigation Blocked", "⛔");
          setTimeout(hideBlurOverlay, 1500);
        };
        window.addEventListener('popstate', popHandler);
        window._popHandler = popHandler;

        const unloadHandler = (e) => {
          e.preventDefault();
          e.returnValue = '';
          return '';
        };
        window.addEventListener('beforeunload', unloadHandler);
        window._unloadHandler = unloadHandler;
      } else {
        document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
          el.style.pointerEvents = '';
          el.style.opacity = '';
        });
        if (window._popHandler) {
          window.removeEventListener('popstate', window._popHandler);
          delete window._popHandler;
        }
        if (window._unloadHandler) {
          window.removeEventListener('beforeunload', window._unloadHandler);
          delete window._unloadHandler;
        }
      }
    } catch (e) {
      console.warn("Navigation blocking error:", e);
    }
  }, [showBlurOverlay, hideBlurOverlay]);

  // ============================================
  // FULLSCREEN
  // ============================================

  const enterFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
        return;
      }
      if (fullscreenAttemptedRef.current) return;

      const el = document.documentElement;
      const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (request) {
        fullscreenAttemptedRef.current = true;
        request.call(el)
          .then(() => {
            setIsFullscreen(true);
            fullscreenAttemptedRef.current = false;
          })
          .catch(() => {
            fullscreenAttemptedRef.current = false;
            if (!window._fullscreenToastShown) {
              window._fullscreenToastShown = true;
              toast.custom((t) => (
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                  🔒 Please enter fullscreen for exam security
                </div>
              ), { duration: 4000 });
            }
          });
      }
    } catch (e) {
      fullscreenAttemptedRef.current = false;
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    const isFull = !!document.fullscreenElement;
    setIsFullscreen(isFull);
    if (!isFull && !submitted && !showResult) {
      showBlurOverlay("🔒 Fullscreen Required", "🔒");
      setTimeout(hideBlurOverlay, 2000);
    }
  }, [submitted, showResult, showBlurOverlay, hideBlurOverlay]);

  // ============================================
  // EXAM LOGIC
  // ============================================

  const startExam = async () => {
    try {
      if (attemptId) return;

      const res = await axios.post("/exam/start", { courseId, subjectId });
      const { attemptId: newAttemptId, questions: examQuestions, duration } = res.data;

      if (!examQuestions || examQuestions.length === 0) {
        toast.error("No exam questions found.");
        setLoading(false);
        return;
      }

      setAttemptId(newAttemptId);
      setQuestions(examQuestions);
      setTotalDuration(duration);
      setTimeLeft(duration);
      setStartTime(Date.now());
      setExamStartTime(Date.now());
      setLastActivityTime(Date.now());

      const saved = JSON.parse(localStorage.getItem("examAnswers_" + newAttemptId) || "{}");
      const initial = examQuestions.reduce((acc, q) => {
        acc[q._id] = saved[q._id] || "";
        return acc;
      }, {});
      setAnswers(initial);
      localStorage.setItem("examAnswers_" + newAttemptId, JSON.stringify(initial));

      // Apply protections
      applyCSSProtection();
      createScreenshotCanvas();
      blockNavigation(true);

      setTimeout(enterFullscreen, 1000);

      // Save initial state
      setTimeout(() => saveExamState(), 100);

    } catch (err) {
      console.error("Start exam error:", err);
      if (err.response?.status === 401) {
        toast.error("Please login again.");
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

  // Restore exam on refresh
  const restoreExam = useCallback(() => {
    if (!attemptId) return;
    
    const savedState = restoreExamState();
    if (savedState) {
      setQuestions(savedState.questions || []);
      setCurrentIndex(savedState.currentIndex || 0);
      setAnswers(savedState.answers || {});
      setTimeLeft(savedState.timeLeft || 0);
      setStartTime(savedState.startTime || Date.now());
      setExamStartTime(savedState.examStartTime || Date.now());
      setTotalDuration(savedState.totalDuration || 0);
      setIsScreenshotAttempted(savedState.isScreenshotAttempted || false);
      
      // Restore answers from localStorage
      const savedAnswers = JSON.parse(localStorage.getItem("examAnswers_" + attemptId) || "{}");
      if (Object.keys(savedAnswers).length > 0) {
        setAnswers(savedAnswers);
      }
      
      // Re-apply protections
      applyCSSProtection();
      createScreenshotCanvas();
      blockNavigation(true);
      
      toast.custom((t) => (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          🔄 Exam restored - continuing where you left off
        </div>
      ), { duration: 3000 });
    }
  }, [attemptId, restoreExamState, applyCSSProtection, createScreenshotCanvas, blockNavigation]);

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!attemptId || submitted) return;

    try {
      const res = await axios.post("/exam/submit", {
        attemptId,
        answers,
        autoSubmit: isAutoSubmit,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        deviceType: isMobile ? 'mobile' : 'desktop',
        screenshotAttempted: isScreenshotAttempted
      });

      setSubmitted(true);
      setScoreData({
        score: res.data.score || 0,
        percentage: res.data.percentage || 0,
        questionResults: res.data.questionResults || []
      });
      setShowResult(true);

      // Clear all saved data
      localStorage.removeItem("examAnswers_" + attemptId);
      clearExamState();
      blockNavigation(false);
      cleanup();

      toast.success("✅ Exam submitted successfully!");

    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.message || "Failed to submit exam.");
    }
  };

  const cleanup = () => {
    if (screenshotDetectionRef.current) {
      if (screenshotDetectionRef.current._resizeHandler) {
        window.removeEventListener('resize', screenshotDetectionRef.current._resizeHandler);
      }
      screenshotDetectionRef.current.remove();
      screenshotDetectionRef.current = null;
    }
    const overlay = document.getElementById('exam-blur-overlay');
    if (overlay) overlay.remove();
    const style = document.getElementById('exam-protection-style');
    if (style) style.remove();
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    blockNavigation(false);
    document.body.style.filter = "";
  };

  const handleSelect = async (qId, option) => {
    if (submitted) return;
    const updated = { ...answers, [qId]: option };
    setAnswers(updated);
    localStorage.setItem("examAnswers_" + attemptId, JSON.stringify(updated));
    handleActivity();
    saveExamState();

    if (attemptId) {
      await axios.post("/exam/save-progress", {
        attemptId,
        answers: updated,
      }).catch(() => {});
    }
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      handleActivity();
      saveExamState();
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      handleActivity();
      saveExamState();
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  // Initial exam start
  useEffect(() => {
    if (!courseId || !subjectId) return;
    startExam();

    return () => {
      cleanup();
    };
  }, [courseId, subjectId]);

  // Check for saved state on refresh
  useEffect(() => {
    if (attemptId && !loading) {
      restoreExam();
    }
  }, [attemptId, loading, restoreExam]);

  // Save state periodically
  useEffect(() => {
    if (!loading && !submitted && attemptId) {
      const saveInterval = setInterval(() => {
        saveExamState();
      }, 5000);
      return () => clearInterval(saveInterval);
    }
  }, [loading, submitted, attemptId, saveExamState]);

  // Security listeners
  useEffect(() => {
    if (!loading && !submitted && questions.length > 0) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showBlurOverlay("🖱️ Right-click Blocked", "🖱️");
        setTimeout(hideBlurOverlay, 1500);
      });
      document.addEventListener("copy", (e) => {
        e.preventDefault();
        showBlurOverlay("📋 Copy Blocked", "📋");
        setTimeout(hideBlurOverlay, 1500);
      });
      document.addEventListener("paste", (e) => {
        e.preventDefault();
        showBlurOverlay("📋 Paste Blocked", "📋");
        setTimeout(hideBlurOverlay, 1500);
      });
      document.addEventListener("cut", (e) => {
        e.preventDefault();
        showBlurOverlay("✂️ Cut Blocked", "✂️");
        setTimeout(hideBlurOverlay, 1500);
      });
      document.addEventListener("blur", () => {
        if (!submitted && !showResult) {
          showBlurOverlay("👀 Focus Lost", "👀");
        }
      });
      document.addEventListener("focus", () => {
        hideBlurOverlay();
        handleActivity();
      });

      const activityEvents = ['click', 'touchstart', 'mousemove', 'keydown', 'scroll', 'touchmove'];
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity);
      });

      inactivityTimerRef.current = setInterval(checkInactivity, 5000);

      toast.custom((t) => (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" />
          🔒 Exam Protected
        </div>
      ), { duration: 3000 });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [loading, submitted, questions.length]);

  // Timer effect - persists across refresh
  useEffect(() => {
    if (timeLeft > 0 && !submitted && !loading) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          // Save state on each tick
          saveExamState();
          if (newTime <= 0) {
            clearInterval(timerIntervalRef.current);
            handleSubmit(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [timeLeft, submitted, loading, saveExamState]);

  // Low time warning
  useEffect(() => {
    if (timeLeft <= 60 && timeLeft > 0 && !warningShown && !submitted) {
      setWarningShown(true);
      toast.custom((t) => (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          ⏰ {Math.floor(timeLeft / 60)} minute{Math.floor(timeLeft / 60) !== 1 ? 's' : ''} remaining!
        </div>
      ), { duration: 5000 });
    }
  }, [timeLeft, warningShown, submitted]);

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading exam...</p>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No Questions Available</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">There are no approved exam questions for this subject.</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const progress = questions.length
    ? Math.round((Object.keys(answers).filter(k => answers[k]).length / questions.length) * 100)
    : 0;
  const answeredCount = Object.keys(answers).filter(k => answers[k]).length;

  return (
    <div
      id="exam-container"
      ref={examContainerRef}
      className={`exam-content min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-4 px-4 md:py-8 ${blurActive ? 'exam-blurred' : ''}`}
      style={{ touchAction: 'pan-y' }}
      onClick={handleActivity}
      onTouchStart={handleActivity}
    >
      <Toaster position="top-right" />

      {/* Security Status Bar */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-900/90 text-white rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="hidden sm:inline">Secure Exam</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 ${isFullscreen ? 'text-green-400' : 'text-yellow-400'}`}>
              {isFullscreen ? '🔒' : '🔓'}
              <span className="hidden sm:inline">{isFullscreen ? 'Fullscreen' : 'Fullscreen Off'}</span>
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1">
              <EyeOff className="h-3 w-3" />
              <span className="hidden sm:inline">Protected</span>
            </span>
            <span className="text-gray-600">|</span>
            <span>{isMobile ? '📱' : '💻'}</span>
            {isInactive && (
              <span className="text-yellow-400 animate-pulse">⏳</span>
            )}
            {isScreenshotAttempted && (
              <span className="text-red-400">📸</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-500" />
                Exam
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {questions.length} questions • {isMobile ? 'Mobile' : 'Desktop'} mode
                {attemptId && (
                  <span className="ml-2 text-xs text-gray-400">ID: {attemptId.slice(-6)}</span>
                )}
              </p>
            </div>
            {timeLeft > 0 && !submitted && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold ${
                timeLeft < 60 ? 'text-red-500 bg-red-50 dark:bg-red-950/30' :
                timeLeft < 120 ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30' :
                'text-green-500 bg-green-50 dark:bg-green-950/30'
              }`}>
                <Timer className="h-5 w-5" />
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            )}
            {timeLeft === 0 && !submitted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-mono text-xl font-bold animate-pulse">
                Time's Up!
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-3 mb-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{progress}%</p>
            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Answered</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{answeredCount}/{questions.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Security</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
              <Shield className={`h-4 w-4 ${isBlocked ? 'text-yellow-500' : 'text-green-500'}`} />
              {isBlocked ? 'Paused' : 'Active'}
            </p>
          </div>
        </div>

        {/* Question Card */}
        {current && !submitted && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <span className="font-medium">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">
                  {questions.length - answeredCount} left
                </span>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                {current.question}
              </p>

              <div className="space-y-3">
                {current.options?.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const selected = answers[current._id] === letter;

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(current._id, letter)}
                      className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-sm ${
                          selected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {selected && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={prev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                >
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Back
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all shadow-lg shadow-green-500/25 text-sm"
                  >
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={next}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25 text-sm"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 inline ml-1" />
                  </button>
                )}
              </div>

              {/* Question Navigator */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap gap-1.5">
                  {questions.map((_, idx) => {
                    const isAnswered = answers[questions[idx]?._id];
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => { setCurrentIndex(idx); handleActivity(); }}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          isCurrent ? "bg-blue-600 text-white" :
                          isAnswered ? "bg-green-100 dark:bg-green-950/30 text-green-700" :
                          "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className={`sticky top-0 p-6 text-white ${
              scoreData.percentage >= 70 ? 'bg-gradient-to-r from-green-600 to-emerald-700' :
              scoreData.percentage >= 50 ? 'bg-gradient-to-r from-yellow-600 to-orange-700' :
              'bg-gradient-to-r from-red-600 to-rose-700'
            }`}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                  {scoreData.percentage >= 70 ? <Award className="h-8 w-8 text-white" /> :
                   scoreData.percentage >= 50 ? <TrendingUp className="h-8 w-8 text-white" /> :
                   <BookOpen className="h-8 w-8 text-white" />}
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Exam Complete!</h2>
                <p className="mt-1 opacity-90 text-sm">
                  {scoreData.percentage >= 70 ? "Excellent work!" :
                   scoreData.percentage >= 50 ? "Good effort!" :
                   "Keep learning!"}
                </p>
                {isScreenshotAttempted && (
                  <p className="mt-2 text-xs bg-red-500/30 p-2 rounded-lg">
                    📸 Screenshot attempt detected
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{scoreData.score}</span>
                <span className="text-xl text-gray-500"> / {questions.length}</span>
                <div className="mt-2 inline-block px-4 py-2 rounded-full text-lg font-semibold bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                  {scoreData.percentage}%
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Review</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {scoreData.questionResults?.map((result, i) => (
                  <div key={i} className={`border rounded-xl p-3 ${
                    result.isCorrect ? "border-green-200 dark:border-green-800 bg-green-50/30" :
                    "border-red-200 dark:border-red-800 bg-red-50/30"
                  }`}>
                    <div className="flex gap-3">
                      {result.isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" /> :
                                       <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{i+1}. {result.questionText}</p>
                        <p className="text-sm">Your answer: <span className={result.isCorrect ? "text-green-600" : "text-red-600"}>{result.userAnswerLetter || 'None'}</span></p>
                        {!result.isCorrect && <p className="text-sm text-green-600">Correct: {result.correctAnswer}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <button
                onClick={() => navigate("/student/dashboard")}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all text-sm"
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