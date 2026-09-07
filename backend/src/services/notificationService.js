// src/services/notificationService.js
import { io } from "../../server.js";

export const emitAdminNotification = (notification) => {
  if (io) {
    io.to("admin").emit("new_admin_notification", notification);
    io.to("admin_notifications").emit("new_admin_notification", notification);
  } else {
    console.log("📢 Admin Notification (no socket):", notification);
  }
};

export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit("new_notification", notification);
    io.to(`user_${userId}`).emit("new_notification", notification);
  }
};

export const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};