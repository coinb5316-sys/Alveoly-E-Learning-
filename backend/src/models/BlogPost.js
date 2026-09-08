// models/BlogPost.js - UNIFIED COMPLETE MODEL (NO PRE-SAVE)
import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  // ===== BASIC INFO =====
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
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  // ===== CATEGORY & TAGS =====
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],

  // ===== MEDIA =====
  featuredImage: {
    type: String,
    default: null
  },
  galleryImages: [{
    type: String,
    default: []
  }],
  videoUrl: {
    type: String,
    default: ""
  },
  videoEmbed: {
    type: String,
    default: ""
  },
  audioUrl: {
    type: String,
    default: ""
  },

  // ===== AUTHOR INFO =====
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
    type: String,
    default: "Contributor"
  },
  authorBio: {
    type: String,
    default: ""
  },
  authorImage: {
    type: String,
    default: ""
  },

  // ===== STATUS & PUBLISHING =====
  status: {
    type: String,
    enum: ["draft", "pending", "published", "archived"],
    default: "draft"
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: null
  },
  scheduledDate: {
    type: Date,
    default: null
  },

  // ===== SETTINGS =====
  readingTime: {
    type: Number,
    default: 5
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

  // ===== SEO =====
  metaDescription: {
    type: String,
    maxlength: [160, "Meta description cannot exceed 160 characters"],
    default: ""
  },
  metaKeywords: {
    type: String,
    default: ""
  },

  // ===== ENHANCED CONTENT =====
  references: [{
    type: String,
    default: []
  }],
  learningObjectives: [{
    type: String,
    default: []
  }],
  statistics: [{
    value: String,
    label: String
  }],
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogPost",
    default: []
  }],

  // ===== STATS =====
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
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
  }],
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
  }]

}, {
  timestamps: true
});

// ===== INDEXES =====
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ publishDate: -1 });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ featured: 1, status: 1 });

// ===== VIRTUAL for comment count =====
blogPostSchema.virtual('commentCount', {
  ref: 'BlogComment',
  localField: '_id',
  foreignField: 'postId',
  count: true
});

blogPostSchema.set('toJSON', { virtuals: true });
blogPostSchema.set('toObject', { virtuals: true });

const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;