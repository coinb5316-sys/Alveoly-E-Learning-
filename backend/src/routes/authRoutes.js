// routes/authRoutes.js
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
  assignPlanAfterPayment,
  adminApproveUser,
  sendPlanExpiryNotification,
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= REGISTRATION FLOW =================
router.post("/register/alveoly", registerAlveolyStudent);
router.post("/register/non-alveoly", registerNonAlveolyStudent);
router.get("/verify-approval/:token", verifyApprovalToken);
router.post("/complete-registration", protect, completeRegistration);

// ================= PLAN MANAGEMENT =================
router.post("/assign-plan", protect, adminOnly, assignPlanToUser);
router.post("/assign-plan-after-payment", protect, assignPlanAfterPayment);

// ================= USER APPROVAL =================
router.patch("/admin/approve/:userId", protect, adminOnly, adminApproveUser);

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

// ================= LECTURER MANAGEMENT =================
router.post("/register-lecturer", protect, adminOnly, registerLecturer);

// ================= PLAN EXPIRY NOTIFICATION =================
router.post("/plan-expiry/:userId", protect, adminOnly, sendPlanExpiryNotification);

export default router;