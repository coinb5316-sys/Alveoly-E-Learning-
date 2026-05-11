// LecturerContentForm.jsx - Same upload UI as AdminContent's upload form
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
    linkType: "subject",
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
    // ✅ Remove /api prefix - just use /lecturer/content
    const res = await axios.get(`/content/lecturer/content/${id}`);
    if (res.data.success) {
      const content = res.data.content;
      setFormData({
        title: content.title,
        type: content.type,
        linkType: content.subjectId ? "subject" : "course",
        courseId: content.courseId || "",
        subjectId: content.subjectId || "",
        isPaid: content.isPaid,
        price: content.price || "",
        thumbnail: null
      });
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

  // LecturerContentForm.jsx - Fix fetchSubjects
const fetchSubjects = async (courseId) => {
  if (!courseId) return;
  try {
    // ✅ CHANGE: Use 'course' parameter instead of 'courseId'
    const res = await axios.get(`/subjects?course=${courseId}`);
    console.log("Subjects fetched:", res.data);
    setSubjects(res.data);
  } catch (err) {
    console.error("Fetch subjects error:", err);
    toast.error("Failed to fetch subjects");
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
    // ✅ This will now work correctly
    fetchSubjects(value);
  }
  
  if (name === "subjectId") {
    const selectedSubject = subjects.find(s => s._id === value);
    if (selectedSubject && selectedSubject.courseId) {
      setFormData(prev => ({ ...prev, courseId: selectedSubject.courseId }));
    }
  }
};

  // LecturerContentForm.jsx - COMPLETE FIXED handleSubmit

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.title) {
    toast.error("Please enter a title");
    return;
  }
  
  if (formData.linkType === "subject" && !formData.subjectId) {
    toast.error("Please select a subject");
    return;
  }
  
  if (formData.linkType === "course" && !formData.courseId) {
    toast.error("Please select a course");
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
  
  if (file && formData.type !== "quiz") {
    submitData.append("file", file);
  }
  
  if (formData.thumbnail) submitData.append("thumbnail", formData.thumbnail);

  if (formData.linkType === "subject") {
    submitData.append("subjectId", formData.subjectId);
    // ✅ IMPORTANT: Also send courseId when using subject
    if (formData.courseId) {
      submitData.append("courseId", formData.courseId);
    } else {
      // Find the courseId from the selected subject
      const selectedSubject = subjects.find(s => s._id === formData.subjectId);
      if (selectedSubject && selectedSubject.courseId) {
        submitData.append("courseId", selectedSubject.courseId);
      }
    }
  } else {
    submitData.append("courseId", formData.courseId);
  }
  
  submitData.append("isPaid", formData.isPaid);
  submitData.append("price", formData.price);
  
  if (formData.type === "quiz") {
    submitData.append("quizTimerMinutes", "0");
    submitData.append("quizPassMark", "70");
  }
  
  try {
    if (id) {
      await axios.put(`/content/lecturer/content/${id}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Content updated successfully");
    } else {
      await axios.post("/content/lecturer/content", submitData, {
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

      {/* Upload Form - Same UI as Admin's upload form */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {id ? "Edit Content" : "Upload New Content"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {id ? "Update your existing content" : "Add new learning materials to the platform"}
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                placeholder="Enter content title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Type *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["video", "image", "pdf", "quiz"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      formData.type === type
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={formData.linkType}
              onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="subject">Attach to Subject</option>
              <option value="course">Attach to Course</option>
            </select>

            {formData.linkType === "subject" ? (
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            ) : (
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
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
                  className="pl-10 pr-4 py-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            )}
          </div>

          {formData.type !== "quiz" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content File {!id && "*"}
                </label>
                <input
                  type="file"
                  accept={formData.type === "video" ? "video/*" : formData.type === "image" ? "image/*" : "application/pdf"}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thumbnail (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}

          {formData.type === "quiz" && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                    Quiz Content Created
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-0.5">
                    After creating the quiz, you'll be able to add questions, set timer, and configure pass mark.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default LecturerContentForm;