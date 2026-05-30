// backend/src/models/BlogView.js
import mongoose from "mongoose";

const blogViewSchema = new mongoose.Schema(
  {
    blogId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Blog', 
      required: true 
    },
    ip: { 
      type: String, 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    userAgent: { 
      type: String 
    },
    viewedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Index for efficient querying
blogViewSchema.index({ blogId: 1, viewedAt: -1 });
blogViewSchema.index({ ip: 1, blogId: 1, viewedAt: -1 });

export default mongoose.model('BlogView', blogViewSchema);