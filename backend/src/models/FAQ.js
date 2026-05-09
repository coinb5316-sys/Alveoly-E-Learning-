import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["general", "admissions", "courses", "fees", "technical", "other"],
    default: "general"
  },
  keywords: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  views: { type: Number, default: 0 },
  helpful: { yes: { type: Number, default: 0 }, no: { type: Number, default: 0 } },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

faqSchema.pre('save', function(next) {
  if (this.question) {
    this.keywords = this.question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }
  next();
});

export default mongoose.model("FAQ", faqSchema);