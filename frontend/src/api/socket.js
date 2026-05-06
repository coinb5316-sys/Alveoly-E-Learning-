// frontend/src/api/socket.js
import { io } from "socket.io-client";

// Use dedicated socket URL if available, fallback to API URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Rest of your code remains the same...

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