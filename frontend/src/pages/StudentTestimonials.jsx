// StudentTestimonials.jsx - Professional styling with dark mode
import { useState, useEffect } from "react";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  User,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Sparkles,
  Quote,
  Heart,
  Award,
  TrendingUp,
  Users
} from "lucide-react";
import { Loader2 } from "lucide-react";

const StudentTestimonials = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({
    name: "",
    course: "",
    rating: 5,
    feedback: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const fetchMyTestimonials = async () => {
      try {
        const res = await API.get("/testimonials/my");
        setFeedbacks(res.data);
      } catch (err) {
        toast.error("Error fetching your testimonials");
      }
    };
    fetchMyTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.course.trim()) {
      toast.error("Please enter your course");
      return;
    }
    if (!form.feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/testimonials", form);

      toast.success("Testimonial submitted for review!");
      setForm({ name: "", course: "", rating: 5, feedback: "" });
      setHoveredRating(0);

      const res = await API.get("/testimonials/my");
      setFeedbacks(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return { icon: CheckCircle, text: "Approved", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-950/30" };
      case "pending":
        return { icon: Clock, text: "Pending Review", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-950/30" };
      case "rejected":
        return { icon: XCircle, text: "Rejected", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-950/30" };
      default:
        return { icon: Clock, text: status, color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const stats = {
    total: feedbacks.length,
    approved: feedbacks.filter(f => f.status === "approved").length,
    pending: feedbacks.filter(f => f.status === "pending").length,
    averageRating: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Share Your Experience
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Help others by sharing your learning journey
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {feedbacks.length} Reviews
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {feedbacks.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.total}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.approved}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="mt-1 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.pending}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.averageRating}
                    </span>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Form */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Share Your Story</h2>
                <p className="text-sm text-white/80 mt-0.5">Your feedback helps others make informed decisions</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Your Course
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g., Nursing, Medicine, Pharmacy"
                    value={form.course}
                    required
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setForm({ ...form, rating: num })}
                    onMouseEnter={() => setHoveredRating(num)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-all ${
                        num <= (hoveredRating || form.rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Your Feedback
              </label>
              <div className="relative">
                <Quote className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  placeholder="Share your learning experience, what you enjoyed, and how it helped you..."
                  value={form.feedback}
                  required
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  rows={4}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Testimonial
                </>
              )}
            </button>
          </form>
        </div>

        {/* Your Submissions Section */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Your Submissions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Track the status of your testimonials
              </p>
            </div>
            {feedbacks.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Heart className="h-4 w-4 text-red-500" />
                <span>{stats.approved} approved</span>
              </div>
            )}
          </div>

          {feedbacks.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Testimonials Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Share your learning experience. Your feedback will appear here once submitted.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
              {feedbacks.map((feedback) => {
                const StatusIcon = getStatusConfig(feedback.status).icon;
                const statusConfig = getStatusConfig(feedback.status);
                
                return (
                  <div
                    key={feedback._id}
                    className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {feedback.course}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {feedback.name}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.text}
                      </span>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Feedback Text */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      "{feedback.feedback}"
                    </p>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </div>
                      {feedback.status === "pending" && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <Clock className="h-3 w-3" />
                          Awaiting review
                        </div>
                      )}
                      {feedback.status === "approved" && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <ThumbsUp className="h-3 w-3" />
                          Publicly visible
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Motivational Banner */}
        {feedbacks.length === 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
            <div className="relative z-10">
              <Heart className="h-10 w-10 mx-auto mb-3" />
              <p className="text-lg font-medium">
                Your voice matters! Share your experience and inspire others.
              </p>
              <p className="text-sm text-white/80 mt-2">
                Every testimonial helps build a stronger learning community.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTestimonials;