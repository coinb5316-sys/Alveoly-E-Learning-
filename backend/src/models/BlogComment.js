// models/BlogComment.js
import mongoose from "mongoose";

const blogCommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogPost",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  authorName: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  },
  authorAvatar: {
    type: String
  },
  content: {
    type: String,
    required: [true, "Comment content is required"],
    trim: true,
    maxlength: [1000, "Comment cannot exceed 1000 characters"]
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "spam"],
    default: "pending"
  },
  likes: {
    type: Number,
    default: 0
  },
  replies: [{
    authorName: String,
    authorEmail: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
blogCommentSchema.index({ postId: 1 });
blogCommentSchema.index({ status: 1 });
blogCommentSchema.index({ createdAt: -1 });

const BlogComment = mongoose.model("BlogComment", blogCommentSchema);
export default BlogComment;