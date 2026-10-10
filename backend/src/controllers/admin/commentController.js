// server/controllers/admin/commentController.js
import Comment from "../../models/Comment.js";
import Post from "../../models/Post.js";

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

    const shaped = comments.map((c) => ({
      ...c,
      postTitle: c.postId?.title || "Unknown",
      postSlug: c.postId?.slug || "",
      postImage: c.postId?.image || "",
    }));

    res.json({ success: true, data: shaped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCommentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }
    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { body } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }
    comment.replies.push({
      authorName: "Alveoly Editorial",
      authorId: req.user._id,
      body,
      createdAt: new Date(),
    });
    await comment.save();
    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkUpdateComments = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids?.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }
    await Comment.updateMany({ _id: { $in: ids } }, { $set: { status } });
    res.json({ success: true, message: `${ids.length} comments updated` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkDeleteComments = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }
    await Comment.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} comments deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Public ---------- */
export const addComment = async (req, res) => {
  try {
    const { content, authorName, authorEmail } = req.body;
    const comment = await Comment.create({
      postId: req.params.id,
      authorName,
      authorEmail,
      body: content,
      status: "pending",
    });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { comments: 1 } });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
