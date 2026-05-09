// server.js - COMPLETELY FIXED VERSION
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import QA from "./src/models/QAModel.js";

dotenv.config();

// ================= CREATE EXPRESS APP =================
const app = express();

// ================= CONNECT TO MONGODB =================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};
connectDB();

// ================= MIDDLEWARE =================
// CORS - must be first
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://alveolye-learning.academy",
    "https://www.alveolye-learning.academy",
    "https://alveoly-platform.onrender.com",
    "https://alveoly-platform-1.onrender.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

// Helmet
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running 🚀" });
});

// ================= QA ROUTES =================
// Get all Q&A
app.get("/api/admin/qa/list", async (req, res) => {
  try {
    const list = await QA.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, list });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Add Q&A
app.post("/api/admin/qa/add", async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ ok: false, message: "Question and answer required" });
    }
    
    const qa = await QA.create({ question, answer });
    res.json({ ok: true, qa });
  } catch (error) {
    console.error("Add error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Update Q&A
app.put("/api/admin/qa/update/:id", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = await QA.findByIdAndUpdate(
      req.params.id,
      { question, answer, updatedAt: Date.now() },
      { new: true }
    );
    if (!qa) {
      return res.status(404).json({ ok: false, message: "Q&A not found" });
    }
    res.json({ ok: true, qa });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Delete Q&A
app.delete("/api/admin/qa/delete/:id", async (req, res) => {
  try {
    const qa = await QA.findByIdAndDelete(req.params.id);
    if (!qa) {
      return res.status(404).json({ ok: false, message: "Q&A not found" });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ================= HTTP SERVER =================
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// ================= SOCKET.IO =================
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://alveolye-learning.academy",
  "https://www.alveolye-learning.academy",
  "https://alveoly-platform.onrender.com",
  "https://alveoly-platform-1.onrender.com",
  CLIENT_URL,
].filter(Boolean);

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
});

const unansweredQuestions = [];

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("identify_user", (data) => {
    const { userId, userName, role } = data;
    socket.join(`user_${userId}`);
    console.log(`👤 User identified: ${userName} (${role}) - ID: ${userId}`);
    
    if (role === "admin") {
      socket.join("admin");
      io.to("admin").emit("unanswered_questions_batch", unansweredQuestions);
    }
  });

  socket.on("user_question", (data) => {
    const { text, userName } = data;
    console.log(`💬 Question from ${userName}: "${text.substring(0, 100)}"`);
    socket.emit("bot_typing");
    
    setTimeout(() => {
      socket.emit("bot_reply", {
        text: `Thank you for your question, ${userName}! Our team will get back to you shortly.`,
        timestamp: new Date()
      });
    }, 800);
    
    const unansweredQ = {
      id: Date.now(),
      text: text,
      userName: userName || "Anonymous",
      socketId: socket.id,
      createdAt: new Date(),
      status: "pending"
    };
    unansweredQuestions.push(unansweredQ);
    io.to("admin").emit("unanswered_question", unansweredQ);
  });

  socket.on("admin_answer", (data) => {
    const { toSocketId, answer } = data;
    console.log(`📨 Admin answering to socket: ${toSocketId}`);
    io.to(toSocketId).emit("admin_answer_reply", {
      text: answer,
      timestamp: new Date()
    });
  });

  socket.on("refresh_cache", () => {
    console.log("🔄 Cache refresh requested by admin");
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔴 Client disconnected (${socket.id}):`, reason);
  });
});

// ================= START SERVER =================
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`\n📢 QA API endpoints:`);
  console.log(`   - GET  /api/admin/qa/list   - Get all Q&A`);
  console.log(`   - POST /api/admin/qa/add    - Add new Q&A`);
  console.log(`   - PUT  /api/admin/qa/update/:id - Update Q&A`);
  console.log(`   - DELETE /api/admin/qa/delete/:id - Delete Q&A`);
});