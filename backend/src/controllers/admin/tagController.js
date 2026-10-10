// server/controllers/admin/tagController.js
import Tag from "../../models/Tag.js";
import Post from "../../models/Post.js";

export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 }).lean();

    // Attach live usage counts from posts
    const usage = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);
    const usageMap = new Map(usage.map((u) => [u._id.toLowerCase(), u.count]));

    const withCounts = tags.map((t) => ({
      ...t,
      postCount: usageMap.get(t.name.toLowerCase()) || 0,
    }));

    res.json({ success: true, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTag = async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json({ success: true, data: tag });
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Tag already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tag)
      return res
        .status(404)
        .json({ success: false, message: "Tag not found" });
    res.json({ success: true, data: tag });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Tag deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/blog/tags/:id/merge
export const mergeTag = async (req, res) => {
  try {
    const { sourceId, targetId } = req.body;
    const source = await Tag.findById(sourceId);
    const target = await Tag.findById(targetId);

    if (!source || !target) {
      return res
        .status(404)
        .json({ success: false, message: "Tag not found" });
    }

    // Replace source tag with target tag across all posts
    await Post.updateMany(
      { tags: source.name },
      { $set: { "tags.$[el]": target.name } },
      { arrayFilters: [{ el: source.name }] }
    );

    // Remove duplicates that may have resulted
    await Post.updateMany(
      { tags: { $all: [source.name, target.name] } },
      { $pull: { tags: source.name } }
    );

    // Delete the source tag
    await Tag.findByIdAndDelete(sourceId);

    res.json({
      success: true,
      message: `Merged #${source.name} into #${target.name}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};