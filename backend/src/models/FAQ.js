// models/FAQ.js - SIMPLE FIXED VERSION (No automatic keyword generation)
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
  keywords: [{
    type: String,
    default: []
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  views: { type: Number, default: 0 },
  helpful: { 
    yes: { type: Number, default: 0 }, 
    no: { type: Number, default: 0 } 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: false
  }
}, { timestamps: true });

// NO pre-save middleware - keep it simple
// If you want keywords, you can set them manually or generate them client-side

export default mongoose.model("FAQ", faqSchema);