// StudentTrial.jsx - Fixed results view with proper data handling
import { useState, useEffect } from "react";
import axios from "../api/axios";
import socket from "../config/socket";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  HelpCircle,
  Loader2,
  Zap,
  BookOpen,
  Target,
  BarChart3,
  RotateCcw,
  ChevronRight
} from "lucide-react";

const StudentTrial = () => {
  const { user } = useAuth();
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  const current = questions[currentIndex];

  // ================= FETCH =================
  const fetchQuestions = async () => {
    try {
      if (!subjectId || !courseId) return;

      const res = await axios.get(
        `/questions?subjectId=${subjectId}&courseId=${courseId}`
      );

      const trials = res.data.filter((q) => q.type === "trial");
      setQuestions(trials);
      
      setAnswers({});
      setSubmitted(false);
      setTime(0);
      setResultData(null);
      setSelectedQuestionIndex(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions");
    }
  };

  useEffect(() => {
    fetchQuestions();

    socket.on("question:created", fetchQuestions);
    socket.on("question:updated", fetchQuestions);
    socket.on("question:deleted", fetchQuestions);

    return () => {
      socket.off("question:created", fetchQuestions);
      socket.off("question:updated", fetchQuestions);
      socket.off("question:deleted", fetchQuestions);
    };
  }, [subjectId, courseId]);

  // ================= TIMER =================
  useEffect(() => {
    if (submitted) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted]);

  // ================= SELECT =================
  const handleSelect = (qId, optionLetter, optionText) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [qId]: { letter: optionLetter, text: optionText }
    }));
  };

  // ================= NAV =================
  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // ================= SUBMIT =================
  const submitTrial = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error("Please answer at least one question.");
      return;
    }

    // Format answers for backend - send the text answers, not letters
    const formattedAnswers = {};
    Object.keys(answers).forEach(qId => {
      formattedAnswers[qId] = answers[qId].text;
    });

    try {
      setSubmitting(true);

      const res = await axios.post("/trial/submit", {
        subjectId,
        courseId,
        answers: formattedAnswers,
        duration: time,
      });

      setResultData(res.data.attempt);
      setSubmitted(true);
      toast.success("Trial submitted successfully!");
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error(err.response?.data?.message || "Failed to submit trial.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;
  
  // Use resultData for score if available, otherwise calculate from answers
  const score = resultData?.score || Object.keys(answers).filter(qId => {
    const userAnswer = answers[qId];
    const question = questions.find(q => q._id === qId);
    return userAnswer?.text?.toLowerCase().trim() === question?.correctAnswer?.toLowerCase().trim();
  }).length;
  
  const percentage = resultData?.percentage || (questions.length ? Math.round((score / questions.length) * 100) : 0);

  const getPerformanceDetails = () => {
    if (percentage >= 80) return { text: "Excellent", color: "text-green-600", bg: "bg-gradient-to-r from-green-600 to-emerald-600" };
    if (percentage >= 60) return { text: "Good", color: "text-blue-600", bg: "bg-gradient-to-r from-blue-600 to-purple-600" };
    if (percentage >= 50) return { text: "Average", color: "text-yellow-600", bg: "bg-gradient-to-r from-yellow-500 to-orange-500" };
    if (percentage > 0) return { text: "Needs Improvement", color: "text-orange-600", bg: "bg-gradient-to-r from-orange-500 to-red-500" };
    return { text: "Not Started", color: "text-gray-600", bg: "bg-gradient-to-r from-gray-500 to-gray-600" };
  };

  const performanceDetails = getPerformanceDetails();

  // Loading state
  if (questions.length === 0 && !submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading questions...</p>
      </div>
    );
  }

  // No questions state
  if (!current && questions.length === 0 && !submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <BookOpen className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Questions Available</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          No trial questions found for this subject. Please check back later.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Active quiz view
  if (!submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
        <Toaster position="top-right" />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Trial Practice
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Test your knowledge with practice questions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatTime(time)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {answeredCount} of {questions.length} answered
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Progress: {Math.round(progress)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Remaining: {questions.length - answeredCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          {current && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <span className="font-bold text-sm">{currentIndex + 1}</span>
                    </div>
                    <span className="font-medium">Question {currentIndex + 1} of {questions.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-lg">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>{questions.length - answeredCount} unanswered</span>
                  </div>
                </div>
              </div>

              {/* Question Body */}
              <div className="p-6">
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-8 leading-relaxed">
                  {current.question}
                </p>

                <div className="space-y-3">
                  {current.options?.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const selected = answers[current._id]?.letter === letter;

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(current._id, letter, opt)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                          selected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                            selected
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50"
                          }`}>
                            {letter}
                          </div>
                          <span className={`flex-1 text-base ${selected ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
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
                      onClick={submitTrial}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Submit Trial
                        </>
                      )}
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

                {/* Question Navigator */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Quick navigation:</p>
                  <div className="flex flex-wrap gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered = answers[q._id];
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            isCurrent
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                              : isAnswered
                              ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
      </div>
    );
  }

  // Results View - After submission
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header with Gradient */}
        <div className={`rounded-2xl p-8 mb-8 text-white ${performanceDetails.bg}`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-4">
              <Award className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Trial Complete!</h1>
            <p className="text-white/80 max-w-md mx-auto">
              Here's a comprehensive breakdown of your performance
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 mb-3">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{score}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">out of {questions.length}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Total Score</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/30 mb-3">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{percentage}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Percentage</p>
            <p className={`text-xs mt-2 font-medium ${performanceDetails.color}`}>{performanceDetails.text}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/30 mb-3">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatTime(time)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Time Spent</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Total Duration</p>
          </div>
        </div>

        {/* Question Review Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Question Review</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review your answers and learn from mistakes</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Correct</span>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Incorrect</span>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
            {questions && questions.length > 0 ? questions.map((q, index) => {
              const userAnswer = answers[q._id];
              const isCorrect = userAnswer?.text?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim();
              
              return (
                <div 
                  key={q._id} 
                  className={`p-6 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                    selectedQuestionIndex === index ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => setSelectedQuestionIndex(selectedQuestionIndex === index ? null : index)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Question {index + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isCorrect 
                            ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        }`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                        {q.question}
                      </p>
                      
                      {selectedQuestionIndex === index && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Answer:</p>
                              <p className={`text-base ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {userAnswer?.letter}. {userAnswer?.text || 'Not answered'}
                              </p>
                            </div>
                            {!isCorrect && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Correct Answer:</p>
                                <p className="text-base text-green-600 dark:text-green-400">
                                  {q.correctAnswer}
                                </p>
                              </div>
                            )}
                            {q.rationale && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Explanation:</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {q.rationale}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuestionIndex(selectedQuestionIndex === index ? null : index);
                      }}
                    >
                      <ChevronRight className={`h-5 w-5 transition-transform ${selectedQuestionIndex === index ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">No questions available for review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setTime(0);
              setCurrentIndex(0);
              setResultData(null);
              setSelectedQuestionIndex(null);
              fetchQuestions();
            }}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Practice
          </button>
          <button
            onClick={() => navigate("/student/progress")}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTrial;