// LecturerContentForm.jsx - SIMPLIFIED WORKING VERSION
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
  Building,
  Info
} from "lucide-react";

// Quiz Editor Component (keep your existing QuizEditor code)
const QuizEditor = ({ content, onClose, onSave, refreshContents }) => {
  // ... keep your existing QuizEditor code exactly as is
};

// Main LecturerContentForm Component - SIMPLIFIED WORKING VERSION
const LecturerContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [courses, setCourses] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]); // Already populated subjects!
  const [programs, setPrograms] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [user, setUser] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  // ================= STEP 1: Get current user (already has populated assignedSubjects) =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        console.log("🔄 Fetching user data...");
        
        const userRes = await axios.get("/auth/me");
        const userData = userRes.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        console.log("✅ User role:", userData.role);
        console.log("📚 Lecturer info:", userData.lecturerInfo);
        
        // Get assigned subjects - they are already populated with full subject objects!
        let subjects = [];
        if (userData.lecturerInfo?.assignedSubjects) {
          subjects = userData.lecturerInfo.assignedSubjects;
          console.log(`📚 Found ${subjects.length} assigned subjects (already populated):`);
          subjects.forEach(s => console.log(`  - ${s.name} (Course: ${s.courseId?.name || 'N/A'})`));
        }
        
        setAssignedSubjects(subjects);
        
        if (subjects.length === 0) {
          console.warn("⚠️ No subjects assigned to this lecturer!");
        }
        
      } catch (err) {
        console.error("🔥 Error fetching user:", err);
        toast.error("Failed to load user data");
        
        // Fallback to localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setAssignedSubjects(userData.lecturerInfo?.assignedSubjects || []);
          } catch (e) {
            console.error("Failed to parse stored user:", e);
          }
        }
      } finally {
        setLoadingUser(false);
      }
    };
    
    fetchUser();
  }, []);

  // ================= STEP 2: Fetch courses and programs =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, coursesRes] = await Promise.all([
          axios.get("/programs"),
          axios.get("/courses"),
        ]);
        setPrograms(programsRes.data || []);
        setCourses(coursesRes.data || []);
        console.log("📚 Programs loaded:", programsRes.data?.length);
        console.log("📚 Courses loaded:", coursesRes.data?.length);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to fetch courses and programs");
      }
    };
    fetchData();
  }, []);

  // ================= STEP 3: Fetch content for editing =================
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

  // ================= Helper functions =================
  const handleProgramChange = async (programId) => {
    setForm(prev => ({ ...prev, programId, courseId: "", subjectId: "" }));
    if (programId) {
      try {
        const res = await axios.get(`/courses/program/${programId}`);
        setFilteredCourses(res.data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setFilteredCourses([]);
      }
    } else {
      setFilteredCourses([]);
    }
  };

  const handleCourseChange = (courseId) => {
    setForm(prev => ({ ...prev, courseId, subjectId: "" }));
  };

  // Get subjects filtered by selected course (using already populated assignedSubjects)
  const getSubjectsForCourse = () => {
    if (!form.courseId) return assignedSubjects;
    
    return assignedSubjects.filter(subject => {
      const subjectCourseId = subject.courseId?._id || subject.courseId;
      return subjectCourseId === form.courseId;
    });
  };

  const availableSubjects = getSubjectsForCourse();

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
      const selectedSubject = assignedSubjects.find(s => s._id === form.subjectId);
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

  // Debug logging
  console.log("=== STATE DEBUG ===");
  console.log("Assigned Subjects count:", assignedSubjects.length);
  console.log("Assigned Subjects:", assignedSubjects.map(s => ({ id: s._id, name: s.name, courseId: s.courseId?._id || s.courseId })));
  console.log("Available for course:", availableSubjects.length);
  console.log("Form courseId:", form.courseId);
  console.log("Form subjectId:", form.subjectId);
  console.log("Loading user:", loadingUser);

  if (loadingUser) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your account...</p>
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

            {/* Course Selection */}
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

          {/* Subject Selection - Using already populated assignedSubjects */}
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
                  disabled={availableSubjects.length === 0}
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.isPaid ? "💰" : "📖"} {s.courseId?.name ? `(${s.courseId.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* No subjects assigned message */}
              {assignedSubjects.length === 0 && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        No subjects assigned to you
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        You don't have any subjects assigned yet. Please contact an administrator to assign subjects to your lecturer account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Subjects exist but none for selected course */}
              {assignedSubjects.length > 0 && availableSubjects.length === 0 && form.courseId && (
                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                        No subjects for this course
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        Your assigned subjects don't include any subjects from the selected course. Please select a different course or contact admin.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Need to select course first */}
              {assignedSubjects.length > 0 && availableSubjects.length === 0 && !form.courseId && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Select a course first
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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