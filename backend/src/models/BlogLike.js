// backend/src/models/BlogLike.js
import mongoose from "mongoose";

const blogLikeSchema = new mongoose.Schema(
  {
    blogId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Blog', 
      required: true 
    },
    ipAddress: { 
      type: String, 
      required: true,
      index: true
    },
    likedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Ensure one IP can only like a blog once
blogLikeSchema.index({ blogId: 1, ipAddress: 1 }, { unique: true });

export default mongoose.model('BlogLike', blogLikeSchema);