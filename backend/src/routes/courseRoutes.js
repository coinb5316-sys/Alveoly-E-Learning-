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

// Add this to your courseRoutes.js
router.get("/public", getPublicCourses);

// Also add this controller function in courseController.js:
export const getPublicCourses = async (req, res) => {
  try {
    // Only return essential fields for public view
    const courses = await Course.find()
      .populate("programId", "name code")
      .select("name programId")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("Get Public Courses Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default router;