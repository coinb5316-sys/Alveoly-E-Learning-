import { useState, useEffect } from "react";
import axios from "../api/axios";
import socket from "../api/socket";
import {
  FaRobot,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const StudentTrial = () => {
  const { user } = useAuth();
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [time, setTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [backendResult, setBackendResult] = useState(null);

  const current = questions[currentIndex];

  // ================= FETCH (UNCHANGED) =================
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
      setShowResult(false);
      setTime(0);
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

  // ================= TIMER (UNCHANGED) =================
  useEffect(() => {
    if (submitted) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted]);

  // ================= SELECT (UNCHANGED) =================
  const handleSelect = (qId, option) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  // ================= AI (COMPLETELY UNCHANGED) =================
  const askAI = async () => {
    if (!current) return;

    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await axios.post("/ai/ask", {
        question: `
Question: ${current.question}
Options:
${current.options
  .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
  .join("\n")}

Explain the correct answer like a nursing tutor.
        `,
      });

      setAiResponse(res.data.answer);
    } catch (err) {
      setAiResponse("Please Subscribe to a plan.");
    }

    setAiLoading(false);
  };

  // ================= NAV (UNCHANGED) =================
  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAiResponse("");
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setAiResponse("");
    }
  };

  // ================= SUBMIT (UNCHANGED) =================
  const submitTrial = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error("Please answer at least one question.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post("/trial/submit", {
        subjectId,
        courseId,
        answers,
        duration: time,
      });

      setBackendResult(res.data.attempt);
      setSubmitted(true);
      setShowResult(true);
      toast.success("Trial submitted successfully!");
    } catch (err) {
      console.error("❌ Submit Error:", err);
      toast.error(err.response?.data?.message || "Failed to submit trial.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= CALCULATE SCORE (UNCHANGED) =================
  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q._id];
      const correctAnswer = q.correctAnswer;
      
      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const score = calculateScore();
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  const getColor = () => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 50) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + "h " : ""}${mins > 0 ? mins + "m " : ""}${secs}s`;
  };

  // ================= BILLION-DOLLAR PROFESSIONAL UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4">
            <span className="text-2xl">🧠</span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI-Powered Assessment</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
            Trial Practice
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
            Test your knowledge with our intelligent practice system. Get real-time AI assistance and detailed feedback.
          </p>
        </div>

        {/* Timer & Progress Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Timer Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Time Spent</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(time)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500">Focus & Accuracy</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Active Session</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Mastery Progress</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {Object.keys(answers).length}/{questions.length} Answered
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
              <div className="flex justify-between mt-4 text-xs text-slate-500 dark:text-slate-400">
                <span>🎯 Accuracy Goal: 80%</span>
                <span>⚡ {questions.length - Object.keys(answers).length} Remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Question Navigator
          </p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`relative w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                  answers[q._id]
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                } ${currentIndex === i ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900" : ""}`}
              >
                {i + 1}
                {answers[q._id] && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-green-500"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {!current && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">No questions available for this subject.</p>
          </div>
        )}

        {current && !submitted && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Question Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 px-8 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{currentIndex + 1}</span>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-medium tracking-wide">CURRENT QUESTION</p>
                    <p className="text-white text-sm font-semibold">Question {currentIndex + 1} of {questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-white/80 text-sm">AI Ready to Assist</span>
                </div>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-8">
              <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-8 leading-relaxed">
                {current.question}
              </p>

              {/* Options */}
              <div className="grid gap-4 mb-8">
                {current.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const selected = answers[current._id] === letter;
                  const gradients = [
                    "from-blue-500 to-cyan-500",
                    "from-purple-500 to-pink-500",
                    "from-emerald-500 to-teal-500",
                    "from-orange-500 to-red-500"
                  ];

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(current._id, letter)}
                      className={`group relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                        selected
                          ? `border-transparent bg-gradient-to-r ${gradients[i % gradients.length]} text-white shadow-xl scale-[1.02]`
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
                          <FaCheck className="text-white/80 text-xl" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* AI Section - EXACTLY as original */}
              <div className="mb-8">
                <button
                  onClick={askAI}
                  disabled={aiLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25"
                >
                  <FaRobot className="text-lg" /> 
                  {aiLoading ? "Thinking..." : "Ask AI"}
                </button>

                {aiLoading && (
                  <div className="mt-4 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing question...</span>
                  </div>
                )}

                {aiResponse && (
                  <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                    <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                      {aiResponse}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={prev}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  <FaArrowLeft /> Previous
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={submitTrial}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all shadow-lg shadow-green-500/25"
                  >
                    {submitting ? "Submitting..." : "Submit Trial"} <FaCheck />
                  </button>
                ) : (
                  <button
                    onClick={next}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25"
                  >
                    Next <FaArrowRight />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Modal - Styled but logic UNCHANGED */}
        {showResult && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-800">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Trial Complete!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Here's your performance breakdown</p>
                </div>

                <div className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                  <div className="text-5xl font-bold mb-2">
                    <span className={getColor()}>
                      {backendResult?.score ?? score}/{questions.length}
                    </span>
                  </div>
                  <p className={`text-2xl font-semibold ${getColor()}`}>
                    {backendResult?.percentage ?? percentage}%
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    Performance:{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {backendResult?.performance || 
                        (percentage >= 80 ? "Excellent" : percentage >= 60 ? "Good" : percentage >= 40 ? "Average" : "Poor")}
                    </span>
                  </p>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {questions.map((q, index) => {
                    const userAnswerLetter = answers[q._id];
                    const userAnswerText = userAnswerLetter && q.options 
                      ? q.options[userAnswerLetter.charCodeAt(0) - 65] 
                      : null;
                    
                    const correctAnswerLetter = q.correctAnswer;
                    const correctAnswerText = correctAnswerLetter && q.options 
                      ? q.options[correctAnswerLetter.charCodeAt(0) - 65] 
                      : null;
                    
                    const isCorrect = userAnswerLetter === correctAnswerLetter;

                    return (
                      <div key={q._id} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                        <p className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
                          {index + 1}. {q.question}
                        </p>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium text-slate-500 dark:text-slate-400">Your Answer:</span>{" "}
                            <span className={isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                              {userAnswerLetter || "None"}
                              {userAnswerText && ` - ${userAnswerText}`}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p>
                              <span className="font-medium text-slate-500 dark:text-slate-400">Correct Answer:</span>{" "}
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                {correctAnswerLetter}
                                {correctAnswerText && ` - ${correctAnswerText}`}
                              </span>
                            </p>
                          )}
                        </div>
                        {q.rationale && (
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            📘 {q.rationale}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => navigate("/student/progress")}
                  className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg"
                >
                  View Progress Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTrial;