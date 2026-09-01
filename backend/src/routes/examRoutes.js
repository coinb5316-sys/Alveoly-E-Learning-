// routes/examRoutes.js - Updated with results routes
import express from "express";
import {
  startExam,
  saveProgress,
  submitExam,
  getStudentExamResults,
  getExamAttemptDetails,
} from "../controllers/examController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// STUDENT ROUTES
router.post("/start", protect, startExam);
router.post("/save-progress", protect, saveProgress);
router.post("/submit", protect, submitExam);

// ================= GET RESULTS =================
router.get("/results", protect, getStudentExamResults);
router.get("/results/:attemptId", protect, getExamAttemptDetails);

export default router;