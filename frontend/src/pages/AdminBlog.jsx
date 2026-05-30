// src/pages/AdminBlog.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter,
  FaSpinner, FaCheckCircle, FaClock, FaChartLine,
  FaTimes, FaCalendarAlt, FaTag, FaEye as FaViewIcon
} from "react-icons/fa";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchBlogs();
    fetchStats();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/blogs");
      setBlogs(res.data.blogs || []);
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
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "all" || blog.status === statusFilter)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs flex items-center gap-1"><FaCheckCircle className="text-xs" /> Published</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs flex items-center gap-1"><FaClock className="text-xs" /> Draft</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs">{status}</span>;
    }
  };

  const getImageUrl = (blog) => {
    if (!blog?.featuredImage) return null;
    if (typeof blog.featuredImage === 'string') return blog.featuredImage;
    if (blog.featuredImage?.url) return blog.featuredImage.url;
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage blog posts</p>
        </div>
        <Link
          to="/admin/blog/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm md:text-base"
        >
          <FaPlus className="text-sm" /> New Post
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{stats.published || 0}</p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Published</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.drafts || 0}</p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Drafts</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{(stats.totalViews || 0).toLocaleString()}</p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Views</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xl md:text-2xl font-bold text-red-500 dark:text-red-400">{stats.totalLikes || 0}</p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Likes</p>
          </div>
        </div>
      )}

      {/* Top Posts Section */}
      {stats?.topPosts?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
            <FaChartLine className="text-blue-500" /> Top Performing Posts
          </h3>
          <div className="space-y-2 md:space-y-3">
            {stats.topPosts.slice(0, 3).map(post => (
              <div key={post._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base line-clamp-1">{post.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{post.views} views • {post.likes} likes</p>
                </div>
                <Link to={`/blog/${post.slug}`} target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 self-end sm:self-center">
                  <FaEye />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-12 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base"
          />
        </div>
        
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <FaFilter /> Filter {statusFilter !== "all" && `(${statusFilter})`}
        </button>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="hidden sm:block px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Mobile Filter Dropdown */}
      {mobileFiltersOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-900 dark:text-white">Filter by Status</span>
            <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500">
              <FaTimes />
            </button>
          </div>
          <div className="space-y-2">
            {["all", "published", "draft", "archived"].map(status => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setMobileFiltersOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  statusFilter === status 
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Blog List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="text-3xl md:text-4xl text-blue-600 animate-spin" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No blog posts found</p>
          <Link to="/admin/blog/create" className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline">
            Create your first post →
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Title</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Category</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Views</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Date</th>
                    <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((blog) => (
                    <tr key={blog._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{blog.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{blog.excerpt}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">{blog.category}</span>
                      </td>
                      <td className="p-4">{getStatusBadge(blog.status)}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{blog.views || 0}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(blog.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/blog/edit/${blog._id}`} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                            <FaEdit />
                          </Link>
                          <Link to={`/blog/${blog.slug}`} target="_blank" className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                            <FaEye />
                          </Link>
                          <button onClick={() => handleDelete(blog._id, blog.title)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-3 md:space-y-4">
            {filteredBlogs.map((blog) => (
              <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                {getImageUrl(blog) && getImageUrl(blog) !== "/blog-default.jpg" && (
                  <img 
                    src={getImageUrl(blog)} 
                    alt={blog.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2 flex-1">
                    {blog.title}
                  </h3>
                  {getStatusBadge(blog.status)}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {blog.excerpt}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaTag className="text-blue-500" /> {blog.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt /> {new Date(blog.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaViewIcon /> {blog.views || 0} views
                  </span>
                </div>
                
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Link to={`/admin/blog/edit/${blog._id}`} className="px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-sm transition-colors">
                    <FaEdit className="inline mr-1" /> Edit
                  </Link>
                  <Link to={`/blog/${blog.slug}`} target="_blank" className="px-3 py-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg text-sm transition-colors">
                    <FaEye className="inline mr-1" /> View
                  </Link>
                  <button onClick={() => handleDelete(blog._id, blog.title)} className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm transition-colors">
                    <FaTrash className="inline mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBlog;