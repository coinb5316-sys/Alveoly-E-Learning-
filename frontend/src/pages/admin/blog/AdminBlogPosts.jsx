// src/pages/admin/blog/AdminBlogPosts.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  Calendar,
  User,
  Tag,
  MoreVertical,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MessageSquare // <-- ADD THIS IMPORT
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock data - Replace with API calls
const mockPosts = [
  {
    id: 1,
    title: "The Future of Nursing: AI-Powered Patient Care in 2026",
    subtitle: "How artificial intelligence is revolutionizing healthcare delivery",
    category: "Healthcare Technology",
    tags: ["AI", "Nursing", "Healthcare", "Technology"],
    author: {
      id: 1,
      name: "Dr. Sarah Mitchell",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
    },
    status: "published",
    featured: true,
    views: 1247,
    likes: 89,
    comments: 34,
    publishDate: "2026-01-15",
    createdAt: "2026-01-10T10:30:00Z",
    updatedAt: "2026-01-15T14:20:00Z"
  },
  {
    id: 2,
    title: "Evidence-Based Practice: Bridging Research and Clinical Care",
    subtitle: "How to implement evidence-based practice in daily nursing routines",
    category: "Nursing Practice",
    tags: ["Evidence-Based Practice", "Nursing", "Research"],
    author: {
      id: 2,
      name: "Prof. James Anderson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    status: "draft",
    featured: false,
    views: 0,
    likes: 0,
    comments: 0,
    publishDate: null,
    createdAt: "2026-01-16T09:00:00Z",
    updatedAt: "2026-01-16T11:30:00Z"
  },
  {
    id: 3,
    title: "Mental Health in Healthcare Workers: Strategies for Self-Care",
    subtitle: "Essential wellness practices for nurses and healthcare professionals",
    category: "Mental Health",
    tags: ["Mental Health", "Wellness", "Self-Care"],
    author: {
      id: 3,
      name: "Dr. Emily Chen",
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face"
    },
    status: "published",
    featured: true,
    views: 2341,
    likes: 156,
    comments: 67,
    publishDate: "2026-01-10",
    createdAt: "2026-01-08T08:00:00Z",
    updatedAt: "2026-01-10T16:45:00Z"
  },
  {
    id: 4,
    title: "Telehealth: The New Normal in Patient Care",
    subtitle: "Best practices for virtual nursing consultations",
    category: "Telehealth",
    tags: ["Telehealth", "Virtual Care", "Technology"],
    author: {
      id: 4,
      name: "Dr. Michael Roberts",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    status: "pending",
    featured: false,
    views: 0,
    likes: 0,
    comments: 0,
    publishDate: null,
    createdAt: "2026-01-17T13:00:00Z",
    updatedAt: "2026-01-17T15:20:00Z"
  },
  {
    id: 5,
    title: "Cultural Competence in Nursing: Providing Inclusive Care",
    subtitle: "Understanding and respecting cultural differences in healthcare",
    category: "Patient Care",
    tags: ["Culture", "Diversity", "Patient Care"],
    author: {
      id: 5,
      name: "Dr. Maria Santos",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    status: "published",
    featured: false,
    views: 978,
    likes: 78,
    comments: 42,
    publishDate: "2026-01-05",
    createdAt: "2026-01-02T11:00:00Z",
    updatedAt: "2026-01-05T09:30:00Z"
  },
  {
    id: 6,
    title: "Nursing Leadership in the Digital Age",
    subtitle: "How nurse leaders can leverage technology for better outcomes",
    category: "Nursing Leadership",
    tags: ["Leadership", "Technology", "Management"],
    author: {
      id: 6,
      name: "Dr. Robert Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    },
    status: "archived",
    featured: false,
    views: 743,
    likes: 56,
    comments: 23,
    publishDate: "2026-01-03",
    createdAt: "2025-12-28T14:00:00Z",
    updatedAt: "2026-01-03T10:15:00Z"
  }
];

const statusColors = {
  published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  archived: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const statusIcons = {
  published: CheckCircle,
  draft: Edit,
  pending: Clock,
  archived: XCircle
};

const AdminBlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchPosts();
  }, [currentPage, statusFilter, categoryFilter, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      let filtered = [...mockPosts];
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(post =>
          post.title.toLowerCase().includes(search) ||
          post.subtitle.toLowerCase().includes(search) ||
          post.tags.some(tag => tag.toLowerCase().includes(search)) ||
          post.author.name.toLowerCase().includes(search)
        );
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(post => post.status === statusFilter);
      }
      
      // Category filter
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(post => post.category === categoryFilter);
      }
      
      // Pagination
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginated = filtered.slice(start, end);
      
      setPosts(paginated);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    }
  };

  const handleBulkDelete = () => {
    if (selectedPosts.length === 0) return;
    if (window.confirm(`Delete ${selectedPosts.length} selected posts?`)) {
      setPosts(prev => prev.filter(post => !selectedPosts.includes(post.id)));
      setSelectedPosts([]);
      setShowBulkActions(false);
      toast.success(`${selectedPosts.length} posts deleted`);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPosts(posts.map(post => post.id));
      setShowBulkActions(true);
    } else {
      setSelectedPosts([]);
      setShowBulkActions(false);
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => {
      const newSelected = prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId];
      setShowBulkActions(newSelected.length > 0);
      return newSelected;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategories = () => {
    const cats = ['all', ...new Set(mockPosts.map(post => post.category))];
    return cats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Blog Posts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all your blog posts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosts}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <Link
            to="/admin/blog/create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>
          
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="all">All Categories</option>
            {getCategories().filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedPosts.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
            >
              Delete Selected
            </button>
            <button
              onClick={() => {
                setSelectedPosts([]);
                setShowBulkActions(false);
              }}
              className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === posts.length && posts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Post
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stats
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
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-lg font-medium">No posts found</p>
                      <p className="text-sm">Try adjusting your filters or create a new post</p>
                      <Link
                        to="/admin/blog/create"
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Create New Post
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const StatusIcon = statusIcons[post.status] || Edit;
                  return (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => handleSelectPost(post.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            {post.featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                              {post.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {post.subtitle}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="px-1.5 py-0.5 text-xs text-gray-400">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {post.author.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {post.comments}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {post.status === 'published' ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(post.publishDate)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(post.createdAt)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/blog/edit/${post.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/blog/post/${post.id}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {posts.length} of {mockPosts.length} posts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogPosts;