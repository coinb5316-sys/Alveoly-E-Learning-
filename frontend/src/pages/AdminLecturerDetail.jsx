// pages/admin/AdminLecturerDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Building,
  MapPin,
  MessageSquare,
  FileText,
  TrendingUp
} from "lucide-react";

const AdminLecturerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContent: 0,
    publishedContent: 0,
    totalStudents: 0,
    averageScore: 0
  });

  useEffect(() => {
    fetchLecturerDetails();
    fetchLecturerStats();
  }, [id]);

  const fetchLecturerDetails = async () => {
    try {
      const res = await axios.get(`/admin/lecturers/${id}`);
      setLecturer(res.data);
    } catch (err) {
      console.error("Fetch lecturer error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturerStats = async () => {
    try {
      const res = await axios.get(`/admin/lecturers/${id}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!lecturer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lecturer not found</p>
        <button onClick={() => navigate("/admin/lecturers")} className="text-blue-600 mt-4">
          Back to Lecturers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/lecturers")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Lecturer Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage lecturer information
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-900 p-1">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {lecturer.name?.charAt(0) || "L"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lecturer.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {lecturer.lecturerInfo?.title || "Lecturer"} 
                {lecturer.lecturerInfo?.specialization && ` - ${lecturer.lecturerInfo.specialization}`}
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {lecturer.email}
                </div>
                {lecturer.lecturerInfo?.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {lecturer.lecturerInfo.phoneNumber}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(lecturer.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Deactivate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.totalContent}</p>
          <p className="text-xs text-gray-600">Total Content</p>
        </div>
        <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.publishedContent}</p>
          <p className="text-xs text-gray-600">Published</p>
        </div>
        <div className="rounded-xl bg-purple-50 dark:bg-purple-950/20 p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
          <p className="text-xs text-gray-600">Students Reached</p>
        </div>
        <div className="rounded-xl bg-orange-50 dark:bg-orange-950/20 p-4">
          <p className="text-2xl font-bold text-orange-600">{stats.averageScore}%</p>
          <p className="text-xs text-gray-600">Avg Student Score</p>
        </div>
      </div>

      {/* Assigned Courses & Subjects */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Assigned Courses
            </h3>
          </div>
          {lecturer.lecturerInfo?.assignedCourses?.length > 0 ? (
            <div className="space-y-2">
              {lecturer.lecturerInfo.assignedCourses.map((course, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="font-medium">{course.name || course}</span>
                  <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No courses assigned</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Assigned Subjects
            </h3>
          </div>
          {lecturer.lecturerInfo?.assignedSubjects?.length > 0 ? (
            <div className="space-y-2">
              {lecturer.lecturerInfo.assignedSubjects.map((subject, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="font-medium">{subject.name || subject}</span>
                  <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No subjects assigned</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <FileText className="h-4 w-4 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Created new exam: "Midterm Assessment"</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Users className="h-4 w-4 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Graded 15 student submissions</p>
              <p className="text-xs text-gray-500">5 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Award className="h-4 w-4 text-purple-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Published new lesson: "Introduction to Programming"</p>
              <p className="text-xs text-gray-500">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLecturerDetail;