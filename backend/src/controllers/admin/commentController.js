// backend/src/controllers/admin/commentController.js
import mongoose from "mongoose";
import Comment from "../../models/Comment.js";
import Post from "../../models/Post.js";

/* ---------- Constants ---------- */
const VALID_STATUSES = ["pending", "approved", "spam", "deleted"];

/* ---------- Helpers ---------- */
const shapeComment = (c) => ({
  ...c,
  id: c._id?.toString?.() || c.id,
  postTitle: c.postId?.title || "Unknown",
  postSlug: c.postId?.slug || "",
  postImage: c.postId?.image || "",
});

/* ---------- GET /api/admin/blog/comments ---------- */
export const getComments = async (req, res) => {
  try {
    const { status, postId, search, sort = "newest" } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (postId && postId !== "all") filter.postId = postId;
    if (search) {
      filter.$or = [
        { authorName: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      likes: { likes: -1 },
    };

    const comments = await Comment.find(filter)
      .populate("postId", "title slug image publishedAt")
      .sort(sortMap[sort] || { createdAt: -1 })
      .lean();

    res.json({ success: true, data: comments.map(shapeComment) });
  } catch (err) {
    console.error("getComments error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- PUT /api/admin/blog/comments/:id/status ---------- */
export const updateCommentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("postId", "title slug image publishedAt")
      .lean();

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }
    res.json({ success: true, data: shapeComment(comment) });
  } catch (err) {
    console.error("updateCommentStatus error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE /api/admin/blog/comments/:id ---------- */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }
    // Keep the post's comment counter honest
    await Post.findByIdAndUpdate(comment.postId, { $inc: { comments: -1 } });
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    console.error("deleteComment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/comments/:id/reply ---------- */
export const replyToComment = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Reply body is required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    comment.replies.push({
      authorName: "Alveoly Editorial",
      authorId: req.user?._id,
      body: body.trim(),
      createdAt: new Date(),
    });
    await comment.save();

    const populated = await Comment.findById(comment._id)
      .populate("postId", "title slug image publishedAt")
      .lean();

    res.json({ success: true, data: shapeComment(populated) });
  } catch (err) {
    console.error("replyToComment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/comments/bulk-update ---------- */
export const bulkUpdateComments = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
    const result = await Comment.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    res.json({
      success: true,
      message: `${result.modifiedCount} comments updated`,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    console.error("bulkUpdateComments error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/comments/bulk-delete ---------- */
export const bulkDeleteComments = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }

    // Look up the comments first so we can decrement post counts correctly
    const comments = await Comment.find({ _id: { $in: ids } })
      .select("postId")
      .lean();

    await Comment.deleteMany({ _id: { $in: ids } });

    // Decrement each affected post's comment counter
    const countsByPost = new Map();
    comments.forEach((c) => {
      const key = String(c.postId);
      countsByPost.set(key, (countsByPost.get(key) || 0) + 1);
    });
    await Promise.all(
      [...countsByPost.entries()].map(([postId, n]) =>
        Post.findByIdAndUpdate(postId, { $inc: { comments: -n } })
      )
    );

    res.json({
      success: true,
      message: `${comments.length} comments deleted`,
    });
  } catch (err) {
    console.error("bulkDeleteComments error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Public: POST /api/blog/posts/:id/comments ---------- */
export const addComment = async (req, res) => {
  try {
    const { content, authorName, authorEmail } = req.body;
    if (!content || !content.trim() || !authorName || !authorName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and comment text are required.",
      });
    }

    const comment = await Comment.create({
      postId: req.params.id,
      authorName: authorName.trim(),
      authorEmail: (authorEmail || "").trim(),
      body: content.trim(),
      status: "pending",
    });

    await Post.findByIdAndUpdate(req.params.id, { $inc: { comments: 1 } });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    console.error("addComment error:", err);
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fields: Object.keys(err.errors).reduce((a, k) => {
          a[k] = err.errors[k].message;
          return a;
        }, {}),
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};