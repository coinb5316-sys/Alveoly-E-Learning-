// pages/lecturer/LecturerStudents.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import {
  Users, Search, Filter, Mail, Phone, Calendar,
  TrendingUp, Award, Clock, Loader2, Eye,
  ChevronDown, Download, UserPlus, Star
} from "lucide-react";

const LecturerStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ course: "", status: "" });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [search, filter]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filter.course) params.append("courseId", filter.course);
      
      const res = await axios.get(`/api/lecturer/students?${params.toString()}`);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Fetch students error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/lecturer/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Fetch courses error:", err);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">My Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and track your students' progress
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus className="h-4 w-4" />
          Invite Students
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{students.length}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(students.reduce((sum, s) => sum + (s.averageScore || 0), 0) / (students.length || 1))}%
              </p>
              <p className="text-sm text-gray-500">Average Score</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {students.filter(s => s.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Active Students</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <select
          value={filter.course}
          onChange={(e) => setFilter({ ...filter, course: e.target.value })}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>{course.name}</option>
          ))}
        </select>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No students found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <div
              key={student._id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {student.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getPerformanceColor(student.averageScore || 0)}`}>
                        <Star className="h-3 w-3" />
                        Avg: {Math.round(student.averageScore || 0)}%
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        Last active: {student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleDateString() : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/lecturer/students/${student._id}/progress`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Progress
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerStudents;