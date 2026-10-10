// server/models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    icon: { type: String, default: "folder" },
    color: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

categorySchema.index({ order: 1, name: 1 });

export default mongoose.model("Category", categorySchema);