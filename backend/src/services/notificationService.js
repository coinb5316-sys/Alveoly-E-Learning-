// src/services/notificationService.js - COMPLETE FIXED
// No direct import from server.js to avoid circular dependency

// Use a global variable or a singleton pattern
let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
  console.log("✅ Notification service initialized with Socket.IO");
};

export const emitAdminNotification = (notification) => {
  try {
    if (ioInstance) {
      ioInstance.to("admin").emit("new_admin_notification", notification);
      ioInstance.to("admin_notifications").emit("new_admin_notification", notification);
      console.log("📢 Admin Notification sent:", notification.message);
    } else {
      console.log("📢 Admin Notification (no socket):", notification);
    }
  } catch (error) {
    console.error("❌ Error emitting admin notification:", error);
  }
};

export const emitNotification = (userId, notification) => {
  try {
    if (ioInstance) {
      ioInstance.to(userId.toString()).emit("new_notification", notification);
      ioInstance.to(`user_${userId}`).emit("new_notification", notification);
      console.log("📢 User Notification sent:", notification.message);
    } else {
      console.log("📢 User Notification (no socket):", notification);
    }
  } catch (error) {
    console.error("❌ Error emitting user notification:", error);
  }
};

export const emitToRoom = (room, event, data) => {
  try {
    if (ioInstance) {
      ioInstance.to(room).emit(event, data);
    }
  } catch (error) {
    console.error(`❌ Error emitting to room ${room}:`, error);
  }
};

export const emitToAll = (event, data) => {
  try {
    if (ioInstance) {
      ioInstance.emit(event, data);
    }
  } catch (error) {
    console.error(`❌ Error emitting to all:`, error);
  }
};