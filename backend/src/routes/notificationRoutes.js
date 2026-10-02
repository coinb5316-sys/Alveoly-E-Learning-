// routes/notificationRoutes.js
import express from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationCount,
  getNotificationStats,
  sendTestNotification,
  createNotification
} from "../controllers/notificationController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= PROTECTED ROUTES =================
router.get("/", protect, getUserNotifications);
router.get("/count", protect, getNotificationCount);
router.patch("/:id/read", protect, markAsRead);
router.post("/mark-all-read", protect, markAllAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/", protect, deleteAllNotifications);

// ================= ADMIN ROUTES =================
router.get("/stats", protect, adminOnly, getNotificationStats);
router.post("/test", protect, adminOnly, sendTestNotification);
router.post("/create", protect, adminOnly, async (req, res) => {
  try {
    const { userId, userRole, type, title, message, link, metadata } = req.body;
    const notification = await createNotification(
      userId,
      userRole,
      type,
      title,
      message,
      link,
      metadata
    );
    res.json({ success: true, notification });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;