// server.js - Complete Socket.IO configuration with notifications
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

dotenv.config();

// ================= INIT =================
connectDB();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ================= HTTP SERVER =================
const httpServer = createServer(app);

// ================= SOCKET.IO =================
// server.js - Update the allowedOrigins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://alveolye-learning.academy",
  "https://www.alveolye-learning.academy",
  "https://alveoly-platform.onrender.com",
  "https://alveoly-platform-1.onrender.com",
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

    // ================= SMART CHAT BOT WITH FAQ DATABASE =================
  let userSession = null;
  const FAQ = mongoose.model("FAQ");
  
  socket.on("bot:identify", (data) => {
    userSession = { userId: data.userId, userName: data.userName, role: data.role || "user", connectedAt: new Date() };
    console.log(`🤖 Bot identified: ${data.userName}`);
    socket.emit("bot:ready", { message: "Bot ready!" });
  });
  
  socket.on("bot:question", async (data) => {
    const { text, userName } = data;
    const questionText = text?.trim();
    if (!questionText) {
      socket.emit("bot:reply", { text: "Please enter a question.", isAuto: true, timestamp: new Date() });
      return;
    }
    console.log(`🤖 Question: "${questionText.substring(0, 100)}"`);
    socket.emit("bot:typing", { isTyping: true });
    
    try {
      const searchTerm = questionText.toLowerCase().trim();
      const keywords = searchTerm.split(/\s+/).filter(w => w.length > 2);
      const faqs = await FAQ.find({
        isActive: true,
        $or: [
          { question: { $regex: searchTerm, $options: 'i' } },
          { answer: { $regex: searchTerm, $options: 'i' } },
          { keywords: { $in: keywords } }
        ]
      }).limit(2);
      
      let reply;
      if (faqs && faqs.length > 0) {
        const bestMatch = faqs[0];
        reply = `📚 **Answer:**\n\n${bestMatch.answer}`;
        bestMatch.views += 1;
        await bestMatch.save();
      } else {
        const lowerText = questionText.toLowerCase();
        if (lowerText.includes("hello") || lowerText.includes("hi")) {
          reply = "👋 Hello! Welcome to Alveoly! How can I help you today?";
        } else if (lowerText.includes("course") || lowerText.includes("program")) {
          reply = "🎓 We offer Nursing, Public Health, Pharmacy, and more. Which interests you?";
        } else if (lowerText.includes("admission") || lowerText.includes("apply")) {
          reply = "📝 Apply online through our website! Need step-by-step guidance?";
        } else if (lowerText.includes("fee") || lowerText.includes("cost")) {
          reply = "💰 Certificates from $500, Diplomas from $1,500, Degrees from $3,000/year.";
        } else if (lowerText.includes("contact") || lowerText.includes("support")) {
          reply = "📞 Email: support@alveoly.com | Phone: +233 (0) 54 489 1862";
        } else if (lowerText.includes("thank")) {
          reply = "🌟 You're welcome! Anything else I can help with?";
        } else if (lowerText.includes("bye")) {
          reply = "👋 Goodbye! Have a great day!";
        } else {
          if (!global.pendingQuestions) global.pendingQuestions = [];
          global.pendingQuestions.push({
            id: Date.now(), text: questionText, userName: userName || "Anonymous",
            socketId: socket.id, timestamp: new Date(), status: "pending"
          });
          io.to("admin").emit("admin:unanswered", global.pendingQuestions[global.pendingQuestions.length - 1]);
          reply = "📝 Thanks! I've notified our team. They'll respond shortly.";
        }
      }
      setTimeout(() => {
        socket.emit("bot:reply", { text: reply, isAuto: true, timestamp: new Date() });
        socket.emit("bot:typing", { isTyping: false });
      }, 500);
    } catch (error) {
      console.error("Bot error:", error);
      socket.emit("bot:reply", { text: "Having trouble. Please contact support.", error: true, timestamp: new Date() });
      socket.emit("bot:typing", { isTyping: false });
    }
  });
  
  socket.on("bot:admin-reply", (data) => {
    const { toSocketId, answer, questionId } = data;
    console.log(`📨 Admin replying to: ${toSocketId}`);
    if (global.pendingQuestions) {
      const idx = global.pendingQuestions.findIndex(q => q.id === questionId);
      if (idx !== -1) {
        global.pendingQuestions[idx].status = "answered";
        global.pendingQuestions[idx].answer = answer;
        io.to("admin").emit("bot:question-answered", global.pendingQuestions[idx]);
      }
    }
    io.to(toSocketId).emit("bot:admin-reply", { text: answer, isAdmin: true, timestamp: new Date() });
  });
  
  socket.on("bot:get-pending", () => {
    if (global.pendingQuestions?.length) {
      socket.emit("bot:pending-questions", global.pendingQuestions.filter(q => q.status === "pending"));
    }
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