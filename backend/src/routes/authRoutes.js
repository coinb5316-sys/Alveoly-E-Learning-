// routes/authRoutes.js - Updated with Program support
import express from "express";
import {
  register,
  login,
  assignCourse,
  assignProgram,
  getMyInfo,
  resetPassword,
  forgotPassword,
  googleLogin,
  registerLecturer,
  updateActivity,
  debugSubjects,
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= EMAIL AUTH =================
router.post("/register", register);
router.post("/login", login);

// ================= GOOGLE LOGIN (frontend sends idToken) =================
router.post("/google-login", googleLogin);

// ================= USER MANAGEMENT =================
router.get("/me", protect, getMyInfo);
router.put("/me/course", protect, assignCourse);
router.put("/me/program", protect, assignProgram);  // NEW: Assign program to user
router.put("/me/activity", protect, updateActivity);

// ================= PASSWORD RESET =================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ================= LECTURER MANAGEMENT (Admin only) =================
router.post("/register-lecturer", protect, adminOnly, registerLecturer);

// Debug endpoint (remove in production)
router.get("/debug-subjects", protect, adminOnly, debugSubjects);

export default router;