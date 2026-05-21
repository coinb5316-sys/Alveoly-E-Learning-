// LecturerContentForm.jsx - COMPLETELY FIXED VERSION
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Upload,
  DollarSign,
  Clock,
  Loader2,
  Eye,
  Save,
  BookOpen,
  GraduationCap,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  ArrowLeft,
  Building
} from "lucide-react";

// Quiz Editor Component (keep as is - same as before)
const QuizEditor = ({ content, onClose, onSave, refreshContents }) => {
  // ... (keep your existing QuizEditor code exactly as is)
};

// Main LecturerContentForm Component - COMPLETELY FIXED
const LecturerContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [courses, setCourses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [user, setUser] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
  });

  const [form, setForm] = useState({
    title: "",
    type: "video",
    linkType: "subject",
    programId: "",
    courseId: "",
    subjectId: "",
    isPaid: false,
    price: "",
    thumbnail: null,
  });

  // ================= FIXED: Get current user and fetch assigned subjects =================
  useEffect(() => {
    const fetchUserAndSubjects = async () => {
      try {
        console.log("🔄 Fetching user data...");
        
        // Fetch current user with populated fields
        const userRes = await axios.get("/auth/me");
        const userData = userRes.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        console.log("✅ User data received:", userData);
        console.log("📚 Lecturer info:", userData.lecturerInfo);
        
        // Get assigned subject IDs from user data
        let assignedIds = [];
        
        // Check multiple possible locations for assigned subjects
        if (userData.lecturerInfo?.assignedSubjects) {
          assignedIds = userData.lecturerInfo.assignedSubjects;
        } else if (userData.assignedSubjects) {
          assignedIds = userData.assignedSubjects;
        }
        
        // Handle if assignedIds contains objects instead of strings
        const extractedIds = assignedIds.map(id => {
          if (typeof id === 'object' && id._id) return id._id;
          if (typeof id === 'object' && id.toString) return id.toString();
          return id;
        }).filter(id => id);
        
        setAssignedSubjectIds(extractedIds);
        
        console.log("📌 Extracted assigned subject IDs:", extractedIds);
        
        if (extractedIds.length === 0) {
          console.warn("⚠️ No assigned subjects found!");
          setAllSubjects([]);
          setLoadingSubjects(false);
          return;
        }
        
        // Fetch subject details for each assigned ID
        setLoadingSubjects(true);
        const fetchedSubjects = [];
        const failedIds = [];
        
        for (const subjectId of extractedIds) {
          try {
            console.log(`🔍 Fetching subject: ${subjectId}`);
            const subjectRes = await axios.get(`/subjects/${subjectId}`);
            if (subjectRes.data) {
              fetchedSubjects.push(subjectRes.data);
              console.log(`✅ Loaded subject: ${subjectRes.data.name}`);
            }
          } catch (err) {
            console.error(`❌ Failed to fetch subject ${subjectId}:`, err.response?.status, err.response?.data);
            failedIds.push(subjectId);
          }
        }
        
        if (failedIds.length > 0) {
          console.warn(`⚠️ Could not fetch ${failedIds.length} subjects:`, failedIds);
          toast.error(`Failed to load ${failedIds.length} assigned subject(s). Please contact admin.`);
        }
        
        setAllSubjects(fetchedSubjects);
        console.log(`📚 Total subjects loaded: ${fetchedSubjects.length}`);
        
      } catch (err) {
        console.error("🔥 Error fetching user or subjects:", err);
        
        // Fallback to localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            const assignedIds = userData.lecturerInfo?.assignedSubjects || [];
            setAssignedSubjectIds(assignedIds);
            console.log("📌 Using cached user data, assigned IDs:", assignedIds);
          } catch (e) {
            console.error("Failed to parse stored user:", e);
          }
        }
        
        toast.error("Failed to load your assigned subjects. Please refresh and try again.");
      } finally {
        setLoadingSubjects(false);
      }
    };
    
    fetchUserAndSubjects();
  }, []);

  // Fetch courses and programs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, coursesRes] = await Promise.all([
          axios.get("/programs"),
          axios.get("/courses"),
        ]);
        setPrograms(programsRes.data);
        setCourses(coursesRes.data);
        console.log("📚 Programs loaded:", programsRes.data.length);
        console.log("📚 Courses loaded:", coursesRes.data.length);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to fetch courses and programs");
      }
    };
    fetchData();
  }, []);

  // ================= FIXED: Get available subjects =================
  const getAvailableSubjects = () => {
    console.log("🔍 getAvailableSubjects called");
    console.log("  - allSubjects:", allSubjects.length);
    console.log("  - form.courseId:", form.courseId);
    console.log("  - assignedSubjectIds:", assignedSubjectIds);
    
    let available = [...allSubjects];
    
    // Filter by selected course if any
    if (form.courseId) {
      available = available.filter(s => {
        const matchesCourse = s.courseId === form.courseId || s.courseId?._id === form.courseId;
        return matchesCourse;
      });
      console.log("  - After course filter:", available.length);
    }
    
    // Also filter by assigned IDs to be safe
    if (assignedSubjectIds.length > 0) {
      available = available.filter(s => assignedSubjectIds.includes(s._id));
      console.log("  - After assignment filter:", available.length);
    }
    
    console.log("  - Final available subjects:", available.map(s => s.name));
    return available;
  };

  // Fetch content for editing
  useEffect(() => {
    if (isEditing && id) {
      fetchContentForEdit();
    }
  }, [id, isEditing]);

  const fetchContentForEdit = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`/content/${id}`);
      const content = res.data;
      setContentData(content);
      
      setForm({
        title: content.title,
        type: content.type,
        linkType: content.subjectId ? "subject" : "course",
        programId: content.courseId?.programId?._id || content.courseId?.programId || "",
        courseId: content.courseId?._id || content.courseId || "",
        subjectId: content.subjectId?._id || content.subjectId || "",
        isPaid: content.isPaid,
        price: content.price || "",
        thumbnail: null,
      });
      
      // Load filtered courses for the program
      if (content.courseId?.programId) {
        const programId = content.courseId.programId._id || content.courseId.programId;
        await handleProgramChange(programId);
      }
      
      if (content.type === "quiz") {
        setSelectedLesson(content);
      }
      
    } catch (err) {
      console.error("Error fetching content:", err);
      toast.error("Failed to load content for editing");
      navigate("/lecturer/content");
    } finally {
      setFetching(false);
    }
  };

  // Handle program change - fetch courses for selected program
  const handleProgramChange = async (programId) => {
    setForm(prev => ({ ...prev, programId, courseId: "", subjectId: "" }));
    if (programId) {
      try {
        const res = await axios.get(`/courses/program/${programId}`);
        setFilteredCourses(res.data || []);
        console.log("📚 Filtered courses for program:", res.data.length);
      } catch (err) {
        console.error("Error fetching courses by program:", err);
        setFilteredCourses([]);
      }
    } else {
      setFilteredCourses([]);
    }
  };

  // Handle course change - reset subject selection
  const handleCourseChange = (courseId) => {
    setForm(prev => ({ ...prev, courseId, subjectId: "" }));
  };

  const handleUpload = async () => {
    if (!form.title) {
      toast.error("Please enter a title");
      return;
    }

    if (form.linkType === "subject" && !form.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    
    if (form.linkType === "course" && !form.courseId) {
      toast.error("Please select a course");
      return;
    }

    if (form.type !== "quiz" && !file && !isEditing) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    
    if (file && form.type !== "quiz") {
      formData.append("file", file);
    }
    
    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

    if (form.linkType === "subject") {
      formData.append("subjectId", form.subjectId);
      const selectedSubject = allSubjects.find(s => s._id === form.subjectId);
      if (selectedSubject && selectedSubject.courseId) {
        const courseIdValue = selectedSubject.courseId._id || selectedSubject.courseId;
        formData.append("courseId", courseIdValue);
      } else {
        toast.error("Selected subject is not associated with a course");
        setLoading(false);
        return;
      }
    } else {
      const courseIdValue = form.courseId._id || form.courseId;
      formData.append("courseId", courseIdValue);
    }

    formData.append("isPaid", form.isPaid);
    formData.append("price", form.price);

    if (form.type === "quiz") {
      formData.append("quizTimerMinutes", "0");
      formData.append("quizPassMark", "70");
    }

    try {
      let res;
      if (isEditing) {
        res = await axios.put(`/content/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Content updated successfully");
      } else {
        res = await axios.post("/content/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Uploaded successfully");
      }

      if (form.type === "quiz" && res.data) {
        setSelectedLesson(res.data);
        setShowQuizEditor(true);
      } else {
        navigate("/lecturer/content");
      }

      if (!isEditing) {
        resetForm();
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (!isEditing) {
      setForm({
        title: "",
        type: "video",
        linkType: "subject",
        programId: "",
        courseId: "",
        subjectId: "",
        isPaid: false,
        price: "",
        thumbnail: null,
      });
      setFile(null);
      setFilteredCourses([]);
    }
  };

  const closeViewer = () => {
    setViewer({ open: false, type: "", url: "", title: "" });
  };

  // Get available subjects for dropdown
  const availableSubjects = getAvailableSubjects();

  // Debug logging
  console.log("=== LECTURER CONTENT FORM STATE ===");
  console.log("Assigned Subject IDs:", assignedSubjectIds);
  console.log("All Subjects loaded:", allSubjects.length);
  console.log("Available Subjects (filtered):", availableSubjects.length);
  console.log("Form courseId:", form.courseId);
  console.log("Form subjectId:", form.subjectId);
  console.log("Loading subjects:", loadingSubjects);

  // Show loading state while fetching subjects
  if (loadingSubjects) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your assigned subjects...</p>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/lecturer/content")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {isEditing ? "Edit Content" : "Create Learning Content"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditing ? "Update your existing content" : "Upload videos, PDFs, images, and create quizzes for your assigned subjects"}
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Content" : "Upload New Content"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? "Update your existing content" : "Share learning materials with your students"}
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              placeholder="Enter content title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              disabled={isEditing}
            >
              <option value="video">🎥 Video</option>
              <option value="image">🖼 Image</option>
              <option value="pdf">📄 PDF</option>
              <option value="quiz">📝 Quiz</option>
            </select>

            <select
              value={form.linkType}
              onChange={(e) => setForm({ ...form, linkType: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="subject">Attach to Subject</option>
              <option value="course">Attach to Course</option>
            </select>
          </div>

          {/* Program Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.programId}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Program</option>
                  {programs.filter(p => p.isActive !== false).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.code ? `(${p.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Selection - Filtered by Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  disabled={!form.programId}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Course</option>
                  {filteredCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          {form.linkType === "subject" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  disabled={availableSubjects.length === 0 && assignedSubjectIds.length > 0}
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.isPaid ? "💰" : "📖"}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Warning Messages */}
              {assignedSubjectIds.length === 0 && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        No subjects assigned
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Please contact an administrator to assign subjects to your account.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 underline hover:no-underline"
                      >
                        Refresh Page
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {assignedSubjectIds.length > 0 && availableSubjects.length === 0 && form.courseId && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        No subjects for this course
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Your assigned subjects don't include any subjects from the selected course. Please select a different course or contact admin.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {assignedSubjectIds.length > 0 && availableSubjects.length === 0 && !form.courseId && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Select a course first
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Please select a program and course above to see your assigned subjects.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.isPaid}
                onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Premium Content
            </label>
            {form.isPaid && (
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="pl-10 pr-4 py-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            )}
          </div>

          {form.type !== "quiz" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content File {!isEditing && "*"}
                </label>
                <input
                  type="file"
                  accept="video/*,image/*,application/pdf"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile) {
                      const maxSize = form.type === 'video' ? 100 * 1024 * 1024 : 
                                     form.type === 'pdf' ? 50 * 1024 * 1024 : 
                                     10 * 1024 * 1024;
                      if (selectedFile.size > maxSize) {
                        toast.error(`${form.type.toUpperCase()} file too large! Maximum ${maxSize / (1024 * 1024)}MB`);
                        e.target.value = null;
                        return;
                      }
                      setFile(selectedFile);
                    }
                  }}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
                {isEditing && contentData?.fileUrl && (
                  <p className="text-xs text-gray-500 mt-1">Current file: {contentData.fileUrl?.split('/').pop()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thumbnail (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
                      toast.error("Thumbnail too large! Maximum size is 5MB");
                      e.target.value = null;
                      return;
                    }
                    setForm({ ...form, thumbnail: selectedFile });
                  }}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}

          {form.type === "quiz" && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                    {isEditing ? "Edit Quiz Content" : "Quiz Content"}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-0.5">
                    {isEditing ? "Update the quiz title and settings" : "After creating the quiz, you'll be able to add questions, set timer, and configure pass mark."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {loading ? "Processing..." : (isEditing ? "Update Content" : "Upload Content")}
            </button>
            <button
              onClick={() => navigate("/lecturer/content")}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Editor Modal */}
      {showQuizEditor && selectedLesson && (
        <QuizEditor
          content={selectedLesson}
          onClose={() => {
            setShowQuizEditor(false);
            setSelectedLesson(null);
            navigate("/lecturer/content");
          }}
          onSave={() => {}}
          refreshContents={() => {}}
        />
      )}
    </div>
  );
};

export default LecturerContentForm;