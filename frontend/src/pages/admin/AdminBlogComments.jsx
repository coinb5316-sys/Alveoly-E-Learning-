// src/pages/admin/blog/AdminBlogComments.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  Check,
  X,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock data
const mockComments = [
  {
    id: 1,
    postId: 1,
    postTitle: "The Future of Nursing: AI-Powered Patient Care in 2026",
    user: "Emily Johnson, RN",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=50&h=50&fit=crop&crop=face",
    email: "emily.j@example.com",
    text: "This article perfectly captures the transformative power of AI in nursing. I've personally seen how these tools improve patient care!",
    date: "2026-01-15T14:30:00Z",
    status: "approved",
    likes: 24,
    replies: 3
  },
  {
    id: 2,
    postId: 1,
    postTitle: "The Future of Nursing: AI-Powered Patient Care in 2026",
    user: "Dr. Michael Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    email: "michael.c@example.com",
    text: "Excellent breakdown of the challenges and opportunities. The ethical considerations are particularly crucial.",
    date: "2026-01-15T12:15:00Z",
    status: "approved",
    likes: 18,
    replies: 1
  },
  {
    id: 3,
    postId: 2,
    postTitle: "Evidence-Based Practice: Bridging Research and Clinical Care",
    user: "Sarah Williams, RN",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face",
    email: "sarah.w@example.com",
    text: "This is exactly what I needed to read. The practical examples make it so much easier to implement EBP in my daily practice.",
    date: "2026-01-14T09:45:00Z",
    status: "pending",
    likes: 5,
    replies: 0
  },
  {
    id: 4,
    postId: 3,
    postTitle: "Mental Health in Healthcare Workers: Strategies for Self-Care",
    user: "Dr. Lisa Park",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face",
    email: "lisa.p@example.com",
    text: "As a healthcare worker myself, I really appreciate this article. The self-care strategies are practical and actionable.",
    date: "2026-01-13T16:20:00Z",
    status: "approved",
    likes: 42,
    replies: 5
  },
  {
    id: 5,
    postId: 3,
    postTitle: "Mental Health in Healthcare Workers: Strategies for Self-Care",
    user: "John Doe",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
    email: "john.d@example.com",
    text: "Great article! However, I think more emphasis should be placed on organizational-level changes to support mental health.",
    date: "2026-01-13T10:00:00Z",
    status: "pending",
    likes: 3,
    replies: 0
  },
  {
    id: 6,
    postId: 4,
    postTitle: "Telehealth: The New Normal in Patient Care",
    user: "Dr. Amanda Lee",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    email: "amanda.l@example.com",
    text: "Telehealth has truly transformed how we deliver care. This article highlights the key benefits and considerations perfectly.",
    date: "2026-01-12T11:30:00Z",
    status: "approved",
    likes: 27,
    replies: 2
  },
  {
    id: 7,
    postId: 5,
    postTitle: "Cultural Competence in Nursing: Providing Inclusive Care",
    user: "Maria Garcia, BSN",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=50&h=50&fit=crop&crop=face",
    email: "maria.g@example.com",
    text: "This is such an important topic. The cultural competence framework discussed here should be mandatory training for all nurses.",
    date: "2026-01-11T08:15:00Z",
    status: "spam",
    likes: 0,
    replies: 0
  }
];

const AdminBlogComments = () => {
  const [comments, setComments] = useState(mockComments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComment, setSelectedComment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleApprove = (id) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === id
          ? { ...comment, status: 'approved' }
          : comment
      )
    );
    toast.success('Comment approved');
  };

  const handleReject = (id) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === id
          ? { ...comment, status: 'rejected' }
          : comment
      )
    );
    toast.success('Comment rejected');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments(prev => prev.filter(comment => comment.id !== id));
      toast.success('Comment deleted');
    }
  };

  const handleMarkSpam = (id) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === id
          ? { ...comment, status: 'spam' }
          : comment
      )
    );
    toast.success('Marked as spam');
  };

  const handleViewDetails = (comment) => {
    setSelectedComment(comment);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      spam: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'spam': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          comment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          comment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: comments.length,
    approved: comments.filter(c => c.status === 'approved').length,
    pending: comments.filter(c => c.status === 'pending').length,
    spam: comments.filter(c => c.status === 'spam').length,
    rejected: comments.filter(c => c.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Comments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Moderate and manage blog comments
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Comments</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.spam}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Spam</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Comment
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Post
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-lg font-medium">No comments found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <motion.tr
                    key={comment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                          {comment.text}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {comment.replies} replies
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-red-500">❤️</span>
                            {comment.likes}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                        {comment.postTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.avatar}
                          alt={comment.user}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {comment.user}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                        {getStatusIcon(comment.status)}
                        {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(comment)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {comment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(comment.id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(comment.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {comment.status === 'approved' && (
                          <button
                            onClick={() => handleMarkSpam(comment.id)}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition"
                            title="Mark as Spam"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comment Detail Modal */}
      {isDetailModalOpen && selectedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Comment Details</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedComment.avatar}
                  alt={selectedComment.user}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedComment.user}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedComment.email}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Post</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedComment.postTitle}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Comment</p>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {selectedComment.text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedComment.status)}`}>
                    {getStatusIcon(selectedComment.status)}
                    {selectedComment.status.charAt(0).toUpperCase() + selectedComment.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(selectedComment.date)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Likes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedComment.likes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Replies</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedComment.replies}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                {selectedComment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedComment.id);
                        setIsDetailModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedComment.id);
                        setIsDetailModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedComment.id);
                    setIsDetailModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Delete Comment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogComments;