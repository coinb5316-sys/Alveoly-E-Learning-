// AdminSubjects.jsx - Fixed JSX syntax errors
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
  FaExclamationCircle
} from "react-icons/fa";
import axios from "../api/axios";
import { io } from "socket.io-client";

const socket = io("https://www.alveolye-learning.academy");

const AdminSubjects = () => {
  const [courses, setCourses] = useState([]);
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
    courseId: "",
    isPaid: false,
    price: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    fetchData();

    socket.on("subject:created", (data) => {
      setSubjects((prev) => [data, ...prev]);
    });

    socket.on("subject:updated", (updated) => {
      setSubjects((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
    });

    socket.on("subject:deleted", (_id) => {
      setSubjects((prev) => prev.filter((s) => s._id !== _id));
    });

    return () => {
      socket.off("subject:created");
      socket.off("subject:updated");
      socket.off("subject:deleted");
    };
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, subjectsRes, usersRes, manualRes] = await Promise.all([
        axios.get("/courses"),
        axios.get("/subjects"),
        axios.get("/users"),
        axios.get("/manual-access/all"),
      ]);
      setCourses(coursesRes.data);
      setSubjects(subjectsRes.data);
      setUsers(usersRes.data);
      setManualAccessList(manualRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // ================= ADD =================
  const handleAdd = async () => {
    if (!form.name || !form.courseId) {
      alert("All required fields needed");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/subjects", {
        ...form,
        price: form.isPaid ? Number(form.price) : 0,
      });
      setForm({ name: "", courseId: "", isPaid: false, price: "" });
      setEditing(null);
      await fetchData();
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete subject");
    }
  };

  const handleDeleteAccess = async (id) => {
    if (!window.confirm("Delete this access?")) return;
    try {
      await axios.delete(`/manual-access/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAccess = async (id) => {
    try {
      await axios.patch(`/manual-access/${id}/toggle`);
      await fetchData();
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (subject) => {
    setEditing(subject);
    setForm({
      name: subject.name,
      courseId: subject.courseId,
      isPaid: subject.isPaid,
      price: subject.price || "",
    });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axios.put(`/subjects/${editing._id}`, {
        ...form,
        price: form.isPaid ? Number(form.price) : 0,
      });
      setEditing(null);
      setForm({ name: "", courseId: "", isPaid: false, price: "" });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update subject");
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (id) => {
    return courses.find((c) => c._id === id)?.name || "N/A";
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const paidSubjects = subjects.filter(s => s.isPaid).length;
  const freeSubjects = subjects.filter(s => !s.isPaid).length;
  const activeAccess = manualAccessList.filter(m => m.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Subject Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, manage and control subject access for students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <FaBook className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {subjects.length} subjects
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {subjects.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <FaBook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Free Subjects</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {freeSubjects}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid Subjects</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {paidSubjects}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
              <FaDollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Access</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {activeAccess}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <FaUserGraduate className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${
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
          className={`px-4 py-2 text-sm font-medium transition-all relative ${
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
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FaPlus className="h-4 w-4 text-blue-500" />
              {editing ? "Edit Subject" : "Add New Subject"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Subject Name"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />

              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

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
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price (₵)"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={editing ? handleUpdate : handleAdd}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  editing ? "Update Subject" : "Add Subject"
                )}
              </button>
              {editing && (
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: "", courseId: "", isPaid: false, price: "" });
                  }}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Search and Subjects List */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FaBook className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No subjects match your search" : "No subjects found. Add your first subject!"}
                  </p>
                </div>
              ) : (
                filteredSubjects.map((subject) => (
                  <div key={subject._id} className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        subject.isPaid 
                          ? 'bg-yellow-50 dark:bg-yellow-950/30' 
                          : 'bg-green-50 dark:bg-green-950/30'
                      }`}>
                        <FaChalkboardTeacher className={`h-4 w-4 ${
                          subject.isPaid 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {subject.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {getCourseName(subject.courseId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          subject.isPaid
                            ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400"
                            : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                        }`}>
                          {subject.isPaid ? `₵${subject.price}` : "Free"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Edit Subject"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Subject"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Access Tab */}
      {activeTab === "access" && (
        <>
          {/* Manual Unlock Form */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FaUnlockAlt className="h-4 w-4 text-green-500" />
              Manual Unlock Access
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Grant subject access to students after offline payment
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Student
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    placeholder="e.g. 30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleManualUnlock}
                  disabled={manualLoading}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50"
                >
                  {manualLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="h-4 w-4 animate-spin" />
                      Processing...
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
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Manual Access Records
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {manualAccessList.length} records
              </span>
            </div>

            {manualAccessList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FaUserGraduate className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No manual unlocks yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-left">Expiry Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {manualAccessList.map((m) => (
                      <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {m.userId?.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {m.userId?.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {m.subjectId?.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {new Date(m.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                            m.isActive
                              ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                          }`}>
                            {m.isActive ? (
                              <FaCheckCircle className="h-3 w-3" />
                            ) : (
                              <FaExclamationCircle className="h-3 w-3" />
                            )}
                            {m.isActive ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateAccess(m._id)}
                              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleToggleAccess(m._id)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                m.isActive
                                  ? "bg-gray-500 hover:bg-gray-600 text-white"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                            >
                              {m.isActive ? "Lock" : "Unlock"}
                            </button>
                            <button
                              onClick={() => handleDeleteAccess(m._id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md relative shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaEdit className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Edit Subject
                </h3>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course
                </label>
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
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
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
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