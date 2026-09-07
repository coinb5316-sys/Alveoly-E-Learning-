// models/BlogCategory.js - Alternative with two middleware (both call next)
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

// First middleware - generate slug
blogCategorySchema.pre("save", function(next) {
  if (this.isModified('name') && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next(); // MUST call next()
});

// Second middleware - trim name
blogCategorySchema.pre("save", function(next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  next(); // MUST call next() here too!
});

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
export default BlogCategory;