// server/models/Video.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    youtubeId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    duration: { type: String, required: true },
    category: { type: String, required: true, index: true },
    publishedAt: { type: Date, default: Date.now, index: true },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({ title: "text", description: "text" });

export default mongoose.model("Video", videoSchema);