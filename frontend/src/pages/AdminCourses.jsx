// AdminCourses.jsx - BILLION-DOLLAR PROFESSIONAL with Program Integration
import { useState, useEffect } from "react";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaBook, 
  FaSearch,
  FaGraduationCap,
  FaFolderOpen,
  FaSpinner,
  FaBuilding,
  FaCheckCircle,
  FaExclamationCircle,
  FaFilter
} from "react-icons/fa";
import API from "../api/axios";
import initializeSocket, { getSocket } from "../config/socket";
import toast, { Toaster } from "react-hot-toast";

const AdminCourses = () => {
  const [socket, setSocket] = useState(null);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ name: "", programId: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgramId, setFilterProgramId] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // ================= DARK MODE =================
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    const newSocket = initializeSocket();
    setSocket(newSocket);
    
    fetchCourses();
    fetchPrograms();

    // Socket.IO listeners
    newSocket.on("course:created", (course) => {
      setCourses((prev) => [course, ...prev]);
      toast.success(`Course "${course.name}" created`);
    });

    newSocket.on("course:updated", (updatedCourse) => {
      setCourses((prev) =>
        prev.map((c) => (c._id === updatedCourse._id ? updatedCourse : c))
      );
      toast.success(`Course "${updatedCourse.name}" updated`);
    });

    newSocket.on("course:deleted", (_id) => {
      setCourses((prev) => prev.filter((c) => c._id !== _id));
      toast.info("Course deleted");
    });

    newSocket.on("program:created", () => fetchPrograms());
    newSocket.on("program:updated", () => fetchPrograms());
    newSocket.on("program:deleted", () => fetchPrograms());

    return () => {
      newSocket.off("course:created");
      newSocket.off("course:updated");
      newSocket.off("course:deleted");
      newSocket.off("program:created");
      newSocket.off("program:updated");
      newSocket.off("program:deleted");
    };
  }, []);

  // ================= FETCH COURSES =================
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/courses");
      const coursesData = Array.isArray(res.data) ? res.data : [];
      setCourses(coursesData);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to fetch courses");
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH PROGRAMS =================
  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const res = await API.get("/programs");
      setPrograms(res.data || []);
    } catch (err) {
      console.error("Error fetching programs:", err);
      toast.error("Failed to load programs");
    } finally {
      setLoadingPrograms(false);
    }
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ================= ADD =================
  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error("Course name is required");
      return;
    }
    if (!form.programId) {
      toast.error("Please select a program");
      return;
    }

    try {
      setLoading(true);
      await API.post("/courses", form);
      setForm({ name: "", programId: "" });
      await fetchCourses();
      toast.success("Course created successfully!");
      document.getElementById('add-course-modal')?.close();
    } catch (err) {
      console.error("Error adding course:", err);
      toast.error(err.response?.data?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (_id, name) => {
    if (!window.confirm(`Delete course "${name}"? This action cannot be undone.`)) return;

    try {
      await API.delete(`/courses/${_id}`);
      setCourses((prev) => prev.filter((c) => c._id !== _id));
      toast.success(`Course "${name}" deleted`);
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error(err.response?.data?.message || "Failed to delete course");
    }
  };

  // ================= EDIT =================
  const handleEdit = (course) => {
    setEditing(course);
    setForm({
      name: course.name,
      programId: course.programId?._id || course.programId,
    });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!form.name.trim()) {
      toast.error("Course name is required");
      return;
    }
    if (!form.programId) {
      toast.error("Please select a program");
      return;
    }

    try {
      setLoading(true);
      await API.put(`/courses/${editing._id}`, form);
      setEditing(null);
      setForm({ name: "", programId: "" });
      await fetchCourses();
      toast.success("Course updated successfully!");
    } catch (err) {
      console.error("Error updating course:", err);
      toast.error(err.response?.data?.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  // Get program name by ID
  const getProgramName = (programId) => {
    const program = programs.find(p => p._id === programId);
    return program?.name || "Unknown Program";
  };

  // Get program color
  const getProgramColor = (index) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-600",
    ];
    return colors[index % colors.length];
  };

  // Filter courses based on search and program filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = !filterProgramId || course.programId?._id === filterProgramId || course.programId === filterProgramId;
    return matchesSearch && matchesProgram;
  });

  // Stats
  const activeProgramsCount = programs.filter(p => p.isActive !== false).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            borderRadius: "16px",
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm">
            <FaBook className="text-blue-600 dark:text-blue-400 text-sm" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Course Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Course Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
            Create, manage, and organize your educational courses under academic programs
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaBook className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Courses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaBuilding className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Programs</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{programs.length}</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Programs</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeProgramsCount}</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Courses/Program</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {programs.length ? Math.round(courses.length / programs.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter, and Add Section */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Program Filter */}
          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <select
              value={filterProgramId}
              onChange={(e) => setFilterProgramId(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.name} {program.isActive === false ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Add Course Button */}
          <button
            onClick={() => {
              setEditing(null);
              setForm({ name: "", programId: "" });
              document.getElementById('add-course-modal')?.showModal();
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25"
          >
            <FaPlus className="h-4 w-4" />
            Add New Course
          </button>
        </div>

        {/* Courses Grid/Loading/Error */}
        {loading && courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaBook className="w-6 h-6 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <FaExclamationCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-center">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 flex items-center justify-center mb-4">
              <FaFolderOpen className="w-12 h-12 text-blue-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {searchTerm || filterProgramId ? "No courses match your criteria" : "No courses yet"}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {searchTerm || filterProgramId ? "Try different search terms" : "Create your first course to get started"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCourses.map((course, index) => {
              const programColor = getProgramColor(
                programs.findIndex(p => p._id === (course.programId?._id || course.programId))
              );
              const programName = course.programId?.name || getProgramName(course.programId);
              
              return (
                <div
                  key={course._id}
                  className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left - Course Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${programColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <FaBook className="text-white text-xl" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-lg text-slate-900 dark:text-white break-words">
                            {course.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 text-indigo-700 dark:text-indigo-400">
                              <FaBuilding className="w-2.5 h-2.5" />
                              {programName}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              ID: {course._id?.slice(-8) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right - Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => handleEdit(course)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all text-sm font-medium"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course._id, course.name)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all text-sm font-medium"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Course Modal */}
      <dialog id="add-course-modal" className="bg-transparent">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {editing ? <FaEdit className="text-white text-lg" /> : <FaPlus className="text-white text-lg" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editing ? "Edit Course" : "New Course"}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {editing ? "Modify course details" : "Add a new course to a program"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: "", programId: "" });
                    document.getElementById('add-course-modal')?.close();
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to Nursing"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  autoFocus
                />
              </div>

              {/* Program Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Program <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    name="programId"
                    value={form.programId}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select a program</option>
                    {programs.filter(p => p.isActive !== false).map((program) => (
                      <option key={program._id} value={program._id}>
                        {program.name} {program.code ? `(${program.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {loadingPrograms && (
                  <p className="text-xs text-slate-400 mt-1">Loading programs...</p>
                )}
                {programs.filter(p => p.isActive !== false).length === 0 && !loadingPrograms && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    No active programs available. Please create a program first.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={editing ? handleUpdate : handleAdd}
                disabled={loading || (!editing && programs.filter(p => p.isActive !== false).length === 0)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editing ? <FaEdit className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
                    {editing ? "Update Course" : "Create Course"}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "", programId: "" });
                  document.getElementById('add-course-modal')?.close();
                }}
                className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AdminCourses;