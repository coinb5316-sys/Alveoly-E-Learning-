// routes/userRoutes.js - Add approve endpoint
import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  updateUser,
  getUserStats,
  approveUser, // Add this
} from "../controllers/userController.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", protect, adminOnly, getAllUsers);
router.get("/stats", protect, adminOnly, getUserStats);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);
router.put("/:id", protect, adminOnly, updateUser);
router.patch("/:id/approve", protect, adminOnly, approveUser); // Add this

// ================= STUDENTS ROUTE - ALLOW LECTURERS AND ADMINS =================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("programId", "name code")
      .populate("courseId", "name")
      .populate("planId", "title duration price durationUnit");
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/students", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (currentUser.programId) {
      const filter = { 
        role: "student",
        programId: currentUser.programId,
        _id: { $ne: req.user._id }
      };
      
      const students = await User.find(filter)
        .select("name email programId courseId _id")
        .populate("programId", "name")
        .populate("courseId", "name");
      
      return res.json(students);
    }
    
    if (currentUser.courseId) {
      const filter = { 
        role: "student",
        courseId: currentUser.courseId,
        _id: { $ne: req.user._id }
      };
      
      const students = await User.find(filter)
        .select("name email courseId _id")
        .populate("courseId", "name");
      
      return res.json(students);
    }
    
    console.log("User has no program or course assigned");
    res.json([]);
    
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all students with full details (ADMIN ONLY)
router.get("/students/full", protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate("planId", "title duration price durationUnit")
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
      planName: student.planId?.title || "No Plan",
      planId: student.planId?._id || null,
      isPlanActive: student.isPlanActive || false,
      planExpiryDate: student.planExpiryDate,
      assignedSubjects: student.lecturerInfo?.assignedSubjects || [],
      createdAt: student.createdAt,
      lastLoginAt: student.lastLoginAt,
      isActive: student.isActive,
      userType: student.userType,
      isApproved: student.isApproved,
      registrationCompleted: student.registrationCompleted
    }));
    
    res.json(formattedStudents);
  } catch (err) {
    console.error("Error fetching full student details:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;