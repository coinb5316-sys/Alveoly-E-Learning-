// backend/src/models/QAModel.js
import mongoose from "mongoose";

const qaSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
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
    default: "general"
  },
  priority: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

qaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("QA", qaSchema);