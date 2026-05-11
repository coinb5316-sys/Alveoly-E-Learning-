// LecturerContentForm.jsx - Simplified create/edit form
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Save,
  X,
  Upload,
  FileText,
  Video,
  Image,
  HelpCircle,
  DollarSign,
  Loader2,
  ArrowLeft
} from "lucide-react";

const LecturerContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "video",
    courseId: "",
    subjectId: "",
    isPaid: false,
    price: "",
    thumbnail: null
  });

  useEffect(() => {
    fetchCourses();
    if (id) fetchContent();
  }, [id]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Fetch courses error:", err);
      toast.error("Failed to fetch courses");
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/lecturer/content/${id}`);
      if (res.data.success) {
        const content = res.data.content;
        setFormData({
          title: content.title,
          type: content.type,
          courseId: content.courseId || "",
          subjectId: content.subjectId || "",
          isPaid: content.isPaid,
          price: content.price || "",
          thumbnail: null
        });
        // Fetch subjects for the course
        if (content.courseId) {
          fetchSubjects(content.courseId);
        }
      }
    } catch (err) {
      console.error("Fetch content error:", err);
      toast.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (courseId) => {
    if (!courseId) return;
    try {
      const res = await axios.get(`/subjects?courseId=${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Fetch subjects error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    if (name === "courseId") {
      setFormData(prev => ({ ...prev, subjectId: "" }));
      fetchSubjects(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error("Please enter a title");
      return;
    }
    
    if (!formData.courseId) {
      toast.error("Please select a course");
      return;
    }
    
    if (!formData.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    
    if (formData.type !== "quiz" && !file && !id) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setSaving(true);
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("type", formData.type);
    submitData.append("courseId", formData.courseId);
    submitData.append("subjectId", formData.subjectId);
    submitData.append("isPaid", formData.isPaid);
    submitData.append("price", formData.price);
    
    if (file) submitData.append("file", file);
    if (formData.thumbnail) submitData.append("thumbnail", formData.thumbnail);
    
    if (formData.type === "quiz") {
      submitData.append("quizTimerMinutes", "0");
      submitData.append("quizPassMark", "70");
    }
    
    try {
      if (id) {
        await axios.put(`/api/lecturer/content/${id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Content updated successfully");
      } else {
        await axios.post("/api/lecturer/content", submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Content created successfully");
      }
      navigate("/lecturer/content");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "video": return <Video className="h-5 w-5" />;
      case "image": return <Image className="h-5 w-5" />;
      case "pdf": return <FileText className="h-5 w-5" />;
      case "quiz": return <HelpCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/lecturer/content")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {id ? "Edit Content" : "Create New Content"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload learning materials for your students
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/lecturer/content")}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : (id ? "Update" : "Create")}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter content title"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["video", "image", "pdf", "quiz"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  formData.type === type
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {getTypeIcon(type)}
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Course & Subject */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course *
            </label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              disabled={!formData.courseId}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Premium Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Premium Content
          </label>
          {formData.isPaid && (
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          )}
        </div>

        {/* File Upload (for non-quiz) */}
        {formData.type !== "quiz" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content File {!id && "*"}
            </label>
            <input
              type="file"
              accept={formData.type === "video" ? "video/*" : formData.type === "image" ? "image/*" : "application/pdf"}
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
            />
          </div>
        )}

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.files[0] }))}
            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
          />
        </div>

        {/* Quiz Info */}
        {formData.type === "quiz" && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                  Quiz Created Successfully
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-500 mt-0.5">
                  After creation, you'll be able to add questions and configure quiz settings
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default LecturerContentForm;