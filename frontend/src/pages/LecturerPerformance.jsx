// pages/lecturer/LecturerPerformance.jsx - FULLY UPDATED with Grade button
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Users,
  BookOpen,
  Trophy,
  Download,
  RotateCcw,
  Eye,
  X,
  CheckCircle,
  Trash2,
  Filter,
  Search,
  Calendar,
  Target,
  Loader2,
  BarChart3,
  School,
  GraduationCap,
  ChevronDown
} from "lucide-react";

const LecturerPerformance = () => {
  const navigate = useNavigate();
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [allAssignedSubjects, setAllAssignedSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ 
    totalAttempts: 0, 
    averageScore: 0, 
    passRate: 0, 
    completedLessons: 0,
    uniqueStudents: 0
  });

  // Load initial data
  useEffect(() => {
    fetchAssignedResources();
    fetchAllStudents();
  }, []);

  // Filter subjects when course changes
  useEffect(() => {
    if (selectedCourse) {
      const filtered = allAssignedSubjects.filter(s => 
        s.courseId?._id === selectedCourse || s.courseId === selectedCourse
      );
      setFilteredSubjects(filtered);
      setSelectedSubject("");
      setSelectedStudent("");
      setAttempts([]);
      setStats({ totalAttempts: 0, averageScore: 0, passRate: 0, completedLessons: 0, uniqueStudents: 0 });
    } else {
      setFilteredSubjects([]);
    }
  }, [selectedCourse, allAssignedSubjects]);

  // Fetch performance data when subject or student changes
  useEffect(() => {
    if (selectedSubject) {
      fetchPerformanceData();
    } else {
      setAttempts([]);
      setStats({ totalAttempts: 0, averageScore: 0, passRate: 0, completedLessons: 0, uniqueStudents: 0 });
    }
  }, [selectedSubject, selectedStudent]);

  const fetchAssignedResources = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        axios.get("/lecturer/assigned-courses"),
        axios.get("/lecturer/assigned-subjects"),
      ]);
      
      if (coursesRes.data.success) {
        setAssignedCourses(coursesRes.data.courses || []);
      }
      if (subjectsRes.data.success) {
        setAllAssignedSubjects(subjectsRes.data.subjects || []);
      }
    } catch (err) {
      console.error("Error fetching assigned resources:", err);
      toast.error("Failed to fetch assigned courses and subjects");
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get("/users/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      try {
        const res2 = await axios.get("/lecturer/students");
        setStudents(res2.data.students || []);
      } catch (err2) {
        console.error("Alternative also failed:", err2);
        setStudents([]);
      }
    }
  };

  const fetchPerformanceData = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    
    try {
      let url;
      if (selectedStudent) {
        url = `/lesson-quiz/student/${selectedStudent}/subject/${selectedSubject}/progress`;
      } else {
        url = `/lesson-quiz/subject/${selectedSubject}/performance`;
      }
      
      const res = await axios.get(url);
      const data = res.data;
      
     const formattedAttempts = (data.attempts || []).map(attempt => ({
  _id: attempt._id,
  studentName: attempt.userName || attempt.userId?.name || "Unknown",
  studentEmail: attempt.userEmail || attempt.userId?.email || "",
  studentId: attempt.userId?._id || attempt.userId,
  contentTitle: attempt.lessonId?.title || "N/A",
  contentId: attempt.lessonId?._id || attempt.lessonId,
  score: attempt.score || 0,
  totalPoints: attempt.totalPoints || 0,
  percentage: attempt.percentage || 0,
  isPassed: attempt.isPassed || false,
  isGraded: attempt.isGraded || false,  // ← ADD THIS LINE
  status: attempt.status || "completed",
  submittedAt: attempt.completedAt || attempt.submittedAt,
  answers: attempt.questions?.map(q => ({
    question: q.questionText,
    selectedAnswer: q.selectedText,
    correctAnswer: q.correctText,
    isCorrect: q.isCorrect,
    feedback: q.rationale
  })) || []
}));
      
      setAttempts(formattedAttempts);
      
      const totalAttempts = formattedAttempts.length;
      const averageScore = totalAttempts > 0 
        ? Math.round(formattedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts) 
        : 0;
      const passedCount = formattedAttempts.filter(a => a.isPassed).length;
      const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
      const uniqueStudents = new Set(formattedAttempts.map(a => a.studentId).filter(Boolean)).size;
      const completedLessons = new Set(formattedAttempts.map(a => a.contentId).filter(Boolean)).size;
      
      setStats({ 
        totalAttempts, 
        averageScore, 
        passRate, 
        completedLessons,
        uniqueStudents 
      });
    } catch (err) {
      console.error("Error fetching performance:", err);
      toast.error(err.response?.data?.message || "Failed to fetch performance data");
      setAttempts([]);
      setStats({ totalAttempts: 0, averageScore: 0, passRate: 0, completedLessons: 0, uniqueStudents: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAllowRetake = async (attemptId, studentName, lessonTitle) => {
    if (!window.confirm(`Allow ${studentName} to retake "${lessonTitle}"?`)) return;
    
    try {
      await axios.post(`/lesson-quiz/allow-retake/${attemptId}`);
      toast.success(`Retake permission granted for ${studentName}`);
      await fetchPerformanceData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to allow retake");
    }
  };

  const handleDeleteAttempt = async (attemptId, studentName, lessonTitle) => {
    if (!window.confirm(`Delete this attempt for ${studentName} - "${lessonTitle}"?`)) return;
    
    try {
      await axios.delete(`/lesson-quiz/attempt/${attemptId}`);
      toast.success(`Deleted attempt for ${studentName}`);
      await fetchPerformanceData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete attempt");
    }
  };

  const viewAttemptDetails = (attempt) => {
    setSelectedAttempt(attempt);
    setShowDetailsModal(true);
  };

 // In LecturerPerformance.jsx, change the handleGradeAttempt function:

const handleGradeAttempt = (attemptId) => {
  console.log("Navigating to grade with ID:", attemptId);
  // FIXED: Navigate to /lecturer/grading/:attemptId instead of /lecturer/attempts/:attemptId
  navigate(`/lecturer/grading/${attemptId}`);
};

  const exportReport = () => {
    if (!attempts.length) return;
    
    const subjectName = filteredSubjects.find(s => s._id === selectedSubject)?.name || "N/A";
    const courseName = assignedCourses.find(c => c._id === selectedCourse)?.name || "N/A";
    const studentName = selectedStudent ? students.find(s => s._id === selectedStudent)?.name : "All Students";
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      course: courseName,
      subject: subjectName,
      student: studentName,
      stats: stats,
      attempts: attempts.map(a => ({
        student: a.studentName,
        email: a.studentEmail,
        lesson: a.contentTitle || "N/A",
        score: `${a.score}/${a.totalPoints}`,
        percentage: `${Math.round(a.percentage || 0)}%`,
        status: a.isPassed ? "Passed" : "Failed",
        date: a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "N/A",
      })),
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `lecturer_performance_${subjectName}_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    toast.success("Report exported successfully");
  };

  const filteredAttempts = attempts.filter(attempt => 
    attempt.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.contentTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSubjectName = filteredSubjects.find(s => s._id === selectedSubject)?.name || "";
  const selectedCourseName = assignedCourses.find(c => c._id === selectedCourse)?.name || "";
  const selectedStudentName = students.find(s => s._id === selectedStudent)?.name || "";

  let studentsWithAttempts = [];
  if (selectedSubject && attempts.length > 0) {
    const studentMap = new Map();
    attempts.forEach(a => {
      const studentId = a.studentId;
      if (studentId && !studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: a.studentName,
          email: a.studentEmail,
          totalScore: 0,
          count: 0
        });
      }
      if (studentMap.has(studentId)) {
        const student = studentMap.get(studentId);
        student.totalScore += (a.percentage || 0);
        student.count++;
      }
    });
    studentsWithAttempts = Array.from(studentMap.values()).map(s => ({
      ...s,
      averageScore: Math.round(s.totalScore / s.count),
      attempts: s.count
    }));
  }

  if (allAssignedSubjects.length === 0 && !loading && assignedCourses.length > 0) {
    return (
      <div className="space-y-6">
        <Toaster position="top-right" />
        <div className="flex flex-col items-center justify-center py-20">
          <School className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Subjects Assigned</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            You haven't been assigned to any subjects yet. Contact an administrator to get access to subjects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Student Performance
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track student quiz results and learning progress for your subjects
          </p>
          {selectedSubjectName && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <GraduationCap className="h-4 w-4" />
              <span>{selectedCourseName}</span>
              <span>•</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{selectedSubjectName}</span>
              {selectedStudentName && (
                <>
                  <span>•</span>
                  <span>Student: {selectedStudentName}</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportReport}
            disabled={!attempts.length}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-green-900/30"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Course</option>
                {assignedCourses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedCourse}
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedSubject}
              >
                <option value="">All Students</option>
                {studentsWithAttempts.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.averageScore}% avg, {s.attempts} attempts)
                  </option>
                ))}
                {students.filter(s => !studentsWithAttempts.find(swa => swa.id === s._id)).map(s => (
                  <option key={s._id} value={s._id}>{s.name} (No attempts)</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">Loading performance data...</p>
        </div>
      )}

      {/* No Selection State */}
      {!selectedSubject && !loading && filteredSubjects.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <School className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Select a Subject</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Choose a course and subject from your assigned subjects to view student performance
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {selectedSubject && !loading && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalAttempts}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unique Students</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.uniqueStudents}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.averageScore}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pass Rate</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.passRate}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Content Used</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completedLessons}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {attempts.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by student name, email, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          {attempts.length > 0 && (
            <div className="hidden lg:block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-6 py-4 text-left font-medium">Student</th>
                      <th className="px-6 py-4 text-left font-medium">Content</th>
                      <th className="px-6 py-4 text-left font-medium">Score</th>
                      <th className="px-6 py-4 text-left font-medium">Percentage</th>
                      <th className="px-6 py-4 text-left font-medium">Status</th>
                      <th className="px-6 py-4 text-left font-medium">Date</th>
                      <th className="px-6 py-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredAttempts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          No attempts found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredAttempts.map((attempt, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{attempt.studentName || "Unknown"}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{attempt.studentEmail || "No email"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{attempt.contentTitle || "N/A"}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{attempt.score || 0} / {attempt.totalPoints || 0}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${attempt.percentage || 0}%` }} />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">{Math.round(attempt.percentage || 0)}%</span>
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            {attempt.isPassed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-medium">
                                <CheckCircle className="h-3 w-3" /> Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-medium">
                                <X className="h-3 w-3" /> Failed
                              </span>
                            )}
                           </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                            {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "N/A"}
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {/* View Details Button */}
                              <button 
                                onClick={() => viewAttemptDetails(attempt)} 
                                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors" 
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              {/* Grade Button - Navigates to grading page */}
                              <button 
                                onClick={() => handleGradeAttempt(attempt._id)} 
                                className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors" 
                                title="Grade Submission"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              
                              {/* Allow Retake Button */}
                              <button 
                                onClick={() => handleAllowRetake(attempt._id, attempt.studentName, attempt.contentTitle)} 
                                className="p-1.5 rounded-lg text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-colors" 
                                title="Allow Retake"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                              
                              {/* Delete Attempt Button */}
                              <button 
                                onClick={() => handleDeleteAttempt(attempt._id, attempt.studentName, attempt.contentTitle)} 
                                className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" 
                                title="Delete Attempt"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                           </td>
                         </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mobile Card View */}
          {attempts.length > 0 && (
            <div className="lg:hidden space-y-4">
              {filteredAttempts.map((attempt, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{attempt.studentName || "Unknown"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{attempt.studentEmail || "No email"}</p>
                    </div>
                    {attempt.isPassed ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-medium">Passed</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-medium">Failed</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Content</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{attempt.contentTitle || "N/A"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{attempt.score || 0} / {attempt.totalPoints || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{Math.round(attempt.percentage || 0)}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => viewAttemptDetails(attempt)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleGradeAttempt(attempt._id)} className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleAllowRetake(attempt._id, attempt.studentName, attempt.contentTitle)} className="p-1.5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 rounded-lg transition-colors">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteAttempt(attempt._id, attempt.studentName, attempt.contentTitle)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Attempts Message */}
          {attempts.length === 0 && !loading && selectedSubject && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Attempts Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Students haven't attempted any quizzes for this subject yet.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Attempt Details Modal */}
      {showDetailsModal && selectedAttempt && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quiz Attempt Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedAttempt.studentName} • {selectedAttempt.contentTitle || "Unknown"}
                </p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedAttempt.score || 0} / {selectedAttempt.totalPoints || 0}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{Math.round(selectedAttempt.percentage || 0)}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`text-xl font-bold ${selectedAttempt.isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {selectedAttempt.isPassed ? 'Passed' : 'Failed'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {selectedAttempt.submittedAt ? new Date(selectedAttempt.submittedAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Question Answers</h3>
              <div className="space-y-3">
                {selectedAttempt.answers?.map((q, idx) => (
                  <div key={idx} className={`border rounded-xl p-4 ${q.isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20' : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'}`}>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{idx + 1}. {q.question || "No question text"}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        Student's answer: 
                        <span className={q.isCorrect ? 'text-green-600 dark:text-green-400 font-medium ml-1' : 'text-red-600 dark:text-red-400 font-medium ml-1'}>
                          {q.selectedAnswer || 'No answer'}
                        </span>
                      </p>
                      {!q.isCorrect && (
                        <p className="text-green-600 dark:text-green-400">Correct answer: {q.correctAnswer || "Unknown"}</p>
                      )}
                      {q.feedback && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          💡 {q.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end gap-3">
              <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                Close
              </button>
              <button onClick={() => { setShowDetailsModal(false); handleAllowRetake(selectedAttempt._id, selectedAttempt.studentName, selectedAttempt.contentTitle); }} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/25 dark:shadow-yellow-900/30">
                <RotateCcw className="h-4 w-4" /> Allow Retake
              </button>
              <button onClick={() => { setShowDetailsModal(false); handleDeleteAttempt(selectedAttempt._id, selectedAttempt.studentName, selectedAttempt.contentTitle); }} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-red-500/25 dark:shadow-red-900/30">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerPerformance;