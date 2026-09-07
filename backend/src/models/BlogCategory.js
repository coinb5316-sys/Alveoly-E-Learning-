// models/BlogCategory.js - COMPLETELY FIXED
import mongoose from "mongoose";

const blogCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: "#3b82f6"
  },
  count: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// SINGLE pre-save middleware - combine both operations
blogCategorySchema.pre("save", function(next) {
  // Trim name
  if (this.name) {
    this.name = this.name.trim();
  }
  
  // Generate slug from name
  if (this.isModified('name') && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  next(); // Make sure this is called exactly once
});

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
export default BlogCategory;