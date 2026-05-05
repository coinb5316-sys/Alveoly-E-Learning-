// routes/notificationRoutes.js - Updated
import express from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationCount,
  getNotificationStats,
  sendTestNotification
} from "../controllers/notificationController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.get("/", protect, getUserNotifications);
router.get("/count", protect, getNotificationCount);
router.post("/mark-all-read", protect, markAllAsRead);
router.delete("/", protect, deleteAllNotifications);
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

// Admin only routes
router.get("/stats", protect, adminOnly, getNotificationStats);
router.post("/test", protect, adminOnly, sendTestNotification);

export default router;