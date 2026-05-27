import express from "express";
import {
  getCourses,
  getCoursesByProgram,
  getPublicCoursesByProgram,  // ADD THIS
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= PUBLIC ROUTES (No authentication required) =================
router.get("/public/program/:programId", getPublicCoursesByProgram);  // NEW: Public endpoint for signup page

// ================= PROTECTED ROUTES (require login) =================
router.get("/", protect, getCourses);
router.get("/program/:programId", protect, getCoursesByProgram);
router.post("/", protect, adminOnly, createCourse);
router.put("/:id", protect, adminOnly, updateCourse);
router.delete("/:id", protect, adminOnly, deleteCourse);

export default router;