// models/Subject.js - COMPLETE UPDATED VERSION (USD → GHS support)
import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    // ============== PAID / FREE ==============
    isPaid: {
      type: Boolean,
      default: false,
    },

    // ============== PRICING (USD base + GHS reference) ==============
    price: {
      type: Number,
      default: 0,
      min: 0,
      // PRIMARY price stored in USD
    },
    priceInGHS: {
      type: Number,
      default: 0,
      min: 0,
      // GHS equivalent at time of creation/update
    },
    exchangeRateAtCreation: {
      type: Number,
      default: 15.50,
      min: 0,
      // USD → GHS rate used when this subject was saved
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "GHS"],
      // Base currency for price field
    },

    // Students who unlocked this subject
    studentsUnlocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Topics array
    topics: [topicSchema],
  },
  { timestamps: true }
);

// Indexes
subjectSchema.index({ programId: 1, courseId: 1 });
subjectSchema.index({ isPaid: 1 });
subjectSchema.index({ createdAt: -1 });

export default mongoose.model("Subject", subjectSchema);