// models/BlogCategory.js
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
    trim: true
  },
  icon: {
    type: String
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

// Pre-save middleware to generate slug
blogCategorySchema.pre("save", function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
export default BlogCategory;