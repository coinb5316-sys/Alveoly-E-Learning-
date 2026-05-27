// routes/userRoutes.js - UPDATED
import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  updateUser,
  getUserStats,
} from "../controllers/userController.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", protect, adminOnly, getAllUsers);
router.get("/stats", protect, adminOnly, getUserStats);  // ADD THIS
router.get("/:id", protect, adminOnly, getUserById);     // ADD THIS
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);
router.put("/:id", protect, adminOnly, updateUser);

// Get all students (accessible by lecturers and admins)
router.get("/students", protect, async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = { role: "student" };
    
    if (courseId && courseId !== "undefined" && courseId !== "null") {
      filter.courseId = courseId;
    }
    
    const students = await User.find(filter)
      .select("name email courseId _id createdAt lastLoginAt isActive")
      .populate("courseId", "name");
    
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all students with full details (program, course, subjects)
router.get("/students/full", protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        model: 'Subject',
        select: 'name',
        populate: {
          path: 'courseId',
          model: 'Course',
          select: 'name'
        }
      });
    
    const formattedStudents = students.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      programId: student.programId,
      courseId: student.courseId,
      programName: student.programId?.name || "Not assigned",
      courseName: student.courseId?.name || "Not assigned",
      assignedSubjects: student.lecturerInfo?.assignedSubjects || [],
      createdAt: student.createdAt,
      lastLoginAt: student.lastLoginAt,
      isActive: student.isActive
    }));
    
    res.json(formattedStudents);
  } catch (err) {
    console.error("Error fetching full student details:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;