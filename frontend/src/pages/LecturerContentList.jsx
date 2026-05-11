// LecturerContentList.jsx - Same UI as AdminContent
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Video,
  Image,
  HelpCircle,
  File,
  Calendar,
  BookOpen,
  DollarSign,
  Loader2,
  X
} from "lucide-react";

const LecturerContentList = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", search: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
  });

  useEffect(() => {
    fetchContents();
  }, [filter]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.type) params.append("type", filter.type);
      if (filter.search) params.append("search", filter.search);
      
      // Lecturer gets their own content only
      const res = await axios.get(`/api/lecturer/content?${params.toString()}`);
      if (res.data.success) {
        setContents(res.data.content);
      }
    } catch (err) {
      console.error("Fetch content error:", err);
      toast.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/lecturer/content/${id}`);
      fetchContents();
      setShowDeleteModal(null);
      toast.success("Content deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  const openViewer = (content) => {
    if (content.type === "quiz") {
      // Navigate to quiz viewer or open modal
      return;
    }
    setViewer({
      open: true,
      type: content.type,
      url: content.fileUrl,
      title: content.title,
    });
  };

  const closeViewer = () => {
    setViewer({ open: false, type: "", url: "", title: "" });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "video": return <Video className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      case "image": return <Image className="h-4 w-4" />;
      case "quiz": return <HelpCircle className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "video": return "from-blue-500 to-cyan-600";
      case "pdf": return "from-red-500 to-rose-600";
      case "image": return "from-green-500 to-emerald-600";
      case "quiz": return "from-purple-500 to-indigo-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      video: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      pdf: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      image: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      quiz: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
    };
    return badges[type] || "bg-gray-100 dark:bg-gray-800 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            My Content
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your uploaded learning materials
          </p>
        </div>
        <Link
          to="/lecturer/content/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Create Content
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
            <option value="video">Videos</option>
            <option value="image">Images</option>
            <option value="pdf">PDFs</option>
            <option value="quiz">Quizzes</option>
          </select>
        </div>
        <button
          onClick={() => setFilter({ type: "", search: "" })}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : contents.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <File className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Content Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Create your first learning material to get started
            </p>
            <Link
              to="/lecturer/content/create"
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              Create Content
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {contents.map((content) => (
            <div
              key={content._id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Thumbnail */}
                  <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${getTypeColor(content.type)} flex-shrink-0 overflow-hidden`}>
                    {content.type === "quiz" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <HelpCircle className="text-white/80 text-3xl" />
                      </div>
                    ) : content.thumbnailUrl ? (
                      <img
                        src={content.thumbnailUrl}
                        className="w-full h-full object-cover"
                        alt={content.title}
                        onError={(e) => { e.target.src = "/api/placeholder/400/200"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getTypeIcon(content.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {content.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadge(content.type)} capitalize`}>
                        {content.type}
                      </span>
                      {content.isPaid && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700">
                          ₵{content.price}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(content.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {content.subjectId?.name || content.courseId?.name || "Unlinked"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openViewer(content)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                  <Link
                    to={`/lecturer/content/${content._id}/edit`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(content)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    title="Delete"
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

      {/* Media Viewer */}
      {viewer.open && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 text-white bg-black/50 flex-shrink-0">
            <h3 className="text-lg font-semibold">{viewer.title}</h3>
            <button onClick={closeViewer} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            {viewer.type === "video" && (
              <video src={viewer.url} controls autoPlay className="max-w-full max-h-full rounded-lg" />
            )}
            {viewer.type === "image" && (
              <img src={viewer.url} alt={viewer.title} className="max-w-full max-h-full rounded-lg" />
            )}
            {viewer.type === "pdf" && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(viewer.url)}&embedded=true`}
                title={viewer.title}
                className="w-full h-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerContentList;