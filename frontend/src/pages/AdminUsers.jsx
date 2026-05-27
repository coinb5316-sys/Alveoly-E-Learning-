// AdminUsers.jsx - COMPLETE WITH DEBUGGING & FIXES
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
  FaBuilding,
  FaUserPlus,
  FaChalkboard,
  FaCheckCircle,
  FaUserTag,
  FaCalendarAlt,
  FaPhone,
  FaIdCard,
  FaUniversity,
  FaLayerGroup
} from "react-icons/fa";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddLecturerModal, setShowAddLecturerModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedLecturer, setExpandedLecturer] = useState(null);
  const [newLecturer, setNewLecturer] = useState({
    name: "",
    email: "",
    password: "",
    programId: "",
    courseId: "",
    title: "Dr.",
    subjectIds: []
  });
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    role: "",
    programId: "",
    courseId: "",
    title: "",
    subjectIds: []
  });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  // ================= FETCH USERS (with full details) =================
const fetchUsers = async () => {
  try {
    setLoading(true);
    // Try to get full student details if admin
    let usersData = [];
    try {
      const studentsRes = await axios.get("/users/students/full");
      const lecturersRes = await axios.get("/users?role=lecturer");
      const adminsRes = await axios.get("/users?role=admin");
      usersData = [...studentsRes.data, ...lecturersRes.data, ...adminsRes.data];
    } catch (err) {
      // Fallback to regular endpoint
      const res = await axios.get("/users");
      usersData = res.data;
    }
    setUsers(Array.isArray(usersData) ? usersData : []);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch users");
  } finally {
    setLoading(false);
  }
};

  // ================= FETCH PROGRAMS =================
  const fetchPrograms = async () => {
    try {
      const res = await axios.get("/programs");
      setPrograms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  // ================= FETCH COURSES =================
  const fetchCourses = async (programId = null) => {
    try {
      const url = programId ? `/courses?program=${programId}` : "/courses";
      const res = await axios.get(url);
      const coursesData = Array.isArray(res.data) ? res.data : [];
      setCourses(coursesData);
      return coursesData;
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      return [];
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

  // ================= FETCH FILTERED COURSES BY PROGRAM =================
  const fetchFilteredCourses = async (programId) => {
    if (!programId || programId === "undefined" || programId === "null" || programId === "") {
      setFilteredCourses([]);
      return [];
    }
    try {
      const res = await axios.get(`/courses/program/${programId}`);
      const coursesData = Array.isArray(res.data) ? res.data : [];
      setFilteredCourses(coursesData);
      return coursesData;
    } catch (err) {
      console.error("Failed to fetch filtered courses:", err);
      setFilteredCourses([]);
      return [];
    }
  };

  // ================= FETCH FILTERED SUBJECTS (FIXED WITH DEBUG) =================
  const fetchFilteredSubjects = async (courseId) => {
    console.log("=== FETCHING SUBJECTS FOR COURSE:", courseId);
    
    if (!courseId || courseId === "undefined" || courseId === "null" || courseId === "") {
      console.log("No valid course ID, clearing subjects");
      setAvailableSubjects([]);
      return [];
    }
    
    try {
      console.log("Making request to:", `/subjects?course=${courseId}`);
      const res = await axios.get(`/subjects?course=${courseId}`);
      console.log("Response status:", res.status);
      console.log("Response data:", res.data);
      
      const subjectsArray = Array.isArray(res.data) ? res.data : [];
      console.log("Subjects found:", subjectsArray.length);
      subjectsArray.forEach(s => console.log(`  - ${s.name} (${s._id})`));
      
      setAvailableSubjects(subjectsArray);
      return subjectsArray;
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      console.error("Error response:", err.response);
      setAvailableSubjects([]);
      return [];
    }
  };

  // Debug: Log when availableSubjects changes
  useEffect(() => {
    console.log("=== availableSubjects UPDATED ===");
    console.log("Number of subjects:", availableSubjects.length);
    console.log("Subjects:", availableSubjects);
  }, [availableSubjects]);

  useEffect(() => {
    fetchUsers();
    fetchPrograms();
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
        programId: editUserData.programId || null,
        courseId: editUserData.courseId || null,
      };
      
      if (editUserData.role === "lecturer") {
        let subjectIds = [];
        if (editUserData.subjectIds && Array.isArray(editUserData.subjectIds)) {
          subjectIds = editUserData.subjectIds.filter(id => id && id !== "" && id !== "undefined" && id !== "null");
        }
        
        updateData.lecturerInfo = {
          title: editUserData.title || "",
          assignedCourses: editUserData.courseId ? [editUserData.courseId] : [],
          assignedSubjects: subjectIds
        };
      }
      
      const response = await axios.put(`/users/${selectedUser._id}`, updateData);
      
      if (response.data.success) {
        toast.success("User updated successfully!");
        setShowEditUserModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(response.data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update user");
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
      }).filter(id => id && id !== "" && id !== "undefined" && id !== "null");
    }
    
    const userProgramId = user.programId?._id || user.programId || "";
    const userCourseId = user.courseId?._id || user.courseId || "";
    
    setSelectedUser(user);
    setEditUserData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student",
      programId: userProgramId,
      courseId: userCourseId,
      title: user.lecturerInfo?.title || "Dr.",
      subjectIds: subjectIds
    });
    
    if (userProgramId && userProgramId !== "undefined" && userProgramId !== "null") {
      fetchFilteredCourses(userProgramId).then(coursesData => {
        if (userCourseId && userCourseId !== "undefined" && userCourseId !== "null") {
          fetchFilteredSubjects(userCourseId);
        }
      });
    }
    
    setShowEditUserModal(true);
  };

  // ================= UPDATE USER ROLE =================
  const handleRoleChange = async (id, role) => {
    try {
      setLoading(true);
      const response = await axios.put(`/users/${id}/role`, { role });
      if (response.data.success) {
        fetchUsers();
        toast.success(`User role updated to ${role}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
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
      toast.success("User deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD LECTURER (REWRITTEN) =================
const handleAddLecturer = async (e) => {
  e.preventDefault();
  
  console.log("=== SUBMITTING LECTURER ===");
  console.log("newLecturer state:", newLecturer);
  console.log("subjectIds to send:", newLecturer.subjectIds);
  
  try {
    setLoading(true);
    
    // Validate required fields
    if (!newLecturer.name || !newLecturer.email || !newLecturer.password) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }
    
    if (!newLecturer.programId) {
      toast.error("Please select a program");
      setLoading(false);
      return;
    }
    
    if (!newLecturer.courseId) {
      toast.error("Please select a course");
      setLoading(false);
      return;
    }
    
    // Ensure subjectIds is an array (it should be from state)
    const subjectIdsToSend = Array.isArray(newLecturer.subjectIds) ? newLecturer.subjectIds : [];
    
    console.log("Sending subject IDs:", subjectIdsToSend);
    
    const payload = {
      name: newLecturer.name,
      email: newLecturer.email,
      password: newLecturer.password,
      programId: newLecturer.programId,
      courseId: newLecturer.courseId,
      title: newLecturer.title || "Dr.",
      assignedSubjects: subjectIdsToSend
    };
    
    console.log("Full payload:", JSON.stringify(payload, null, 2));
    
    const response = await axios.post("/auth/register-lecturer", payload);
    
    console.log("Response:", response.data);
    
    if (response.data.success) {
      toast.success(response.data.message || "Lecturer added successfully!");
      setShowAddLecturerModal(false);
      // Reset form
      setNewLecturer({
        name: "",
        email: "",
        password: "",
        programId: "",
        courseId: "",
        title: "Dr.",
        subjectIds: []
      });
      setAvailableSubjects([]);
      setFilteredCourses([]);
      fetchUsers(); // Refresh the user list
    } else {
      toast.error(response.data.message || "Failed to add lecturer");
    }
  } catch (err) {
    console.error("Error adding lecturer:", err);
    console.error("Error response:", err.response?.data);
    toast.error(err.response?.data?.message || "Failed to add lecturer");
  } finally {
    setLoading(false);
  }
};

  const handleProgramChange = async (programId) => {
    setEditUserData({...editUserData, programId, courseId: "", subjectIds: []});
    if (programId && programId !== "undefined" && programId !== "null" && programId !== "") {
      const coursesData = await fetchFilteredCourses(programId);
      setFilteredCourses(coursesData);
      setAvailableSubjects([]);
    } else {
      setFilteredCourses([]);
      setAvailableSubjects([]);
    }
  };

  const handleCourseChange = async (courseId) => {
    setEditUserData({...editUserData, courseId, subjectIds: []});
    if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
      await fetchFilteredSubjects(courseId);
    } else {
      setAvailableSubjects([]);
    }
  };

  // ================= HANDLE NEW PROGRAM CHANGE (FIXED) =================
  const handleNewProgramChange = async (programId) => {
    console.log("=== PROGRAM CHANGED ===");
    console.log("Selected program ID:", programId);
    
    setNewLecturer(prev => ({ ...prev, programId, courseId: "", subjectIds: [] }));
    
    if (programId && programId !== "undefined" && programId !== "null" && programId !== "") {
      console.log("Fetching courses for program:", programId);
      const coursesData = await fetchFilteredCourses(programId);
      console.log("Courses found:", coursesData.length);
      setFilteredCourses(coursesData);
      setAvailableSubjects([]);
    } else {
      setFilteredCourses([]);
      setAvailableSubjects([]);
    }
  };

  // ================= HANDLE NEW COURSE CHANGE (FIXED WITH DEBUG) =================
  const handleNewCourseChange = async (courseId) => {
    console.log("=== COURSE CHANGED ===");
    console.log("Selected course ID:", courseId);
    console.log("Current newLecturer state:", newLecturer);
    
    setNewLecturer(prev => ({ ...prev, courseId, subjectIds: [] }));
    
    if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
      console.log("Fetching subjects for course:", courseId);
      const subjects = await fetchFilteredSubjects(courseId);
      console.log("Subjects loaded:", subjects.length);
    } else {
      console.log("No course selected, clearing subjects");
      setAvailableSubjects([]);
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
    console.log("Subjects selected for edit:", selectedValues);
    setEditUserData({...editUserData, subjectIds: selectedValues});
  };

 // ================= HANDLE NEW SUBJECT SELECTION (REWRITTEN) =================
const handleNewSubjectSelection = (e) => {
  const selectedOptions = Array.from(e.target.selectedOptions);
  const selectedValues = selectedOptions.map(option => option.value);
  
  console.log("=== SUBJECT SELECTION CHANGED ===");
  console.log("Selected values:", selectedValues);
  console.log("Number selected:", selectedValues.length);
  
  // Update the state with the selected subject IDs
  setNewLecturer(prev => {
    const updated = { 
      ...prev, 
      subjectIds: selectedValues 
    };
    console.log("Updated newLecturer state:", updated);
    return updated;
  });
};

  const toggleLecturerExpanded = (userId) => {
    if (expandedLecturer === userId) {
      setExpandedLecturer(null);
    } else {
      setExpandedLecturer(userId);
    }
  };

  const getAssignedSubjectsList = (user) => {
    if (user.role !== "lecturer") return [];
    if (!user.lecturerInfo?.assignedSubjects) return [];
    
    return user.lecturerInfo.assignedSubjects.map(subject => {
      if (typeof subject === 'object' && subject.name) return subject;
      return { _id: subject, name: "Loading..." };
    });
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
      <Toaster position="top-right" />
      
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
            <FaUserPlus className="h-4 w-4" />
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
                  <th className="px-6 py-4 text-left font-medium">Program</th>
                  <th className="px-6 py-4 text-left font-medium">Course</th>
                  <th className="px-6 py-4 text-left font-medium">Assigned Subjects</th>
                  <th className="px-6 py-4 text-left font-medium">Role</th>
                  <th className="px-6 py-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredUsers.map((user) => {
                  const assignedSubjects = getAssignedSubjectsList(user);
                  const isExpanded = expandedLecturer === user._id;
                  
                  return (
                    <>
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                              user.role === "admin" ? "from-purple-500 to-purple-600" :
                              user.role === "lecturer" ? "from-blue-500 to-blue-600" : "from-green-500 to-green-600"
                            }`}>
                              <span className="text-white font-semibold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                              {user.role === "lecturer" && user.lecturerInfo?.title && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.lecturerInfo.title}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="h-3.5 w-3.5 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaBuilding className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{user.programId?.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaGraduationCap className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{user.courseId?.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.role === "lecturer" ? (
                            assignedSubjects.length > 0 ? (
                              <div>
                                <button
                                  onClick={() => toggleLecturerExpanded(user._id)}
                                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                  <FaBook className="h-3.5 w-3.5" />
                                  <span className="text-sm font-medium">
                                    {assignedSubjects.length} subject{assignedSubjects.length !== 1 ? 's' : ''}
                                  </span>
                                  <svg className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-sm">No subjects assigned</span>
                            )
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
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
                            <button 
                              onClick={() => openEditModal(user)} 
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors text-sm font-medium"
                            >
                              <FaEdit className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(user._id)} 
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-sm font-medium"
                            >
                              <FaTrash className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded row for assigned subjects */}
                      {isExpanded && user.role === "lecturer" && assignedSubjects.length > 0 && (
                        <tr className="bg-gray-50 dark:bg-gray-800/30">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="ml-12">
                              <div className="flex items-center gap-2 mb-3">
                                <FaBook className="h-4 w-4 text-blue-500" />
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Assigned Subjects</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {assignedSubjects.map((subject, idx) => (
                                  <div key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <FaCheckCircle className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {subject.name || subject._id}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <FaUsers className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      )}

      {/* ================= ADD LECTURER MODAL ================= */}
      {showAddLecturerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaChalkboardTeacher className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Lecturer</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Create a new lecturer account</p>
                </div>
              </div>
              <button onClick={() => setShowAddLecturerModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddLecturer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input type="text" required value={newLecturer.name} onChange={(e) => setNewLecturer({...newLecturer, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g., Dr. John Smith" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" required value={newLecturer.email} onChange={(e) => setNewLecturer({...newLecturer, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="lecturer@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password <span className="text-red-500">*</span></label>
                <input type="password" required value={newLecturer.password} onChange={(e) => setNewLecturer({...newLecturer, password: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Minimum 6 characters" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Program <span className="text-red-500">*</span></label>
                <select required value={newLecturer.programId} onChange={(e) => handleNewProgramChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                  <option value="">Select Program</option>
                  {programs.map(program => <option key={program._id} value={program._id}>{program.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course <span className="text-red-500">*</span></label>
                <select required value={newLecturer.courseId} onChange={(e) => handleNewCourseChange(e.target.value)} disabled={!newLecturer.programId || newLecturer.programId === ""} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">Select Course</option>
                  {filteredCourses.map(course => <option key={course._id} value={course._id}>{course.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subjects</label>
                <select 
  multiple 
  onChange={handleNewSubjectSelection} 
  value={newLecturer.subjectIds}
  disabled={!newLecturer.courseId || newLecturer.courseId === ""} 
  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
>
  {availableSubjects.map(subject => (
    <option key={subject._id} value={subject._id}>
      {subject.name}
    </option>
  ))}
</select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Hold Ctrl/Cmd to select multiple subjects</p>
                {availableSubjects.length === 0 && newLecturer.courseId && newLecturer.courseId !== "" && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">No subjects available for this course. Please create subjects first.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <select value={newLecturer.title} onChange={(e) => setNewLecturer({...newLecturer, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                  <option>Dr.</option><option>Prof.</option><option>Mr.</option><option>Mrs.</option><option>Ms.</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowAddLecturerModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaUserPlus className="h-4 w-4" />}
                  Add Lecturer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT USER MODAL ================= */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaEdit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit User</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Update user information</p>
                </div>
              </div>
              <button onClick={() => setShowEditUserModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input type="text" value={editUserData.name} onChange={(e) => setEditUserData({...editUserData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input type="email" value={editUserData.email} onChange={(e) => setEditUserData({...editUserData, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                <select value={editUserData.role} onChange={(e) => setEditUserData({...editUserData, role: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Program</label>
                <select value={editUserData.programId} onChange={(e) => handleProgramChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                  <option value="">No Program</option>
                  {programs.map(program => <option key={program._id} value={program._id}>{program.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course</label>
                <select value={editUserData.courseId} onChange={(e) => handleCourseChange(e.target.value)} disabled={!editUserData.programId || editUserData.programId === "undefined" || editUserData.programId === "null"} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50">
                  <option value="">No Course</option>
                  {filteredCourses.map(course => <option key={course._id} value={course._id}>{course.name}</option>)}
                </select>
              </div>

              {editUserData.role === "lecturer" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                    <select value={editUserData.title} onChange={(e) => setEditUserData({...editUserData, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                      <option>Dr.</option><option>Prof.</option><option>Mr.</option><option>Mrs.</option><option>Ms.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assigned Subjects</label>
                    <select multiple onChange={handleSubjectSelection} value={editUserData.subjectIds} disabled={!editUserData.courseId || editUserData.courseId === "undefined" || editUserData.courseId === "null"} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50">
                      {availableSubjects.map(subject => (
                        <option key={subject._id} value={subject._id}>{subject.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Hold Ctrl/Cmd to select multiple subjects</p>
                    {editUserData.subjectIds.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Selected Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                          {editUserData.subjectIds.map((id, idx) => {
                            const subject = availableSubjects.find(s => s._id === id);
                            return (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs">
                                <FaCheckCircle className="h-2.5 w-2.5" />
                                {subject?.name || id}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowEditUserModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button onClick={handleUpdateUser} disabled={loading} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaSave className="h-4 w-4" />}
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