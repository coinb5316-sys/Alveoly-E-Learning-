// StudentSubjects.jsx - Fully updated with proper socket initialization
import { useEffect, useState } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { initializeSocket } from "../config/socket";
import { useAuth } from "../context/AuthContext";
import {
  Lock,
  CheckCircle,
  Play,
  BookOpen,
  GraduationCap,
  Clock,
  Star,
  TrendingUp,
  Zap,
  Sparkles,
  Crown,
  ChevronRight,
  AlertCircle,
  Loader2,
  CreditCard,
  Shield
} from "lucide-react";

const StudentSubjects = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [courseId, setCourseId] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [socket, setSocket] = useState(null);

  const [payments, setPayments] = useState([]);
  const [now, setNow] = useState(new Date());
  const [manualAccess, setManualAccess] = useState([]);

  // ================= LIVE TIMER =================
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ================= FETCH MANUAL ACCESS =================
  useEffect(() => {
    const fetchManualAccess = async () => {
      try {
        const res = await axios.get("/manual-access/mine");
        setManualAccess(res.data || []);
      } catch (err) {
        console.error("Error fetching manual access:", err);
      }
    };
    fetchManualAccess();
  }, []);

  // ================= GET COURSE =================
  useEffect(() => {
    const courseFromUrl = new URLSearchParams(search).get("course");

    if (courseFromUrl) {
      setCourseId(courseFromUrl);
      const fetchCourseName = async () => {
        try {
          const res = await axios.get(`/courses/${courseFromUrl}`);
          setCourseName(res.data.name);
        } catch (err) {
          console.error("Error fetching course name:", err);
          setCourseName("Course");
        }
      };
      fetchCourseName();
    } else if (user?.courseId) {
      if (typeof user.courseId === "string") {
        setCourseId(user.courseId);
        setCourseName(user.courseIdName || "My Course");
      } else if (user.courseId?._id) {
        setCourseId(user.courseId._id);
        setCourseName(user.courseId.name);
      }
    }
  }, [user, search]);

  // ================= FETCH PAYMENTS =================
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("/payments/mine");
        setPayments(res.data || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
      }
    };
    fetchPayments();
  }, []);

  // ================= ACCESS LOGIC =================
  const hasActivePlan = () => {
    return payments.some(
      (p) =>
        p.status === "success" &&
        p.planId &&
        p.expiresAt &&
        new Date(p.expiresAt) > now
    );
  };

  const isSubjectUnlocked = (subject) => {
    if (subject.isUnlocked !== undefined) {
      return subject.isUnlocked;
    }

    if (!subject.isPaid) return true;
    if (hasActivePlan()) return true;

    const subjectPayment = payments.find(
      (p) =>
        p.status === "success" &&
        p.subjectId?.toString() === subject._id.toString() &&
        new Date(p.expiresAt) > now
    );

    const manual = manualAccess.find(
      (m) =>
        m.subjectId?.toString() === subject._id.toString() &&
        m.isActive &&
        new Date(m.expiresAt) > now
    );

    return !!subjectPayment || !!manual;
  };

  // ================= FETCH SUBJECTS WITH SOCKET =================
  useEffect(() => {
    if (!courseId) {
      setFetching(false);
      return;
    }

    // Initialize socket
    const newSocket = initializeSocket();
    setSocket(newSocket);

    const fetchSubjects = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`/subjects?course=${courseId}`);
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjects([]);
      } finally {
        setFetching(false);
      }
    };

    fetchSubjects();

    // Socket event listeners
    newSocket.on("subject:created", (subj) => {
      if (subj.courseId?.toString() === courseId) {
        setSubjects((prev) => [subj, ...prev]);
      }
    });

    newSocket.on("subject:updated", (subj) => {
      setSubjects((prev) =>
        prev.map((s) => (s._id === subj._id ? subj : s))
      );
    });

    newSocket.on("subject:deleted", (_id) => {
      setSubjects((prev) => prev.filter((s) => s._id !== _id));
    });

    newSocket.on("manualAccess:updated", () => {
      // Refresh manual access
      axios.get("/manual-access/mine").then((res) => {
        setManualAccess(res.data || []);
      });
      // Refresh subjects to update unlock status
      axios.get(`/subjects?course=${courseId}`).then((res) => {
        setSubjects(res.data || []);
      });
    });

    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.off("subject:created");
        newSocket.off("subject:updated");
        newSocket.off("subject:deleted");
        newSocket.off("manualAccess:updated");
      }
    };
  }, [courseId]);

  // ================= PAYMENT =================
  const handleUnlock = async (subject) => {
    try {
      setLoading(true);
      const res = await axios.post("/payments/initiate", {
        subjectId: subject._id,
      });
      if (res.data?.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const unlockedCount = subjects.filter(s => isSubjectUnlocked(s)).length;
  const lockedCount = subjects.filter(s => !isSubjectUnlocked(s) && s.isPaid).length;
  const freeCount = subjects.filter(s => !s.isPaid).length;

  // Helper function to truncate text
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <GraduationCap className="h-4 w-4" />
            <span>Course</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] md:max-w-none">
              {courseName || "Loading..."}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Subjects & Modules
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a subject to start learning, practice, or take exams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {subjects.length} Subjects
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {subjects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {subjects.length}
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
                <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
                  {freeCount}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {fetching && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">Loading subjects...</p>
        </div>
      )}

      {/* Empty State */}
      {!fetching && subjects.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Subjects Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Subjects for this course will appear here once they're added.
            </p>
            <button
              onClick={() => navigate("/student/courses")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Courses
            </button>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {!fetching && subjects.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const unlocked = isSubjectUnlocked(subject);
            
            return (
              <div
                key={subject._id}
                onMouseEnter={() => setHoveredSubject(subject._id)}
                onMouseLeave={() => setHoveredSubject(null)}
                className={`group relative rounded-xl border transition-all duration-300 overflow-hidden flex flex-col ${
                  unlocked
                    ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
                }`}
              >
                {/* Badges - Positioned properly to avoid text overlap */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
                  {subject.isPaid && !unlocked && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg whitespace-nowrap">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}

                  {subject.isPaid && unlocked && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-500 text-white rounded-full shadow-lg whitespace-nowrap">
                      <CheckCircle className="h-3 w-3" />
                      Unlocked
                    </span>
                  )}

                  {!subject.isPaid && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full shadow-lg whitespace-nowrap">
                      <Zap className="h-3 w-3" />
                      Free
                    </span>
                  )}
                </div>

                <div className="p-5 relative z-10 flex-1 flex flex-col">
                  {/* Icon and Title - Improved layout */}
                  <div className="flex items-start gap-3 mb-3 pr-16">
                    {/* Icon - smaller on mobile */}
                    <div className={`flex-shrink-0 ${!unlocked && 'opacity-50'}`}>
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
                        unlocked 
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110" 
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      }`}>
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    {/* Title area with proper text wrapping */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-base leading-tight break-words ${unlocked ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {subject.name}
                      </h3>
                      {subject.isPaid && (
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                          <CreditCard className="h-3 w-3 flex-shrink-0" />
                          <span>₵{subject.price}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description - with truncation for long text */}
                  <p className={`text-sm mb-4 line-clamp-2 ${unlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    Master {truncateText(subject.name, 30)} with comprehensive study materials, practice questions, and mock exams.
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-auto">
                    {!unlocked && subject.isPaid ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleUnlock(subject)}
                          disabled={loading}
                          className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              Unlock for ₵{subject.price}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => navigate("/student/plans")}
                          className="w-full py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
                        >
                          Or get full access plan
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : !unlocked && !subject.isPaid ? (
                      <button
                        onClick={() => navigate(`/student/lessons/${subject._id}`)}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Play className="h-4 w-4" />
                        Start Learning
                      </button>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => navigate(`/student/lessons/${subject._id}`)}
                          className="py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all flex items-center justify-center gap-1"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span className="hidden sm:inline">Lessons</span>
                          <span className="sm:hidden">Learn</span>
                        </button>
                        <button
                          onClick={() => navigate(`/student/exams/${courseId}/${subject._id}`)}
                          className="py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-all flex items-center justify-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Exam
                        </button>
                        <button
                          onClick={() => navigate(`/student/trial/${courseId}/${subject._id}`)}
                          className="py-1.5 rounded-lg bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-xs font-medium transition-all flex items-center justify-center gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          <span className="hidden sm:inline">Practice</span>
                          <span className="sm:hidden">Test</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress indicator */}
                {unlocked && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
                    <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade Banner */}
      {lockedCount > 0 && !hasActivePlan() && (
        <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Unlock All Subjects</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Get access to all {lockedCount} premium subjects with our subscription plans
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/student/plans")}
              className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
            >
              View Plans
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSubjects;