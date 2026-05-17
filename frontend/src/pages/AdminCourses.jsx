// AdminCourses.jsx - HIGHLY RESPONSIVE with socket configuration
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
  FaSpinner
} from "react-icons/fa";
import API from "../api/axios";
import initializeSocket, { getSocket } from "../config/socket";

const AdminCourses = () => {
  const [socket, setSocket] = useState(null);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ================= FETCH =================
  useEffect(() => {
    // Initialize socket connection
    const newSocket = initializeSocket();
    setSocket(newSocket);
    
    // Fetch courses
    fetchCourses();

    // Socket.IO listeners
    newSocket.on("course:created", (course) => {
      setCourses((prev) => [course, ...prev]);
    });

    newSocket.on("course:updated", (updatedCourse) => {
      setCourses((prev) =>
        prev.map((c) => (c._id === updatedCourse._id ? updatedCourse : c))
      );
    });

    newSocket.on("course:deleted", (_id) => {
      setCourses((prev) => prev.filter((c) => c._id !== _id));
    });

    // Cleanup
    return () => {
      newSocket.off("course:created");
      newSocket.off("course:updated");
      newSocket.off("course:deleted");
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
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ name: e.target.value });
  };

  // ================= ADD =================
  const handleAdd = async () => {
    if (!form.name.trim()) return;

    try {
      setLoading(true);
      await API.post("/courses", { name: form.name });
      setForm({ name: "" });
      await fetchCourses();
    } catch (err) {
      console.error("Error adding course:", err);
      alert(err.response?.data?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (_id) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      await API.delete(`/courses/${_id}`);
      setCourses((prev) => prev.filter((c) => c._id !== _id));
    } catch (err) {
      console.error("Error deleting course:", err);
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  // ================= EDIT =================
  const handleEdit = (course) => {
    setEditing(course);
    setForm({ name: course.name });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!form.name.trim()) return;

    try {
      setLoading(true);
      await API.put(`/courses/${editing._id}`, { name: form.name });
      setEditing(null);
      setForm({ name: "" });
      await fetchCourses();
    } catch (err) {
      console.error("Error updating course:", err);
      alert(err.response?.data?.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 break-words">
            Course Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
            Create, manage, and organize your educational courses
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <FaGraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Total: {courses.length} courses
            </span>
          </div>
        </div>
      </div>

      {/* Search and Add Section */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        {/* Search Bar */}
        <div className="relative w-full">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Add Course Button */}
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "" });
            document.getElementById('add-course-modal')?.showModal?.();
          }}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 text-sm sm:text-base"
        >
          <FaPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="whitespace-nowrap">Add New Course</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 break-words">
                {courses.length}
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
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Active Courses</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 break-words">
                {courses.filter(c => c.status !== 'archived').length}
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0 ml-2">
              <FaGraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid/List View */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">All Courses</h3>
        </div>

        {loading && courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <FaSpinner className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-red-500 dark:text-red-400 text-center">
              <FaFolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm break-words">{error}</p>
              <button
                onClick={fetchCourses}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <FaFolderOpen className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm break-words">
              {searchTerm ? "No courses match your search" : "No courses found. Add your first course!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredCourses.map((course, index) => (
              <div
                key={course._id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <FaBook className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                      {course.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 break-all">
                      ID: {course._id?.slice(-8) || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-1.5 sm:p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                    title="Edit Course"
                  >
                    <FaEdit size={14} className="sm:w-4 sm:h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(course._id)}
                    className="p-1.5 sm:p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Delete Course"
                  >
                    <FaTrash size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[calc(100%-1.5rem)] sm:max-w-md relative shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <FaEdit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                  Edit Course
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "" });
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 ml-2"
              >
                <FaTimes size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter course name"
                autoFocus
              />
            </div>

            {/* Modal Footer */}
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
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "" });
                }}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      <dialog id="add-course-modal" className="bg-transparent">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[calc(100%-1.5rem)] sm:max-w-md relative shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <FaPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                  Add New Course
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "" });
                  document.getElementById('add-course-modal')?.close();
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 ml-2"
              >
                <FaTimes size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter course name"
                autoFocus
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 pt-0 sm:pt-0">
              <button
                onClick={async () => {
                  await handleAdd();
                  document.getElementById('add-course-modal')?.close();
                }}
                disabled={loading}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Course'
                )}
              </button>
              <button
                onClick={() => {
                  setForm({ name: "" });
                  document.getElementById('add-course-modal')?.close();
                }}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all text-sm sm:text-base"
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