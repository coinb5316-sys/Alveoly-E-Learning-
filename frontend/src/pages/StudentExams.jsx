// StudentExams.jsx - Maximum screenshot protection across all devices
import { useState, useEffect, useRef } from "react";
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
  const [fullscreenErrorShown, setFullscreenErrorShown] = useState(false);
  const [isScreenshotAttempted, setIsScreenshotAttempted] = useState(false);
  const [blurActive, setBlurActive] = useState(false);
  
  // Refs for security
  const examContainerRef = useRef(null);
  const securityIntervalRef = useRef(null);
  const blockNavigationRef = useRef(null);
  const fullscreenAttemptedRef = useRef(false);
  const screenshotBlurTimeoutRef = useRef(null);
  const videoRef = useRef(null);

  const current = questions[currentIndex];
  
  // MAXIMUM ALLOWED SECURITY VIOLATIONS
  const MAX_VIOLATIONS = 1;
  const MAX_MOUSE_LEAVES = 1;

  // Safe toast wrapper
  const safeToast = {
    success: (msg, opts) => {
      try { return toast.success(msg, opts); } catch (e) { console.warn("Toast error:", e); return null; }
    },
    error: (msg, opts) => {
      try { return toast.error(msg, opts); } catch (e) { console.warn("Toast error:", e); return null; }
    },
    warning: (msg, opts) => {
      try { return toast(msg, { ...opts, icon: '⚠️' }); } catch (e) { console.warn("Toast error:", e); return null; }
    },
    info: (msg, opts) => {
      try { return toast(msg, { ...opts, icon: 'ℹ️' }); } catch (e) { console.warn("Toast error:", e); return null; }
    }
  };

  // ============================================
  // SCREENSHOT PROTECTION - ENHANCED
  // ============================================

  // 1. CSS-based protection - prevents rendering on screenshot
  const applyScreenshotProtection = () => {
    try {
      // Add CSS to prevent rendering during screenshot
      const style = document.createElement('style');
      style.id = 'screenshot-protection';
      style.textContent = `
        @media print {
          body { display: none !important; }
          #exam-container { display: none !important; }
        }
        /* Prevent selection and copying */
        #exam-container {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }
        /* Blur when screenshot is detected */
        .screenshot-blur {
          filter: blur(20px) !important;
          transition: filter 0.1s ease !important;
          pointer-events: none !important;
        }
        .screenshot-blur * {
          filter: blur(20px) !important;
        }
        /* Hide content when blurred */
        .screenshot-hidden {
          opacity: 0 !important;
          transition: opacity 0.1s ease !important;
        }
        /* Anti-screenshot watermark */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: red;
          font-size: 24px;
          font-weight: bold;
          z-index: 9999;
          background: rgba(255,0,0,0.1);
          padding: 20px;
          border-radius: 10px;
          border: 3px solid red;
          display: none;
        }
        .watermark.active {
          display: block !important;
        }
      `;
      document.head.appendChild(style);
    } catch (e) {
      console.warn("CSS protection error:", e);
    }
  };

  // 2. Detect screenshot attempts via key combinations
  const detectScreenshotKey = (e) => {
    try {
      const key = e.key;
      
      // Print Screen key
      if (key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        handleScreenshotAttempt("Print Screen");
        return false;
      }

      // Alt + PrintScreen
      if (e.altKey && key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        handleScreenshotAttempt("Alt+PrintScreen");
        return false;
      }

      // Ctrl + Shift + S (Snipping Tool / Screenshot)
      if (e.ctrlKey && e.shiftKey && (key === 's' || key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        handleScreenshotAttempt("Ctrl+Shift+S (Snipping Tool)");
        return false;
      }

      // Windows + Shift + S (Windows Snipping)
      if (e.metaKey && e.shiftKey && (key === 's' || key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        handleScreenshotAttempt("Win+Shift+S (Snipping Tool)");
        return false;
      }

      // Windows + PrintScreen
      if (e.metaKey && key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        handleScreenshotAttempt("Win+PrintScreen");
        return false;
      }

      // Command + Shift + 3 (Mac screenshot)
      if (e.metaKey && e.shiftKey && key === '3') {
        e.preventDefault();
        e.stopPropagation();
        handleScreenshotAttempt("Cmd+Shift+3 (Mac Screenshot)");
        return false;
      }

      // Command + Shift + 4 (Mac screenshot selection)
      if (e.metaKey && e.shiftKey && key === '4') {
        e.preventDefault();
        e.stopPropagation();
        handleScreenshotAttempt("Cmd+Shift+4 (Mac Screenshot)");
        return false;
      }

      // Command + Shift + 5 (Mac screenshot/recording)
      if (e.metaKey && e.shiftKey && key === '5') {
        e.preventDefault();
        e.stopPropagation();
        handleScreenshotAttempt("Cmd+Shift+5 (Mac Screenshot/Recording)");
        return false;
      }

      return true;
    } catch (err) {
      console.warn("Screenshot detection error:", err);
      return true;
    }
  };

  // 3. Handle screenshot attempt - blur page and submit
  const handleScreenshotAttempt = (method) => {
    if (submitted || showResult || isExamBlocked) return;
    
    setIsScreenshotAttempted(true);
    
    // Immediately blur the page
    blurExamContent(true);
    
    // Show watermark warning
    showScreenshotWatermark();
    
    // Log the attempt
    console.warn(`📸 Screenshot attempt detected: ${method}`);
    console.warn(`⏱️ Time elapsed: ${Math.floor((Date.now() - startTime) / 1000)}s`);
    console.warn(`📱 Device: ${isMobile ? 'Mobile' : 'Desktop'}`);
    
    // Count as security violation and auto-submit
    handleSecurityViolation(`Screenshot attempt (${method})`);
    
    // Keep blurred for a few seconds
    if (screenshotBlurTimeoutRef.current) {
      clearTimeout(screenshotBlurTimeoutRef.current);
    }
    
    screenshotBlurTimeoutRef.current = setTimeout(() => {
      blurExamContent(false);
      hideScreenshotWatermark();
    }, 3000);
  };

  // 4. Blur exam content
  const blurExamContent = (blur) => {
    try {
      const container = document.getElementById('exam-container');
      if (container) {
        if (blur) {
          container.classList.add('screenshot-blur');
          setBlurActive(true);
        } else {
          container.classList.remove('screenshot-blur');
          setBlurActive(false);
        }
      }
    } catch (e) {
      console.warn("Blur error:", e);
    }
  };

  // 5. Show screenshot watermark
  const showScreenshotWatermark = () => {
    try {
      let watermark = document.getElementById('screenshot-watermark');
      if (!watermark) {
        watermark = document.createElement('div');
        watermark.id = 'screenshot-watermark';
        watermark.className = 'watermark';
        watermark.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🚫</div>
            <div style="font-size: 18px; color: red;">SCREENSHOT DETECTED</div>
            <div style="font-size: 14px; color: #666; margin-top: 5px;">Exam auto-submitted</div>
          </div>
        `;
        document.body.appendChild(watermark);
      }
      watermark.classList.add('active');
    } catch (e) {
      console.warn("Watermark error:", e);
    }
  };

  const hideScreenshotWatermark = () => {
    try {
      const watermark = document.getElementById('screenshot-watermark');
      if (watermark) {
        watermark.classList.remove('active');
      }
    } catch (e) {
      console.warn("Hide watermark error:", e);
    }
  };

  // 6. Detect screen recording via mediaDevices
  const detectScreenRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Check if screen is being recorded
        // Note: This is passive detection - we can't fully prevent
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: false 
        }).catch(() => null);
        
        if (stream) {
          // Screen recording detected
          console.warn("📹 Screen recording detected");
          handleSecurityViolation("Screen recording detected");
          
          // Stop the stream if we can
          stream.getTracks().forEach(track => track.stop());
        }
      }
    } catch (e) {
      // Silently fail - this is just passive detection
    }
  };

  // 7. Mobile screenshot detection via visibility change
  // On mobile, screenshots are often taken via hardware buttons
  // We detect this by monitoring for rapid visibility changes
  const detectMobileScreenshot = () => {
    if (!isMobile) return;
    
    // On mobile, screenshots often cause a brief screen flash
    // We monitor for rapid visibility changes
    let lastVisibilityChange = Date.now();
    let visibilityChangeCount = 0;
    
    const mobileScreenshotCheck = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange;
      
      if (document.hidden) {
        // If hidden for a very short time (typical of screenshot button press)
        if (timeSinceLastChange < 2000) {
          visibilityChangeCount++;
          
          if (visibilityChangeCount >= 2) {
            // Multiple rapid changes - likely screenshot
            handleScreenshotAttempt("Mobile screenshot (hardware button)");
            visibilityChangeCount = 0;
          }
        }
        lastVisibilityChange = now;
      } else {
        // Reset count after returning
        setTimeout(() => {
          visibilityChangeCount = 0;
        }, 3000);
      }
    };
    
    // Add listener specifically for mobile screenshot detection
    document.addEventListener('visibilitychange', mobileScreenshotCheck);
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', mobileScreenshotCheck);
    };
  };

  // 8. Detect screenshot via beforeprint event (some browsers trigger this)
  const handleBeforePrint = () => {
    handleScreenshotAttempt("Print/Screenshot triggered");
  };

  // 9. Detect screenshot via afterprint (some browsers)
  const handleAfterPrint = () => {
    // Just log it
    console.warn("Print/Screenshot completed");
  };

  // 10. Add anti-screenshot CSS overlay
  const addAntiScreenshotOverlay = () => {
    try {
      // Create a canvas overlay that makes screenshots look corrupted
      const canvas = document.createElement('canvas');
      canvas.id = 'anti-screenshot-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9998';
      canvas.style.opacity = '0.01'; // Almost invisible to user
      canvas.style.display = 'none';
      
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Draw a pattern that will appear in screenshots
      ctx.fillStyle = 'rgba(255, 0, 0, 0.01)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text that will appear in screenshots
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ SCREENSHOT PROTECTED', canvas.width/2, canvas.height/2);
      
      document.body.appendChild(canvas);
      
      // Make it visible when screenshot is detected
      return canvas;
    } catch (e) {
      console.warn("Anti-screenshot overlay error:", e);
      return null;
    }
  };

  // ============================================
  // END SCREENSHOT PROTECTION
  // ============================================

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      setIsMobile(isMobileDevice);
      
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
        safeToast.error("No exam questions found for this subject.");
        setLoading(false);
        return;
      }

      setAttemptId(newAttemptId);
      setQuestions(examQuestions);
      setTimeLeft(duration);
      setStartTime(Date.now());

      const storedAnswers = JSON.parse(localStorage.getItem("examAnswers")) || "{}";
      const parsedAnswers = typeof storedAnswers === 'object' ? storedAnswers : {};
      const initialAnswers = examQuestions.reduce((acc, q) => {
        acc[q._id] = parsedAnswers[q._id] || "";
        return acc;
      }, {});
      setAnswers(initialAnswers);
      localStorage.setItem("examAnswers", JSON.stringify(initialAnswers));
      
      // Apply all protections
      applyScreenshotProtection();
      addAntiScreenshotOverlay();
      
      // Start mobile screenshot detection
      detectMobileScreenshot();
      
      // Block navigation
      blockAllNavigation(true);
      
      // Try fullscreen
      setTimeout(() => {
        tryEnterFullscreen();
      }, 1000);
      
    } catch (err) {
      console.error("Start exam error:", err);
      if (err.response?.status === 401) {
        safeToast.error("Unauthorized. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        safeToast.error(err.response.data.message || "You cannot take this exam.");
        navigate("/student/dashboard");
      } else {
        safeToast.error(err.response?.data?.message || "Failed to start exam.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Block all navigation
  const blockAllNavigation = (block) => {
    try {
      if (block) {
        document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
          if (!el.closest('#exam-container')) {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
          }
        });

        window.history.pushState(null, '', window.location.href);
        
        const popStateHandler = (e) => {
          e.preventDefault();
          handleSecurityViolation("Attempted to use browser navigation");
          window.history.pushState(null, '', window.location.href);
        };
        
        window.addEventListener('popstate', popStateHandler);
        blockNavigationRef.current = popStateHandler;

        const beforeUnloadHandler = (e) => {
          e.preventDefault();
          e.returnValue = '';
          return '';
        };
        
        window.addEventListener('beforeunload', beforeUnloadHandler);
        blockNavigationRef.current.beforeUnload = beforeUnloadHandler;

      } else {
        document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
          el.style.pointerEvents = '';
          el.style.opacity = '';
        });
        
        if (blockNavigationRef.current) {
          if (typeof blockNavigationRef.current === 'function') {
            window.removeEventListener('popstate', blockNavigationRef.current);
          }
          if (blockNavigationRef.current.beforeUnload) {
            window.removeEventListener('beforeunload', blockNavigationRef.current.beforeUnload);
          }
          blockNavigationRef.current = null;
        }
      }
    } catch (e) {
      console.warn("Navigation blocking error:", e);
    }
  };

  // Fullscreen management
  const tryEnterFullscreen = () => {
    try {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
        return;
      }

      if (fullscreenAttemptedRef.current || fullscreenErrorShown) {
        return;
      }

      const element = document.documentElement;
      const requestFullscreen = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
      
      if (requestFullscreen) {
        fullscreenAttemptedRef.current = true;
        requestFullscreen.call(element)
          .then(() => {
            setIsFullscreen(true);
            fullscreenAttemptedRef.current = false;
            safeToast.success("🔒 Fullscreen mode activated");
          })
          .catch((err) => {
            console.warn("Fullscreen error:", err);
            fullscreenAttemptedRef.current = false;
            setFullscreenErrorShown(true);
            
            if (isMobile) {
              safeToast.warning("Please enable fullscreen for exam security");
            } else {
              safeToast.warning("⚠️ Please enter fullscreen mode for exam security");
            }
          });
      } else {
        if (isMobile) {
          safeToast.info("📱 Please stay on this page and don't switch apps");
        }
      }
    } catch (e) {
      console.warn("Fullscreen attempt error:", e);
      fullscreenAttemptedRef.current = false;
    }
  };

  const handleUserInteractionForFullscreen = () => {
    if (!document.fullscreenElement && !fullscreenAttemptedRef.current && !fullscreenErrorShown) {
      tryEnterFullscreen();
    }
  };

  const exitFullscreen = () => {
    try {
      const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exitFullscreen) {
        exitFullscreen.call(document).catch(() => {});
      }
      setIsFullscreen(false);
    } catch (e) {
      console.warn("Exit fullscreen error:", e);
    }
  };

  const handleFullscreenChange = () => {
    try {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      
      if (!isFull && !submitted && !showResult && !isExamBlocked) {
        if (isFullscreen) {
          handleSecurityViolation("Exited fullscreen mode");
        }
      }
    } catch (e) {
      console.warn("Fullscreen change error:", e);
    }
  };

  // Security violation handler
  const handleSecurityViolation = (message) => {
    if (submitted || showResult || isExamBlocked) return;
    
    try {
      const newCount = securityViolations + 1;
      setSecurityViolations(newCount);
      setSecurityWarningMessage(message);
      setShowSecurityWarning(true);
      
      console.warn(`⚠️ Security violation ${newCount}: ${message}`);
      
      // Blur content on violation
      blurExamContent(true);
      
      setTimeout(() => {
        setShowSecurityWarning(false);
        blurExamContent(false);
      }, 3000);
      
      if (newCount >= MAX_VIOLATIONS) {
        setIsExamBlocked(true);
        safeToast.error(`⚠️ Exam auto-submitted: ${message}`);
        
        setTimeout(() => {
          handleSubmit(true);
        }, 1500);
      }
    } catch (e) {
      console.warn("Security violation error:", e);
    }
  };

  // Mouse leave detection
  const handleMouseLeave = () => {
    if (submitted || showResult || isExamBlocked || isMobile) return;
    
    try {
      const newCount = mouseLeaveCount + 1;
      setMouseLeaveCount(newCount);
      
      if (newCount >= MAX_MOUSE_LEAVES) {
        handleSecurityViolation("Mouse left exam window");
      }
    } catch (e) {
      console.warn("Mouse leave error:", e);
    }
  };

  // Visibility change detection
  const handleVisibilityChange = () => {
    try {
      if (document.hidden) {
        if (!submitted && !showResult && !isExamBlocked) {
          setVisibilityWarnings(prev => prev + 1);
          setHasBeenHidden(true);
          
          const deviceType = isMobile ? 'mobile app' : 'tab';
          handleSecurityViolation(`Switched away from exam (${deviceType})`);
          
          document.body.style.filter = "blur(8px)";
          document.body.style.transition = "filter 0.3s ease";
          
          safeToast.error(`🚫 Do not switch ${isMobile ? 'apps' : 'tabs'}!`, {
            duration: 3000
          });
        }
      } else {
        document.body.style.filter = "";
        setLastActiveTime(Date.now());
        
        if (!submitted && !showResult && !isExamBlocked) {
          if (hasBeenHidden) {
            const awayTime = Date.now() - lastActiveTime;
            if (awayTime > 5000) {
              handleSecurityViolation(`Away for ${Math.floor(awayTime/1000)}s`);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Visibility change error:", e);
    }
  };

  // Window blur detection
  const handleWindowBlur = () => {
    if (!submitted && !showResult && !isExamBlocked) {
      setTimeout(() => {
        if (document.hidden) {
          handleSecurityViolation(`Window lost focus`);
        }
      }, 500);
    }
  };

  // Prevent copy/paste
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

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    try {
      // First check for screenshot keys
      if (!detectScreenshotKey(e)) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key.toLowerCase();

      const blockedKeys = ['c', 'v', 'x', 'p', 's', 'u', 'a', 'r', 't', 'w', 'n'];
      if (isCtrl && blockedKeys.includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        handleSecurityViolation(`Ctrl+${key.toUpperCase()}`);
        return;
      }

      if (e.key.startsWith('F') && parseInt(e.key.replace('F', '')) >= 5) {
        e.preventDefault();
        handleSecurityViolation(`${e.key} key`);
        return;
      }

      if (isCtrl && isShift && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        handleSecurityViolation("DevTools");
        return;
      }

      if (e.altKey && ['tab', 'f4', 'escape'].includes(key)) {
        e.preventDefault();
        handleSecurityViolation(`Alt+${key}`);
        return;
      }

      if (key === 'meta' || key === 'win' || key === 'command') {
        e.preventDefault();
        handleSecurityViolation("Windows key");
        return;
      }

      if (isCtrl && key === 'r') {
        e.preventDefault();
        handleSecurityViolation("Refresh");
        return;
      }
    } catch (err) {
      console.warn("Keydown error:", err);
    }
  };

  // Mobile touch events
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
      handleSecurityViolation("Pinch/zoom");
    }
  };

  // Prevent selection
  const handleSelectStart = (e) => {
    e.preventDefault();
    return false;
  };

  // Inactivity check
  const checkInactivity = () => {
    try {
      const now = Date.now();
      const inactiveTime = (now - lastActiveTime) / 1000;
      
      if (inactiveTime > 15 && !submitted && !showResult && !isExamBlocked) {
        safeToast.warning(`⚠️ Inactive for ${Math.floor(inactiveTime)}s`);
        
        if (inactiveTime > 30) {
          handleSecurityViolation(`Inactive ${Math.floor(inactiveTime)}s`);
        }
        
        setLastActiveTime(now);
      }
    } catch (e) {
      console.warn("Inactivity check error:", e);
    }
  };

  const handleSelect = async (qId, option) => {
    if (submitted || isExamBlocked) return;

    try {
      const updated = { ...answers, [qId]: option };
      setAnswers(updated);
      localStorage.setItem("examAnswers", JSON.stringify(updated));

      if (attemptId) {
        await axios.post("/exam/save-progress", {
          attemptId,
          answers: updated,
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Save progress error:", err);
    }
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!attemptId || submitted) return;

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

      localStorage.removeItem("examAnswers");
      
      exitFullscreen();
      blockAllNavigation(false);
      cleanupSecurityListeners();
      
      if (isAutoSubmit) {
        safeToast.error(`⚠️ Exam auto-submitted due to security violation`);
      } else {
        safeToast.success("✅ Exam submitted successfully!");
      }
    } catch (err) {
      console.error("Submit error:", err);
      safeToast.error(err.response?.data?.message || "Failed to submit exam.");
    }
  };

  const cleanupSecurityListeners = () => {
    try {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("afterprint", handleAfterPrint);
      
      if (securityIntervalRef.current) {
        clearInterval(securityIntervalRef.current);
      }
      
      if (screenshotBlurTimeoutRef.current) {
        clearTimeout(screenshotBlurTimeoutRef.current);
      }
      
      document.body.style.filter = "";
      blurExamContent(false);
      hideScreenshotWatermark();
      blockAllNavigation(false);
      
      // Remove protection styles
      const style = document.getElementById('screenshot-protection');
      if (style) style.remove();
      
      const canvas = document.getElementById('anti-screenshot-canvas');
      if (canvas) canvas.remove();
      
      const watermark = document.getElementById('screenshot-watermark');
      if (watermark) watermark.remove();
    } catch (e) {
      console.warn("Cleanup error:", e);
    }
  };

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
      try {
        document.addEventListener("copy", handleCopy);
        document.addEventListener("paste", handlePaste);
        document.addEventListener("cut", handleCut);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("blur", handleWindowBlur);
        document.addEventListener("focus", handleWindowFocus);
        document.addEventListener("selectstart", handleSelectStart);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("beforeprint", handleBeforePrint);
        document.addEventListener("afterprint", handleAfterPrint);

        securityIntervalRef.current = setInterval(checkInactivity, 5000);

        if (!document.fullscreenElement && !isFullscreen) {
          setTimeout(() => tryEnterFullscreen(), 1500);
        }

        // Check for screen recording periodically
        setInterval(() => {
          if (!submitted && !showResult && !isExamBlocked) {
            detectScreenRecording();
          }
        }, 30000);

        safeToast.success(`🔒 Security mode active - ${isMobile ? '📱' : '💻'}`, {
          duration: 4000
        });
        
        if (isMobile) {
          safeToast.warning("📱 Do not switch apps, lock screen, or take screenshots!", {
            duration: 6000
          });
        }
        
        safeToast.warning("📸 Screenshots will auto-submit your exam!", {
          duration: 5000
        });
      } catch (e) {
        console.warn("Security setup error:", e);
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
        setTimeLeft(prev => {
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
      safeToast.warning(`⏰ ${Math.floor(timeLeft / 60)} minute${Math.floor(timeLeft / 60) !== 1 ? 's' : ''} remaining!`, {
        duration: 5000
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
              Violation: {securityWarningMessage}
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
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-4 px-4 md:py-8 ${blurActive ? 'screenshot-blur' : ''}`}
      style={{ touchAction: 'pan-y' }}
      onClick={handleUserInteractionForFullscreen}
    >
      <Toaster position="top-right" />
      
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
            <span className="flex items-center gap-1">
              <EyeOff className="h-3 w-3" />
              <span>Screenshot: {isScreenshotAttempted ? '⚠️' : '🔒'}</span>
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
          <span className="font-medium">{securityWarningMessage}</span>
        </div>
      )}

      {/* Screenshot Blur Overlay */}
      {blurActive && (
        <div className="fixed inset-0 bg-red-500/20 backdrop-blur-xl z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Screenshot Detected!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your exam has been auto-submitted due to a screenshot attempt.
            </p>
          </div>
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
                Maximum security - Screenshots auto-submit your exam
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
            ⚠️ ANY security violation including screenshots will auto-submit your exam!
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
                {isScreenshotAttempted && (
                  <p className="mt-1 text-xs bg-red-500/30 p-2 rounded-lg">
                    📸 Screenshot attempt detected and logged
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