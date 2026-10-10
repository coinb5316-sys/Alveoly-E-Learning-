// server/models/Author.js
import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" },
    website: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false }
);

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    role: { type: String, default: "" },
    credentials: { type: String, default: "" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true },
    specialties: [{ type: String }],
    social: { type: socialSchema, default: () => ({}) },
    active: { type: Boolean, default: true },
    // Denormalized for fast public reads
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-slug from name
authorSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

authorSchema.index({ name: "text", role: "text", specialties: "text" });

export default mongoose.model("Author", authorSchema);