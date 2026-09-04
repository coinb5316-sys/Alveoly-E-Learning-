// server.js - COMPLETE WITH VIDEO CONFERENCE SUPPORT AND SENDGRID
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import FAQ from "./src/models/FAQ.js";
import cron from "node-cron";
import { checkExpiredPlans, checkApproachingExpiry } from "./utils/planScheduler.js";
import sgMail from "@sendgrid/mail";

dotenv.config();

// ================= INIT =================
connectDB();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ================= SENDGRID INIT =================
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("✅ SendGrid initialized");
} else {
  console.warn("⚠️ SendGrid API key not configured. Email features disabled.");
}

// ================= HTTP SERVER =================
const httpServer = createServer(app);

// ================= SOCKET.IO =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://alveolye-learning.academy",
  "https://www.alveolye-learning.academy",
  "https://alveoly-platform.onrender.com",
  "https://alveoly-platform-1.onrender.com",
  "https://alveoly-platform-zp2p.onrender.com",
  "https://alveoly-platform-sunu.onrender.com",
  "https://alveoly-e-learning-755w.onrender.com",
  "https://alveoly-e-learning.pages.dev",
  CLIENT_URL,
].filter(Boolean);

console.log("Socket.IO allowed origins:", allowedOrigins);

export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ Socket.IO blocked origin: ${origin}`);
        callback(null, true);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowUpgrades: true,
  perMessageDeflate: false,
  httpCompression: false,
});

// Store active rooms and participants
const rooms = new Map();

// ================= SOCKET.IO CONNECTION HANDLER =================
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  console.log("📡 Transport:", socket.conn.transport.name);

  socket.on("upgrade", () => {
    console.log("⬆️ Transport upgraded to websocket");
  });

  // ================= VIDEO CONFERENCE EVENTS =================
  
  socket.on("join-call", (data) => {
    const { classId, userId, userName, role, audioEnabled = true, videoEnabled = true } = data;
    
    if (!classId || !userId) {
      console.error("Missing classId or userId in join-call");
      return;
    }
    
    console.log(`🎥 User ${userName} (${userId}) joining room ${classId}`);
    
    socket.userId = userId;
    socket.userName = userName;
    socket.classId = classId;
    socket.role = role;
    
    socket.join(classId);
    
    if (!rooms.has(classId)) {
      rooms.set(classId, new Map());
    }
    
    const room = rooms.get(classId);
    const participantInfo = {
      socketId: socket.id,
      userName,
      role,
      audioEnabled,
      videoEnabled,
      joinedAt: new Date()
    };
    
    room.set(userId, participantInfo);
    
    console.log(`📊 Room ${classId} now has ${room.size} participants`);
    
    const existingParticipants = [];
    for (const [existingUserId, info] of room.entries()) {
      if (existingUserId !== userId) {
        existingParticipants.push({
          userId: existingUserId,
          userName: info.userName,
          role: info.role,
          audioEnabled: info.audioEnabled,
          videoEnabled: info.videoEnabled
        });
      }
    }
    
    console.log(`📨 Sending ${existingParticipants.length} existing participants to ${userName}`);
    
    socket.emit("existing-participants", existingParticipants);
    socket.emit("join-confirmed", { classId, userId });
    
    setTimeout(() => {
      socket.to(classId).emit("user-joined", {
        userId,
        userName,
        role,
        audioEnabled,
        videoEnabled
      });
    }, 200);
  });

  socket.on("signal", (data) => {
    const { to, signal, classId } = data;
    
    if (!classId || !to) return;
    
    const room = rooms.get(classId);
    const targetUser = room?.get(to);
    
    if (targetUser) {
      io.to(targetUser.socketId).emit("signal", {
        from: socket.userId,
        signal
      });
    } else {
      console.log(`⚠️ Target user ${to} not found in room ${classId}`);
    }
  });

  socket.on("user-speaking", (data) => {
    const { classId, userId, isSpeaking } = data;
    
    if (!classId || !userId) return;
    
    socket.to(classId).emit("user-speaking", {
      userId,
      isSpeaking
    });
  });

  socket.on("participant-updated", (data) => {
    const { classId, userId, updates } = data;
    
    if (!classId || !userId) return;
    
    const room = rooms.get(classId);
    const participant = room?.get(userId);
    
    if (participant) {
      Object.assign(participant, updates);
      socket.to(classId).emit("participant-updated", {
        userId,
        updates
      });
    }
  });

  socket.on("chat-message", (data) => {
    const { classId, message, userId, userName } = data;
    
    if (!classId || !message) return;
    
    io.to(classId).emit("new-chat-message", {
      userId,
      userName,
      message,
      timestamp: new Date()
    });
  });

  socket.on("user-leaving", (data) => {
    const { classId, userId, userName, isLecturer } = data;
    
    console.log(`👋 User ${userName} (${userId}) leaving room ${classId}, isLecturer: ${isLecturer}`);
    
    const room = rooms.get(classId);
    if (room) {
      room.delete(userId);
      socket.to(classId).emit("user-left", { 
        userId, 
        userName,
        leftAt: new Date()
      });
      
      if (room.size === 0) {
        rooms.delete(classId);
        console.log(`🗑️ Room ${classId} deleted (empty)`);
      }
    }
    
    socket.leave(classId);
  });

  socket.on("end-class", (data) => {
    const { classId } = data;
    
    console.log(`🔚 Class ${classId} ended by lecturer`);
    
    io.to(classId).emit("class-ended", {
      message: "The class has been ended by the lecturer"
    });
    
    const room = rooms.get(classId);
    if (room) {
      room.clear();
      rooms.delete(classId);
    }
  });

  socket.on("get-room-participants", (data) => {
    const { classId } = data;
    
    const room = rooms.get(classId);
    if (!room) {
      socket.emit("room-participants", { participants: [] });
      return;
    }
    
    const participants = [];
    for (const [userId, info] of room.entries()) {
      participants.push({
        userId,
        userName: info.userName,
        role: info.role,
        audioEnabled: info.audioEnabled,
        videoEnabled: info.videoEnabled
      });
    }
    
    socket.emit("room-participants", { participants });
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
    
    console.log(`🤖 Question: "${questionText}"`);
    socket.emit("bot:typing", { isTyping: true });
    
    try {
      const searchTerm = questionText.toLowerCase().trim();
      let faq = await FAQ.findOne({
        isActive: true,
        question: { $regex: searchTerm, $options: 'i' }
      });
      
      let reply;
      let usedAI = false;
      
      if (faq) {
        console.log(`✅ Found FAQ: "${faq.question}"`);
        reply = `📚 **Answer:**\n\n${faq.answer}`;
        faq.views += 1;
        await faq.save();
      } else {
        console.log(`No FAQ found, calling AI for: "${questionText}"`);
        
        try {
          const aiModule = await import('./src/services/aiService.js');
          const askAI = aiModule.askAI;
          const isMedicalQuestion = aiModule.isMedicalQuestion;
          
          const isMedical = isMedicalQuestion(questionText);
          const aiAnswer = await askAI(questionText, isMedical);
          
          console.log(`AI Response received:`, aiAnswer ? "Yes" : "No");
          
          if (aiAnswer && aiAnswer !== null && typeof aiAnswer === 'string' && aiAnswer.length > 0) {
            const icon = isMedical ? "🩺" : "🤖";
            const prefix = isMedical ? "**Nurse AI:**" : "**AI Assistant:**";
            reply = `${icon} ${prefix}\n\n${aiAnswer}`;
            usedAI = true;
            console.log(`✅ Answered with AI`);
          } else {
            throw new Error("AI returned empty response");
          }
        } catch (aiError) {
          console.error("AI error details:", aiError.message);
          reply = "📝 I'm having trouble connecting to AI. Please try again later or contact support.";
        }
      }
      
      setTimeout(() => {
        socket.emit("bot:reply", { 
          text: reply, 
          isAuto: true, 
          isAI: usedAI,
          timestamp: new Date() 
        });
        socket.emit("bot:typing", { isTyping: false });
      }, 500);
      
    } catch (error) {
      console.error("Bot error:", error);
      socket.emit("bot:reply", { 
        text: "Having trouble. Please contact support at alveolyelearning@gmail.com", 
        error: true, 
        timestamp: new Date() 
      });
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
    
    if (socket.classId && socket.userId) {
      const room = rooms.get(socket.classId);
      if (room) {
        const participant = room.get(socket.userId);
        if (participant) {
          room.delete(socket.userId);
          console.log(`👋 User ${participant.userName} (${socket.userId}) removed from room ${socket.classId} due to disconnect`);
          
          io.to(socket.classId).emit("user-left", {
            userId: socket.userId,
            userName: participant.userName,
            leftAt: new Date(),
            disconnected: true
          });
        }
        
        if (room.size === 0) {
          rooms.delete(socket.classId);
          console.log(`🗑️ Room ${socket.classId} deleted (empty after disconnect)`);
        }
      }
    }
  });

  socket.on("error", (err) => {
    console.error("❌ Socket error:", err.message);
  });
  
  socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
  });
});

// ================= HELPER FUNCTIONS =================
export const emitNotification = (userId, notification) => {
  io.to(userId.toString()).emit("new_notification", notification);
  io.to(`user_${userId}`).emit("new_notification", notification);
};

export const emitAdminNotification = (notification) => {
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
    socket: "Socket.IO server is ready",
    activeRooms: rooms.size,
    email: SENDGRID_API_KEY ? "SendGrid enabled ✅" : "SendGrid disabled ❌"
  });
});

// ================= SOCKET STATUS ENDPOINT =================
app.get("/socket-status", (req, res) => {
  const roomStats = {};
  for (const [roomId, participants] of rooms.entries()) {
    roomStats[roomId] = {
      participantCount: participants.size,
      participants: Array.from(participants.entries()).map(([userId, info]) => ({
        userId,
        userName: info.userName,
        role: info.role
      }))
    };
  }
  
  res.json({
    status: "healthy",
    connections: io.engine.clientsCount,
    transports: ["polling", "websocket"],
    activeRooms: rooms.size,
    rooms: roomStats,
    allowedOrigins: allowedOrigins,
    emailStatus: SENDGRID_API_KEY ? "enabled" : "disabled"
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
      connected: socket.connected,
      userId: socket.userId,
      userName: socket.userName,
      classId: socket.classId
    });
  }
  
  res.json({
    totalConnections: io.engine.clientsCount,
    socketCount: connectedSockets.length,
    sockets: connectedSockets.slice(0, 50),
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ================= PLAN EXPIRY SCHEDULER =================
// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Running plan expiry checker...");
  await checkExpiredPlans();
  await checkApproachingExpiry();
});

// Also run on server startup
setTimeout(async () => {
  console.log("🔄 Initial plan expiry check...");
  await checkExpiredPlans();
  await checkApproachingExpiry();
}, 60000); // Wait 60 seconds after server start

// ================= START SERVER =================
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`✅ Transports: websocket, polling`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
  console.log(`✅ SendGrid: ${SENDGRID_API_KEY ? "Enabled ✅" : "Disabled ❌"}`);
  console.log(`\n🎥 Video Conference Ready:`);
  console.log(`   - Peer-to-peer video calling`);
  console.log(`   - Screen sharing support`);
  console.log(`   - Real-time chat`);
  console.log(`   - Speaking detection`);
  console.log(`\n📢 Notification rooms ready:`);
  console.log(`   - User rooms: user_{userId}`);
  console.log(`   - Admin rooms: admin, admin_notifications`);
  console.log(`\n🌐 API endpoints:`);
  console.log(`   - GET  /                Health check`);
  console.log(`   - GET  /socket-status   Socket.IO status`);
  console.log(`   - GET  /socket-stats    Detailed connection stats`);
  console.log(`   - POST /auth/register/alveoly  Alveoly student registration`);
  console.log(`   - POST /auth/register/non-alveoly  Non-Alveoly student registration`);
  console.log(`   - GET  /auth/verify-approval/:token  Verify approval token`);
  console.log(`\n📧 Email endpoints:`);
  console.log(`   - POST /auth/forgot-password  Send password reset email`);
  console.log(`   - POST /auth/assign-plan  Admin assign plan to user`);
});

export default httpServer;