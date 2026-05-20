// AdminSubjects.jsx - ORIGINAL WORKING CODE with PROGRAM SUPPORT ADDED
import { useState, useEffect } from "react";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaBook, 
  FaSearch,
  FaChalkboardTeacher,
  FaDollarSign,
  FaUnlockAlt,
  FaClock,
  FaUserGraduate,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaBuilding
} from "react-icons/fa";
import axios from "../api/axios";
import initializeSocket, { getSocket } from "../config/socket";

const AdminSubjects = () => {
  const [socket, setSocket] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualAccessList, setManualAccessList] = useState([]);
  const [duration, setDuration] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("subjects");

  const [form, setForm] = useState({
    name: "",
    programId: "",
    courseId: "",
    isPaid: false,
    price: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    const newSocket = initializeSocket();
    setSocket(newSocket);
    
    fetchData();

    if (newSocket) {
      newSocket.on("subject:created", (data) => {
        setSubjects((prev) => [data, ...prev]);
      });

      newSocket.on("subject:updated", (updated) => {
        setSubjects((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s))
        );
      });

      newSocket.on("subject:deleted", (_id) => {
        setSubjects((prev) => prev.filter((s) => s._id !== _id));
      });
    }

    return () => {
      if (newSocket) {
        newSocket.off("subject:created");
        newSocket.off("subject:updated");
        newSocket.off("subject:deleted");
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const [programsRes, coursesRes, subjectsRes, usersRes, manualRes] = await Promise.all([
        axios.get("/programs"),
        axios.get("/courses"),
        axios.get("/subjects"),
        axios.get("/users"),
        axios.get("/manual-access/all"),
      ]);
      setPrograms(programsRes.data || []);
      setCourses(coursesRes.data || []);
      setSubjects(subjectsRes.data || []);
      setUsers(usersRes.data || []);
      setManualAccessList(manualRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // ================= FILTER COURSES BY PROGRAM =================
  const handleProgramChange = async (programId) => {
    setForm({ ...form, programId, courseId: "" });
    if (programId) {
      try {
        const res = await axios.get(`/courses/program/${programId}`);
        setFilteredCourses(res.data || []);
      } catch (err) {
        console.error("Error fetching courses by program:", err);
        setFilteredCourses([]);
      }
    } else {
      setFilteredCourses([]);
    }
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // ================= ADD =================
  const handleAdd = async () => {
    if (!form.name) {
      alert("Subject name is required");
      return;
    }
    if (!form.programId) {
      alert("Please select a program");
      return;
    }
    if (!form.courseId) {
      alert("Please select a course");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/subjects", {
        name: form.name,
        programId: form.programId,
        courseId: form.courseId,
        isPaid: form.isPaid,
        price: form.isPaid ? Number(form.price) : 0,
      });
      setForm({ name: "", programId: "", courseId: "", isPaid: false, price: "" });
      setEditing(null);
      await fetchData();
      alert("Subject added successfully!");
    } catch (err) {
      console.error("Error adding subject:", err);
      alert(err.response?.data?.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  const handleManualUnlock = async () => {
    if (!selectedUser || !selectedSubject) {
      alert("Please select student and subject");
      return;
    }

    try {
      setManualLoading(true);
      await axios.post("/manual-access/grant", {
        userId: selectedUser,
        subjectId: selectedSubject,
        durationDays: Number(duration),
        note: "Offline payment",
      });
      alert("✅ Subject unlocked successfully");
      setSelectedUser("");
      setSelectedSubject("");
      setDuration(30);
      await fetchData();
    } catch (err) {
      console.error("Error unlocking subject:", err);
      alert(err.response?.data?.message || "Failed to unlock");
    } finally {
      setManualLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (_id) => {
    if (!window.confirm("Delete subject?")) return;
    try {
      await axios.delete(`/subjects/${_id}`);
      await fetchData();
    } catch (err) {
      console.error("Error deleting subject:", err);
      alert(err.response?.data?.message || "Failed to delete subject");
    }
  };

  const handleDeleteAccess = async (id) => {
    if (!window.confirm("Delete this access?")) return;
    try {
      await axios.delete(`/manual-access/${id}`);
      await fetchData();
    } catch (err) {
      console.error("Error deleting access:", err);
    }
  };

  const handleToggleAccess = async (id) => {
    try {
      await axios.patch(`/manual-access/${id}/toggle`);
      await fetchData();
    } catch (err) {
      console.error("Error toggling access:", err);
    }
  };

  const handleUpdateAccess = async (id) => {
    const days = prompt("Enter new duration (days):");
    if (!days) return;
    try {
      await axios.put(`/manual-access/${id}`, {
        durationDays: Number(days),
      });
      await fetchData();
    } catch (err) {
      console.error("Error updating access:", err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (subject) => {
    setEditing(subject);
    setForm({
      name: subject.name,
      programId: subject.programId?._id || subject.programId || "",
      courseId: subject.courseId?._id || subject.courseId || "",
      isPaid: subject.isPaid,
      price: subject.price || "",
    });
    
    const progId = subject.programId?._id || subject.programId;
    if (progId) {
      axios.get(`/courses/program/${progId}`).then(res => {
        setFilteredCourses(res.data || []);
      }).catch(err => console.error(err));
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!form.name) {
      alert("Subject name is required");
      return;
    }
    if (!form.programId) {
      alert("Please select a program");
      return;
    }
    if (!form.courseId) {
      alert("Please select a course");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/subjects/${editing._id}`, {
        name: form.name,
        programId: form.programId,
        courseId: form.courseId,
        isPaid: form.isPaid,
        price: form.isPaid ? Number(form.price) : 0,
      });
      setEditing(null);
      setForm({ name: "", programId: "", courseId: "", isPaid: false, price: "" });
      setFilteredCourses([]);
      await fetchData();
      alert("Subject updated successfully!");
    } catch (err) {
      console.error("Error updating subject:", err);
      alert(err.response?.data?.message || "Failed to update subject");
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (id) => {
    const course = courses.find((c) => c._id === id);
    return course?.name || "N/A";
  };

  const getProgramName = (id) => {
    const program = programs.find((p) => p._id === id);
    return program?.name || "N/A";
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const paidSubjects = subjects.filter(s => s.isPaid).length;
  const freeSubjects = subjects.filter(s => !s.isPaid).length;
  const activeAccess = manualAccessList.filter(m => m.isActive).length;

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 break-words">
            Subject Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
            Create, manage and control subject access for students
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <FaBook className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Total: {subjects.length} subjects
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 break-words">
                {subjects.length}
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0 ml-2">
              <FaBook className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Free Subjects</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 break-words">
                {freeSubjects}
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0 ml-2">
              <FaCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Paid Subjects</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 break-words">
                {paidSubjects}
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center flex-shrink-0 ml-2">
              <FaDollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Active Access</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 break-words">
                {activeAccess}
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0 ml-2">
              <FaUserGraduate className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
            activeTab === "subjects"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Subjects
          {activeTab === "subjects" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("access")}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
            activeTab === "access"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Manual Access
          {activeTab === "access" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
      </div>

      {/* Subjects Tab */}
      {activeTab === "subjects" && (
        <>
          {/* Add Subject Form */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
              <FaPlus className="h-4 w-4 text-blue-500" />
              {editing ? "Edit Subject" : "Add New Subject"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Subject Name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />

              <select
                name="programId"
                value={form.programId}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Program</option>
                {programs.filter(p => p.isActive !== false).map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.code ? `(${p.code})` : ""}
                  </option>
                ))}
              </select>

              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                disabled={!form.programId}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Course</option>
                {filteredCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={form.isPaid}
                  onChange={handleChange}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                Paid Subject
              </label>

              {form.isPaid && (
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price (₵)"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <button
                onClick={editing ? handleUpdate : handleAdd}
                disabled={loading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  editing ? "Update Subject" : "Add Subject"
                )}
              </button>
              {editing && (
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: "", programId: "", courseId: "", isPaid: false, price: "" });
                    setFilteredCourses([]);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Search and Subjects List */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <FaBook className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-700 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-center text-sm break-words">
                    {searchTerm ? "No subjects match your search" : "No subjects found. Add your first subject!"}
                  </p>
                </div>
              ) : (
                filteredSubjects.map((subject) => (
                  <div key={subject._id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        subject.isPaid 
                          ? 'bg-yellow-50 dark:bg-yellow-950/30' 
                          : 'bg-green-50 dark:bg-green-950/30'
                      }`}>
                        <FaChalkboardTeacher className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                          subject.isPaid 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                          {subject.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <FaBuilding className="w-3 h-3" />
                            {getProgramName(subject.programId?._id || subject.programId)}
                          </span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <FaBook className="w-3 h-3" />
                            {getCourseName(subject.courseId?._id || subject.courseId)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium whitespace-nowrap ${
                          subject.isPaid
                            ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400"
                            : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                        }`}>
                          {subject.isPaid ? `₵${subject.price}` : "Free"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-1.5 sm:p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Edit Subject"
                      >
                        <FaEdit size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
                        className="p-1.5 sm:p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Subject"
                      >
                        <FaTrash size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Access Tab - Keep your original working code */}
      {activeTab === "access" && (
        <>
          {/* Manual Unlock Form */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-2 sm:mb-4 flex items-center gap-2">
              <FaUnlockAlt className="h-4 w-4 text-green-500" />
              Manual Unlock Access
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 break-words">
              Grant subject access to students after offline payment
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Student
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select student</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Duration (Days)
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <input
                    type="number"
                    placeholder="e.g. 30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleManualUnlock}
                  disabled={manualLoading}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 text-sm sm:text-base"
                >
                  {manualLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Unlock Access"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Manual Access List */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                Manual Access Records
              </h3>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {manualAccessList.length} records
              </span>
            </div>

            {manualAccessList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <FaUserGraduate className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-center text-sm">No manual unlocks yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Student</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Subject</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left hidden sm:table-cell">Expiry Date</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Status</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {manualAccessList.map((m) => (
                      <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm break-words max-w-[150px] sm:max-w-none">
                            {m.userId?.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block break-all">
                            {m.userId?.email}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span className="text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm break-words max-w-[120px] sm:max-w-none block">
                            {m.subjectId?.name}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell whitespace-nowrap">
                          {new Date(m.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium whitespace-nowrap ${
                            m.isActive
                              ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                          }`}>
                            {m.isActive ? (
                              <FaCheckCircle className="h-2 w-2 sm:h-3 sm:w-3" />
                            ) : (
                              <FaExclamationCircle className="h-2 w-2 sm:h-3 sm:w-3" />
                            )}
                            {m.isActive ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <button
                              onClick={() => handleUpdateAccess(m._id)}
                              className="px-2 sm:px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleToggleAccess(m._id)}
                              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                m.isActive
                                  ? "bg-gray-500 hover:bg-gray-600 text-white"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                            >
                              {m.isActive ? "Lock" : "Unlock"}
                            </button>
                            <button
                              onClick={() => handleDeleteAccess(m._id)}
                              className="px-2 sm:px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[calc(100%-1.5rem)] sm:max-w-md relative shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <FaEdit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                  Edit Subject
                </h3>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 ml-2"
              >
                <FaTimes size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program
                </label>
                <select
                  value={form.programId}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course
                </label>
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  disabled={!form.programId}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                >
                  <option value="">Select Course</option>
                  {filteredCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={form.isPaid}
                  onChange={handleChange}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                Paid Subject
              </label>

              {form.isPaid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (₵)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 pt-0 sm:pt-0">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;