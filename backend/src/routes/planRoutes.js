// routes/planRoutes.js
import express from "express";
import {
  getPlans,
  getPublicPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} from "../controllers/planController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/public", getPublicPlans);

// Protected routes
router.get("/", protect, getPlans);
router.get("/:id", protect, getPlanById);

// Admin only
router.post("/", protect, adminOnly, createPlan);
router.put("/:id", protect, adminOnly, updatePlan);
router.delete("/:id", protect, adminOnly, deletePlan);

export default router;