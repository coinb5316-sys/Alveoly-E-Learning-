// models/ContentPayment.js - COMPLETE UPDATED VERSION
import mongoose from "mongoose";

const contentPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },

    // ============== AMOUNT FIELDS ==============
    // `amount` is the GHS amount ACTUALLY charged through Paystack
    amount: {
      type: Number,
      required: true,
      min: 0,
      // e.g., 234.80 (GHS)
    },

    // Original USD price at time of purchase
    amountUSD: {
      type: Number,
      default: null,
      min: 0,
      // e.g., 20.00
    },

    // Verified amount from Paystack (GHS)
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
      // e.g., 11.74
    },

    currency: {
      type: String,
      default: "GHS",
      enum: ["GHS", "USD"],
    },

    reference: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },

    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate purchases
contentPaymentSchema.index({ userId: 1, contentId: 1, status: 1 });
contentPaymentSchema.index({ reference: 1, status: 1 });

export default mongoose.model("ContentPayment", contentPaymentSchema);