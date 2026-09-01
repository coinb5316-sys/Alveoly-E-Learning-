// src/pages/StudentExamResults.jsx - Complete Exam Results & Revision
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  User,
  GraduationCap,
  Eye,
  RefreshCw,
  AlertCircle,
  Trophy,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const StudentExamResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResult, setFilterResult] = useState("all");

  // Fetch all exam results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await API.get("/exam/results");
        setResults(res.data || []);
      } catch (err) {
        console.error("Error fetching exam results:", err);
        toast.error("Failed to load exam results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Fetch detailed attempt for revision
  const fetchAttemptDetails = async (attemptId) => {
    try {
      setDetailLoading(true);
      const res = await API.get(`/exam/results/${attemptId}`);
      setSelectedResult(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error fetching attempt details:", err);
      toast.error("Failed to load exam details");
    } finally {
      setDetailLoading(false);
    }
  };

  // Filter results
  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterResult === "all" || result.result === filterResult;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalExams = results.length;
  const passedExams = results.filter(r => r.result === "pass").length;
  const failedExams = results.filter(r => r.result === "fail").length;
  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Trophy className="h-4 w-4" />
            <span>Exam Results</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            My Exam Results
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review your exam performance and revise questions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalExams} Exams
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {totalExams > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Exams</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {totalExams}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
                  {passedExams}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
                  {failedExams}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
                  {avgScore}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by subject or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <option value="all">All Results</option>
          <option value="pass">Passed</option>
          <option value="fail">Failed</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">Loading exam results...</p>
        </div>
      )}

      {/* Results List */}
      {!loading && results.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Exam Results Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              You haven't completed any exams yet. Take an exam to see your results here.
            </p>
            <button
              onClick={() => navigate("/student/subjects")}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
            >
              Browse Subjects
            </button>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && filteredResults.length > 0 && (
        <div className="grid gap-4">
          {filteredResults.map((result) => (
            <motion.div
              key={result._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left - Result Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {result.subjectName}
                      </h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        result.result === "pass"
                          ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                      }`}>
                        {result.result === "pass" ? "✅ Passed" : "❌ Failed"}
                      </span>
                      {result.resitAllowed && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                          🔄 Resit Available
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {result.courseName}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Attempt #{result.attemptNumber || 1}
                      </span>
                    </div>
                  </div>

                  {/* Center - Score */}
                  <div className="text-center md:text-right">
                    <div className="flex items-center gap-3 md:justify-end">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {result.score}/{result.totalQuestions}
                      </div>
                      <div className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                        result.percentage >= 70
                          ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                          : result.percentage >= 50
                          ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                      }`}>
                        {Math.round(result.percentage)}%
                      </div>
                    </div>
                  </div>

                  {/* Right - Actions */}
                  <div className="flex gap-2 self-end md:self-center">
                    <button
                      onClick={() => fetchAttemptDetails(result._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>
                    {result.resitAllowed && (
                      <button
                        onClick={() => navigate(`/student/exams/${result.courseId}/${result.subjectId}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all text-sm font-medium"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retake
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredResults.length === 0 && results.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No results match your search</p>
        </div>
      )}

      {/* Detail/Revision Modal */}
      <AnimatePresence>
        {showDetailModal && selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className={`p-6 text-white ${
                selectedResult.result === "pass"
                  ? "bg-gradient-to-r from-green-600 to-emerald-700"
                  : "bg-gradient-to-r from-red-600 to-rose-700"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedResult.subjectName}</h2>
                    <p className="text-sm opacity-90">{selectedResult.courseName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedResult.score}/{selectedResult.totalQuestions}</div>
                      <div className="text-sm opacity-80">{Math.round(selectedResult.percentage)}%</div>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>📅 {new Date(selectedResult.submittedAt).toLocaleDateString()}</span>
                  <span>🔄 Attempt #{selectedResult.attemptNumber || 1}</span>
                </div>
              </div>

              {/* Modal Body - Questions */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400 mt-3">Loading questions...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <span>Review your answers below. Green indicates correct, red indicates incorrect.</span>
                    </div>
                    
                    {selectedResult.questions?.map((q, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-xl p-4 ${
                          q.isCorrect
                            ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10"
                            : "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {q.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {idx + 1}. {q.questionText}
                            </p>
                            <div className="mt-2 space-y-1">
                              {q.options?.map((opt, optIdx) => {
                                const letter = String.fromCharCode(65 + optIdx);
                                const isUserAnswer = q.userAnswerLetter === letter;
                                const isCorrectAnswer = q.correctAnswer === letter;
                                let bgColor = "";
                                
                                if (isCorrectAnswer) {
                                  bgColor = "bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-700";
                                } else if (isUserAnswer && !isCorrectAnswer) {
                                  bgColor = "bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-700";
                                }
                                
                                return (
                                  <div
                                    key={optIdx}
                                    className={`text-sm p-2 rounded-lg border ${bgColor || "border-gray-200 dark:border-gray-700"}`}
                                  >
                                    <span className="font-semibold">{letter}.</span> {opt}
                                    {isCorrectAnswer && (
                                      <span className="ml-2 text-green-600 dark:text-green-400">✓ Correct</span>
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <span className="ml-2 text-red-600 dark:text-red-400">✗ Your answer</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {q.rationale && (
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                💡 {q.rationale}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
                {selectedResult.resitAllowed && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      navigate(`/student/exams/${selectedResult.courseId}/${selectedResult.subjectId}`);
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all"
                  >
                    Retake Exam
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentExamResults;