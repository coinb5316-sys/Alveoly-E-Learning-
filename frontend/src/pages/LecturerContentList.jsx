// LecturerContentList.jsx - Complete updated with professional UI and topic organization
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  Video,
  Image,
  File,
  X,
  Eye,
  BookOpen,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Hash,
  List,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  GraduationCap,
  User
} from "lucide-react";

const LecturerContentList = () => {
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    total: 0,
    videos: 0,
    pdfs: 0,
    images: 0,
    quizzes: 0,
    paid: 0,
    free: 0,
    published: 0,
    draft: 0
  });

  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
  });

  useEffect(() => {
    fetchContents();
    fetchSubjectsAndTopics();
  }, []);

  useEffect(() => {
    filterContents();
  }, [searchTerm, typeFilter, topicFilter, contents]);

  const fetchSubjectsAndTopics = async () => {
    try {
      const res = await axios.get("/subjects");
      const subjectsData = res.data || [];
      setSubjects(subjectsData);
      
      // Extract all topics from all subjects
      const allTopics = [];
      subjectsData.forEach(subject => {
        if (subject.topics && subject.topics.length > 0) {
          subject.topics.forEach(topic => {
            allTopics.push({
              ...topic,
              subjectId: subject._id,
              subjectName: subject.name
            });
          });
        }
      });
      setTopics(allTopics);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/content/lecturer");
      setContents(res.data);
      
      // Calculate stats
      const newStats = {
        total: res.data.length,
        videos: res.data.filter(c => c.type === "video").length,
        pdfs: res.data.filter(c => c.type === "pdf").length,
        images: res.data.filter(c => c.type === "image").length,
        quizzes: res.data.filter(c => c.type === "quiz").length,
        paid: res.data.filter(c => c.isPaid).length,
        free: res.data.filter(c => !c.isPaid).length,
        published: res.data.filter(c => c.isPublished !== false).length,
        draft: res.data.filter(c => c.isPublished === false).length,
      };
      setStats(newStats);
    } catch (err) {
      console.error("Error fetching contents:", err);
      toast.error("Failed to fetch your contents");
    } finally {
      setLoading(false);
    }
  };

  const filterContents = () => {
    let filtered = [...contents];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.subjectId?.name && c.subjectId.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(c => c.type === typeFilter);
    }
    
    // Apply topic filter
    if (topicFilter !== "all") {
      filtered = filtered.filter(c => c.topicId === topicFilter);
    }
    
    setFilteredContents(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) return;
    try {
      await axios.delete(`/content/${id}`);
      setContents((prev) => prev.filter((c) => c._id !== id));
      toast.success("Content deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const openViewer = (c) => {
    if (c.type === "quiz") {
      toast.info("Quiz content - edit to add questions");
      return;
    }
    setViewer({
      open: true,
      type: c.type,
      url: c.fileUrl,
      title: c.title,
    });
  };

  const closeViewer = () => {
    setViewer({ open: false, type: "", url: "", title: "" });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "video": return <Video className="h-4 w-4" />;
      case "pdf": return <File className="h-4 w-4" />;
      case "image": return <Image className="h-4 w-4" />;
      case "quiz": return <HelpCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
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

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case "video": return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
      case "pdf": return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";
      case "image": return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400";
      case "quiz": return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t._id === topicId);
    return topic?.name || "Uncategorized";
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const toggleTopics = (subjectId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Group contents by topic for the topics view
  const getContentsByTopic = () => {
    const grouped = {};
    contents.forEach(content => {
      const topicId = content.topicId || 'uncategorized';
      if (!grouped[topicId]) {
        grouped[topicId] = [];
      }
      grouped[topicId].push(content);
    });
    return grouped;
  };

  const contentsByTopic = getContentsByTopic();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="h-44 bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              My Content Library
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Manage all the learning materials you've created</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <FolderOpen className="h-3 w-3" />
                {topics.length} topics available
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {stats.total} Total Items
              </span>
            </div>
            <button
              onClick={() => navigate("/lecturer/content/create")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              Create Content
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Videos</p>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.videos}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">PDFs</p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
                  {stats.pdfs}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <File className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Images</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
                  {stats.images}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <Image className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quizzes</p>
                <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
                  {stats.quizzes}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Premium</p>
                <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
                  {stats.paid}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
                  {stats.published}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mt-1">
                  {stats.draft}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Topics Section */}
        {topics.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-purple-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Your Content Topics</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">({topics.length} topics)</span>
              </div>
              {topicFilter !== "all" && (
                <button
                  onClick={() => setTopicFilter("all")}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear Filter
                </button>
              )}
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTopicFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    topicFilter === "all"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  All Content
                </button>
                {topics.map((topic) => {
                  const contentCount = contents.filter(c => c.topicId === topic._id).length;
                  return (
                    <button
                      key={topic._id}
                      onClick={() => setTopicFilter(topic._id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                        topicFilter === topic._id
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Hash className="h-3 w-3" />
                      {topic.name}
                      <span className={`ml-1 text-xs ${
                        topicFilter === topic._id ? "text-white/80" : "text-gray-400"
                      }`}>
                        ({contentCount})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">All Types</option>
              <option value="video">Videos</option>
              <option value="pdf">PDFs</option>
              <option value="image">Images</option>
              <option value="quiz">Quizzes</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {filteredContents.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Content Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {searchTerm || typeFilter !== "all" || topicFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't created any content yet. Use the form to upload your first learning material."}
              </p>
              {filteredContents.length === 0 && (searchTerm || typeFilter !== "all" || topicFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("all");
                    setTopicFilter("all");
                  }}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredContents.map((content) => {
              const topicName = content.topicId ? getTopicName(content.topicId) : null;
              const subjectName = getSubjectName(content.subjectId?._id || content.subjectId);
              
              return (
                <div
                  key={content._id}
                  onClick={() => openViewer(content)}
                  className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className={`relative h-44 w-full bg-gradient-to-br ${getTypeColor(content.type)}`}>
                    {content.type === "quiz" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <HelpCircle className="text-white/80 text-5xl mb-2" />
                        <span className="text-white font-medium text-sm">Quiz Content</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={content.thumbnailUrl || "/api/placeholder/400/200"}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          alt={content.title}
                          onError={(e) => { e.target.src = "/api/placeholder/400/200"; }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-12 w-12 text-white" />
                        </div>
                      </>
                    )}

                    {/* Type Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getTypeBadgeColor(content.type)}`}>
                      {getTypeIcon(content.type)}
                      <span className="capitalize">{content.type}</span>
                    </div>

                    {/* Topic Badge */}
                    {topicName && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-purple-600/80 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {topicName}
                      </div>
                    )}

                    {/* Price Badge */}
                    {content.isPaid && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-yellow-500 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ₵{content.price}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-lg text-white text-xs font-medium flex items-center gap-1 ${
                      content.isPublished !== false ? 'bg-green-500' : 'bg-orange-500'
                    }`}>
                      {content.isPublished !== false ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {content.isPublished !== false ? 'Published' : 'Draft'}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {content.title}
                    </h3>
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <GraduationCap className="h-3 w-3" />
                      <span className="truncate">{subjectName}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                      </div>
                      {content.type !== "quiz" && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{content.views || 0} views</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lecturer/content/edit/${content._id}`);
                        }}
                        className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(content._id);
                        }}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
    </>
  );
};

export default LecturerContentList;