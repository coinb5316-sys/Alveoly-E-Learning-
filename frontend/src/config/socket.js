// src/config/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://alveoly-platform.onrender.com";

let socket = null;
let reconnectAttempts = 0;

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
    reconnectAttempts = 0;
  });

  socket.on("connect_error", (error) => {
    reconnectAttempts++;
    console.error(`❌ Socket.IO error (attempt ${reconnectAttempts}):`, error.message);
    
    // Only log, don't alert
    if (reconnectAttempts === 5) {
      console.warn("⚠️ Still having connection issues. Check your network.");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.IO disconnected:", reason);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("Socket.IO reconnected after", attemptNumber, "attempts");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export default initializeSocket;