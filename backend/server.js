// server.js - Complete Socket.IO configuration with notifications and BOT system
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import QA from "./src/models/QAModel.js";

dotenv.config();

// ================= INIT =================
connectDB();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ================= HTTP SERVER =================
const httpServer = createServer(app);

// ================= QA CACHE SYSTEM =================
let qaCache = [];
let lastCacheUpdate = null;
const CACHE_TTL = 300000; // 5 minutes

// Load QA cache from database
async function loadQaCache() {
  const now = Date.now();
  if (qaCache.length > 0 && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_TTL) {
    return qaCache;
  }
  
  try {
    qaCache = await QA.find({}).sort({ createdAt: -1 });
    lastCacheUpdate = now;
    console.log(`📚 QA Cache loaded: ${qaCache.length} entries`);
    return qaCache;
  } catch (error) {
    console.error("Failed to load QA cache:", error);
    return [];
  }
}

// Clear QA cache (call when Q&A is updated)
export function clearQaCache() {
  qaCache = [];
  lastCacheUpdate = null;
  console.log("🗑️ QA Cache cleared");
}

// Find best answer for a question
async function findBestAnswer(question) {
  const qaList = await loadQaCache();
  
  if (!qaList.length) {
    return null;
  }
  
  const normalizedQuestion = question.toLowerCase().trim();
  
  // Remove common words for better matching
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'for', 'in', 'on', 'at', 'with', 'by'];
  const keywords = normalizedQuestion.split(/\s+/).filter(word => !stopWords.includes(word) && word.length > 2);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const qa of qaList) {
    const qaQuestion = qa.question.toLowerCase();
    let score = 0;
    
    // Exact match - highest score
    if (qaQuestion === normalizedQuestion) {
      score += 100;
    }
    
    // Contains exact phrase
    if (qaQuestion.includes(normalizedQuestion)) {
      score += 50;
    }
    
    // Keyword matching
    for (const keyword of keywords) {
      if (qaQuestion.includes(keyword)) {
        score += 10;
      }
    }
    
    // Word-by-word matching
    const questionWords = normalizedQuestion.split(/\s+/);
    for (const word of questionWords) {
      if (word.length > 2 && qaQuestion.includes(word)) {
        score += 2;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }
  
  // Only return if score is meaningful (at least 20)
  if (bestScore >= 20) {
    console.log(`✅ Match found with score ${bestScore}: "${bestMatch.question}"`);
    return bestMatch;
  }
  
  return null;
}

// ================= SOCKET.IO CONFIGURATION =================
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
  transports: ["polling", "websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowUpgrades: true,
  perMessageDeflate: false,
  httpCompression: false,
});

// Track connected users for analytics
const connectedUsers = new Map();
const unansweredQuestions = [];

// ================= SOCKET.IO CONNECTION HANDLER =================
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  console.log("📡 Transport:", socket.conn.transport.name);
  
  let currentUserId = null;
  let currentUserRole = null;

  // Handle upgrade to websocket
  socket.on("upgrade", () => {
    console.log("⬆️ Transport upgraded to websocket");
  });

  // ================= USER AUTHENTICATION & ROOM JOINING =================
  socket.on("identify_user", (data) => {
    const { userId, userName, role } = data;
    currentUserId = userId;
    currentUserRole = role;
    
    // Store connection info
    connectedUsers.set(socket.id, { userId, userName, role, connectedAt: new Date() });
    
    // Join appropriate rooms
    socket.join(`user_${userId}`);
    console.log(`👤 User identified: ${userName} (${role}) - ID: ${userId}`);
    
    if (role === "admin") {
      socket.join("admin");
      socket.join("admin_notifications");
      console.log(`🛠️ Admin ${userName} joined admin rooms`);
      
      // Send any pending unanswered questions to new admin
      if (unansweredQuestions.length > 0) {
        socket.emit("unanswered_questions_batch", unansweredQuestions);
      }
    }
    
    socket.emit("identified", { success: true, userId, role });
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

  // ================= AI CHAT BOT WITH QA DATABASE =================
  socket.on("user_question", async (data) => {
    const { text, userName } = data;
    const questionText = text?.trim();
    
    if (!questionText) {
      socket.emit("bot_reply", {
        text: "Please enter a question so I can help you.",
        timestamp: new Date()
      });
      return;
    }
    
    console.log(`💬 Question from ${userName}: "${questionText.substring(0, 100)}"`);
    
    // Show typing indicator
    socket.emit("bot_typing");
    
    try {
      // Search for answer in QA database
      const match = await findBestAnswer(questionText);
      
      let reply;
      let shouldNotifyAdmin = false;
      
      if (match) {
        reply = `🤖 **Answer:**\n\n${match.answer}`;
        console.log(`✅ Found answer in QA database for: "${questionText.substring(0, 50)}..."`);
      } else {
        // No match found - create a friendly response
        reply = `📝 Thanks for your question, ${userName || "there"}!\n\n"${questionText.substring(0, 100)}${questionText.length > 100 ? '...' : ''}"\n\nI'll make sure our team sees this and gets back to you shortly. In the meantime, you can:\n\n• Check our FAQ section\n• Browse our course catalog\n• Contact our support team\n\nIs there anything else I can help with?`;
        shouldNotifyAdmin = true;
        
        // Store unanswered question
        const unansweredQ = {
          id: Date.now(),
          text: questionText,
          userName: userName || "Anonymous",
          socketId: socket.id,
          createdAt: new Date(),
          status: "pending"
        };
        unansweredQuestions.push(unansweredQ);
        
        // Limit to last 100
        while (unansweredQuestions.length > 100) {
          unansweredQuestions.shift();
        }
        
        // Notify admins
        io.to("admin").emit("unanswered_question", unansweredQ);
        io.to("admin_notifications").emit("new_admin_notification", {
          type: "info",
          title: "New Unanswered Question",
          message: `${userName || "Someone"} asked: "${questionText.substring(0, 50)}..."`,
          timestamp: new Date(),
          metadata: unansweredQ
        });
        console.log(`📢 Notified admins about unanswered question from ${userName}`);
      }
      
      // Send response with slight delay for natural feel
      setTimeout(() => {
        socket.emit("bot_reply", {
          text: reply,
          timestamp: new Date(),
          answered: !!match
        });
      }, 800);
      
    } catch (error) {
      console.error("❌ Error processing question:", error);
      socket.emit("bot_reply", {
        text: "😅 I'm having trouble processing your question right now. Please try again in a moment or contact our support team directly.\n\nWe apologize for the inconvenience!",
        timestamp: new Date(),
        error: true
      });
    }
  });

  // ================= ADMIN ANSWER TO STUDENT =================
  socket.on("admin_answer", (data) => {
    const { toSocketId, answer } = data;
    console.log(`📨 Admin answering to socket: ${toSocketId}`);
    
    // Find the unanswered question and mark as answered
    const answeredIndex = unansweredQuestions.findIndex(q => q.socketId === toSocketId);
    if (answeredIndex !== -1) {
      unansweredQuestions[answeredIndex].status = "answered";
      unansweredQuestions[answeredIndex].answeredAt = new Date();
      unansweredQuestions[answeredIndex].answer = answer;
      
      // Notify admins that question was answered
      io.to("admin").emit("question_answered", unansweredQuestions[answeredIndex]);
    }
    
    // Send answer to the student
    io.to(toSocketId).emit("admin_answer_reply", {
      text: answer,
      timestamp: new Date()
    });
    
    // Also send to the specific user's room
    socket.emit("answer_sent", { success: true, toSocketId });
  });

  // ================= QA CACHE MANAGEMENT (Admin) =================
  socket.on("refresh_cache", async () => {
    if (currentUserRole === "admin") {
      await loadQaCache();
      io.to("admin").emit("cache_refreshed", { success: true, count: qaCache.length });
      console.log("🔄 QA Cache refreshed by admin");
    }
  });

  // ================= QA CRUD OPERATIONS (Admin) =================
  socket.on("qa:add", async (data, callback) => {
    if (currentUserRole !== "admin") {
      if (callback) callback({ success: false, message: "Unauthorized" });
      return;
    }
    
    try {
      const { question, answer } = data;
      const newQA = await QA.create({ question, answer });
      await loadQaCache(); // Refresh cache
      
      io.to("admin").emit("qa:updated", { action: "add", qa: newQA });
      if (callback) callback({ success: true, qa: newQA });
    } catch (error) {
      if (callback) callback({ success: false, message: error.message });
    }
  });
  
  socket.on("qa:update", async (data, callback) => {
    if (currentUserRole !== "admin") {
      if (callback) callback({ success: false, message: "Unauthorized" });
      return;
    }
    
    try {
      const { id, question, answer } = data;
      const updated = await QA.findByIdAndUpdate(id, { question, answer, updatedAt: Date.now() }, { new: true });
      await loadQaCache(); // Refresh cache
      
      io.to("admin").emit("qa:updated", { action: "update", qa: updated });
      if (callback) callback({ success: true, qa: updated });
    } catch (error) {
      if (callback) callback({ success: false, message: error.message });
    }
  });
  
  socket.on("qa:delete", async (data, callback) => {
    if (currentUserRole !== "admin") {
      if (callback) callback({ success: false, message: "Unauthorized" });
      return;
    }
    
    try {
      const { id } = data;
      await QA.findByIdAndDelete(id);
      await loadQaCache(); // Refresh cache
      
      io.to("admin").emit("qa:updated", { action: "delete", id });
      if (callback) callback({ success: true });
    } catch (error) {
      if (callback) callback({ success: false, message: error.message });
    }
  });

  // ================= DISCONNECT HANDLING =================
  socket.on("disconnect", (reason) => {
    console.log(`🔴 Client disconnected (${socket.id}):`, reason);
    connectedUsers.delete(socket.id);
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
    qaCache: { count: qaCache.length, lastUpdate: lastCacheUpdate }
  });
});

// ================= QA ENDPOINTS (REST) =================
app.get("/api/admin/qa/list", async (req, res) => {
  try {
    const list = await QA.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, list });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post("/api/admin/qa/add", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = await QA.create({ question, answer });
    await loadQaCache();
    io.to("admin").emit("qa_updated", { action: "add", qa });
    res.json({ ok: true, qa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.put("/api/admin/qa/update/:id", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = await QA.findByIdAndUpdate(req.params.id, { question, answer, updatedAt: Date.now() }, { new: true });
    await loadQaCache();
    io.to("admin").emit("qa_updated", { action: "update", qa });
    res.json({ ok: true, qa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.delete("/api/admin/qa/delete/:id", async (req, res) => {
  try {
    await QA.findByIdAndDelete(req.params.id);
    await loadQaCache();
    io.to("admin").emit("qa_updated", { action: "delete", id: req.params.id });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
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
    unansweredCount: unansweredQuestions.filter(q => q.status === "pending").length,
    qaCacheSize: qaCache.length,
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
    connectedUsers: Array.from(connectedUsers.values()).slice(0, 50),
    unansweredQuestions: unansweredQuestions.filter(q => q.status === "pending").slice(0, 20),
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ================= START SERVER =================
httpServer.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`✅ Transports: polling, websocket`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
  
  // Initialize QA cache on startup
  await loadQaCache();
  
  console.log(`\n📢 Notification rooms ready:`);
  console.log(`   - User rooms: user_{userId}`);
  console.log(`   - Admin rooms: admin, admin_notifications`);
  console.log(`\n🤖 Bot System Ready:`);
  console.log(`   - QA Cache: ${qaCache.length} entries`);
  console.log(`   - Answer matching: Active`);
  console.log(`\n🌐 API endpoints:`);
  console.log(`   - GET  /                Health check`);
  console.log(`   - GET  /socket-status   Socket.IO status`);
  console.log(`   - GET  /socket-stats    Detailed connection stats`);
  console.log(`   - GET  /api/admin/qa/list  QA Library`);
  console.log(`   - POST /api/admin/qa/add   Add QA`);
  console.log(`   - PUT  /api/admin/qa/update/:id Update QA`);
  console.log(`   - DELETE /api/admin/qa/delete/:id Delete QA`);
});