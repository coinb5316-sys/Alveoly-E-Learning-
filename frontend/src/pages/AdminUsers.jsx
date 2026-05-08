// AdminUsers.jsx - Updated with Lecturer role support
import { useEffect, useState } from "react";
import { 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaGraduationCap,
  FaEnvelope,
  FaUserTag,
  FaUsers,
  FaUserCheck,
  FaSpinner,
  FaShieldAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserPlus,
  FaEdit,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import axios from "../api/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddLecturerModal, setShowAddLecturerModal] = useState(false);
  const [newLecturer, setNewLecturer] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    title: "Dr.",
    specialization: ""
  });

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

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= ROLE CHANGE =================
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
      alert("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE USER =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      setLoading(true);
      await axios.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("User deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD LECTURER =================
  const handleAddLecturer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/auth/register-lecturer", newLecturer);
      alert("Lecturer added successfully!");
      setShowAddLecturerModal(false);
      setNewLecturer({
        name: "",
        email: "",
        password: "",
        department: "",
        title: "Dr.",
        specialization: ""
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add lecturer");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const lecturerCount = users.filter(u => u.role === "lecturer").length;
  const studentCount = users.filter(u => u.role === "student").length;
  const activeUsers = users.length;

  // Get role badge style
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {totalUsers}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {studentCount}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {lecturerCount}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {adminCount}
              </p>
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
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

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <FaUsers className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || roleFilter !== "all" 
              ? "No users match your search criteria" 
              : "No users found"}
          </p>
          {(searchTerm || roleFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
              }}
              className="mt-4 text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && filteredUsers.length > 0 && (
        <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
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
                          user.role === "lecturer" ? "from-blue-500 to-blue-600" :
                          "from-green-500 to-green-600"
                        }`}>
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                          {user.role === "lecturer" && user.lecturerInfo?.title && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({user.lecturerInfo.title})
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="h-3.5 w-3.5 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaGraduationCap className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {user.courseId?.name || (user.role === "lecturer" ? "N/A" : "None")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 border ${getRoleBadgeStyle(user.role)}`}
                        >
                          <option value="student">Student</option>
                          <option value="lecturer">Lecturer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-sm font-medium"
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && filteredUsers.length > 0 && (
        <div className="grid gap-4 md:hidden">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center ${
                  user.role === "admin" ? "from-purple-500 to-purple-600" :
                  user.role === "lecturer" ? "from-blue-500 to-blue-600" :
                  "from-green-500 to-green-600"
                }`}>
                  <span className="text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <FaEnvelope className="h-3 w-3" />
                    {user.email}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}>
                  {user.role === "admin" ? "Admin" : user.role === "lecturer" ? "Lecturer" : "Student"}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FaGraduationCap className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Course:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {user.courseId?.name || (user.role === "lecturer" ? "N/A" : "None")}
                  </span>
                </div>
                {user.role === "lecturer" && user.lecturerInfo?.specialization && (
                  <div className="flex items-center gap-2 text-sm">
                    <FaChalkboardTeacher className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Specialization:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {user.lecturerInfo.specialization}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 border ${getRoleBadgeStyle(user.role)}`}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Administrator</option>
                </select>

                <button
                  onClick={() => handleDelete(user._id)}
                  className="px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors flex items-center gap-2"
                >
                  <FaTrash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lecturer Modal */}
      {showAddLecturerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Add New Lecturer
              </h2>
              <button
                onClick={() => setShowAddLecturerModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FaTimes className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddLecturer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLecturer.name}
                  onChange={(e) => setNewLecturer({...newLecturer, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newLecturer.email}
                  onChange={(e) => setNewLecturer({...newLecturer, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="lecturer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={newLecturer.password}
                  onChange={(e) => setNewLecturer({...newLecturer, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <select
                    value={newLecturer.title}
                    onChange={(e) => setNewLecturer({...newLecturer, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option>Dr.</option>
                    <option>Prof.</option>
                    <option>Mr.</option>
                    <option>Mrs.</option>
                    <option>Ms.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newLecturer.department}
                    onChange={(e) => setNewLecturer({...newLecturer, department: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={newLecturer.specialization}
                  onChange={(e) => setNewLecturer({...newLecturer, specialization: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="e.g., Web Development, AI, Database"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddLecturerModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Add Lecturer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;