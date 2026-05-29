// AdminPrograms.jsx - Billion-Dollar Professional UI
import { useState, useEffect } from "react";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaBriefcase,
  FaSearch,
  FaBuilding,
  FaCode,
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaBookOpen
} from "react-icons/fa";
import API from "../api/axios";
import initializeSocket, { getSocket } from "../config/socket";
import toast, { Toaster } from "react-hot-toast";

const AdminPrograms = () => {
  const [socket, setSocket] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    code: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [programCourses, setProgramCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // ================= DARK MODE =================
  const [darkMode, setDarkMode] = useState(false);
  
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
    
    fetchPrograms();

    // Socket.IO listeners
    newSocket.on("program:created", (program) => {
      setPrograms((prev) => [program, ...prev]);
      toast.success(`Program "${program.name}" created`);
    });

    newSocket.on("program:updated", (updatedProgram) => {
      setPrograms((prev) =>
        prev.map((p) => (p._id === updatedProgram._id ? updatedProgram : p))
      );
      toast.success(`Program "${updatedProgram.name}" updated`);
    });

    newSocket.on("program:deleted", (_id) => {
      setPrograms((prev) => prev.filter((p) => p._id !== _id));
      toast.info("Program deleted");
    });

    return () => {
      newSocket.off("program:created");
      newSocket.off("program:updated");
      newSocket.off("program:deleted");
    };
  }, []);

  // ================= FETCH PROGRAMS =================
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/programs");
      setPrograms(res.data || []);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError(err.response?.data?.message || "Failed to fetch programs");
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH COURSES FOR PROGRAM =================
  const fetchProgramCourses = async (programId) => {
    try {
      setLoadingCourses(true);
      const res = await API.get(`/courses/program/${programId}`);
      setProgramCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching program courses:", err);
      setProgramCourses([]);
    } finally {
      setLoadingCourses(false);
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
      toast.error("Program name is required");
      return;
    }

    try {
      setLoading(true);
      await API.post("/programs", form);
      setForm({ name: "", description: "", code: "" });
      await fetchPrograms();
      toast.success("Program created successfully!");
      document.getElementById('add-program-modal')?.close();
    } catch (err) {
      console.error("Error adding program:", err);
      toast.error(err.response?.data?.message || "Failed to add program");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (_id, name) => {
    if (!window.confirm(`Delete program "${name}"? This will also delete all associated courses.`)) return;

    try {
      await API.delete(`/programs/${_id}`);
      setPrograms((prev) => prev.filter((p) => p._id !== _id));
      toast.success(`Program "${name}" deleted`);
    } catch (err) {
      console.error("Error deleting program:", err);
      toast.error(err.response?.data?.message || "Failed to delete program");
    }
  };

  // ================= EDIT =================
const handleEdit = (program) => {
  setEditing(program);
  setForm({
    name: program.name,
    description: program.description || "",
    code: program.code || "",
  });
  // OPEN THE MODAL
  document.getElementById('add-program-modal')?.showModal();
};

  // ================= UPDATE =================
const handleUpdate = async () => {
  if (!form.name.trim()) {
    toast.error("Program name is required");
    return;
  }

  try {
    setLoading(true);
    await API.put(`/programs/${editing._id}`, form);
    setEditing(null);
    setForm({ name: "", description: "", code: "" });
    await fetchPrograms();
    toast.success("Program updated successfully!");
    // CLOSE THE MODAL
    document.getElementById('add-program-modal')?.close();
  } catch (err) {
    console.error("Error updating program:", err);
    toast.error(err.response?.data?.message || "Failed to update program");
  } finally {
    setLoading(false);
  }
};

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (program) => {
    try {
      await API.put(`/programs/${program._id}`, {
        ...program,
        isActive: !program.isActive,
      });
      await fetchPrograms();
      toast.success(`Program ${!program.isActive ? "activated" : "deactivated"}`);
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Failed to update status");
    }
  };

  // ================= VIEW DETAILS =================
  const handleViewDetails = async (program) => {
    setSelectedProgram(program);
    await fetchProgramCourses(program._id);
    setShowDetailsModal(true);
  };

  // Filter programs based on search
  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (program.code && program.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats
  const activePrograms = programs.filter(p => p.isActive !== false).length;
  const inactivePrograms = programs.filter(p => p.isActive === false).length;

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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm">
            <FaBriefcase className="text-indigo-600 dark:text-indigo-400 text-sm" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Program Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Academic Programs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
            Create and manage academic programs. Each program contains multiple courses.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaBriefcase className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Programs</p>
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
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activePrograms}</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaExclamationCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Inactive Programs</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{inactivePrograms}</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Courses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {programs.reduce((acc, p) => acc + (p.courseCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add Section */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search programs by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setForm({ name: "", description: "", code: "" });
              document.getElementById('add-program-modal')?.showModal();
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25"
          >
            <FaPlus className="h-4 w-4" />
            Add New Program
          </button>
        </div>

        {/* Programs Grid/Loading/Error */}
        {loading && programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaBriefcase className="w-6 h-6 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading programs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <FaExclamationCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-center">{error}</p>
            <button
              onClick={fetchPrograms}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center mb-4">
              <FaBriefcase className="w-12 h-12 text-indigo-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {searchTerm ? "No programs match your search" : "No programs yet"}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {searchTerm ? "Try a different search term" : "Create your first program to get started"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((program, index) => (
              <div
                key={program._id}
                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Card Header with Gradient */}
                <div className={`relative overflow-hidden h-32 bg-gradient-to-r ${
                  program.isActive !== false 
                    ? "from-indigo-600 to-purple-600" 
                    : "from-slate-600 to-slate-700"
                } p-5`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <FaBuilding className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg line-clamp-1">
                            {program.name}
                          </h3>
                          {program.code && (
                            <p className="text-white/70 text-xs font-mono mt-0.5">
                              {program.code}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        program.isActive !== false
                          ? "bg-green-500/20 text-green-200"
                          : "bg-red-500/20 text-red-200"
                      }`}>
                        {program.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {program.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {program.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>{new Date(program.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaBookOpen className="w-3 h-3" />
                      <span>{program.courseCount || 0} Courses</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleViewDetails(program)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all text-sm font-medium"
                    >
                      <FaEye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleToggleStatus(program)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                        program.isActive !== false
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                          : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                      }`}
                    >
                      {program.isActive !== false ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                      {program.isActive !== false ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEdit(program)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-all text-sm font-medium"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(program._id, program.name)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all text-sm font-medium"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Program Modal */}
      <dialog id="add-program-modal" className="bg-transparent">
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
                      {editing ? "Edit Program" : "New Program"}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {editing ? "Modify program details" : "Create a new academic program"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: "", description: "", code: "" });
                    document.getElementById('add-program-modal')?.close();
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Program Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor of Science in Nursing"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Program Code
                </label>
                <div className="relative">
                  <FaCode className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g., BSN, RN-BSN"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Unique identifier for the program (optional)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the program, its objectives, and requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={editing ? handleUpdate : handleAdd}
                disabled={loading}
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
                    {editing ? "Update Program" : "Create Program"}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "", description: "", code: "" });
                  document.getElementById('add-program-modal')?.close();
                }}
                className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* Program Details Modal */}
      {showDetailsModal && selectedProgram && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
            <div className={`bg-gradient-to-r ${
              selectedProgram.isActive !== false 
                ? "from-indigo-600 to-purple-600" 
                : "from-slate-600 to-slate-700"
            } px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaBriefcase className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedProgram.name}</h3>
                    {selectedProgram.code && (
                      <p className="text-white/70 text-sm font-mono">{selectedProgram.code}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedProgram(null);
                    setProgramCourses([]);
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6">
              {/* Program Info */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {selectedProgram.description || "No description provided."}
                </p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FaCalendarAlt className="w-3 h-3" />
                    Created: {new Date(selectedProgram.createdAt).toLocaleDateString()}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedProgram.isActive !== false
                      ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                  }`}>
                    {selectedProgram.isActive !== false ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>

              {/* Courses Section */}
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FaBookOpen className="text-indigo-500" />
                Courses in this Program
              </h4>

              {loadingCourses ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-indigo-500 text-2xl" />
                </div>
              ) : programCourses.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No courses added to this program yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {programCourses.map((course) => (
                    <div key={course._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <FaBookOpen className="text-white text-sm" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {course.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProgram(null);
                  setProgramCourses([]);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrograms;