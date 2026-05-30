// backend/src/models/BlogComment.js
import mongoose from "mongoose";

const blogCommentSchema = new mongoose.Schema(
  {
    blogId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Blog', 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    userName: { 
      type: String, 
      required: true 
    },
    userEmail: { 
      type: String 
    },
    content: { 
      type: String, 
      required: true 
    },
    isApproved: { 
      type: Boolean, 
      default: false 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    parentCommentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'BlogComment' 
    }
  },
  { timestamps: true }
);

// Indexes
blogCommentSchema.index({ blogId: 1, isApproved: 1, createdAt: -1 });
blogCommentSchema.index({ blogId: 1, createdAt: -1 });

export default mongoose.model('BlogComment', blogCommentSchema);