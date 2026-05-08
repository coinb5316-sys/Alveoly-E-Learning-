// pages/admin/AdminLecturers.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  ChevronDown,
  Download,
  UserCheck,
  UserX,
  Award,
  Clock,
  Building,
  MapPin,
  MoreVertical,
  Plus,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const AdminLecturers = () => {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    lecturerId: "",
    courseId: "",
    subjectId: ""
  });

  useEffect(() => {
    fetchLecturers();
    fetchCourses();
  }, []);

  const fetchLecturers = async () => {
    try {
      const res = await axios.get("/admin/lecturers");
      setLecturers(res.data);
    } catch (err) {
      console.error("Fetch lecturers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Fetch courses error:", err);
    }
  };

  const fetchSubjects = async (courseId) => {
    if (!courseId) return;
    try {
      const res = await axios.get(`/subjects?courseId=${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Fetch subjects error:", err);
    }
  };

  const handleAssign = async () => {
    try {
      await axios.post("/admin/lecturers/assign", formData);
      setShowAssignModal(false);
      setFormData({ lecturerId: "", courseId: "", subjectId: "" });
      fetchLecturers();
      alert("Lecturer assigned successfully!");
    } catch (err) {
      console.error("Assign error:", err);
      alert(err.response?.data?.message || "Failed to assign lecturer");
    }
  };

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.name?.toLowerCase().includes(search.toLowerCase()) ||
    lecturer.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (isActive) => {
    if (isActive !== false) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700">
          <CheckCircle className="h-3 w-3" /> Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700">
        <XCircle className="h-3 w-3" /> Inactive
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Lecturer Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage lecturers, assign courses, and monitor activity
          </p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Assign Lecturer
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Lecturers</p>
              <p className="text-2xl font-bold">{lecturers.length}</p>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active</p>
              <p className="text-2xl font-bold">{lecturers.filter(l => l.isActive !== false).length}</p>
            </div>
            <UserCheck className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Courses Assigned</p>
              <p className="text-2xl font-bold">
                {lecturers.reduce((sum, l) => sum + (l.lecturerInfo?.assignedCourses?.length || 0), 0)}
              </p>
            </div>
            <BookOpen className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Subjects Assigned</p>
              <p className="text-2xl font-bold">
                {lecturers.reduce((sum, l) => sum + (l.lecturerInfo?.assignedSubjects?.length || 0), 0)}
              </p>
            </div>
            <GraduationCap className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchLecturers}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Lecturers Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredLecturers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No lecturers found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lecturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLecturers.map((lecturer) => (
                  <tr key={lecturer._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {lecturer.name?.charAt(0) || "L"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {lecturer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lecturer.lecturerInfo?.title || "Lecturer"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{lecturer.email}</span>
                        </div>
                        {lecturer.lecturerInfo?.phoneNumber && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{lecturer.lecturerInfo.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {lecturer.lecturerInfo?.assignedCourses?.map((course, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700">
                            {course.name || course}
                          </span>
                        ))}
                        {(!lecturer.lecturerInfo?.assignedCourses || lecturer.lecturerInfo.assignedCourses.length === 0) && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {lecturer.lecturerInfo?.assignedSubjects?.map((subject, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700">
                            {subject.name || subject}
                          </span>
                        ))}
                        {(!lecturer.lecturerInfo?.assignedSubjects || lecturer.lecturerInfo.assignedSubjects.length === 0) && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(lecturer.lecturerInfo?.isActive)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(lecturer.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedLecturer(lecturer);
                            setFormData({ ...formData, lecturerId: lecturer._id });
                            setShowAssignModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Assign Course/Subject"
                        >
                          <BookOpen className="h-4 w-4 text-blue-500" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
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

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Assign Lecturer
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Lecturer
                </label>
                <select
                  value={formData.lecturerId}
                  onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Select a lecturer</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer._id} value={lecturer._id}>
                      {lecturer.name} ({lecturer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign to Course (Optional)
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => {
                    setFormData({ ...formData, courseId: e.target.value, subjectId: "" });
                    fetchSubjects(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign to Subject (Optional)
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  disabled={!formData.courseId}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLecturers;