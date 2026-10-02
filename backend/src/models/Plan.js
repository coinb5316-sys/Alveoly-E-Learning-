// models/Plan.js - COMPLETE UPDATED VERSION (USD → GHS support)
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

    // ============== PRICING (USD base + GHS reference) ==============
    price: {
      type: Number,
      required: true,
      min: 0,
      // This is the PRIMARY price stored in USD
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
      // USD → GHS rate used when this plan was saved
    },
    currency: {
      type: String,
      default: "USD",
      // Base currency for price field
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
    isPopular: {
      type: Boolean,
      default: false
    },
    features: [{
      type: String
    }],

    // Full access control - unlock ALL content
    unlocksAllContent: {
      type: Boolean,
      default: true
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
    },

    // Program access - if set, unlocks all content for these programs
    programAccess: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program"
    }],
  },
  { timestamps: true }
);

// Indexes
planSchema.index({ isActive: 1 });
planSchema.index({ isFree: 1 });
planSchema.index({ price: 1 });
planSchema.index({ accessLevel: 1 });
planSchema.index({ programAccess: 1 });
planSchema.index({ isPopular: 1 });

export default mongoose.model("Plan", planSchema);