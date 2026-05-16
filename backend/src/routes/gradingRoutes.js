// routes/gradingRoutes.js
import express from "express";
import {
  getPendingSubmissions,
  getSubmissionDetails,
  gradeSubmission,
  autoGradeMcq,
  updateManualGrade,
  getGradingStats,
  bulkGradeSubmissions,
  addQuestionFeedback,
  requestResubmission,
} from "../controllers/gradingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication and lecturer/admin role
router.use(protect);
router.use((req, res, next) => {
  if (req.user.role !== "lecturer" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Lecturer only." });
  }
  next();
});

// Grading routes
router.get("/pending", getPendingSubmissions);
router.get("/stats", getGradingStats);
router.get("/submission/:submissionId", getSubmissionDetails);
router.post("/submission/:submissionId/auto-grade", autoGradeMcq);
router.post("/submission/:submissionId/manual-grade", gradeSubmission);
router.put("/submission/:submissionId/manual-grade", updateManualGrade);
router.post("/submission/:submissionId/feedback", addQuestionFeedback);
router.post("/submission/:submissionId/resubmit-request", requestResubmission);
router.post("/bulk-grade", bulkGradeSubmissions);

export default router;