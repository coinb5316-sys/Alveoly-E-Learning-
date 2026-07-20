// routes/subjectRoutes.js
import express from "express";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectById,
  getSubjectsPublic,
  addTopic,
  removeTopic,
  updateTopic,
} from "../controllers/subjectController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { requireSubjectAccess } from "../middleware/accessMiddleware.js";

const router = express.Router();

/**
 * ================= ALL AUTHENTICATED USERS (including lecturers) =================
 */
router.get("/", protect, getSubjects);
router.get("/public", getSubjectsPublic);
router.get("/:subjectId", protect, requireSubjectAccess, getSubjectById);

/**
 * ================= ADMIN ACCESS =================
 */
router.post("/", protect, adminOnly, createSubject);
router.put("/:id", protect, adminOnly, updateSubject);
router.delete("/:id", protect, adminOnly, deleteSubject);

/**
 * ================= TOPIC MANAGEMENT (Admin Only) =================
 */
router.post("/:subjectId/topics", protect, adminOnly, addTopic);
router.delete("/:subjectId/topics/:topicId", protect, adminOnly, removeTopic);
router.put("/:subjectId/topics/:topicId", protect, adminOnly, updateTopic);

export default router;