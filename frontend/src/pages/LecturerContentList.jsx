// LecturerContentList.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  MoreVertical,
  FileText,
  ClipboardList,
  Star,
  FileQuestion,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";

const LecturerContentList = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", status: "", search: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [filter]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.type) params.append("type", filter.type);
      if (filter.status !== "") params.append("isPublished", filter.status === "published");
      if (filter.search) params.append("search", filter.search);
      
      const res = await axios.get(`/api/lecturer/content?${params.toString()}`);
      if (res.data.success) {
        setContent(res.data.content);
      }
    } catch (err) {
      console.error("Fetch content error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/lecturer/content/${id}`);
      fetchContent();
      setShowDeleteModal(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handlePublish = async (id, isPublished) => {
    try {
      await axios.patch(`/api/lecturer/content/${id}/publish`, { isPublished: !isPublished });
      fetchContent();
    } catch (err) {
      console.error("Publish error:", err);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      lesson: <FileText className="h-5 w-5 text-blue-500" />,
      exam: <ClipboardList className="h-5 w-5 text-purple-500" />,
      practice: <Star className="h-5 w-5 text-green-500" />,
      assignment: <FileQuestion className="h-5 w-5 text-orange-500" />
    };
    return icons[type] || <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getTypeBadge = (type) => {
    const badges = {
      lesson: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      exam: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      practice: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      assignment: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
    };
    return badges[type] || "bg-gray-100 dark:bg-gray-800 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            My Content
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your lessons, exams, practice materials, and assignments
          </p>
        </div>
        <Link
          to="/lecturer/content/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Create New Content
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Types</option>
            <option value="lesson">Lessons</option>
            <option value="exam">Exams</option>
            <option value="practice">Practice</option>
            <option value="assignment">Assignments</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <button
          onClick={fetchContent}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No content found</p>
          <Link to="/lecturer/content/create" className="text-blue-600 mt-2 inline-block">
            Create your first content →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {content.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {item.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadge(item.type)} capitalize`}>
                        {item.type}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${item.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      {item.questions && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FileQuestion className="h-3 w-3" />
                          {item.questions.length} questions
                        </div>
                      )}
                      {item.views > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <TrendingUp className="h-3 w-3" />
                          {item.views} views
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePublish(item._id, item.isPublished)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title={item.isPublished ? "Unpublish" : "Publish"}
                  >
                    {item.isPublished ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  <Link
                    to={`/lecturer/content/${item._id}/edit`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(item)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete Content
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{showDeleteModal.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerContentList;