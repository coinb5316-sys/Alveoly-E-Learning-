// pages/AdminTopics.jsx - COMPLETE FIXED WITH AUTH HANDLING
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  Save,
  X,
  AlertCircle,
  BookOpen,
  Layers,
  FolderTree,
  List,
  Grid,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../api/axios";
import initializeSocket from "../config/socket";

const AdminTopics = () => {
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Hierarchy state
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  // Topics state
  const [topics, setTopics] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 0,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ================= SOCKET.IO SETUP =================
  useEffect(() => {
    const newSocket = initializeSocket();
    setSocket(newSocket);
    
    fetchPrograms();

    if (newSocket) {
      newSocket.on("program:created", () => fetchPrograms());
      newSocket.on("program:updated", () => fetchPrograms());
      newSocket.on("program:deleted", () => fetchPrograms());
      
      newSocket.on("course:created", () => {
        if (selectedProgram) fetchCourses(selectedProgram);
      });
      newSocket.on("course:updated", () => {
        if (selectedProgram) fetchCourses(selectedProgram);
      });
      newSocket.on("course:deleted", () => {
        if (selectedProgram) fetchCourses(selectedProgram);
      });
      
      newSocket.on("subject:created", () => {
        if (selectedCourse) fetchSubjects(selectedCourse);
      });
      newSocket.on("subject:updated", () => {
        if (selectedCourse) fetchSubjects(selectedCourse);
      });
      newSocket.on("subject:deleted", () => {
        if (selectedCourse) fetchSubjects(selectedCourse);
      });
      
      // Listen for topic updates
      newSocket.on("subject:updated", (updatedSubject) => {
        if (selectedSubject && updatedSubject._id === selectedSubject) {
          fetchTopics(selectedSubject);
        }
      });
    }

    return () => {
      if (newSocket) {
        newSocket.off("program:created");
        newSocket.off("program:updated");
        newSocket.off("program:deleted");
        newSocket.off("course:created");
        newSocket.off("course:updated");
        newSocket.off("course:deleted");
        newSocket.off("subject:created");
        newSocket.off("subject:updated");
        newSocket.off("subject:deleted");
      }
    };
  }, []);

  // Re-fetch when selection changes
  useEffect(() => {
    if (selectedProgram) {
      fetchCourses(selectedProgram);
      setSelectedCourse("");
      setSelectedSubject("");
      setTopics([]);
    } else {
      setCourses([]);
      setSelectedCourse("");
      setSelectedSubject("");
      setTopics([]);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedCourse) {
      fetchSubjects(selectedCourse);
      setSelectedSubject("");
      setTopics([]);
    } else {
      setSubjects([]);
      setSelectedSubject("");
      setTopics([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject);
    } else {
      setTopics([]);
    }
  }, [selectedSubject]);

  // ================= API CALLS =================

  const fetchPrograms = async () => {
    try {
      const res = await API.get("/programs");
      const data = res.data || [];
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load programs");
      }
      setPrograms([]);
    }
  };

  const fetchCourses = async (programId) => {
    try {
      const res = await API.get(`/courses/program/${programId}`);
      const data = res.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load courses");
      }
      setCourses([]);
    }
  };

  const fetchSubjects = async (courseId) => {
    try {
      const res = await API.get(`/subjects?course=${courseId}`);
      const data = res.data || [];
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load subjects");
      }
      setSubjects([]);
    }
  };

  const fetchTopics = async (subjectId) => {
    setLoading(true);
    try {
      console.log("Fetching topics for subject:", subjectId);
      const res = await API.get(`/subjects/${subjectId}`);
      console.log("Topics response:", res.data);
      const data = res.data || {};
      const topicsData = data.topics || [];
      setTopics(Array.isArray(topicsData) ? topicsData : []);
    } catch (error) {
      console.error("Error fetching topics:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Authentication failed. Please refresh the page and try again.");
      } else if (error.response?.status === 404) {
        toast.error("Subject not found");
      } else {
        toast.error("Failed to load topics");
      }
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLER FUNCTIONS =================

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        name: topic.name || "",
        description: topic.description || "",
        order: topic.order || 0,
        isActive: topic.isActive !== undefined ? topic.isActive : true
      });
    } else {
      setEditingTopic(null);
      setFormData({
        name: "",
        description: "",
        order: Array.isArray(topics) ? topics.length : 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTopic(null);
    setFormData({
      name: "",
      description: "",
      order: 0,
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Topic name is required");
      return;
    }

    if (!selectedSubject) {
      toast.error("Please select a subject first");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Saving topic:", {
        subjectId: selectedSubject,
        data: formData,
        isEditing: !!editingTopic
      });

      if (editingTopic) {
        // Update existing topic
        await API.put(
          `/subjects/${selectedSubject}/topics/${editingTopic._id}`,
          formData
        );
        toast.success("Topic updated successfully!");
      } else {
        // Create new topic
        await API.post(
          `/subjects/${selectedSubject}/topics`,
          formData
        );
        toast.success("Topic created successfully!");
      }
      handleCloseModal();
      fetchTopics(selectedSubject);
    } catch (error) {
      console.error("Error saving topic:", error);
      console.error("Error details:", error.response?.data);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Authentication failed. Please refresh and try again.");
      } else if (error.response?.status === 404) {
        toast.error("Subject not found. Please select a valid subject.");
      } else {
        toast.error(error.response?.data?.message || "Failed to save topic");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await API.delete(
        `/subjects/${selectedSubject}/topics/${topicId}`
      );
      toast.success("Topic deleted successfully!");
      setDeleteConfirm(null);
      fetchTopics(selectedSubject);
    } catch (error) {
      console.error("Error deleting topic:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Authentication failed. Please refresh and try again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to delete topic");
      }
    }
  };

  const handleReorder = async (topicId, direction) => {
    if (!Array.isArray(topics) || topics.length === 0) return;
    
    const currentIndex = topics.findIndex(t => t._id === topicId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= topics.length) return;

    const topic1 = topics[currentIndex];
    const topic2 = topics[newIndex];
    
    try {
      await Promise.all([
        API.put(
          `/subjects/${selectedSubject}/topics/${topic1._id}`,
          { ...topic1, order: topic2.order }
        ),
        API.put(
          `/subjects/${selectedSubject}/topics/${topic2._id}`,
          { ...topic2, order: topic1.order }
        )
      ]);
      
      fetchTopics(selectedSubject);
      toast.success("Topics reordered successfully!");
    } catch (error) {
      console.error("Error reordering topics:", error);
      toast.error("Failed to reorder topics");
    }
  };

  // ================= SAFE DATA ACCESS =================

  const safePrograms = Array.isArray(programs) ? programs : [];
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeTopics = Array.isArray(topics) ? topics : [];

  const selectedProgramName = safePrograms.find(p => p._id === selectedProgram)?.name || "";
  const selectedCourseName = safeCourses.find(c => c._id === selectedCourse)?.name || "";
  const selectedSubjectName = safeSubjects.find(s => s._id === selectedSubject)?.name || "";

  const filteredTopics = safeTopics.filter(topic =>
    topic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ================= RENDER =================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Topics Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage topics organized by Program → Course → Subject
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedSubject && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              Add Topic
            </button>
          )}
          <button
            onClick={() => {
              if (selectedProgram) fetchCourses(selectedProgram);
              if (selectedCourse) fetchSubjects(selectedCourse);
              if (selectedSubject) fetchTopics(selectedSubject);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hierarchy Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Program Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Program
              </div>
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select Program</option>
              {safePrograms.filter(p => p.isActive !== false).map(program => (
                <option key={program._id} value={program._id}>
                  {program.name} {program.code ? `(${program.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Course Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Course
              </div>
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!selectedProgram}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Course</option>
              {safeCourses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                Subject
              </div>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedCourse}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Subject</option>
              {safeSubjects.map(subject => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} {subject.isPaid ? "💰" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Selection Display */}
        {selectedSubject && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Current Path:</span>
              <span className="text-blue-600 dark:text-blue-400">{selectedProgramName}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
              <span className="text-blue-600 dark:text-blue-400">{selectedCourseName}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">{selectedSubjectName}</span>
              <span className="ml-2 text-gray-400">({safeTopics.length} topics)</span>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      {selectedSubject && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Topics List */}
      {selectedSubject ? (
        loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading topics...</p>
          </div>
        ) : safeTopics.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Topics Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Click the <span className="font-semibold text-blue-600">"Add Topic"</span> button above to create the first topic for this subject
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "space-y-3"
          }>
            {filteredTopics.map((topic, index) => (
              <div
                key={topic._id}
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all ${
                  viewMode === "grid" ? "p-5" : "p-4"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {!topic.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          Inactive
                        </span>
                      )}
                      <span className="text-sm text-gray-400 dark:text-gray-500">#{topic.order + 1}</span>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {topic.name}
                      </h3>
                    </div>
                    {topic.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleReorder(topic._id, "up")}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReorder(topic._id, "down")}
                      disabled={index === safeTopics.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(topic)}
                      className="p-1.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Edit Topic"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(topic._id)}
                      className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete Topic"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === topic._id && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <span>Delete "{topic.name}"? This action cannot be undone.</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteTopic(topic._id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <FolderTree className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select a Subject</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Use the dropdowns above to navigate through Programs → Courses → Subjects to manage topics
          </p>
        </div>
      )}

      {/* Modal for Create/Edit Topic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {editingTopic ? <Edit className="text-white text-lg" /> : <Plus className="text-white text-lg" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingTopic ? "Edit Topic" : "New Topic"}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {editingTopic ? "Modify topic details" : `Add to: ${selectedSubjectName}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter topic name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                  placeholder="Enter topic description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingTopic ? "Update Topic" : "Create Topic"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTopics;