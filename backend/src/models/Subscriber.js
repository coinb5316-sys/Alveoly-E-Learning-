// server/models/Subscriber.js
import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, default: "" },
    source: {
      type: String,
      enum: ["footer", "article", "sidebar", "podcast", "import", "manual"],
      default: "footer",
    },
    status: {
      type: String,
      enum: ["active", "pending", "unsubscribed", "bounced"],
      default: "active",
      index: true,
    },
    tags: [{ type: String }],
    subscribedAt: { type: Date, default: Date.now, index: true },
    lastOpenedAt: { type: Date, default: null },
    opens: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Subscriber", subscriberSchema);