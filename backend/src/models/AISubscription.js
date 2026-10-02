// models/AISubscription.js - NEW FILE
import mongoose from "mongoose";

const AISubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AISubscriptionPlan",
      required: true,
      index: true,
    },

    // ============== AMOUNT FIELDS ==============
    // `amount` = GHS amount actually charged through Paystack
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountUSD: {
      type: Number,
      default: null,
      // Original USD price
    },
    amountPaid: {
      type: Number,
      default: null,
      // Verified amount from Paystack (GHS)
    },
    exchangeRateUsed: {
      type: Number,
      default: null,
      // USD → GHS rate used at purchase time
    },
    currency: {
      type: String,
      default: "GHS",
      enum: ["GHS", "USD"],
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "failed"],
      default: "pending",
      index: true,
    },

    startDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
AISubscriptionSchema.index({ userId: 1, status: 1 });
AISubscriptionSchema.index({ userId: 1, expiryDate: 1 });
AISubscriptionSchema.index({ reference: 1, status: 1 });

export default mongoose.model("AISubscription", AISubscriptionSchema);