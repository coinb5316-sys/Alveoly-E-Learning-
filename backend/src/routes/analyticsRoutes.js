// routes/analyticsRoutes.js
import express from "express";
import { getDashboardStats, getDetailedAnalytics } from "../controllers/analyticsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/detailed", protect, adminOnly, getDetailedAnalytics);

export default router;