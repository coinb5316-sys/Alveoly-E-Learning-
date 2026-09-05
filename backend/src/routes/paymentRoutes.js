// routes/paymentRoutes.js
import express from "express";
import {
  initiatePayment,
  initiatePlanPayment,
  verifyPayment,
  getMyPayments,
  getAllPayments,
  deletePayment,
  getPaymentByReference,
  getPublicPlans
} from "../controllers/paymentController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.get("/plans/public", getPublicPlans);

// ================= PROTECTED ROUTES =================
router.get("/mine", protect, getMyPayments);

// ================= PLAN PAYMENT =================
router.post("/initiate-plan", protect, initiatePlanPayment);

// ================= SUBJECT PAYMENT =================
router.post("/initiate", protect, initiatePayment);

// ================= VERIFY PAYMENT =================
router.get("/verify", verifyPayment);

// ================= ADMIN ROUTES =================
router.get("/all", protect, adminOnly, getAllPayments);
router.delete("/:id", protect, adminOnly, deletePayment);

// ================= GET BY REFERENCE =================
router.get("/reference/:reference", protect, getPaymentByReference);

export default router;