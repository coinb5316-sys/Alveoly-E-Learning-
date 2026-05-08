// pages/lecturer/LecturerGrading.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { 
  ArrowLeft, Save, Send, User, Clock, Calendar,
  CheckCircle, XCircle, Award, FileText, MessageSquare,
  Loader2, Star, TrendingUp, AlertCircle
} from "lucide-react";

const LecturerGrading = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const res = await axios.get(`/api/lecturer/attempts/${attemptId}`);
      if (res.data.success) {
        setAttempt(res.data.attempt);
        setFeedback(res.data.attempt.lecturerFeedback || "");
        setGrade(res.data.attempt.grade || "PENDING");
        setScore(res.data.attempt.score || 0);
      }
    } catch (err) {
      console.error("Fetch attempt error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGrade = async () => {
    try {
      setSaving(true);
      await axios.post(`/api/lecturer/attempts/${attemptId}/grade`, {
        score,
        feedback,
        grade
      });
      alert("Grade submitted successfully!");
      navigate("/lecturer/attempts");
    } catch (err) {
      console.error("Grade submission error:", err);
      alert(err.response?.data?.message || "Failed to submit grade");
    } finally {
      setSaving(false);
    }
  };

  const calculatePercentage = () => {
    if (!attempt) return 0;
    return (score / attempt.totalPoints) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Attempt not found</p>
        <button onClick={() => navigate("/lecturer/attempts")} className="text-blue-600 mt-4">
          Back to Attempts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/lecturer/attempts")}
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
        <button
          onClick={handleSubmitGrade}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {saving ? "Submitting..." : "Submit Grade"}
        </button>
      </div>

      {/* Student Info */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {attempt.studentName?.charAt(0) || "S"}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {attempt.studentName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{attempt.studentEmail}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{attempt.contentTitle}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{new Date(attempt.submittedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Attempt #{attempt.attemptNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Questions and Answers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Student Answers
            </h2>
            <div className="space-y-6">
              {attempt.answers?.map((answer, idx) => (
                <div key={idx} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Question {idx + 1}: {answer.question}
                    </p>
                    {answer.isCorrect !== undefined && (
                      <div className={`flex items-center gap-1 text-sm ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {answer.isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {answer.pointsEarned}/{answer.points || 1} pts
                      </div>
                    )}
                  </div>
                  <div className="ml-4 mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Student's Answer:</span> {answer.selectedAnswer || "Not answered"}
                    </p>
                    {answer.correctAnswer && !answer.isCorrect && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        <span className="font-medium">Correct Answer:</span> {answer.correctAnswer}
                      </p>
                    )}
                    {answer.feedback && (
                      <p className="text-sm text-blue-600 mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <span className="font-medium">Your Feedback:</span> {answer.feedback}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grading Panel */}
        <div className="space-y-4">
          {/* Score Card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Grading
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Score
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    min="0"
                    max={attempt.totalPoints}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                  <span className="text-sm text-gray-500">/ {attempt.totalPoints} pts</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Percentage</span>
                    <span className="font-medium">{Math.round(calculatePercentage())}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${calculatePercentage()}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="A">A (Excellent)</option>
                  <option value="B">B (Good)</option>
                  <option value="C">C (Average)</option>
                  <option value="D">D (Below Average)</option>
                  <option value="F">F (Fail)</option>
                  <option value="PENDING">Pending Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Feedback
            </h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="6"
              placeholder="Provide constructive feedback to help the student improve..."
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Feedback will be sent to the student via notification
            </p>
          </div>

          {/* Summary Card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Points:</span>
                <span className="font-medium">{attempt.totalPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Score:</span>
                <span className="font-medium">{score}/{attempt.totalPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Percentage:</span>
                <span className="font-medium">{Math.round(calculatePercentage())}%</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Status:</span>
                <span className={`font-medium ${calculatePercentage() >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculatePercentage() >= 70 ? "Passing" : "Failing"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerGrading;