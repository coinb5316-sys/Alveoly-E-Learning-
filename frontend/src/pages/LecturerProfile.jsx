// pages/lecturer/LecturerProfile.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  User, Mail, Phone, BookOpen, Award,
  Calendar, Edit2, Save, X, Loader2, Camera,
  Briefcase, GraduationCap, FolderOpen,
  BookMarked, ChevronRight, CheckCircle, Clock,
  Users, Sparkles, TrendingUp, Star, AlertCircle
} from "lucide-react";

const LecturerProfile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingAssignments, setFetchingAssignments] = useState(true);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    lecturerInfo: {
      title: "",
      bio: "",
      phoneNumber: ""
    }
  });

  // Fetch assigned courses and subjects on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        lecturerInfo: {
          title: user.lecturerInfo?.title || "",
          bio: user.lecturerInfo?.bio || "",
          phoneNumber: user.lecturerInfo?.phoneNumber || ""
        }
      });
      fetchAssignedResources();
    }
  }, [user]);

  const fetchAssignedResources = async () => {
    setFetchingAssignments(true);
    setError(null);
    try {
      // Fetch assigned courses
      const coursesRes = await axios.get("/lecturer/assigned-courses");
      
      if (coursesRes.data.success) {
        setAssignedCourses(coursesRes.data.courses || []);
      }

      // Fetch assigned subjects
      const subjectsRes = await axios.get("/lecturer/assigned-subjects");
      
      if (subjectsRes.data.success) {
        setAssignedSubjects(subjectsRes.data.subjects || []);
      }
      
    } catch (err) {
      console.error("Error fetching assigned resources:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch assigned resources");
    } finally {
      setFetchingAssignments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("lecturerInfo.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        lecturerInfo: { ...prev.lecturerInfo, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("/lecturer/profile", formData);
      if (res.data.success) {
        setUser({ ...user, ...formData });
        setEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get title badge color
  const getTitleBadgeColor = (title) => {
    switch(title) {
      case "Dr.": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Prof.": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Group subjects by course
  const subjectsByCourse = assignedSubjects.reduce((acc, subject) => {
    const courseId = subject.courseId?._id || subject.courseId;
    const courseName = subject.courseId?.name || "Uncategorized";
    if (!acc[courseId]) {
      acc[courseId] = { courseName, subjects: [] };
    }
    acc[courseId].subjects.push(subject);
    return acc;
  }, {});

  if (fetchingAssignments) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mb-4">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Profile</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">{error}</p>
        <button 
          onClick={() => fetchAssignedResources()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            My Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View your teaching assignments and personal information
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Stats Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{assignedCourses.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Courses</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{assignedSubjects.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Subjects</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BookMarked className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formData.lecturerInfo.title || "—"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Academic Title</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {new Date(user?.createdAt).getFullYear()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-900 p-1 shadow-lg">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {formData.name?.charAt(0) || "L"}
                  </span>
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors shadow-md">
                <Camera className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 p-6">
          {!editing ? (
            <div className="space-y-6">
              {/* Name and Title */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formData.name}
                  </h2>
                  {formData.lecturerInfo.title && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTitleBadgeColor(formData.lecturerInfo.title)}`}>
                      {formData.lecturerInfo.title}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Lecturer
                </p>
              </div>

              {/* Contact Info Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{formData.email}</span>
                </div>
                {formData.lecturerInfo.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{formData.lecturerInfo.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              {formData.lecturerInfo.bio && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    About Me
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {formData.lecturerInfo.bio}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <select
                    name="lecturerInfo.title"
                    value={formData.lecturerInfo.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Title</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="lecturerInfo.phoneNumber"
                  value={formData.lecturerInfo.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio / About
                </label>
                <textarea
                  name="lecturerInfo.bio"
                  value={formData.lecturerInfo.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell your students about yourself, your experience, and teaching philosophy..."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Assigned Courses Section */}
      {assignedCourses.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-950/10 dark:to-purple-950/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                  My Teaching Courses
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Courses assigned by the administrator
                </p>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                {assignedCourses.length} Courses
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assignedCourses.map((course) => (
                <div
                  key={course._id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-800/30 p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {course.name}
                      </h3>
                      {course.code && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Code: {course.code}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Status</span>
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Subjects Section */}
      {assignedSubjects.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50/30 to-teal-50/30 dark:from-green-950/10 dark:to-teal-950/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-green-500" />
                  My Teaching Subjects
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Subjects assigned by the administrator
                </p>
              </div>
              <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                {assignedSubjects.length} Subjects
              </span>
            </div>
          </div>
          <div className="p-6">
            {Object.entries(subjectsByCourse).map(([courseId, { courseName, subjects }]) => (
              <div key={courseId} className="mb-6 last:mb-0">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FolderOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {courseName}
                  <span className="text-xs text-gray-400">({subjects.length} subjects)</span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <BookMarked className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {subject.name}
                        </p>
                        {subject.code && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Code: {subject.code}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Assignments Message */}
      {assignedCourses.length === 0 && assignedSubjects.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Courses or Subjects Assigned Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              You haven't been assigned to any courses or subjects. Please contact the administrator to get access.
            </p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Last login: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerProfile;