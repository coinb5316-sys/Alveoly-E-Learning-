// pages/lecturer/LecturerStudents.jsx - COMPLETE FIXED VERSION
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import {
  Users, Search, Filter, Mail, Phone, Calendar,
  TrendingUp, Award, Clock, Loader2, Eye,
  ChevronDown, Download, UserPlus, Star,
  CheckCircle, XCircle, AlertCircle, RefreshCw 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const LecturerStudents = () => {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ course: "", status: "" });
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [stats, setStats] = useState({ total: 0, avgScore: 0, active: 0, withAttempts: 0 });

  useEffect(() => {
    fetchAssignedResources();
  }, []);

  // When course or subject changes, fetch students
  useEffect(() => {
    if (selectedCourse) {
      fetchAllStudents();
    }
  }, [selectedCourse, selectedSubject, search]);

  const fetchAssignedResources = async () => {
    try {
      console.log("Fetching assigned courses and subjects...");
      const [coursesRes, subjectsRes] = await Promise.all([
        axios.get("/lecturer/assigned-courses"),
        axios.get("/lecturer/assigned-subjects"),
      ]);
      
      console.log("Courses response:", coursesRes.data);
      console.log("Subjects response:", subjectsRes.data);
      
      if (coursesRes.data.success) {
        const coursesList = coursesRes.data.courses || [];
        setCourses(coursesList);
        // Auto-select first course if available
        if (coursesList.length > 0 && !selectedCourse) {
          setSelectedCourse(coursesList[0]._id);
        }
      }
      
      if (subjectsRes.data.success) {
        const subjectsList = subjectsRes.data.subjects || [];
        setSubjects(subjectsList);
        console.log(`Loaded ${subjectsList.length} assigned subjects`);
        subjectsList.forEach(s => {
          console.log(`  Subject: ${s.name}, Course: ${s.courseId?.name || s.courseId}`);
        });
      }
    } catch (err) {
      console.error("Error fetching assigned resources:", err);
      toast.error("Failed to fetch assigned courses and subjects");
    }
  };

  const fetchAllStudents = async () => {
  setLoading(true);
  try {
    console.log(`Fetching students for course: ${selectedCourse}`);
    
    let allCourseStudents = [];
    
    // Use the dedicated lecturer endpoint
    const studentsRes = await axios.get("/lecturer/my-students-list");
    
    if (studentsRes.data.success) {
      allCourseStudents = studentsRes.data.students || [];
    }
    
    console.log(`Found ${allCourseStudents.length} total students`);
    
    // If we have a selected course, filter by it
    if (selectedCourse) {
      allCourseStudents = allCourseStudents.filter(s => 
        s.courseId?._id === selectedCourse || s.courseId === selectedCourse
      );
      console.log(`After course filter: ${allCourseStudents.length} students`);
    }
    
    // If no subject selected, just show students without performance data
    if (!selectedSubject) {
      const formattedStudents = allCourseStudents.map(student => ({
        _id: student._id,
        name: student.name,
        email: student.email,
        totalAttempts: 0,
        averageScore: 0,
        passedAttempts: 0,
        createdAt: student.createdAt,
        lastLoginAt: student.lastLoginAt,
        isActive: student.isActive,
        courseName: student.courseName,
        hasAttempts: false
      }));
      
      applyFiltersAndStats(formattedStudents);
      setLoading(false);
      return;
    }
    
    // Fetch performance data for the selected subject
    console.log(`Fetching performance for subject: ${selectedSubject}`);
    try {
      const perfRes = await axios.get(`/lesson-quiz/subject/${selectedSubject}/performance`);
      const attempts = perfRes.data.attempts || [];
      console.log(`Found ${attempts.length} attempts for this subject`);
      
      // Create a map of student performance
      const performanceMap = new Map();
      
      attempts.forEach(attempt => {
        const studentId = attempt.userId?._id || attempt.userId;
        if (!studentId) return;
        
        if (!performanceMap.has(studentId)) {
          performanceMap.set(studentId, {
            attempts: [],
            totalScore: 0,
            passedCount: 0
          });
        }
        const perf = performanceMap.get(studentId);
        perf.attempts.push(attempt);
        perf.totalScore += (attempt.percentage || 0);
        if (attempt.isPassed) perf.passedCount++;
      });
      
      // Combine students with their performance data
      const studentsWithData = allCourseStudents.map(student => {
        const perf = performanceMap.get(student._id);
        
        if (perf && perf.attempts.length > 0) {
          const totalAttempts = perf.attempts.length;
          return {
            ...student,
            totalAttempts: totalAttempts,
            averageScore: totalAttempts > 0 
              ? Math.round(perf.totalScore / totalAttempts) 
              : 0,
            passedAttempts: perf.passedCount,
            hasAttempts: true
          };
        } else {
          return {
            ...student,
            totalAttempts: 0,
            averageScore: 0,
            passedAttempts: 0,
            hasAttempts: false
          };
        }
      });
      
      applyFiltersAndStats(studentsWithData);
      
    } catch (perfErr) {
      console.error("Error fetching performance data:", perfErr);
      const studentsWithoutPerf = allCourseStudents.map(student => ({
        ...student,
        totalAttempts: 0,
        averageScore: 0,
        passedAttempts: 0,
        hasAttempts: false
      }));
      applyFiltersAndStats(studentsWithoutPerf);
      toast.warning("Could not load performance data. Showing students only.");
    }
    
  } catch (err) {
    console.error("Error fetching students:", err);
    toast.error("Failed to fetch student data");
    setLoading(false);
  }
};

  const applyFiltersAndStats = (studentsList) => {
    // Apply search filter
    let filtered = studentsList;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filter.status === "with_attempts") {
      filtered = filtered.filter(s => s.hasAttempts);
    } else if (filter.status === "no_attempts") {
      filtered = filtered.filter(s => !s.hasAttempts);
    }
    
    // Sort by name
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    
    setStudents(filtered);
    setAllStudents(studentsList);
    
    // Calculate stats
    const total = studentsList.length;
    const studentsWithAttempts = studentsList.filter(s => s.hasAttempts).length;
    const avgScore = studentsWithAttempts > 0 
      ? Math.round(studentsList.filter(s => s.hasAttempts).reduce((sum, s) => sum + (s.averageScore || 0), 0) / studentsWithAttempts)
      : 0;
    const active = studentsList.filter(s => s.isActive).length;
    
    setStats({ 
      total, 
      avgScore, 
      active, 
      withAttempts: studentsWithAttempts 
    });
    
    setLoading(false);
  };

  const getPerformanceColor = (score, hasAttempts) => {
    if (!hasAttempts) return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    if (score >= 80) return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    if (score >= 60) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
    return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
  };

  const getPerformanceIcon = (score, hasAttempts) => {
    if (!hasAttempts) return <AlertCircle className="h-3 w-3" />;
    if (score >= 80) return <CheckCircle className="h-3 w-3" />;
    if (score >= 60) return <TrendingUp className="h-3 w-3" />;
    return <XCircle className="h-3 w-3" />;
  };

  // Helper function to get subjects filtered by selected course
  const getSubjectsForSelectedCourse = () => {
    if (!selectedCourse) return [];
    return subjects.filter(subject => {
      // Check if subject belongs to selected course
      const subjectCourseId = subject.courseId?._id || subject.courseId;
      return subjectCourseId === selectedCourse;
    });
  };

  const filteredSubjects = getSubjectsForSelectedCourse();
  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);
  const selectedCourseObj = courses.find(c => c._id === selectedCourse);

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">My Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View all students enrolled in your courses
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchAllStudents()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedSubject(""); // Reset subject when course changes
              }}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Subject (Optional)
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
              disabled={!selectedCourse}
            >
              <option value="">All Subjects (No performance filter)</option>
              {filteredSubjects.map(subject => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
            {selectedCourse && filteredSubjects.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                No subjects assigned to this course
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="">All Students</option>
              <option value="with_attempts">With Attempts</option>
              <option value="no_attempts">No Attempts Yet</option>
            </select>
          </div>
        </div>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Enrolled</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.withAttempts}</p>
              <p className="text-sm text-gray-500">With Attempts</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total - stats.withAttempts}</p>
              <p className="text-sm text-gray-500">No Attempts</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.avgScore}%</p>
              <p className="text-sm text-gray-500">Avg Score</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {selectedSubject && selectedSubjectObj && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Showing performance data for: <span className="font-semibold">{selectedSubjectObj?.name}</span>
          </p>
        </div>
      )}

      {/* Students List */}
      {students.length === 0 && !loading ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No students found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {!selectedCourse ? "Please select a course to view students" : "No students are enrolled in this course yet"}
          </p>
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {student.courseName && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="h-3 w-3" />
                          {student.courseName}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getPerformanceColor(student.averageScore, student.hasAttempts)}`}>
                        {getPerformanceIcon(student.averageScore, student.hasAttempts)}
                        Avg: {student.hasAttempts ? Math.round(student.averageScore) + '%' : 'No attempts'}
                      </span>
                      {student.hasAttempts && (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {student.totalAttempts} attempts
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {student.passedAttempts} passed
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/lecturer/students/${student._id}/progress${selectedSubject ? `?subject=${selectedSubject}` : ''}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
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