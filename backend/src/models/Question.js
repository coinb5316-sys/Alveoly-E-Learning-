// models/Question.js - Add approval fields
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    type: { type: String, enum: ["trial", "exam"], default: "exam" },
    examTime: { type: Number, default: 0 },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    rationale: { type: String, default: "" },
    isLocked: { type: Boolean, default: false },
    
    // NEW FIELDS FOR LECTURER APPROVAL WORKFLOW
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected", "draft"], 
      default: "pending" 
    },
    rejectionReason: { type: String, default: "" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    submittedForApprovalAt: { type: Date, default: Date.now },
    
    // Track if this is from a lecturer
    source: { type: String, enum: ["admin", "lecturer"], default: "admin" }
  },
  { timestamps: true }
);

// Add indexes for faster queries
questionSchema.index({ status: 1, createdBy: 1 });
questionSchema.index({ courseId: 1, subjectId: 1 });
questionSchema.index({ createdAt: -1 });

export default mongoose.model("Question", questionSchema);