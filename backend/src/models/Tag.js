// server/models/Tag.js
import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

tagSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

export default mongoose.model("Tag", tagSchema);