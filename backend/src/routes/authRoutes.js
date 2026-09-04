// routes/authRoutes.js - Updated with registration flow
import express from "express";
import {
  registerAlveolyStudent,
  registerNonAlveolyStudent,
  verifyApprovalToken,
  completeRegistration,
  login,
  assignCourse,
  assignProgram,
  getMyInfo,
  resetPassword,
  forgotPassword,
  googleLogin,
  registerLecturer,
  updateActivity,
  assignPlanToUser,
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= REGISTRATION FLOW =================
router.post("/register/alveoly", registerAlveolyStudent);
router.post("/register/non-alveoly", registerNonAlveolyStudent);
router.get("/verify-approval/:token", verifyApprovalToken);
router.post("/complete-registration", protect, completeRegistration);

// ================= EMAIL AUTH =================
router.post("/login", login);

// ================= GOOGLE LOGIN =================
router.post("/google-login", googleLogin);

// ================= USER MANAGEMENT =================
router.get("/me", protect, getMyInfo);
router.put("/me/course", protect, assignCourse);
router.put("/me/program", protect, assignProgram);
router.put("/me/activity", protect, updateActivity);

// ================= PASSWORD RESET =================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ================= LECTURER MANAGEMENT (Admin only) =================
router.post("/register-lecturer", protect, adminOnly, registerLecturer);

// ================= PLAN ASSIGNMENT (Admin only) =================
router.post("/assign-plan", protect, adminOnly, assignPlanToUser);

// ================= DEBUG ENDPOINTS =================
router.get("/debug-subjects", protect, adminOnly, async (req, res) => {
  try {
    const Subject = (await import("../models/Subject.js")).default;
    const subjects = await Subject.find()
      .populate("programId", "name")
      .populate("courseId", "name");
    
    res.json({
      count: subjects.length,
      subjects: subjects.map(s => ({
        _id: s._id,
        name: s.name,
        courseId: s.courseId,
        courseName: s.courseId?.name,
        programId: s.programId,
        programName: s.programId?.name
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;