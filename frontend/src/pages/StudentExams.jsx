// StudentExams.jsx - Fixed version
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import socket from "../config/socket";
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
  Timer
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

  const current = questions[currentIndex];

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

  useEffect(() => {
    if (!courseId || !subjectId) return;

    startExam();

    socket.on("question:created", startExam);
    socket.on("question:updated", startExam);
    socket.on("question:deleted", startExam);

    const visibilityHandler = () => {
      if (document.hidden) {
        document.body.style.filter = "blur(6px)";
        toast.error("Tab switched! Stay focused ⚠️");
      } else {
        document.body.style.filter = "";
      }
    };

    const contextMenuHandler = (e) => {
      if (!document.hidden) {
        e.preventDefault();
        toast.error("Right-click disabled during exam");
      }
    };

    document.addEventListener("visibilitychange", visibilityHandler);
    document.addEventListener("contextmenu", contextMenuHandler);

    return () => {
      socket.off("question:created", startExam);
      socket.off("question:updated", startExam);
      socket.off("question:deleted", startExam);
      document.removeEventListener("visibilitychange", visibilityHandler);
      document.removeEventListener("contextmenu", contextMenuHandler);
      document.body.style.filter = "";
    };
  }, [courseId, subjectId]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted && !loading) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && !submitted && questions.length > 0 && !loading) {
      handleSubmit();
    }
  }, [timeLeft, submitted, questions, loading]);

  useEffect(() => {
    if (timeLeft <= 60 && timeLeft > 0 && !warningShown && !submitted) {
      setWarningShown(true);
      toast.warning(`Only ${Math.floor(timeLeft / 60)} minute${Math.floor(timeLeft / 60) !== 1 ? 's' : ''} remaining!`, {
        duration: 5000,
        icon: '⏰'
      });
    }
  }, [timeLeft, warningShown, submitted]);

  const handleSelect = async (qId, option) => {
    if (submitted) return;

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

  const handleSubmit = async () => {
    if (!attemptId) return;

    try {
      const res = await axios.post("/exam/submit", {
        attemptId,
        answers,
      });

      setSubmitted(true);
      setScoreData({
        score: res.data.score,
        percentage: res.data.percentage,
        questionResults: res.data.questionResults || []
      });
      setShowResult(true);

      localStorage.removeItem("examAnswers");
      toast.success("Exam submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit exam.");
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading exam...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Exam Mode
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Read each question carefully and select the best answer
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Per Question</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {Math.floor(timeLeft / questions.length)}s
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
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
            <div className="p-6">
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
                    onClick={handleSubmit}
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