// models/BlogPost.js - SIMPLIFIED (No pre-save middleware)
import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [300, "Subtitle cannot exceed 300 characters"]
  },
  content: {
    type: String,
    required: [true, "Content is required"]
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String
  },
  galleryImages: [{
    type: String
  }],
  videoUrl: {
    type: String
  },
  videoEmbed: {
    type: String
  },
  audioUrl: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is required"]
  },
  authorName: {
    type: String,
    required: true
  },
  authorTitle: {
    type: String
  },
  authorBio: {
    type: String
  },
  authorImage: {
    type: String
  },
  status: {
    type: String,
    enum: ["draft", "pending", "published", "archived"],
    default: "draft"
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date
  },
  scheduledDate: {
    type: Date
  },
  readingTime: {
    type: Number,
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  showAuthor: {
    type: Boolean,
    default: true
  },
  showShareButtons: {
    type: Boolean,
    default: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, "Meta description cannot exceed 160 characters"]
  },
  metaKeywords: {
    type: String
  },
  references: [{
    type: String
  }],
  learningObjectives: [{
    type: String
  }],
  statistics: [{
    value: String,
    label: String
  }],
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogPost"
  }],
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ================= NO MIDDLEWARE - Handle slug and reading time in controller =================
// This avoids the "next is not a function" error entirely

// ================= FIXED: Remove duplicate indexes =================
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ publishDate: -1 });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ featured: 1, status: 1 });

const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;