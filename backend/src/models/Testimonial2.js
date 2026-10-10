// server/models/Testimonial.js
import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    avatar: { type: String, default: "" },
    email: { type: String, default: "" },
    body: { type: String, required: true, maxlength: 400 },

    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    sourceLabel: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "pending",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    pinned: { type: Boolean, default: false, index: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

testimonialSchema.index({ pinned: -1, createdAt: -1 });

export default mongoose.model("Testimonial2", testimonialSchema);