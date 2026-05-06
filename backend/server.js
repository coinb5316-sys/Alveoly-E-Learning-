// server.js - Complete Socket.IO configuration with notifications
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

// ================= INIT =================
connectDB();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ================= HTTP SERVER =================
const httpServer = createServer(app);

// ================= SOCKET.IO =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://alveolyapexprep.academy",
  "https://www.alveolye-learning.academy",
  "https://alveoly-e-learning-of-health-api.onrender.com", 
  CLIENT_URL,
].filter(Boolean);

console.log("Socket.IO allowed origins:", allowedOrigins);

export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ Socket.IO blocked origin: ${origin}`);
        // Still allow for development
        callback(null, true);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowUpgrades: true,
  perMessageDeflate: false,
  httpCompression: false,
});

// ================= SOCKET.IO CONNECTION HANDLER =================
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  console.log("📡 Transport:", socket.conn.transport.name);

  // Handle upgrade to websocket
  socket.on("upgrade", () => {
    console.log("⬆️ Transport upgraded to websocket");
  });

  // ================= USER ROOM JOINING =================
  socket.on("join:user", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`👤 User ${userId} joined room: ${userId}`);
    socket.emit("joined:user", { userId, success: true });
  });

  socket.on("join:admin", () => {
    socket.join("admin");
    console.log("🛠️ Admin joined admin room");
    socket.emit("joined:admin", { success: true });
  });

  // ================= NOTIFICATION ROOMS =================
  socket.on("join:notifications", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`📢 User ${userId} joined notification room`);
      socket.emit("joined:notifications", { success: true });
    }
  });

  socket.on("join:admin_notifications", () => {
    socket.join("admin_notifications");
    console.log("📢 Admin joined admin notification room");
    socket.emit("joined:admin_notifications", { success: true });
  });

  // ================= AI CHAT BOT =================
  socket.on("user_question", (data) => {
    console.log(`💬 Question from ${data.userName}: ${data.text}`);
    socket.emit("bot_typing");
    
    setTimeout(() => {
      socket.emit("bot_reply", {
        text: `Thank you for your question: "${data.text}". Our team will get back to you soon!`,
        timestamp: new Date(),
      });
    }, 1000);
  });

  // ================= DISCONNECT HANDLING =================
  socket.on("disconnect", (reason) => {
    console.log(`🔴 Client disconnected (${socket.id}):`, reason);
  });

  socket.on("error", (err) => {
    console.error("❌ Socket error:", err.message);
  });
  
  socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
  });
});

// ================= HELPER FUNCTION TO EMIT NOTIFICATIONS =================
export const emitNotification = (userId, notification) => {
  // Emit to specific user's room
  io.to(userId.toString()).emit("new_notification", notification);
  io.to(`user_${userId}`).emit("new_notification", notification);
};

export const emitAdminNotification = (notification) => {
  // Emit to admin room
  io.to("admin").emit("new_admin_notification", notification);
  io.to("admin_notifications").emit("new_admin_notification", notification);
};

export const emitToRoom = (room, event, data) => {
  io.to(room).emit(event, data);
};

export const emitToAll = (event, data) => {
  io.emit(event, data);
};

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "API is running 🚀",
    socket: "Socket.IO server is ready"
  });
});

// ================= SOCKET STATUS ENDPOINT =================
app.get("/socket-status", (req, res) => {
  const rooms = {};
  const roomMap = io.sockets.adapter.rooms;
  
  for (const [room, set] of roomMap.entries()) {
    if (!rooms[room]) {
      rooms[room] = set.size;
    }
  }
  
  res.json({
    status: "healthy",
    connections: io.engine.clientsCount,
    transports: ["polling", "websocket"],
    rooms: rooms,
    allowedOrigins: allowedOrigins,
  });
});

// ================= CONNECTION STATS ENDPOINT =================
app.get("/socket-stats", (req, res) => {
  const connectedSockets = [];
  const socketMap = io.sockets.sockets;
  
  for (const [id, socket] of socketMap) {
    connectedSockets.push({
      id: id,
      rooms: Array.from(socket.rooms),
      connected: socket.connected
    });
  }
  
  res.json({
    totalConnections: io.engine.clientsCount,
    socketCount: connectedSockets.length,
    sockets: connectedSockets.slice(0, 50), // Limit to 50 for performance
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ================= START SERVER =================
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`✅ Transports: polling, websocket`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
  console.log(`\n📢 Notification rooms ready:`);
  console.log(`   - User rooms: user_{userId}`);
  console.log(`   - Admin rooms: admin, admin_notifications`);
  console.log(`\n🌐 API endpoints:`);
  console.log(`   - GET  /                Health check`);
  console.log(`   - GET  /socket-status   Socket.IO status`);
  console.log(`   - GET  /socket-stats    Detailed connection stats`);
});