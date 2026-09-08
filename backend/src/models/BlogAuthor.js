// models/BlogAuthor.js - COMPLETELY FIXED (NO PRE-SAVE MIDDLEWARE)
import mongoose from "mongoose";

const blogAuthorSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, "Author name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  title: {
    type: String,
    required: [true, "Author title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  bio: {
    type: String,
    required: [true, "Bio is required"],
    trim: true,
    maxlength: [500, "Bio cannot exceed 500 characters"]
  },
  avatar: {
    type: String,
    default: ""
  },
  expertise: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    default: 0
  },
  education: [{
    type: String,
    trim: true
  }],
  certifications: [{
    type: String,
    trim: true
  }],
  social: {
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" },
    website: { type: String, default: "" }
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active"
  },
  postCount: {
    type: Number,
    default: 0
  },
  totalLikes: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  slug: {
    type: String,
    required: true, // Make required so validation catches it
    unique: true,
    lowercase: true,
    trim: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, "Meta description cannot exceed 160 characters"],
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// NO PRE-SAVE MIDDLEWARE - handle slug generation in the controller

// Indexes
blogAuthorSchema.index({ slug: 1 });
blogAuthorSchema.index({ email: 1 });
blogAuthorSchema.index({ status: 1 });
blogAuthorSchema.index({ name: 1 });

const BlogAuthor = mongoose.model("BlogAuthor", blogAuthorSchema);
export default BlogAuthor;