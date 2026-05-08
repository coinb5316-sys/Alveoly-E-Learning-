// routes/lecturerRoutes.js - NEW FILE
import express from "express";
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
} from "../controllers/lecturerController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All lecturer routes require authentication and lecturer or admin role
router.use(protect);
router.use((req, res, next) => {
  if (req.user.role !== "lecturer" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Lecturer only." });
  }
  next();
});

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Content Management
router.post(
  "/content",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ]),
  createContent
);
router.get("/content", getMyContent);
router.put("/content/:id", updateContent);
router.patch("/content/:id/publish", publishContent);
router.delete("/content/:id", deleteContent);

// Student Attempts & Grading
router.get("/attempts", getStudentAttempts);
router.post("/attempts/:attemptId/grade", gradeSubmission);

// Analytics & Reports
router.get("/analytics", getPerformanceAnalytics);
router.get("/reports/student/:studentId", getStudentReport);

// Profile
router.put("/profile", updateLecturerProfile);

export default router;