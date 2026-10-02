// routes/aiSubscriptionRoutes.js - COMPLETE UPDATED VERSION
import express from "express";
import {
  createSubscription,
  verifySubscription,
  getSubscription,
} from "../controllers/aiSubscriptionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ VERIFY PAYMENT (called from frontend after Paystack redirect)
router.get("/verify", protect, verifySubscription);

// ✅ INIT PAYMENT (create subscription / get Paystack auth URL)
router.post("/", protect, createSubscription);

// ✅ GET CURRENT SUBSCRIPTION
router.get("/", protect, getSubscription);

export default router;