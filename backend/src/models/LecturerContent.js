// models/LecturerContent.js - NEW FILE
import mongoose from "mongoose";

const lecturerContentSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["lesson", "exam", "practice", "assignment", "resource"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    
    // Relationships
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    
    // Content specific
    content: {
      type: String, // HTML content or text for lessons
      default: "",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    filePublicId: {
      type: String,
      default: null,
    },
    attachments: [{
      name: String,
      url: String,
      publicId: String,
      type: String,
    }],
    
    // Exam/Practice specific
    questions: [{
      question: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: String },
      points: { type: Number, default: 1 },
      rationale: { type: String },
      type: { type: String, enum: ["multiple-choice", "true-false", "essay"], default: "multiple-choice" },
    }],
    timerMinutes: {
      type: Number,
      default: 0,
    },
    passMark: {
      type: Number,
      default: 70,
    },
    maxAttempts: {
      type: Number,
      default: 1,
    },
    
    // Settings
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    
    // Statistics
    views: {
      type: Number,
      default: 0,
    },
    completions: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
lecturerContentSchema.index({ lecturerId: 1, courseId: 1, subjectId: 1 });
lecturerContentSchema.index({ isPublished: 1, type: 1 });
lecturerContentSchema.index({ createdAt: -1 });

export default mongoose.model("LecturerContent", lecturerContentSchema);