// AdminTestimonials.jsx - Fixed to handle API responses properly
import { useState, useEffect } from "react";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  Eye,
  Calendar,
  Loader2,
  Quote,
  Heart,
  Filter
} from "lucide-react";
import { BookOpen, RefreshCw } from "lucide-react";

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  });

 // In AdminTestimonials.jsx, modify the fetchData function:
const fetchData = async () => {
  try {
    setLoading(true);
    
    // Fetch pending testimonials - use the correct endpoint
    const pendingRes = await API.get("/testimonials/pending");
    console.log("Pending testimonials response:", pendingRes);
    console.log("Pending testimonials data:", pendingRes.data);
    setTestimonials(Array.isArray(pendingRes.data) ? pendingRes.data : []);
    
    // Fetch all testimonials for stats - use the correct endpoint
    const allRes = await API.get("/testimonials/all");
    console.log("All testimonials response:", allRes);
    const allTestimonials = Array.isArray(allRes.data) ? allRes.data : [];
    
    setStats({
      total: allTestimonials.length,
      approved: allTestimonials.filter(t => t.status === "approved").length,
      rejected: allTestimonials.filter(t => t.status === "rejected").length,
      pending: allTestimonials.filter(t => t.status === "pending").length
    });
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    console.error("Error response:", err.response);
    toast.error(err.response?.data?.message || "Failed to load testimonials");
    setTestimonials([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, status) => {
    setProcessingId(id);
    try {
      if (status === "approved") {
        await API.patch(`/testimonials/${id}/approve`);
        toast.success("Testimonial approved successfully!");
      } else if (status === "rejected") {
        await API.patch(`/testimonials/${id}/reject`);
        toast.success("Testimonial rejected");
      }
      await fetchData(); // Refresh after action
    } catch (err) {
      console.error("Error updating testimonial:", err);
      toast.error(err.response?.data?.message || "Failed to update testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Pending Testimonials
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review and manage student feedback submissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Submitted</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="mt-1 text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Pending Testimonials
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                All student testimonials have been reviewed. Great job keeping up!
              </p>
              <Sparkles className="h-8 w-8 text-yellow-500 mt-4" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial._id}
                className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400">
                    <Clock className="h-3 w-3" />
                    Pending
                  </span>
                </div>

                <div className="p-6">
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {testimonial.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <BookOpen className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {testimonial.course}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({testimonial.rating}/5)
                    </span>
                  </div>

                  {/* Feedback */}
                  <div className="relative mb-5">
                    <Quote className="absolute -top-1 -left-1 h-5 w-5 text-gray-300 dark:text-gray-700 opacity-50" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-4 line-clamp-3">
                      "{testimonial.feedback}"
                    </p>
                  </div>

                  {/* Submission Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Calendar className="h-3 w-3" />
                    Submitted {formatDate(testimonial.createdAt)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(testimonial._id, "approved")}
                      disabled={processingId === testimonial._id}
                      className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingId === testimonial._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ThumbsUp className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(testimonial._id, "rejected")}
                      disabled={processingId === testimonial._id}
                      className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingId === testimonial._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ThumbsDown className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>

                {/* Decorative gradient border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats Summary at bottom */}
        {testimonials.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quick Summary</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} waiting for review
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Will be approved</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;