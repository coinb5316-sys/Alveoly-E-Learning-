import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: String,
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
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);