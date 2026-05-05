// StudentCourses.jsx - Professional styling with dark mode
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { io } from "socket.io-client";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Clock,
  Users,
  Star,
  Award,
  Loader2,
  Sparkles,
  TrendingUp,
  Calendar,
  ArrowRight,
  PlayCircle,
  BookMarked,
  Eye,
  Zap
} from "lucide-react";

const socket = io("http://localhost:5000");

const StudentCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCourse, setHoveredCourse] = useState(null);

  useEffect(() => {
    fetchCourses();

    socket.on("course:created", (course) => {
      setCourses((prev) => [course, ...prev]);
    });

    socket.on("course:updated", (updated) => {
      setCourses((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
    });

    socket.on("course:deleted", (_id) => {
      setCourses((prev) => prev.filter((c) => c._id !== _id));
    });

    return () => {
      socket.off("course:created");
      socket.off("course:updated");
      socket.off("course:deleted");
    };
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mock stats - replace with actual data from API
  const getCourseStats = (courseId) => {
    // This would come from your API
    return {
      subjects: Math.floor(Math.random() * 20) + 5,
      students: Math.floor(Math.random() * 500) + 50,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            My Courses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a course to explore subjects and start your learning journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {courses.length} courses
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {courses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {courses.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <BookMarked className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {courses.reduce((acc, c) => acc + (c.subjects?.length || 0), 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Learning</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  In Progress
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  0%
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-full animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-2/3 animate-pulse" />
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Courses Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Courses will appear here once they're added by the administrator.
              Check back later!
            </p>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && courses.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => {
            const stats = getCourseStats(course._id);
            const isHovered = hoveredCourse === course._id;
            
            return (
              <div
                key={course._id}
                onMouseEnter={() => setHoveredCourse(course._id)}
                onMouseLeave={() => setHoveredCourse(null)}
                className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/5 group-hover:to-purple-600/5 transition-all duration-300" />
                
                {/* Popular Badge (for first course example) */}
                {index === 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg">
                      <Zap className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6 relative z-10">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                        <PlayCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
                        {course.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {stats.subjects} Subjects
                      </p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {stats.students}+
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {stats.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Self-paced
                      </span>
                    </div>
                  </div>

                  {/* Description placeholder */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    Master {course.name} with comprehensive study materials, practice questions, and mock exams to help you succeed.
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/student/subjects?course=${course._id}`)}
                    className="group/btn w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    <span>View Subjects</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Progress indicator (if any) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
                  <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Featured Section (Optional) */}
      {!loading && courses.length > 0 && (
        <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Ready to Start Learning?</h3>
                <p className="text-blue-100 mt-1">
                  Choose a course above and begin your journey to success
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-80">Get started today</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;