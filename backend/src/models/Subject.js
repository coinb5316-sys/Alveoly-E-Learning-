// models/Subject.js
import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    studentsUnlocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    topics: [topicSchema], // Add topics array
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);