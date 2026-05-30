// src/pages/AdminComments.jsx
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTrash, FaSpinner, FaCommentDots, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminComments = () => {
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingComments();
  }, []);

  const fetchPendingComments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/blogs/comments/pending");
      setPendingComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      toast.error("Failed to load pending comments");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (blogId, commentId) => {
    setActionLoading(commentId);
    try {
      await API.put(`/blogs/${blogId}/comments/${commentId}/approve`);
      setPendingComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("Comment approved successfully!");
    } catch (err) {
      console.error("Error approving comment:", err);
      toast.error("Failed to approve comment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (blogId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    setActionLoading(commentId);
    try {
      await API.delete(`/blogs/${blogId}/comments/${commentId}`);
      setPendingComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("Comment deleted successfully!");
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("Failed to delete comment");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comment Moderation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Approve or delete pending comments
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <FaCommentDots className="text-yellow-600" />
          <span className="font-semibold text-yellow-700 dark:text-yellow-400">
            {pendingComments.length} Pending
          </span>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        </div>
      ) : pendingComments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Pending Comments</h3>
          <p className="text-gray-500 dark:text-gray-400">
            All comments have been moderated. Check back later for new comments.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Comment Header */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {comment.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{comment.userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{comment.userEmail || "No email"}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  
                  {/* Comment Content */}
                  <div className="ml-13 pl-0 lg:ml-14">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
                    <Link
                      to={`/blog/${comment.blogSlug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FaEye className="text-xs" /> View on {comment.blogTitle}
                    </Link>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 lg:flex-col">
                  <button
                    onClick={() => handleApprove(comment.blogId, comment.id)}
                    disabled={actionLoading === comment.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === comment.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheckCircle />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(comment.blogId, comment.id)}
                    disabled={actionLoading === comment.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === comment.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComments;