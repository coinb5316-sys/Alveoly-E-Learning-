// backend/src/controllers/admin/tagController.js
import mongoose from "mongoose";
import Tag from "../../models/Tag.js";
import Post from "../../models/Post.js";

/* ---------- Helpers ---------- */
const parseBool = (val, fallback = false) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
};

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const buildTagPayload = (body) => {
  const name = typeof body.name === "string" ? body.name.trim() : body.name;
  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug)
      : name
      ? slugify(name)
      : undefined;

  return {
    name,
    slug,
    description: (body.description || "").trim(),
    featured: parseBool(body.featured, false),
  };
};

/* ---------- GET /api/admin/blog/tags ---------- */
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 }).lean();

    // Attach live usage counts from posts
    const usage = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);
    const usageMap = new Map(
      usage.map((u) => [String(u._id).toLowerCase(), u.count])
    );

    const withCounts = tags.map((t) => ({
      ...t,
      postCount: usageMap.get(t.name.toLowerCase()) || 0,
    }));

    res.json({ success: true, data: withCounts });
  } catch (err) {
    console.error("getTags error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/tags ---------- */
export const createTag = async (req, res) => {
  try {
    const payload = buildTagPayload(req.body);
    if (!payload.name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    const tag = await Tag.create(payload);
    return res.status(201).json({ success: true, data: tag });
  } catch (err) {
    console.error("createTag error:", err);

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
    if (err.code === 11000) {
      const key = Object.keys(err.keyPattern || {}).join(", ") || "field";
      return res.status(409).json({
        success: false,
        message: `Duplicate value for ${key}.`,
        keyValue: err.keyValue,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/* ---------- PUT /api/admin/blog/tags/:id ---------- */
export const updateTag = async (req, res) => {
  try {
    const payload = buildTagPayload(req.body);
    // Don't overwrite existing slug with undefined
    if (!payload.slug) delete payload.slug;

    const tag = await Tag.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!tag) {
      return res
        .status(404)
        .json({ success: false, message: "Tag not found" });
    }
    res.json({ success: true, data: tag });
  } catch (err) {
    console.error("updateTag error:", err);

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
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Duplicate tag name or slug." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE /api/admin/blog/tags/:id ---------- */
export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res
        .status(404)
        .json({ success: false, message: "Tag not found" });
    }
    // Also strip this tag from any posts that carry it
    await Post.updateMany({ tags: tag.name }, { $pull: { tags: tag.name } });
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Tag deleted" });
  } catch (err) {
    console.error("deleteTag error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/tags/merge ---------- */
export const mergeTag = async (req, res) => {
  try {
    const { sourceId, targetId } = req.body;
    if (!sourceId || !targetId) {
      return res.status(400).json({
        success: false,
        message: "sourceId and targetId are required.",
      });
    }
    if (sourceId === targetId) {
      return res.status(400).json({
        success: false,
        message: "Cannot merge a tag into itself.",
      });
    }

    const source = await Tag.findById(sourceId);
    const target = await Tag.findById(targetId);
    if (!source || !target) {
      return res
        .status(404)
        .json({ success: false, message: "Source or target tag not found." });
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
    console.error("mergeTag error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};