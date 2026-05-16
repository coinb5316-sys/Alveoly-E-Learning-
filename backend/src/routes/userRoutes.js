// routes/userRoutes.js - UPDATED
import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";
import User from "../models/User.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);
router.put("/:id", protect, adminOnly, updateUser);

// Get all students (accessible by lecturers and admins)
router.get("/students", protect, async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = { role: "student" };
    
    // Filter by course if provided
    if (courseId && courseId !== "undefined" && courseId !== "null") {
      filter.courseId = courseId;
    }
    
    // Include createdAt and lastLoginAt in the selection
    const students = await User.find(filter)
      .select("name email courseId _id createdAt lastLoginAt isActive")
      .populate("courseId", "name");
    
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;