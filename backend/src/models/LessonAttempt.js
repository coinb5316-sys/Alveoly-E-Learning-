// models/LessonAttempt.js - COMPLETELY FIXED
import mongoose from "mongoose";

const lessonAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LessonQuestion",
      required: true,
    },
    questionText: String,
    selected: String,
    selectedText: String,
    correct: String,
    correctText: String,
    isCorrect: Boolean,
    points: Number,
    pointsEarned: { type: Number, default: 0 },  // ← ADD THIS
    lecturerFeedback: { type: String, default: "" },  // ← ADD THIS
    manualGraded: { type: Boolean, default: false },  // ← ADD THIS
    autoGraded: { type: Boolean, default: false },  // ← ADD THIS
    rationale: String,
  }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  
  // ================= GRADING FIELDS =================
  isGraded: { type: Boolean, default: false },  // ← CRITICAL: ADD THIS
  gradingType: { type: String, enum: ["automatic", "manual", "pending"], default: "pending" },  // ← ADD THIS
  gradedAt: { type: Date },  // ← ADD THIS
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // ← ADD THIS
  lecturerFeedback: { type: String, default: "" },  // ← ADD THIS
  grade: { type: String, default: "PENDING" },  // ← ADD THIS
  
  status: {
    type: String,
    enum: ["in-progress", "completed", "failed", "expired"],
    default: "in-progress",
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  attempts: { type: Number, default: 1 },
  maxAttempts: { type: Number, default: 1 },
  passMark: { type: Number, default: 70 },
  lessonCompleted: { type: Boolean, default: false },
  adminAllowedRetake: { type: Boolean, default: false },
  replacesAttemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LessonAttempt",
    default: null,
  },
  
  // Resubmission fields
  needsResubmission: { type: Boolean, default: false },
  resubmissionReason: { type: String, default: "" },
  resubmissionRequestedAt: Date,
  needsReview: { type: Boolean, default: false },
}, { timestamps: true });

// Virtual for isPassed
lessonAttemptSchema.virtual("isPassed").get(function() {
  return (this.percentage || 0) >= (this.passMark || 70);
});

// IMPORTANT: Include virtuals when converting to JSON
lessonAttemptSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.isPassed = (ret.percentage || 0) >= (ret.passMark || 70);
    return ret;
  }
});

lessonAttemptSchema.set('toObject', { virtuals: true });

// Add indexes for better query performance
lessonAttemptSchema.index({ userId: 1, lessonId: 1 });
lessonAttemptSchema.index({ subjectId: 1, status: 1 });
lessonAttemptSchema.index({ isGraded: 1, status: 1 });
lessonAttemptSchema.index({ createdAt: -1 });

export default mongoose.model("LessonAttempt", lessonAttemptSchema);