// routes/lecturerRoutes.js - COMPLETE FIXED VERSION
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import LecturerContent from "../models/LecturerContent.js";
import LecturerAttempt from "../models/LecturerAttempt.js";
import mongoose from "mongoose";
import {
  createContent,
  getMyContent,
  updateContent,
  publishContent,
  deleteContent,
  getStudentAttempts,
  gradeSubmission,
  getPerformanceAnalytics,
  getStudentReport,
  updateLecturerProfile,
  getDashboardStats,
  getAssignedCourses,
  getAssignedSubjects,
  getAssignedSubjectsByCourse,
  getLecturerExamResults,        // ← ADD THIS
  deleteLecturerExamAttempt,     // ← ADD THIS
  allowLecturerResit,            // ← ADD THIS
  getLecturerExamDetails         // ← ADD THIS
} from "../controllers/lecturerController.js";

const router = express.Router();

// Middleware to check if user is lecturer
const lecturerOnly = (req, res, next) => {
  if (req.user.role !== "lecturer" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Lecturer only." });
  }
  next();
};

router.use(protect);
router.use(lecturerOnly);

// ================= DASHBOARD =================
router.get("/dashboard/stats", getDashboardStats);

// ================= CONTENT MANAGEMENT =================
router.post("/content", createContent);
router.get("/content", getMyContent);
router.put("/content/:id", updateContent);
router.delete("/content/:id", deleteContent);
router.patch("/content/:id/publish", publishContent);

// ================= STUDENT ATTEMPTS & GRADING =================
router.get("/attempts", getStudentAttempts);
router.post("/attempts/:attemptId/grade", gradeSubmission);
router.get("/attempts/pending-count", async (req, res) => {
  try {
    const content = await LecturerContent.find({ lecturerId: req.user._id });
    const contentIds = content.map(c => c._id);
    
    const pendingGrading = await LecturerAttempt.countDocuments({
      contentId: { $in: contentIds },
      status: "submitted",
      graded: false
    });
    
    const totalSubmissions = await LecturerAttempt.countDocuments({
      contentId: { $in: contentIds }
    });
    
    res.json({
      success: true,
      submissions: totalSubmissions,
      grading: pendingGrading
    });
  } catch (err) {
    res.json({ success: true, submissions: 0, grading: 0 });
  }
});

// ================= EXAM RESULTS (Lecturer) =================
router.get("/exam-results", getLecturerExamResults);
router.delete("/exam-attempt/:attemptId", deleteLecturerExamAttempt);
router.patch("/exam-attempt/:attemptId/resit", allowLecturerResit);
router.get("/exam-attempt/:attemptId/details", getLecturerExamDetails);

// ================= ANALYTICS & REPORTS =================
router.get("/analytics", getPerformanceAnalytics);
router.get("/reports/student/:studentId", getStudentReport);

// ================= PROFILE =================
router.put("/profile", updateLecturerProfile);

// ================= ASSIGNED RESOURCES =================
router.get("/assigned-courses", getAssignedCourses);
router.get("/assigned-subjects", getAssignedSubjects);
router.get("/assigned-subjects/course/:courseId", getAssignedSubjectsByCourse);

// ================= NOTIFICATION ROUTES =================
router.get("/notifications/unread-count", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.json({ count: 0 });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.json([]);
  }
});

router.put("/notifications/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/notifications/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= STUDENTS ROUTE - USING LessonAttempt (FIXED) =================
router.get("/students", async (req, res) => {
  try {
    const { search, courseId } = req.query;
    
    // Import LessonAttempt model - THIS IS THE KEY FIX
    const LessonAttempt = mongoose.model("LessonAttempt");
    
    // Get lecturer's assigned courses and subjects
    const user = await User.findById(req.user._id);
    const assignedCourseIds = user?.lecturerInfo?.assignedCourses || [];
    const assignedSubjectIds = user?.lecturerInfo?.assignedSubjects || [];
    
    console.log("Assigned courses:", assignedCourseIds);
    console.log("Assigned subjects:", assignedSubjectIds);
    
    // Build query for students based on assigned courses
    let studentQuery = { role: "student" };
    
    if (courseId) {
      studentQuery.courseId = courseId;
    } else if (assignedCourseIds.length > 0) {
      studentQuery.courseId = { $in: assignedCourseIds };
    }
    
    // Get students
    let students = await User.find(studentQuery)
      .select("name email courseId createdAt lastLoginAt isActive")
      .populate("courseId", "name");
    
    console.log(`Found ${students.length} students`);
    
    if (students.length === 0) {
      return res.json({ success: true, students: [], total: 0 });
    }
    
    // Get all content created by this lecturer
    const lecturerContent = await LecturerContent.find({ 
      lecturerId: req.user._id,
      subjectId: { $in: assignedSubjectIds }
    });
    const contentIds = lecturerContent.map(c => c._id);
    console.log(`Found ${contentIds.length} content items`);
    
    if (contentIds.length === 0) {
      const studentsWithoutPerformance = students.map(student => ({
        _id: student._id,
        name: student.name,
        email: student.email,
        courseId: student.courseId,
        courseName: student.courseId?.name,
        createdAt: student.createdAt,
        lastLoginAt: student.lastLoginAt,
        isActive: student.isActive,
        averageScore: 0,
        totalAttempts: 0,
        passedAttempts: 0
      }));
      
      return res.json({ 
        success: true, 
        students: studentsWithoutPerformance,
        total: studentsWithoutPerformance.length 
      });
    }
    
    // CRITICAL FIX: Use LessonAttempt, NOT LecturerAttempt
    const allAttempts = await LessonAttempt.find({
      lessonId: { $in: contentIds },
      status: "completed"
    });
    console.log(`Found ${allAttempts.length} total attempts from LessonAttempt`);
    
    // Calculate performance for each student
    const studentsWithPerformance = students.map(student => {
      // Get attempts for this specific student
      const studentAttempts = allAttempts.filter(a => 
        a.userId?.toString() === student._id.toString()
      );
      
      console.log(`Student ${student.name} has ${studentAttempts.length} attempts`);
      
      const totalAttempts = studentAttempts.length;
      let averageScore = 0;
      let passedAttempts = 0;
      
      if (totalAttempts > 0) {
        const totalPercentage = studentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
        averageScore = Math.round(totalPercentage / totalAttempts);
        
        // Calculate passed attempts based on percentage and passMark
        passedAttempts = studentAttempts.filter(a => {
          const passMark = a.passMark || 70;
          return (a.percentage || 0) >= passMark;
        }).length;
      }
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        courseId: student.courseId,
        courseName: student.courseId?.name,
        createdAt: student.createdAt,
        lastLoginAt: student.lastLoginAt,
        isActive: student.isActive,
        averageScore,
        totalAttempts,
        passedAttempts
      };
    });
    
    // Apply search filter
    let filteredStudents = studentsWithPerformance;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.name?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by name
    filteredStudents.sort((a, b) => a.name?.localeCompare(b.name));
    
    console.log(`Returning ${filteredStudents.length} students with performance data`);
    
    res.json({ 
      success: true, 
      students: filteredStudents,
      total: filteredStudents.length 
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: err.message });
  }
});
// Performance route - make sure it returns the right structure
router.get("/performance/subject/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const user = await User.findById(req.user._id);
    const hasAccess = user.lecturerInfo?.assignedSubjects?.some(s => s.toString() === subjectId);
    
    if (!hasAccess && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied to this subject" });
    }
    
    // Import LessonAttempt model
    const LessonAttempt = mongoose.model("LessonAttempt");
    
    const attempts = await LessonAttempt.find({ 
      subjectId: subjectId, 
      status: "completed"
    })
      .populate("userId", "name email")
      .populate("lessonId", "title")
      .sort({ completedAt: -1 });
    
    console.log(`Found ${attempts.length} attempts for subject ${subjectId}`);
    
    const processedAttempts = attempts.map(attempt => ({
      _id: attempt._id,
      userId: attempt.userId?._id || attempt.userId,
      userName: attempt.userId?.name || attempt.userName,
      userEmail: attempt.userId?.email || attempt.userEmail,
      lessonId: attempt.lessonId?._id || attempt.lessonId,
      lessonTitle: attempt.lessonId?.title || attempt.lessonTitle,
      score: attempt.score || 0,
      totalPoints: attempt.totalPoints || 0,
      percentage: attempt.percentage || 0,
      isPassed: attempt.isPassed || false,
      submittedAt: attempt.completedAt || attempt.submittedAt
    }));
    
    res.json({ attempts: processedAttempts });
  } catch (err) {
    console.error("Error fetching subject performance:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/performance/student/:studentId/subject/:subjectId", async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    
    const user = await User.findById(req.user._id);
    const hasAccess = user.lecturerInfo?.assignedSubjects?.some(s => s.toString() === subjectId);
    
    if (!hasAccess && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied to this subject" });
    }
    
    const attempts = await LecturerAttempt.find({ 
      studentId: studentId,
      subjectId: subjectId, 
      status: "completed" 
    })
      .populate("contentId", "title")
      .sort({ completedAt: -1 });
    
    const processedAttempts = attempts.map(attempt => ({
      _id: attempt._id,
      lessonId: { title: attempt.contentId?.title || attempt.contentTitle },
      score: attempt.score || 0,
      totalPoints: attempt.totalPoints || 0,
      percentage: attempt.percentage || 0,
      isPassed: attempt.isPassed || false,
      completedAt: attempt.completedAt || attempt.submittedAt
    }));
    
    res.json({ attempts: processedAttempts });
  } catch (err) {
    console.error("Error fetching student progress:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= RETRY/ALLOW RETAKE =================
router.post("/attempts/:attemptId/allow-retake", async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await LecturerAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    attempt.allowRetake = true;
    attempt.adminAllowedRetake = true;
    await attempt.save();
    
    await Notification.create({
      userId: attempt.studentId,
      title: "Retake Permission Granted",
      message: `You have been granted permission to retake "${attempt.contentTitle || 'Quiz'}".`,
      type: "success",
      read: false
    });
    
    res.json({ success: true, message: "Retake permission granted" });
  } catch (err) {
    console.error("Error allowing retake:", err);
    res.status(500).json({ message: err.message });
  }
});

// routes/lecturerRoutes.js - Add this endpoint
router.get("/assigned-subjects", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        populate: { path: 'courseId', select: 'name' }
      });
    
    const subjects = user.lecturerInfo?.assignedSubjects || [];
    res.json({ success: true, subjects });
  } catch (err) {
    console.error("Error fetching assigned subjects:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= DELETE ATTEMPT =================
router.delete("/attempts/:attemptId", async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await LecturerAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    const content = await LecturerContent.findOne({
      _id: attempt.contentId,
      lecturerId: req.user._id
    });
    
    if (!content && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this attempt" });
    }
    
    await attempt.deleteOne();
    res.json({ success: true, message: "Attempt deleted successfully" });
  } catch (err) {
    console.error("Error deleting attempt:", err);
    res.status(500).json({ message: err.message });
  }
});

// Debug endpoint to check assigned subjects
router.get("/debug-assigned-subjects", async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        populate: { path: 'courseId', select: 'name' }
      });
    
    const result = {
      userId: user._id,
      userName: user.name,
      assignedSubjectIds: user.lecturerInfo?.assignedSubjects || [],
      populatedSubjects: user.lecturerInfo?.assignedSubjects?.map(s => ({
        id: s._id,
        name: s.name,
        courseId: s.courseId?._id,
        courseName: s.courseId?.name
      })) || [],
      rawLecturerInfo: user.lecturerInfo
    };
    
    console.log("Debug assigned subjects:", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add this to routes/lecturerRoutes.js - DEDICATED STUDENTS ENDPOINT FOR LECTURERS
router.get("/my-students-list", async (req, res) => {
  try {
    console.log("=== LECTURER MY-STUDENTS-LIST ROUTE HIT ===");
    console.log("Lecturer ID:", req.user._id);
    
    // Get lecturer's assigned courses
    const user = await User.findById(req.user._id);
    const assignedCourseIds = user?.lecturerInfo?.assignedCourses || [];
    
    console.log("Assigned course IDs:", assignedCourseIds);
    
    if (assignedCourseIds.length === 0) {
      return res.json({ success: true, students: [], total: 0 });
    }
    
    // Get all students enrolled in those courses
    const students = await User.find({ 
      role: "student",
      courseId: { $in: assignedCourseIds }
    })
    .select("name email courseId createdAt lastLoginAt isActive _id")
    .populate("courseId", "name");
    
    console.log(`Found ${students.length} students in assigned courses`);
    
    // Format the response
    const formattedStudents = students.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      courseId: student.courseId,
      courseName: student.courseId?.name || "Not assigned",
      createdAt: student.createdAt,
      lastLoginAt: student.lastLoginAt,
      isActive: student.isActive,
      totalAttempts: 0,
      averageScore: 0,
      passedAttempts: 0,
      hasAttempts: false
    }));
    
    res.json({ success: true, students: formattedStudents, total: formattedStudents.length });
  } catch (err) {
    console.error("Error fetching lecturer students:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;