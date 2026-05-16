// routes/lessonQuestionRoutes.js
import express from "express";
import {
  saveLessonQuestions,
  getLessonQuestions,
  startLessonQuiz,
  submitLessonQuiz,
  getStudentProgress,
  getLessonPerformance,
  allowRetake,
  getSubjectPerformance,
  deleteAttempt,
  getStudentProgressForSubject,  // ← ADD THIS IMPORT
} from "../controllers/lessonQuestionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= ROUTES THAT NEED PERMISSION CHECKS IN CONTROLLER =================
// Save quiz - permission checked in controller (admin or content creator)
router.post("/save", protect, saveLessonQuestions);

// Get lesson performance - admin only
router.get("/lesson/:lessonId/performance", protect, adminOnly, getLessonPerformance);

// Get lesson questions - both students and lecturers can view
router.get("/lesson/:lessonId", protect, getLessonQuestions);

// Student routes
router.post("/start/:lessonId", protect, startLessonQuiz);
router.post("/submit", protect, submitLessonQuiz);

// ================= ROUTES WITH LECTURER ACCESS =================
// Get subject performance - Admin OR Lecturer assigned to subject
router.get("/subject/:subjectId/performance", protect, getSubjectPerformance);

// Get student progress for a specific subject - Admin OR Lecturer assigned to subject
router.get("/student/:studentId/subject/:subjectId/progress", protect, getStudentProgressForSubject);

// Get student progress (all) - Admin only
router.get("/student/:studentId/progress", protect, adminOnly, getStudentProgress);

// Allow retake - Admin OR Lecturer assigned to subject
router.post("/allow-retake/:attemptId", protect, allowRetake);

// Delete attempt - Admin OR Lecturer assigned to subject
router.delete("/attempt/:attemptId", protect, deleteAttempt);

export default router;