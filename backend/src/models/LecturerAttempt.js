// models/LecturerAttempt.js - NEW FILE
import mongoose from "mongoose";

const lecturerAttemptSchema = new mongoose.Schema(
  {
    // Relationships
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LecturerContent",
      required: true,
      index: true,
    },
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    
    // Student Info (denormalized)
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    
    // Content Info (denormalized)
    contentTitle: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["lesson", "exam", "practice", "assignment", "resource"],
      required: true,
    },
    
    // Attempt Data
    answers: [{
      questionId: Number,
      question: String,
      selectedAnswer: String,
      isCorrect: Boolean,
      pointsEarned: Number,
      feedback: String,
    }],
    
    score: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "failed", "expired"],
      default: "in-progress",
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    
    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    
    // Lecturer Feedback
    lecturerFeedback: {
      type: String,
      default: "",
    },
    feedbackGivenAt: {
      type: Date,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "F", "PENDING"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
lecturerAttemptSchema.index({ studentId: 1, contentId: 1, status: 1 });
lecturerAttemptSchema.index({ lecturerId: 1, createdAt: -1 });
lecturerAttemptSchema.index({ studentId: 1, contentType: 1, percentage: 1 });

export default mongoose.model("LecturerAttempt", lecturerAttemptSchema);