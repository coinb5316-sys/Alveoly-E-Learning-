// backend/src/models/Podcast.js
import mongoose from "mongoose";

const podcastSchema = new mongoose.Schema(
  {
    episodeNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    audioUrl: { type: String, required: true },
    duration: { type: String, required: true }, // "42:15"
    image: { type: String, default: "" },
    guests: [{ type: String, trim: true }],
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

podcastSchema.index({ title: "text", description: "text" });

export default mongoose.model("Podcast", podcastSchema);