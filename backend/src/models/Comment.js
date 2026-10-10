// server/models/Comment.js
import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    authorName: { type: String, required: true },
    authorEmail: { type: String, default: "" },
    authorRole: { type: String, default: "" },
    authorAvatar: { type: String, default: "" },
    body: { type: String, required: true, maxlength: 2000 },

    status: {
      type: String,
      enum: ["pending", "approved", "spam", "deleted"],
      default: "pending",
      index: true,
    },
    flag: { type: String, default: null },

    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
  },
  { timestamps: true }
);

commentSchema.index({ createdAt: -1 });

export default mongoose.model("Comment", commentSchema);