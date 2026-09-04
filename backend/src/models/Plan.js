// models/Plan.js
import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    durationUnit: {
      type: String,
      enum: ["day", "week", "month", "year"],
      default: "month"
    },
    isFree: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    features: [{
      type: String
    }],
    // Full access control - unlock ALL content
    unlocksAllContent: {
      type: Boolean,
      default: false
    },
    // Specific access control (if not unlocking all)
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject"
    }],
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }],
    programs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program"
    }],
    // Access level
    accessLevel: {
      type: String,
      enum: ["full", "subjects", "courses", "programs", "none"],
      default: "full"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    // For free plans - what's included
    freeAccess: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes
planSchema.index({ isActive: 1 });
planSchema.index({ isFree: 1 });
planSchema.index({ price: 1 });
planSchema.index({ accessLevel: 1 });

export default mongoose.model("Plan", planSchema);