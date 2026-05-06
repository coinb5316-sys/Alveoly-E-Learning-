import { io } from "socket.io-client";

const SOCKET_URL = "https://alveoly-e-learning-of-health-api.onrender.com";

let socket = null;

export const initializeSocket = () => {
  if (socket && socket.connected) {
    console.log("Socket already connected");
    return socket;
  }

  console.log("Initializing Socket.IO connection to:", SOCKET_URL);
  
  socket = io(SOCKET_URL, {
    transports: ["polling", "websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket.IO connected! ID:", socket.id);
    console.log("Transport:", socket.io.engine.transport.name);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket.IO connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.IO disconnected:", reason);
    if (reason === "io server disconnect") {
      socket.connect();
    }
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

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected manually");
  }
};

export default initializeSocket;