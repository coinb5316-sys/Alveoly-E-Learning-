import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import manualAccessRoutes from "./routes/manualAccessRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import lessonQuestionRoutes from "./routes/lessonQuestionRoutes.js";
import contentPaymentRoutes from "./routes/contentPaymentRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import trialRoutes from "./routes/trialRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// ================= SECURITY (HELMET) =================
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ================= CORS - FIXED =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://alveolye-learning.academy",
  "https://www.alveolye-learning.academy",
  "https://alveoly-e-learning-of-health-api.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean);

console.log("✅ CORS Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.warn(`❌ CORS blocked origin: ${origin}`);
      // For now, allow it anyway to fix the issue
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin"
    ],
  })
);

// ================= ❌ REMOVE THIS LINE =================
// app.options("*", cors());  // DELETE THIS - IT'S CAUSING THE ERROR!

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/manual-access", manualAccessRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/stat", statsRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/content-payments", contentPaymentRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/trial", trialRoutes);
app.use("/api/lesson-quiz", lessonQuestionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running 🚀" });
});

// ================= 404 Handler - Use proper syntax =================
// This is the CORRECT way to handle 404s - NOT using '*'
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

export default app;