// backend/src/models/Author.js
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
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Async-style hook — NO `next` parameter.
// Mongoose 6/7/8 all treat this as an awaited async hook.
// Do NOT add a `next` parameter here or you'll reintroduce the
// `TypeError: next is not a function` on Mongoose 8.
authorSchema.pre("save", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
});

// Also handle the case where name is modified but a slug already existed
// and the user wants it to update. Uncomment if you want slug to auto-refresh
// on rename:
//
// authorSchema.pre("save", function () {
//   if (this.isModified("name")) {
//     this.slug = this.name
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, "")
//       .replace(/\s+/g, "-");
//   }
// });

authorSchema.index({ name: "text", role: "text", specialties: "text" });

export default mongoose.model("Author", authorSchema);