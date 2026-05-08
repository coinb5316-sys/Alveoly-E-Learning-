import express from "express";
import {
  register,
  login,
  assignCourse,
  getMyInfo,
  resetPassword,
  forgotPassword,
  googleLogin,
  registerLecturer,
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// EMAIL AUTH
router.post("/register", register);
// In authRoutes.js
router.post("/register-lecturer", protect, adminOnly, registerLecturer);
router.post("/login", login);
router.put("/me/course", protect, assignCourse);
router.get("/me", protect, getMyInfo);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// GOOGLE LOGIN (frontend sends idToken)
router.post("/google-login", googleLogin);

export default router;