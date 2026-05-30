// backend/src/models/BlogLike.js
import mongoose from "mongoose";

const blogLikeSchema = new mongoose.Schema(
  {
    blogId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Blog', 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    likedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Ensure one user can only like a blog once
blogLikeSchema.index({ blogId: 1, userId: 1 }, { unique: true });

export default mongoose.model('BlogLike', blogLikeSchema);