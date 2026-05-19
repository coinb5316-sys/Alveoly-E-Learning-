// StudentTrial.jsx - Premium Professional Version with AI Integration
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "../api/axios";
import { getSocket } from "../config/socket";
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
  ChevronRight,
  Brain,
  Sparkles,
  Lightbulb,
  Shield,
  Crown,
  Star,
  Flag,
  Timer,
  AlertCircle,
  ThumbsUp,
  GraduationCap,
  MessagesSquare,
  Volume2,
  FileText
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

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
  const [loading, setLoading] = useState(true);
  
  // AI States
  const [aiAssistance, setAiAssistance] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiHint, setShowAiHint] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [performancePrediction, setPerformancePrediction] = useState(null);

  const current = questions[currentIndex];

  // Fetch questions with AI-enhanced loading
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      if (!subjectId || !courseId) return;

      const res = await axios.get(
        `/questions?subjectId=${subjectId}&courseId=${courseId}`
      );

      const trials = res.data.filter((q) => q.type === "trial" && q.status === "approved");
      setQuestions(trials);
      
      // Reset states
      setAnswers({});
      setSubmitted(false);
      setTime(0);
      setResultData(null);
      setSelectedQuestionIndex(null);
      setAiAssistance(null);
      setAiSuggestions([]);
      
      // Fetch AI suggestions for this subject
      if (trials.length > 0) {
        fetchAISuggestions(trials[0].subjectId || subjectId);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [subjectId, courseId]);

  // Fetch AI learning suggestions
  const fetchAISuggestions = async (subjId) => {
    try {
      const res = await axios.get(`/ai/subject-suggestions/${subjId}`);
      setAiSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error("AI suggestions error:", err);
    }
  };

  // Get AI assistance for current question
  const getAIAssistance = async () => {
    if (!current) return;
    
    setAiLoading(true);
    setShowAiHint(true);
    
    try {
      const res = await axios.post("/ai/question-assist", {
        question: current.question,
        options: current.options,
        context: "nursing education, multiple choice practice"
      });
      
      setAiAssistance({
        hint: res.data.hint,
        explanation: res.data.explanation,
        confidence: res.data.confidence,
        relatedTopics: res.data.relatedTopics
      });
    } catch (err) {
      setAiAssistance({
        hint: "Consider the key concepts and eliminate obviously incorrect options.",
        explanation: "Focus on understanding the underlying principle rather than memorizing.",
        confidence: 75,
        relatedTopics: ["Review core concepts", "Practice similar questions"]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Predict performance based on current answers
  const predictPerformance = useCallback(() => {
    const answered = Object.keys(answers).length;
    if (answered === 0) return null;
    
    const correctSoFar = Object.keys(answers).filter(qId => {
      const userAnswer = answers[qId];
      const question = questions.find(q => q._id === qId);
      return userAnswer?.text?.toLowerCase().trim() === question?.correctAnswer?.toLowerCase().trim();
    }).length;
    
    const currentAccuracy = (correctSoFar / answered) * 100;
    const projectedScore = (currentAccuracy * questions.length) / 100;
    
    return {
      currentAccuracy: Math.round(currentAccuracy),
      projectedScore: Math.round(projectedScore),
      trend: answered > 1 ? (correctSoFar / answered) > 0.6 ? "up" : "down" : "stable",
      recommendation: currentAccuracy >= 70 ? "Keep up the great work!" : "Focus on careful reading of each question."
    };
  }, [answers, questions]);

  useEffect(() => {
    fetchQuestions();

    const socket = getSocket();
    if (socket) {
      socket.on("question:created", fetchQuestions);
      socket.on("question:updated", fetchQuestions);
      socket.on("question:deleted", fetchQuestions);
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("question:created", fetchQuestions);
        socket.off("question:updated", fetchQuestions);
        socket.off("question:deleted", fetchQuestions);
      }
    };
  }, [subjectId, courseId, fetchQuestions]);

  // Update performance prediction
  useEffect(() => {
    const prediction = predictPerformance();
    setPerformancePrediction(prediction);
  }, [answers, predictPerformance]);

  // Timer effect
  useEffect(() => {
    if (submitted || loading || questions.length === 0) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted, loading, questions.length]);

  const handleSelect = (qId, optionLetter, optionText) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [qId]: { letter: optionLetter, text: optionText, timestamp: new Date() }
    }));
    
    // Clear AI assistance for this question after answering
    if (showAiHint) {
      setShowAiHint(false);
      setAiAssistance(null);
    }
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAiHint(false);
      setAiAssistance(null);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAiHint(false);
      setAiAssistance(null);
    }
  };

  const submitTrial = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error("Please answer at least one question.");
      return;
    }

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
      
      // Submit analytics to AI for future recommendations
      await axios.post("/ai/record-performance", {
        subjectId,
        score: res.data.attempt.percentage,
        duration: time,
        answers: Object.keys(answers).length
      }).catch(err => console.error("Analytics error:", err));
      
      toast.success("Trial submitted successfully! AI is analyzing your performance.");
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
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;
  
  const score = resultData?.score || Object.keys(answers).filter(qId => {
    const userAnswer = answers[qId];
    const question = questions.find(q => q._id === qId);
    return userAnswer?.text?.toLowerCase().trim() === question?.correctAnswer?.toLowerCase().trim();
  }).length;
  
  const percentage = resultData?.percentage || (questions.length ? Math.round((score / questions.length) * 100) : 0);

  const getPerformanceDetails = () => {
    if (percentage >= 90) return { text: "Outstanding", color: "text-emerald-600", bg: "bg-gradient-to-r from-emerald-600 to-teal-600", icon: Crown };
    if (percentage >= 80) return { text: "Excellent", color: "text-green-600", bg: "bg-gradient-to-r from-green-600 to-emerald-600", icon: Award };
    if (percentage >= 70) return { text: "Very Good", color: "text-blue-600", bg: "bg-gradient-to-r from-blue-600 to-cyan-600", icon: Star };
    if (percentage >= 60) return { text: "Good", color: "text-purple-600", bg: "bg-gradient-to-r from-purple-600 to-pink-600", icon: ThumbsUp };
    if (percentage >= 50) return { text: "Satisfactory", color: "text-yellow-600", bg: "bg-gradient-to-r from-yellow-500 to-orange-500", icon: Flag };
    if (percentage > 0) return { text: "Needs Improvement", color: "text-orange-600", bg: "bg-gradient-to-r from-orange-500 to-red-500", icon: AlertCircle };
    return { text: "Not Started", color: "text-gray-600", bg: "bg-gradient-to-r from-gray-500 to-gray-600", icon: HelpCircle };
  };

  const performanceDetails = getPerformanceDetails();
  const PerformanceIcon = performanceDetails.icon;

  // Chart data for performance trend
  const chartData = useMemo(() => {
    return Object.entries(answers).map(([qId, answer], idx) => {
      const question = questions.find(q => q._id === qId);
      const isCorrect = answer?.text?.toLowerCase().trim() === question?.correctAnswer?.toLowerCase().trim();
      return {
        question: idx + 1,
        correct: isCorrect ? 100 : 0,
        timestamp: answer?.timestamp
      };
    });
  }, [answers, questions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <Brain className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading your practice questions...</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">AI is preparing personalized recommendations</p>
        </div>
      </div>
    );
  }

  if (!loading && questions.length === 0 && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No Practice Questions Available</h3>
          <p className="text-slate-500 dark:text-slate-400">
            No practice questions found for this subject. Our AI is working to generate questions for you.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Active quiz view
  if (!submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-6 px-4">
        <Toaster position="top-right" />
        
        <div className="max-w-5xl mx-auto">
          {/* Premium Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    AI-Powered Practice
                  </h1>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Smart questions with real-time AI assistance
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <Timer className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                    {formatTime(time)}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-200 dark:border-amber-800/30">
                  <Brain className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    AI Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Performance Prediction Banner */}
          {performancePrediction && answeredCount > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">AI PREDICTION</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Projected Score: {performancePrediction.projectedScore}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${performancePrediction.trend === 'up' ? 'bg-green-500' : performancePrediction.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{performancePrediction.recommendation}</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mastery Progress</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {answeredCount} of {questions.length} mastered
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-y-[-50%] w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Completed: {Math.round(progress)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Remaining: {questions.length - answeredCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Card */}
          {current && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 px-6 py-5">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="font-bold text-white text-sm">{currentIndex + 1}</span>
                    </div>
                    <div>
                      <span className="text-white/60 text-xs font-medium">QUESTION</span>
                      <p className="text-white text-sm font-semibold">{currentIndex + 1} of {questions.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={getAIAssistance}
                      disabled={aiLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-all"
                    >
                      {aiLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4" />
                      )}
                      Get AI Help
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Body */}
              <div className="p-8">
                <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-8 leading-relaxed">
                  {current.question}
                </p>

                {/* Options Grid */}
                <div className="grid gap-4 mb-8">
                  {current.options?.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const selected = answers[current._id]?.letter === letter;
                    const colors = [
                      "from-blue-500 to-cyan-500",
                      "from-purple-500 to-pink-500",
                      "from-emerald-500 to-teal-500",
                      "from-orange-500 to-red-500"
                    ];

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(current._id, letter, opt)}
                        className={`group relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                          selected
                            ? `border-transparent bg-gradient-to-r ${colors[i % colors.length]} text-white shadow-xl scale-[1.02]`
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                            selected
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50"
                          }`}>
                            {letter}
                          </div>
                          <span className={`flex-1 text-base ${selected ? 'font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                            {opt}
                          </span>
                          {selected && (
                            <CheckCircle className="h-6 w-6 text-white/80" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* AI Assistance Panel */}
                {showAiHint && (
                  <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400">AI Assistant</h4>
                    </div>
                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing question...</span>
                      </div>
                    ) : aiAssistance ? (
                      <div className="space-y-3">
                        <p className="text-amber-800 dark:text-amber-300">{aiAssistance.hint}</p>
                        {aiAssistance.explanation && (
                          <p className="text-sm text-amber-700 dark:text-amber-400">{aiAssistance.explanation}</p>
                        )}
                        {aiAssistance.relatedTopics && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {aiAssistance.relatedTopics.map((topic, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-amber-200/50 dark:bg-amber-800/50 rounded-lg text-amber-800 dark:text-amber-300">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-amber-700 dark:text-amber-400">Click "Get AI Help" for a hint on this question.</p>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={prev}
                    disabled={currentIndex === 0}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>

                  {currentIndex === questions.length - 1 ? (
                    <button
                      onClick={submitTrial}
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Flag className="h-4 w-4" />
                          Submit Trial
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={next}
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Quick Navigator */}
                <div className="mt-6 pt-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <GridIcon className="h-3 w-3" />
                    Question Navigator
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered = answers[q._id];
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`relative w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            isCurrent
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                              : isAnswered
                              ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {idx + 1}
                          {isAnswered && !isCurrent && (
                            <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-emerald-500" />
                          )}
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

  // Results View - Premium
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Hero Results Section */}
        <div className={`rounded-3xl p-10 mb-8 text-white ${performanceDetails.bg} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-6">
              <PerformanceIcon className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Assessment Complete!</h1>
            <p className="text-white/80 text-lg max-w-md mx-auto">
              Your AI-powered performance analysis is ready
            </p>
          </div>
        </div>

        {/* Score Cards Grid */}
        <div className="grid gap-6 md:grid-cols-4 mb-10">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 mb-3">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{score}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Correct Answers</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">out of {questions.length}</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 mb-3">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{percentage}%</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overall Score</p>
            <p className={`text-xs mt-2 font-medium ${performanceDetails.color}`}>{performanceDetails.text}</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/30 mb-3">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatTime(time)}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Time Spent</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Average: {formatTime(Math.floor(time / questions.length))} per Q</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/30 mb-3">
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {Math.round(percentage / 10)}/10
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Performance Rating</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">AI Assessment</p>
          </div>
        </div>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-10">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-500" />
              Performance Timeline
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="correctGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="question" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="correct"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#correctGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Review */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Detailed Question Review
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Review answers and learn from AI explanations</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Correct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Incorrect</span>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
            {questions.map((q, index) => {
              const userAnswer = answers[q._id];
              const isCorrect = userAnswer?.text?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim();
              const isExpanded = selectedQuestionIndex === index;
              
              return (
                <div 
                  key={q._id} 
                  className={`transition-all duration-300 ${
                    isExpanded ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => setSelectedQuestionIndex(isExpanded ? null : index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            Question {index + 1}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isCorrect 
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                          {q.question}
                        </p>
                        
                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-fadeIn">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Your Answer</p>
                                <p className={`text-base font-medium ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {userAnswer?.letter}. {userAnswer?.text || 'Not answered'}
                                </p>
                              </div>
                              {!isCorrect && (
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Correct Answer</p>
                                  <p className="text-base font-medium text-emerald-700 dark:text-emerald-400">
                                    {q.correctAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {q.rationale && (
                              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-400">AI Explanation</p>
                                </div>
                                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                                  {q.rationale}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-transform duration-200">
                        <ChevronRight className={`h-5 w-5 transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setTime(0);
              setCurrentIndex(0);
              setResultData(null);
              setSelectedQuestionIndex(null);
              setAiAssistance(null);
              setShowAiHint(false);
              fetchQuestions();
            }}
            className="flex-1 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-all flex items-center justify-center gap-2 group"
          >
            <RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
            Practice Again
          </button>
          <button
            onClick={() => navigate("/student/progress")}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            View Full Progress Dashboard
          </button>
        </div>

        {/* AI Study Recommendation */}
        {percentage < 70 && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">AI Study Recommendation</h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Based on your performance, we recommend reviewing the questions you missed and practicing similar topics. 
                  Our AI has identified {questions.filter((_, idx) => !Object.values(answers)[idx]?.text?.toLowerCase().trim() === questions[idx]?.correctAnswer?.toLowerCase().trim()).length} areas for improvement.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for grid icon
const GridIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

export default StudentTrial;