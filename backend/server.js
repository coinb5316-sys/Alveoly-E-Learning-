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

// ================= COMPREHENSIVE DEFAULT ANSWERS =================
const DEFAULT_ANSWERS = {
  // Greetings
  "hello": "👋 Hello! Welcome to Alveoly E-Learning Academy! I'm your virtual assistant. How can I help you today?",
  "hi": "👋 Hi there! Great to see you at Alveoly! I'm here to help you with information about our health sciences programs.",
  "hey": "👋 Hey there! Welcome to Alveoly! Feel free to ask me anything about our courses, admissions, or programs.",
  "good morning": "☀️ Good morning! Welcome to Alveoly E-Learning Academy! How can I assist you today?",
  "good afternoon": "🌤️ Good afternoon! Thank you for visiting Alveoly! What would you like to know?",
  "good evening": "🌙 Good evening! Welcome to Alveoly! Feel free to ask me anything!",
  
  // Help and Support
  "help": "🤝 **I'd be happy to help!**\n\n📚 **Courses & Programs**\n🎓 **Admissions**\n💰 **Fees & Financial Aid**\n📞 **Contact Support**\n\nJust type your question and I'll do my best to answer!",
  "support": "🤝 **Our support team is here to help!**\n\n📧 Email: support@alveoly.com\n📱 Phone: +233 (0) 54 489 1862\n💬 Live chat: Available 24/7",
  
  // Courses and Programs
  "courses": "🎓 **Courses and Programs at Alveoly**\n\n**Undergraduate Programs:**\n• Bachelor of Science in Nursing\n• Bachelor of Public Health\n• Bachelor of Health Administration\n\n**Diploma Programs:**\n• Diploma in Pharmacy Technology\n• Diploma in Community Health\n\n**Certificate Programs:**\n• Healthcare Management\n• Health Informatics\n• Medical Coding\n\nWhich program interests you?",
  
  "programs": "🎓 **Academic Programs at Alveoly**\n\n**Degree Programs:** BSc Nursing, BSc Public Health, BSc Health Administration\n**Diploma Programs:** Pharmacy Technology, Community Health, Clinical Research\n**Certificate Programs:** Healthcare Management, Health Informatics, Medical Coding\n\nWould you like detailed information about any specific program?",
  
  // Admissions
  "admission": "📝 **Admission Process:**\n\n1️⃣ Create an Account\n2️⃣ Choose Your Program\n3️⃣ Complete Application\n4️⃣ Upload Documents\n5️⃣ Pay Application Fee (waived for early applicants!)\n6️⃣ Receive Decision\n\nNeed help with any step? I'm here to guide you!",
  
  "admissions": "📝 **Admission Requirements:**\n\n**Certificate Programs:** High school diploma or equivalent\n**Diploma Programs:** High school diploma with minimum GPA of 2.5\n**Degree Programs:** High school diploma with minimum GPA of 3.0\n\n**Application Deadlines:**\n• Fall Semester (Sept): July 31\n• Spring Semester (Jan): Nov 30\n• Summer Semester (May): Mar 31",
  
  // Fees and Payments
  "fee": "💰 **Tuition and Fees**\n\n**Certificate Programs:** $500 - $1,500\n**Diploma Programs:** $1,500 - $3,000\n**Degree Programs:** $3,000 - $8,000/year\n\n**Payment Options:**\n✅ Full payment (5% discount)\n✅ Installment plans\n✅ Scholarships available",
  
  "fees": "💰 **Tuition by Program:**\n\n• Certificate: $500 - $1,500\n• Diploma: $1,500 - $3,000\n• Degree: $3,000 - $8,000/year\n\n**Payment Plans:** Monthly installments available. Would you like more details?",
  
  "payment": "💳 **Payment Methods Accepted:**\n\n• Credit/Debit Cards (Visa, Mastercard)\n• Mobile Money (MTN, Vodafone, AirtelTigo)\n• Bank Transfer\n• PayPal\n\nNeed assistance with payment? Contact finance@alveoly.com",
  
  // Scholarships
  "scholarship": "🎓 **Scholarship Opportunities:**\n\n**Merit Scholarship** (up to 50%)\n**Need-Based Grant** (up to 40%)\n**Early Bird Discount** (10% off)\n**Referral Scholarship** (15% off each)\n\nWould you like to know if you qualify?",
  
  // Contact Information
  "contact": "📞 **Contact Alveoly E-Learning Academy**\n\n📧 Email: support@alveoly.com\n📱 Phone: +233 (0) 54 489 1862\n💬 WhatsApp: +233 (0) 54 489 1862\n\n**Office Hours:** Mon-Fri, 9 AM - 6 PM GMT",
  
  // Thank you and farewell
  "thank": "🌟 You're very welcome! Is there anything else I can help with?",
  "thanks": "🌟 You're very welcome! Feel free to reach out anytime.",
  "bye": "👋 Goodbye! Thank you for visiting Alveoly E-Learning Academy! Have a wonderful day! 🎓",
  "goodbye": "👋 Goodbye! We look forward to welcoming you to the Alveoly family! Take care!"
};

// Find best answer for a question - Enhanced with default answers
async function findBestAnswer(question) {
  const normalizedQuestion = question.toLowerCase().trim();
  const qaList = await loadQaCache();
  
  // First check if there's a match in the database
  if (qaList.length > 0) {
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'for', 'in', 'on', 'at', 'with', 'by'];
    const keywords = normalizedQuestion.split(/\s+/).filter(word => !stopWords.includes(word) && word.length > 2);
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const qa of qaList) {
      const qaQuestion = qa.question.toLowerCase();
      let score = 0;
      
      if (qaQuestion === normalizedQuestion) score += 100;
      if (qaQuestion.includes(normalizedQuestion)) score += 50;
      for (const keyword of keywords) {
        if (qaQuestion.includes(keyword)) score += 10;
      }
      const questionWords = normalizedQuestion.split(/\s+/);
      for (const word of questionWords) {
        if (word.length > 2 && qaQuestion.includes(word)) score += 2;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    }
    
    if (bestScore >= 20) {
      console.log(`✅ Database match found with score ${bestScore}: "${bestMatch.question}"`);
      return bestMatch;
    }
  }
  
  // No database match - check default answers
  if (DEFAULT_ANSWERS[normalizedQuestion]) {
    console.log(`✅ Default answer found for: "${normalizedQuestion}"`);
    return { answer: DEFAULT_ANSWERS[normalizedQuestion] };
  }
  
  for (const [key, answer] of Object.entries(DEFAULT_ANSWERS)) {
    if (normalizedQuestion.includes(key)) {
      console.log(`✅ Default answer found for keyword: "${key}"`);
      return { answer };
    }
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

// ADD THIS LINE - Make io available to Express routes
app.set("io", io);

// Track connected users for analytics
const connectedUsers = new Map();
const unansweredQuestions = [];

// ================= SOCKET.IO CONNECTION HANDLER =================
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  console.log("📡 Transport:", socket.conn.transport.name);
  
  let currentUserId = null;
  let currentUserRole = null;

  socket.on("upgrade", () => {
    console.log("⬆️ Transport upgraded to websocket");
  });

  // ================= USER AUTHENTICATION & ROOM JOINING =================
  socket.on("identify_user", (data) => {
    const { userId, userName, role } = data;
    currentUserId = userId;
    currentUserRole = role;
    
    connectedUsers.set(socket.id, { userId, userName, role, connectedAt: new Date() });
    socket.join(`user_${userId}`);
    console.log(`👤 User identified: ${userName} (${role}) - ID: ${userId}`);
    
    if (role === "admin") {
      socket.join("admin");
      socket.join("admin_notifications");
      console.log(`🛠️ Admin ${userName} joined admin rooms`);
      
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
    socket.emit("bot_typing");
    
    try {
      const match = await findBestAnswer(questionText);
      let reply;
      
      if (match) {
        reply = match.answer;
        console.log(`✅ Found answer for: "${questionText.substring(0, 50)}..."`);
      } else {
        reply = `📝 Thanks for your question, ${userName || "there"}!\n\n"${questionText.substring(0, 100)}${questionText.length > 100 ? '...' : ''}"\n\nI'll make sure our team sees this. You can also contact support@alveoly.com for immediate assistance.\n\nIs there anything else I can help with?`;
        
        const unansweredQ = {
          id: Date.now(),
          text: questionText,
          userName: userName || "Anonymous",
          socketId: socket.id,
          createdAt: new Date(),
          status: "pending"
        };
        unansweredQuestions.push(unansweredQ);
        
        while (unansweredQuestions.length > 100) {
          unansweredQuestions.shift();
        }
        
        io.to("admin").emit("unanswered_question", unansweredQ);
        console.log(`📢 Notified admins about unanswered question from ${userName}`);
      }
      
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
        text: "I'm having trouble processing your question. Please try again or contact support@alveoly.com",
        timestamp: new Date(),
        error: true
      });
    }
  });

  // ================= ADMIN ANSWER TO STUDENT =================
  socket.on("admin_answer", (data) => {
    const { toSocketId, answer } = data;
    console.log(`📨 Admin answering to socket: ${toSocketId}`);
    
    const answeredIndex = unansweredQuestions.findIndex(q => q.socketId === toSocketId);
    if (answeredIndex !== -1) {
      unansweredQuestions[answeredIndex].status = "answered";
      unansweredQuestions[answeredIndex].answeredAt = new Date();
      unansweredQuestions[answeredIndex].answer = answer;
      io.to("admin").emit("question_answered", unansweredQuestions[answeredIndex]);
    }
    
    io.to(toSocketId).emit("admin_answer_reply", {
      text: answer,
      timestamp: new Date()
    });
    
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
  
  await loadQaCache();
  
  console.log(`\n📢 Notification rooms ready:`);
  console.log(`   - User rooms: user_{userId}`);
  console.log(`   - Admin rooms: admin, admin_notifications`);
  console.log(`\n🤖 Bot System Ready:`);
  console.log(`   - QA Cache: ${qaCache.length} entries`);
  console.log(`   - Default answers: ${Object.keys(DEFAULT_ANSWERS).length} topics`);
  console.log(`\n🌐 API endpoints:`);
  console.log(`   - GET  /                Health check`);
  console.log(`   - GET  /socket-status   Socket.IO status`);
  console.log(`   - GET  /socket-stats    Detailed connection stats`);
});