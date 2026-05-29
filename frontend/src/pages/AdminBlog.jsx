// src/pages/AdminBlog.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter,
  FaSpinner, FaCheckCircle, FaClock, FaEyeSlash, FaChartLine
} from "react-icons/fa";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchBlogs();
    fetchStats();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/blogs");
      setBlogs(res.data.blogs);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/blogs/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      try {
        await API.delete(`/blogs/${id}`);
        setBlogs(prev => prev.filter(b => b._id !== id));
        toast.success("Blog deleted");
        fetchStats();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "all" || blog.status === statusFilter)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><FaCheckCircle className="text-xs" /> Published</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><FaClock className="text-xs" /> Draft</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500 mt-1">Create and manage blog posts</p>
        </div>
        <Link
          to="/admin/blog/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <FaPlus /> New Post
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Posts</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            <p className="text-sm text-gray-500">Published</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
            <p className="text-sm text-gray-500">Drafts</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{stats.totalViews?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Views</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-red-500">{stats.totalLikes}</p>
            <p className="text-sm text-gray-500">Total Likes</p>
          </div>
        </div>
      )}

      {/* Top Posts */}
      {stats?.topPosts?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaChartLine /> Top Performing Posts</h3>
          <div className="space-y-3">
            {stats.topPosts.map(post => (
              <div key={post._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{post.title}</p>
                  <p className="text-sm text-gray-500">{post.views} views • {post.likes} likes</p>
                </div>
                <Link to={`/blog/${post.slug}`} target="_blank" className="text-blue-600 hover:text-blue-700">
                  <FaEye />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Blog List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No blog posts found</p>
          <Link to="/admin/blog/create" className="inline-block mt-4 text-blue-600 hover:underline">
            Create your first post →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Title</th>
                <th className="text-left p-4 font-semibold text-gray-600">Category</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Views</th>
                <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{blog.excerpt}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{blog.category}</span>
                  </td>
                  <td className="p-4">{getStatusBadge(blog.status)}</td>
                  <td className="p-4 text-gray-600">{blog.views}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(blog.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/blog/edit/${blog._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FaEdit />
                      </Link>
                      <Link to={`/blog/${blog.slug}`} target="_blank" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <FaEye />
                      </Link>
                      <button onClick={() => handleDelete(blog._id, blog.title)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;