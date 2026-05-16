// pages/lecturer/LecturerGrading.jsx - COMPLETELY FIXED
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { 
  ArrowLeft, Save, Send, User, Clock, Calendar,
  CheckCircle, XCircle, Award, FileText, MessageSquare,
  Loader2, Star, TrendingUp, AlertCircle, RefreshCw,
  Zap, Edit3, Flag, Check, X, Download, Printer
} from "lucide-react";

const LecturerGrading = () => {
  // FIXED: Use 'attemptId' to match the route parameter in App.jsx
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoGrading, setAutoGrading] = useState(false);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const [questionGrades, setQuestionGrades] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [gradingMode, setGradingMode] = useState("manual");

  // Debug log
  console.log("Attempt ID from URL params:", attemptId);

  useEffect(() => {
    // Validate attemptId before fetching
    if (!attemptId || attemptId === "undefined" || attemptId === "null") {
      toast.error("Invalid attempt ID. Please select a valid submission.");
      navigate("/lecturer/attempts");
      return;
    }
    fetchSubmission();
  }, [attemptId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      console.log("Fetching submission with ID:", attemptId);
      
      // Use attemptId in the API URL
      const res = await axios.get(`/grading/submission/${attemptId}`);
      
      console.log("Submission data received:", res.data);
      setSubmission(res.data);
      setOverallFeedback(res.data.lecturerFeedback || "");
      setGrade(res.data.grade || "PENDING");
      
      // Initialize question grades
      const qGrades = {};
      res.data.questions?.forEach(q => {
        qGrades[q.id] = {
          pointsEarned: q.pointsEarned || 0,
          feedback: q.lecturerFeedback || "",
        };
      });
      setQuestionGrades(qGrades);
    } catch (err) {
      console.error("Fetch submission error:", err);
      const errorMsg = err.response?.data?.message || "Failed to load submission";
      toast.error(errorMsg);
      navigate("/lecturer/attempts");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGrade = async () => {
    if (!window.confirm("Auto-grade will automatically grade all MCQ questions. Continue?")) return;
    
    setAutoGrading(true);
    try {
      const res = await axios.post(`/grading/submission/${attemptId}/auto-grade`);
      toast.success(res.data.message);
      await fetchSubmission();
      setGradingMode("auto");
    } catch (err) {
      toast.error(err.response?.data?.message || "Auto-grading failed");
    } finally {
      setAutoGrading(false);
    }
  };

  const handleQuestionGradeChange = (questionId, pointsEarned) => {
    setQuestionGrades(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        pointsEarned: Math.max(0, Math.min(pointsEarned, getMaxPoints(questionId))),
      }
    }));
  };

  const handleQuestionFeedbackChange = (questionId, feedback) => {
    setQuestionGrades(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        feedback,
      }
    }));
  };

  const getMaxPoints = (questionId) => {
    const question = submission?.questions?.find(q => q.id === questionId);
    return question?.points || 1;
  };

  const calculateTotalScore = () => {
    let total = 0;
    Object.values(questionGrades).forEach(q => {
      total += q.pointsEarned || 0;
    });
    return total;
  };

  const calculatePercentage = () => {
    if (!submission) return 0;
    const totalScore = calculateTotalScore();
    return (totalScore / submission.totalPoints) * 100;
  };

 const handleSubmitGrade = async () => {
  if (!submission) return;
  
  if (gradingMode === "manual") {
    const totalScore = calculateTotalScore();
    const percentage = calculatePercentage();
    
    if (!window.confirm(`Submit grade: ${totalScore}/${submission.totalPoints} (${Math.round(percentage)}%)?`)) {
      return;
    }
  }
  
  setSaving(true);
  try {
    const payload = {
      score: calculateTotalScore(),
      feedback: overallFeedback,
      grade: grade,
      questionGrades: Object.entries(questionGrades).map(([questionId, data]) => ({
        questionId,
        pointsEarned: data.pointsEarned,
        feedback: data.feedback,
      })),
      overallFeedback,
    };
    
    await axios.post(`/grading/submission/${attemptId}/manual-grade`, payload);
    toast.success("Grade submitted successfully!");
    // FIXED: Navigate back to grading list, not attempts
    navigate("/lecturer/grading");
  } catch (err) {
    console.error("Grade submission error:", err);
    toast.error(err.response?.data?.message || "Failed to submit grade");
  } finally {
    setSaving(false);
  }
};

  const handleRequestResubmission = async () => {
    const reason = prompt("Please provide a reason for requesting resubmission:");
    if (!reason) return;
    
    try {
      await axios.post(`/grading/submission/${attemptId}/resubmit-request`, { 
        reason, 
        allowRetake: true 
      });
      toast.success("Resubmission requested successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request resubmission");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Submission not found</p>
        <button 
          onClick={() => navigate("/lecturer/attempts")} 
          className="text-blue-600 dark:text-blue-400 mt-4 hover:underline"
        >
          Back to Attempts
        </button>
      </div>
    );
  }

  const totalScore = calculateTotalScore();
  const percentage = calculatePercentage();
  const isPassed = percentage >= 70;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
  onClick={() => navigate("/lecturer/grading")}
  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
>
  <ArrowLeft className="h-5 w-5" />
</button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Grade Submission
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review and grade student's work
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {!submission.isGraded && (
            <button
              onClick={handleAutoGrade}
              disabled={autoGrading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {autoGrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Auto-Grade MCQ
            </button>
          )}
          <button
            onClick={handleSubmitGrade}
            disabled={saving || submission.isGraded}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {saving ? "Submitting..." : submission.isGraded ? "Already Graded" : "Submit Grade"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "questions"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Questions & Answers
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "feedback"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Feedback & Grade
          </button>
        </nav>
      </div>

      {/* Student Info Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {submission.student?.name?.charAt(0) || "S"}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {submission.student?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{submission.student?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="h-4 w-4" />
              <span>{submission.lesson?.title}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Attempt #{submission.attemptNumber}</span>
            </div>
            {submission.isGraded && (
              <div className={`flex items-center gap-2 text-sm px-2 py-1 rounded-full ${
                submission.isPassed 
                  ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
              }`}>
                {submission.isPassed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {submission.isPassed ? "Passed" : "Failed"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grading Mode Banner */}
      {!submission.isGraded && (
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                {gradingMode === "auto" ? <Zap className="h-5 w-5 text-blue-600" /> : <Edit3 className="h-5 w-5 text-purple-600" />}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {gradingMode === "auto" ? "Auto-Grading Mode Active" : "Manual Grading Mode"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {gradingMode === "auto" 
                    ? "MCQ questions are automatically graded. Review and adjust if needed."
                    : "Grade each question individually or provide an overall score."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGradingMode("manual")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  gradingMode === "manual"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Manual Mode
              </button>
              <button
                onClick={() => setGradingMode("auto")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  gradingMode === "auto"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Auto Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Score Summary */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Score Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Points</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{submission.totalPoints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Score</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {submission.isGraded ? submission.score : totalScore} / {submission.totalPoints}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Percentage</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {Math.round(submission.isGraded ? submission.percentage : percentage)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${submission.isGraded ? submission.percentage : percentage}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className={`font-semibold ${(submission.isGraded ? submission.isPassed : isPassed) ? 'text-green-600' : 'text-red-600'}`}>
                  {(submission.isGraded ? submission.isPassed : isPassed) ? "Passed" : "Failed"}
                </span>
              </div>
            </div>
          </div>

          {/* Grading Info */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Grading Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Grading Type</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  submission.gradingType === "automatic" 
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400"
                }`}>
                  {submission.gradingType === "automatic" ? "Auto-Graded" : submission.isGraded ? "Manual" : "Pending"}
                </span>
              </div>
              {submission.gradedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Graded At</span>
                  <span className="text-sm">{new Date(submission.gradedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Questions</span>
                <span className="text-sm">{submission.questions?.length || 0} questions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div className="space-y-4">
          {submission.questions?.map((question, idx) => (
            <div key={question.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Question {idx + 1}: {question.questionText}
                </h3>
                {submission.isGraded && (
                  <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                    question.isCorrect 
                      ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  }`}>
                    {question.isCorrect ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {question.pointsEarned}/{question.points} pts
                  </div>
                )}
              </div>
              
              <div className="space-y-3 ml-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Student's Answer:</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {question.studentAnswer || "No answer provided"}
                  </p>
                </div>
                
                {!question.isCorrect && question.correctAnswerText && (
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Correct Answer:</p>
                    <p className="text-gray-700 dark:text-gray-300">{question.correctAnswerText}</p>
                  </div>
                )}
                
                {question.rationale && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Explanation:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{question.rationale}</p>
                  </div>
                )}
                
                {!submission.isGraded && gradingMode === "manual" && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Points Earned
                        </label>
                        <input
                          type="number"
                          value={questionGrades[question.id]?.pointsEarned || 0}
                          onChange={(e) => handleQuestionGradeChange(question.id, parseInt(e.target.value) || 0)}
                          min="0"
                          max={question.points}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max: {question.points} points</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Feedback (Optional)
                        </label>
                        <textarea
                          value={questionGrades[question.id]?.feedback || ""}
                          onChange={(e) => handleQuestionFeedbackChange(question.id, e.target.value)}
                          rows="2"
                          placeholder="Provide specific feedback for this question..."
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {question.lecturerFeedback && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Lecturer Feedback:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{question.lecturerFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "feedback" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Overall Feedback */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Overall Feedback
            </h2>
            {!submission.isGraded ? (
              <>
                <textarea
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  rows="6"
                  placeholder="Provide overall feedback to help the student improve..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Feedback will be sent to the student via notification
                </p>
              </>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {submission.lecturerFeedback || "No feedback provided"}
                </p>
              </div>
            )}
          </div>

          {/* Grade Selection */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Grade
            </h2>
            {!submission.isGraded ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Letter Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="A+">A+ (97-100%)</option>
                    <option value="A">A (93-96%)</option>
                    <option value="A-">A- (90-92%)</option>
                    <option value="B+">B+ (87-89%)</option>
                    <option value="B">B (83-86%)</option>
                    <option value="B-">B- (80-82%)</option>
                    <option value="C+">C+ (77-79%)</option>
                    <option value="C">C (73-76%)</option>
                    <option value="C-">C- (70-72%)</option>
                    <option value="D">D (60-69%)</option>
                    <option value="F">F (Below 60%)</option>
                    <option value="PENDING">Pending Review</option>
                  </select>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Final Score</span>
                    <span className="text-xl font-bold">{totalScore} / {submission.totalPoints}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Percentage</span>
                    <span className="text-xl font-bold">{Math.round(percentage)}%</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Letter Grade</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{submission.grade}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Final Score</span>
                  <span className="text-xl font-bold">{submission.score} / {submission.totalPoints}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Percentage</span>
                  <span className="text-xl font-bold">{Math.round(submission.percentage)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!submission.isGraded && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleRequestResubmission}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Flag className="h-4 w-4" />
            Request Resubmission
          </button>
          <button
            onClick={handleSubmitGrade}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? "Submitting..." : "Submit Final Grade"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LecturerGrading;