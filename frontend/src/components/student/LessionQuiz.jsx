// components/student/LessonQuiz.jsx - Professional styling with dark mode
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Clock,
  AlertCircle,
  Loader2,
  Award,
  TrendingUp,
  BookOpen,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  HelpCircle,
  Flag,
  Timer,
  BarChart3
} from "lucide-react";

const LessonQuiz = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  
  const autoSubmitTriggered = useRef(false);
  const answersRef = useRef(answers);
  const attemptIdRef = useRef(attemptId);

  // Keep refs updated
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timeLeft > 0 && !submitted && !loading && !isSubmitting && !autoSubmitTriggered.current) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (!autoSubmitTriggered.current && !submitted) {
              performAutoSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, submitted, loading, isSubmitting]);

  useEffect(() => {
    if (lessonId) {
      startQuiz();
    }
  }, [lessonId]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`/lesson-quiz/start/${lessonId}`);
      
      if (res.data.remainingSeconds) {
        setTimeLeft(res.data.remainingSeconds);
      } else if (res.data.timerMinutes) {
        setTimeLeft(res.data.timerMinutes * 60);
      }
      
      setAttemptId(res.data.attemptId);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error("Start quiz error:", err);
      const errorMsg = err.response?.data?.message || "Failed to start quiz";
      toast.error(errorMsg);
      if (err.response?.status === 403) {
        setTimeout(() => navigate(-1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const performAutoSubmit = async () => {
    if (autoSubmitTriggered.current || isSubmitting || submitted) {
      return;
    }
    
    autoSubmitTriggered.current = true;
    setIsSubmitting(true);
    
    toast.loading("Time's up! Submitting your quiz...", { id: "auto-submit" });
    
    try {
      const currentAnswers = answersRef.current;
      const currentAttemptId = attemptIdRef.current;
      
      const res = await axios.post("/lesson-quiz/submit", {
        attemptId: currentAttemptId,
        answers: currentAnswers,
      });
      
      toast.dismiss("auto-submit");
      setSubmitted(true);
      setResult(res.data);
      toast.success(res.data.message);
    } catch (err) {
      console.error("Auto-submit error:", err);
      toast.dismiss("auto-submit");
      toast.error(err.response?.data?.message || "Failed to submit quiz. Please contact support.");
      autoSubmitTriggered.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (questionId, answerLetter) => {
    if (submitted || isSubmitting) return;
    setAnswers(prev => ({ ...prev, [questionId]: answerLetter }));
  };

  const submitQuiz = async () => {
    if (isSubmitting || submitted) return;
    
    if (Object.keys(answers).length < questions.length) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }

    setIsSubmitting(true);
    toast.loading("Submitting your quiz...", { id: "submit" });
    
    try {
      const res = await axios.post("/lesson-quiz/submit", {
        attemptId,
        answers,
      });
      
      toast.dismiss("submit");
      setSubmitted(true);
      setResult(res.data);
      toast.success(res.data.message);
    } catch (err) {
      console.error("Submit error:", err);
      toast.dismiss("submit");
      toast.error(err.response?.data?.message || "Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleRetake = async () => {
    setSubmitted(false);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    autoSubmitTriggered.current = false;
    setIsSubmitting(false);
    setReviewMode(false);
    
    await startQuiz();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 30) return "text-red-500";
    if (timeLeft < 60) return "text-yellow-500";
    return "text-green-500";
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (loading && !submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading quiz questions...</p>
      </div>
    );
  }

  if (submitted && result) {
    const isPassed = result.passed;
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-2xl shadow-xl overflow-hidden border ${
          isPassed ? 'border-green-500' : 'border-red-500'
        }`}>
          {/* Header */}
          <div className={`p-8 text-white ${
            isPassed ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-rose-700'
          }`}>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold">Quiz Results</h2>
                <p className="mt-1 opacity-90">Lesson assessment completed</p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                isPassed ? 'bg-white/20' : 'bg-white/20'
              }`}>
                <span className="text-2xl font-bold">{Math.round(result.percentage)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8">
            {/* Score Display */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                isPassed ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30'
              }`}>
                {isPassed ? (
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isPassed ? "🎉 Congratulations!" : "😔 Keep Learning!"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{result.message}</p>
            </div>

            {/* Score Cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {result.score} / {result.totalPoints}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
                <p className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.round(result.percentage)}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {isPassed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>

            {/* Question Review */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Question Review</h3>
                <button
                  onClick={() => setReviewMode(!reviewMode)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {reviewMode ? "Collapse" : "Show Details"}
                </button>
              </div>
              
              {reviewMode && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {result.questionResults?.map((q, idx) => (
                    <div key={idx} className={`border rounded-xl p-4 ${
                      q.isCorrect 
                        ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20' 
                        : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {q.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {idx + 1}. {q.questionText}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your answer: 
                            <span className={q.isCorrect ? 'text-green-600 dark:text-green-400 ml-1' : 'text-red-600 dark:text-red-400 ml-1'}>
                              {q.userAnswerLetter}. {q.userAnswerText || 'No answer'}
                            </span>
                          </p>
                          {!q.isCorrect && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Correct answer: {q.correctAnswer}. {q.correctAnswerText || ''}
                            </p>
                          )}
                          {q.rationale && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              💡 {q.rationale}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!reviewMode && (
                <div className="grid gap-2">
                  {result.questionResults?.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex-shrink-0">
                        {q.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">Question {idx + 1}</span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {q.points || 1} pt
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Lessons
              </button>
              <button
                onClick={handleRetake}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <HelpCircle className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Questions Available</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">This quiz doesn't have any questions yet.</p>
        <button onClick={handleClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Lesson Quiz</h2>
              <p className="mt-1 opacity-90">Test your knowledge</p>
            </div>
            {timeLeft > 0 && !submitted && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold ${
                timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-white/20'
              }`}>
                <Timer className="h-5 w-5" />
                {formatTime(timeLeft)}
              </div>
            )}
            {timeLeft === 0 && !submitted && !isSubmitting && (
              <div className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg font-mono text-xl font-bold animate-pulse">
                <AlertCircle className="h-5 w-5" />
                Time's Up!
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Answered: {answeredCount}/{questions.length}
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Section */}
        <div className="p-6">
          {/* Question Text */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex-1">
                {currentQuestion.question}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ml-11">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {currentQuestion.points || 1} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options?.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = answers[currentQuestion._id] === letter;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQuestion._id, letter)}
                  disabled={isSubmitting}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50'
                    }`}>
                      {letter}
                    </div>
                    <span className={`text-gray-700 dark:text-gray-300 ${isSelected ? 'font-medium' : ''}`}>
                      {option}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0 || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            
            {currentIndex === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={isSubmitting || answeredCount < questions.length}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit Quiz
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Warning for unanswered questions */}
          {answeredCount < questions.length && currentIndex === questions.length - 1 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              You have {questions.length - answeredCount} unanswered question(s). Please answer all questions before submitting.
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default LessonQuiz;