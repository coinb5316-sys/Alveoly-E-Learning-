// AdminUsers.jsx - COMPLETE WITH DARK/LIGHT MODE SUPPORT
import { useEffect, useState } from "react";
import { 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaGraduationCap,
  FaEnvelope,
  FaUsers,
  FaSpinner,
  FaShieldAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaTimes,
  FaEdit,
  FaSave,
  FaBook,
  FaChalkboard,
  FaUserPlus
} from "react-icons/fa";
import axios from "../api/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddLecturerModal, setShowAddLecturerModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newLecturer, setNewLecturer] = useState({
    name: "",
    email: "",
    password: "",
    courseId: "",
    title: "Dr.",
    subjectIds: []
  });
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    role: "",
    courseId: "",
    title: "",
    subjectIds: []
  });
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH COURSES =================
  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  // ================= FETCH SUBJECTS =================
  const fetchSubjects = async (courseId = null) => {
    try {
      const url = courseId ? `/subjects?course=${courseId}` : "/subjects";
      const res = await axios.get(url);
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchSubjects();
  }, []);

  // ================= UPDATE USER (FULL UPDATE) =================
  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        name: editUserData.name,
        email: editUserData.email,
        role: editUserData.role,
        courseId: editUserData.courseId || null,
      };
      
      if (editUserData.role === "lecturer") {
        let subjectIds = [];
        if (editUserData.subjectIds && Array.isArray(editUserData.subjectIds)) {
          subjectIds = editUserData.subjectIds.filter(id => id && id !== "");
        }
        
        updateData.lecturerInfo = {
          title: editUserData.title || "",
          assignedCourses: editUserData.courseId ? [editUserData.courseId] : [],
          assignedSubjects: subjectIds
        };
      }
      
      const response = await axios.put(`/users/${selectedUser._id}`, updateData);
      
      if (response.data.success) {
        alert("✅ User updated successfully!");
        setShowEditUserModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert(response.data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN EDIT MODAL =================
  const openEditModal = (user) => {
    let subjectIds = [];
    if (user.lecturerInfo?.assignedSubjects && user.lecturerInfo.assignedSubjects.length > 0) {
      subjectIds = user.lecturerInfo.assignedSubjects.map(s => {
        if (typeof s === 'object' && s._id) return s._id;
        if (typeof s === 'string') return s;
        return s;
      }).filter(id => id);
    }
    
    setSelectedUser(user);
    setEditUserData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student",
      courseId: user.courseId?._id || user.courseId || "",
      title: user.lecturerInfo?.title || "",
      subjectIds: subjectIds
    });
    
    const courseId = user.courseId?._id || user.courseId;
    if (courseId) {
      fetchFilteredSubjects(courseId);
    }
    
    setShowEditUserModal(true);
  };

  // ================= FETCH FILTERED SUBJECTS =================
  const fetchFilteredSubjects = async (courseId) => {
    if (!courseId) {
      setAvailableSubjects([]);
      return;
    }
    try {
      const res = await axios.get(`/subjects?course=${courseId}`);
      const subjectsArray = Array.isArray(res.data) ? res.data : [];
      setAvailableSubjects(subjectsArray);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setAvailableSubjects([]);
    }
  };

  // ================= UPDATE USER ROLE =================
  const handleRoleChange = async (id, role) => {
    try {
      setLoading(true);
      await axios.put(`/users/${id}/role`, { role });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role } : u))
      );
      alert(`User role updated to ${role}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE USER =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);
      await axios.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("User deleted successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD LECTURER =================
  const handleAddLecturer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let subjectIds = [];
      if (newLecturer.subjectIds && Array.isArray(newLecturer.subjectIds)) {
        subjectIds = newLecturer.subjectIds.filter(id => id && id !== "");
      }
      
      await axios.post("/auth/register-lecturer", {
        name: newLecturer.name,
        email: newLecturer.email,
        password: newLecturer.password,
        courseId: newLecturer.courseId,
        title: newLecturer.title,
        assignedSubjects: subjectIds
      });
      
      alert("✅ Lecturer added successfully!");
      setShowAddLecturerModal(false);
      setNewLecturer({
        name: "",
        email: "",
        password: "",
        courseId: "",
        title: "Dr.",
        subjectIds: []
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add lecturer");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelection = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setEditUserData({...editUserData, subjectIds: selectedValues});
  };

  const handleNewSubjectSelection = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setNewLecturer({...newLecturer, subjectIds: selectedValues});
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const lecturerCount = users.filter(u => u.role === "lecturer").length;
  const studentCount = users.filter(u => u.role === "student").length;

  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case "admin":
        return "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "lecturer":
        return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default:
        return "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "admin": return <FaShieldAlt className="h-3.5 w-3.5" />;
      case "lecturer": return <FaChalkboardTeacher className="h-3.5 w-3.5" />;
      default: return <FaUserGraduate className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage students, lecturers, and administrators across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddLecturerModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <FaChalkboardTeacher className="h-4 w-4" />
            <span className="text-sm font-medium">Add Lecturer</span>
          </button>
          <button
            onClick={() => fetchUsers()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FaUsers className="h-4 w-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{totalUsers}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <FaUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{studentCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <FaUserGraduate className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lecturers</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{lecturerCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <FaChalkboardTeacher className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Administrators</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{adminCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <FaShieldAlt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
            <FaFilter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters & Search</span>
          </button>
        </div>
        {showFilters && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
              />
            </div>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">Loading users...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && filteredUsers.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-left font-medium">User</th>
                  <th className="px-6 py-4 text-left font-medium">Email</th>
                  <th className="px-6 py-4 text-left font-medium">Course</th>
                  <th className="px-6 py-4 text-left font-medium">Role</th>
                  <th className="px-6 py-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                          user.role === "admin" ? "from-purple-500 to-purple-600" :
                          user.role === "lecturer" ? "from-blue-500 to-blue-600" : "from-green-500 to-green-600"
                        }`}>
                          <span className="text-white font-semibold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2"><FaEnvelope className="h-3.5 w-3.5 text-gray-400" />{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2"><FaGraduationCap className="h-3.5 w-3.5 text-gray-400" /><span>{user.courseId?.name || "None"}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user._id, e.target.value)} 
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${getRoleBadgeStyle(user.role)}`}
                        >
                          <option value="student">Student</option>
                          <option value="lecturer">Lecturer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(user)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors text-sm font-medium">
                          <FaEdit className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-sm font-medium">
                          <FaTrash className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ADD LECTURER MODAL - FULL DARK MODE SUPPORT ================= */}
      {showAddLecturerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaChalkboardTeacher className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Add New Lecturer
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Create a new lecturer account
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddLecturerModal(false)} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddLecturer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={newLecturer.name} 
                  onChange={(e) => setNewLecturer({...newLecturer, name: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  required 
                  value={newLecturer.email} 
                  onChange={(e) => setNewLecturer({...newLecturer, email: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  placeholder="lecturer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input 
                  type="password" 
                  required 
                  value={newLecturer.password} 
                  onChange={(e) => setNewLecturer({...newLecturer, password: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Course <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  value={newLecturer.courseId} 
                  onChange={(e) => {
                    setNewLecturer({...newLecturer, courseId: e.target.value, subjectIds: []});
                    fetchFilteredSubjects(e.target.value);
                  }} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => <option key={course._id} value={course._id}>{course.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Subjects
                </label>
                <select 
                  multiple 
                  onChange={handleNewSubjectSelection}
                  value={newLecturer.subjectIds}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {subjects.filter(s => s.courseId === newLecturer.courseId).map(subject => (
                    <option key={subject._id} value={subject._id} className="py-1">
                      {subject.name}
                    </option>
                  ))}
                </select>
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hold <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd> (Windows) or <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">Cmd</kbd> (Mac) to select multiple
                  </p>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Selected: {newLecturer.subjectIds.length} subject(s)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title
                </label>
                <select 
                  value={newLecturer.title} 
                  onChange={(e) => setNewLecturer({...newLecturer, title: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option>Dr.</option>
                  <option>Prof.</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddLecturerModal(false)} 
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  Add Lecturer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT USER MODAL - FULL DARK MODE SUPPORT ================= */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaEdit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Edit User
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Update user information and permissions
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditUserModal(false)} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={editUserData.name} 
                  onChange={(e) => setEditUserData({...editUserData, name: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input 
                  type="email" 
                  value={editUserData.email} 
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Role
                </label>
                <select 
                  value={editUserData.role} 
                  onChange={(e) => setEditUserData({...editUserData, role: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Course
                </label>
                <select 
                  value={editUserData.courseId} 
                  onChange={(e) => {
                    setEditUserData({...editUserData, courseId: e.target.value, subjectIds: []});
                    fetchFilteredSubjects(e.target.value);
                  }} 
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">No Course</option>
                  {courses.map(course => <option key={course._id} value={course._id}>{course.name}</option>)}
                </select>
              </div>

              {editUserData.role === "lecturer" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Title
                    </label>
                    <select 
                      value={editUserData.title} 
                      onChange={(e) => setEditUserData({...editUserData, title: e.target.value})} 
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Assigned Subjects
                    </label>
                    <select 
                      multiple 
                      onChange={handleSubjectSelection}
                      value={editUserData.subjectIds}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      {availableSubjects.map(subject => (
                        <option key={subject._id} value={subject._id} className="py-1">
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Hold <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd> (Windows) or <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">Cmd</kbd> (Mac) to select multiple
                      </p>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Selected: {editUserData.subjectIds.length} subject(s)
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                <button 
                  onClick={() => setShowEditUserModal(false)} 
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateUser} 
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaSave className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;