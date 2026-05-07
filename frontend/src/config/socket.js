// src/config/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://alveoly-e-learning-of-health-api.onrender.com";

let socket = null;

// Create and initialize the socket instance
export const initializeSocket = () => {
  if (socket && socket.connected) {
    console.log("Socket already connected");
    return socket;
  }

  console.log("Initializing Socket.IO connection to:", SOCKET_URL);
  
  socket = io(SOCKET_URL, {
    transports: ["polling", "websocket"],
    withCredentials: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 30000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket.IO connected! ID:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket.IO error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.IO disconnected:", reason);
  });

  return socket;
};

// ✅ IMPORTANT: Create and export a socket instance that has connect() method
const socketInstance = initializeSocket();
export default socketInstance;