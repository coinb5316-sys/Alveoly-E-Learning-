// frontend/src/api/socket.js - Update with notification join
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(SERVER_URL, {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

socket.on("connect", () => {
  console.log("🟢 Connected:", socket.id);
  
  // Join notification room based on user role
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user._id) {
    socket.emit("join:notifications", user._id);
    if (user.role === "admin") {
      socket.emit("join:admin_notifications");
    }
  }
});

// Listen for new notifications
socket.on("new_notification", (notification) => {
  console.log("🔔 New notification:", notification);
  // You can show a toast notification here
  if (window.toast) {
    window.toast.success(notification.title);
  }
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket error:", err.message);
});

export default socket;