// models/Payment.js - COMPLETE UPDATED VERSION (USD → GHS support)
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
      index: true,
    },

    // ============== AMOUNT FIELDS ==============
    // `amount` is the GHS amount ACTUALLY charged through Paystack
    amount: {
      type: Number,
      required: true,
      min: 0,
      // GHS amount charged (e.g., 147.25)
    },

    // Original USD price at time of purchase
    amountUSD: {
      type: Number,
      default: null,
      min: 0,
      // e.g., 9.50
    },

    // Verified amount from Paystack (in GHS)
    amountPaid: {
      type: Number,
      default: null,
      min: 0,
    },

    // Exchange rate used at purchase time
    exchangeRateUsed: {
      type: Number,
      default: null,
      min: 0,
      // e.g., 15.50
    },

    currency: {
      type: String,
      default: "GHS",
      enum: ["GHS", "USD", "NGN"],
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },

    accessType: {
      type: String,
      enum: ["plan", "subject"],
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ userId: 1, planId: 1, status: 1 });
paymentSchema.index({ userId: 1, subjectId: 1, status: 1 });
paymentSchema.index({ reference: 1, status: 1 });

export default mongoose.model("Payment", paymentSchema);