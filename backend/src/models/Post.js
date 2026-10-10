// server/models/Post.js
import mongoose from "mongoose";

const statisticSchema = new mongoose.Schema(
  { value: String, label: String },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true, index: true },
    subtitle: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },

    image: { type: String, default: "" },
    gallery: [{ type: String }],

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: String }],

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      default: null,
    },

    references: [{ type: String }],
    learningObjectives: [{ type: String }],
    statistics: [statisticSchema],
    relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    videoUrl: { type: String, default: "" },
    audioUrl: { type: String, default: "" },

    metaDescription: { type: String, default: "", maxlength: 200 },
    metaKeywords: { type: String, default: "" },

    status: {
      type: String,
      enum: ["draft", "review", "scheduled", "published", "archived"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    editorsPick: { type: Boolean, default: false },
    medicallyReviewed: { type: Boolean, default: false },

    publishedAt: { type: Date, default: Date.now, index: true },
    readingTime: { type: Number, default: 5 },

    // Engagement
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

postSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

postSchema.index({ title: "text", excerpt: "text", content: "text" });

export default mongoose.model("Post", postSchema);