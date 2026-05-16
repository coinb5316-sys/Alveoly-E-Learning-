// routes/questionRoutes.js
import express from "express";
import {
  getQuestions,
  createQuestion,
  createMultipleQuestions,
  deleteQuestion,
  updateQuestion,
  getMyLecturerQuestions,
  createLecturerQuestionsBulk,
  deleteLecturerQuestion,
  approveQuestion,
  rejectQuestion,
  getPendingQuestions,
  getPendingQuestionsWithStats, // Add this
} from "../controllers/questionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public/Admin routes
router.get("/", protect, getQuestions);
router.post("/", protect, adminOnly, createQuestion);
router.post("/bulk", protect, adminOnly, createMultipleQuestions);
router.put("/:id", protect, adminOnly, updateQuestion);
router.delete("/:id", protect, adminOnly, deleteQuestion);

// Admin approval routes
router.get("/pending", protect, adminOnly, getPendingQuestions);
router.get("/pending-with-stats", protect, adminOnly, getPendingQuestionsWithStats); // NEW ROUTE
router.post("/:id/approve", protect, adminOnly, approveQuestion);
router.post("/:id/reject", protect, adminOnly, rejectQuestion);

// Lecturer specific routes
router.get("/lecturer/my", protect, getMyLecturerQuestions);
router.post("/lecturer/bulk", protect, createLecturerQuestionsBulk);
router.put("/lecturer/:id", protect, updateQuestion); // Add update for lecturer
router.delete("/lecturer/:id", protect, deleteLecturerQuestion);

export default router;