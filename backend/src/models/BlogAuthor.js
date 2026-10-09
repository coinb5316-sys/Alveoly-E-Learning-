// models/BlogAuthor.js
import mongoose from "mongoose";

const blogAuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true
  },
  bio: {
    type: String,
    required: [true, "Bio is required"],
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
  metaDescription: {
    type: String,
    maxlength: [160, "Meta description cannot exceed 160 characters"],
    default: ""
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
  }
}, {
  timestamps: true
});

// Indexes
blogAuthorSchema.index({ email: 1 });
blogAuthorSchema.index({ status: 1 });
blogAuthorSchema.index({ name: 1 });

const BlogAuthor = mongoose.model("BlogAuthor", blogAuthorSchema);
export default BlogAuthor;