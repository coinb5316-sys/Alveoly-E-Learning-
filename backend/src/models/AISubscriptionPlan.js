// models/AISubscriptionPlan.js - COMPLETE UPDATED VERSION (USD → GHS support)
import mongoose from "mongoose";

const AISubscriptionPlanSchema = new mongoose.Schema(
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

    // ============== PRICING (USD base + GHS reference) ==============
    price: {
      type: Number,
      required: true,
      min: 0,
      // PRIMARY price stored in USD (as set by admin)
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
      enum: ["USD", "GHS"],
      // Base currency for the `price` field
    },

    // ============== DURATION ==============
    durationValue: {
      type: Number,
      required: true,
      min: 1,
    },
    durationUnit: {
      type: String,
      enum: ["minutes", "hours", "days", "weeks", "months", "years"],
      required: true,
      default: "days",
    },

    // ============== STATUS ==============
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
AISubscriptionPlanSchema.index({ isActive: 1 });
AISubscriptionPlanSchema.index({ price: 1 });
AISubscriptionPlanSchema.index({ createdAt: -1 });

export default mongoose.model("AISubscriptionPlan", AISubscriptionPlanSchema);