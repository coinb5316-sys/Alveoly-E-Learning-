// models/BlogTag.js - FIXED
import mongoose from "mongoose";

const blogTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tag name is required"],
    unique: true,
    trim: true,
    maxlength: [50, "Tag name cannot exceed 50 characters"]
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  color: {
    type: String,
    default: "#3b82f6",
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color"]
  },
  icon: {
    type: String,
    default: ""
  },
  count: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: [200, "Description cannot exceed 200 characters"],
    default: ""
  },
  metaDescription: {
    type: String,
    maxlength: [160, "Meta description cannot exceed 160 characters"],
    default: ""
  }
}, {
  timestamps: true
});

// FIXED: Properly handle next in pre-save middleware and ensure slug is generated
blogTagSchema.pre("save", function(next) {
  if (this.isModified('name') && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  // If slug is still empty, generate from name
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

// REMOVED DUPLICATE INDEXES
blogTagSchema.index({ slug: 1 });
blogTagSchema.index({ name: 1 });
blogTagSchema.index({ count: -1 });

const BlogTag = mongoose.model("BlogTag", blogTagSchema);
export default BlogTag;