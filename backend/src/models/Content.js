// models/Content.js
import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "image", "pdf", "quiz"],
      required: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    thumbnailPublicId: {
      type: String,
      default: null,
    },
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true
    },
    lecturerName: {
      type: String,
      default: "Admin"
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
    },
    // ========== TOPIC ID FIELD ==========
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject.topics",
      default: null,
      index: true
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      default: 0
    },
    quizTimerMinutes: {
      type: Number,
      default: 0,
    },
    quizPassMark: {
      type: Number,
      default: 70,
    },
    unlockedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

// Add indexes for better query performance
contentSchema.index({ subjectId: 1, topicId: 1 });
contentSchema.index({ courseId: 1 });

export default mongoose.model("Content", contentSchema);