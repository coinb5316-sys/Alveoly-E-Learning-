// routes/userRoutes.js - UPDATED to allow lecturers
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
router.get("/stats", protect, adminOnly, getUserStats);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);
router.put("/:id", protect, adminOnly, updateUser);

// ================= STUDENTS ROUTE - ALLOW LECTURERS AND ADMINS =================

// Add to userRoutes.js
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("programId", "name code")
      .populate("courseId", "name");
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
// IMPORTANT: Remove adminOnly to allow lecturers
router.get("/students", protect, async (req, res) => {
  try {
    const { courseId } = req.query;
    
    // Build filter for students only
    const filter = { role: "student" };
    
    // If courseId is provided, filter by that course
    if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
      filter.courseId = courseId;
    } else {
      // If no courseId provided, check if user is lecturer and get their assigned courses
      if (req.user.role === "lecturer") {
        const user = await User.findById(req.user._id);
        const assignedCourseIds = user?.lecturerInfo?.assignedCourses || [];
        if (assignedCourseIds.length > 0) {
          filter.courseId = { $in: assignedCourseIds };
        }
      }
    }
    
    console.log("Fetching students with filter:", filter);
    
    const students = await User.find(filter)
      .select("name email courseId _id createdAt lastLoginAt isActive")
      .populate("courseId", "name");
    
    console.log(`Found ${students.length} students`);
    
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add this route after the existing /students route
router.get("/students/by-course/:courseId", protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const filter = { 
      role: "student",
      courseId: courseId,
      _id: { $ne: req.user._id }
    };
    
    console.log("Fetching students by course:", courseId);
    
    const students = await User.find(filter)
      .select("name email courseId _id")
      .populate("courseId", "name");
    
    console.log(`Found ${students.length} students in course ${courseId}`);
    
    res.json(students);
  } catch (err) {
    console.error("Error fetching students by course:", err);
    res.status(500).json({ message: err.message });
  }
});

// routes/userRoutes.js - Add this new endpoint
router.get("/students/by-program/:programId", protect, async (req, res) => {
  try {
    const { programId } = req.params;
    
    const filter = { 
      role: "student",
      programId: programId,
      _id: { $ne: req.user._id }
    };
    
    console.log("Fetching students by program:", programId);
    
    const students = await User.find(filter)
      .select("name email programId courseId _id")
      .populate("programId", "name")
      .populate("courseId", "name");
    
    console.log(`Found ${students.length} students in program ${programId}`);
    
    res.json(students);
  } catch (err) {
    console.error("Error fetching students by program:", err);
    res.status(500).json({ message: err.message });
  }
});

// Also update the main /students endpoint to use program
router.get("/students", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // If user has programId, filter by that program
    if (currentUser.programId) {
      const filter = { 
        role: "student",
        programId: currentUser.programId,
        _id: { $ne: req.user._id }
      };
      
      console.log("Fetching students by program:", currentUser.programId);
      
      const students = await User.find(filter)
        .select("name email programId courseId _id")
        .populate("programId", "name")
        .populate("courseId", "name");
      
      console.log(`Found ${students.length} students in program`);
      return res.json(students);
    }
    
    // Fallback to course-based filtering
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
    
    // No program or course assigned
    console.log("User has no program or course assigned");
    res.json([]);
    
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all students with full details (ADMIN ONLY - keep this restricted)
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