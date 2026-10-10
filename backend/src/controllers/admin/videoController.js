// backend/src/controllers/admin/videoController.js
import mongoose from "mongoose";
import Video from "../../models/Video.js";

/* ---------- Helpers ---------- */
const parseBool = (val, fallback) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
};

/* Build a payload from req.body.
   Pass `partial = true` on update so we don't overwrite fields the
   client didn't send. */
const buildVideoPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (body.youtubeId !== undefined) {
    payload.youtubeId = String(body.youtubeId).trim();
  }
  if (body.title !== undefined) {
    payload.title = typeof body.title === "string" ? body.title.trim() : body.title;
  }
  if (body.description !== undefined) {
    payload.description = (body.description || "").trim();
  }
  if (body.duration !== undefined) {
    payload.duration = (body.duration || "").trim();
  }
  if (body.category !== undefined) {
    payload.category = (body.category || "").trim();
  }
  if (body.featured !== undefined) {
    payload.featured = parseBool(body.featured, false);
  }
  if (body.status !== undefined) {
    payload.status = body.status;
  }
  if (body.publishedAt !== undefined) {
    const d = new Date(body.publishedAt);
    if (!Number.isNaN(d.getTime())) payload.publishedAt = d;
  }

  // On create, apply schema defaults for anything not provided.
  if (!partial) {
    if (payload.status === undefined) payload.status = "draft";
    if (payload.featured === undefined) payload.featured = false;
  }

  return payload;
};

/* ---------- GET list ---------- */
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ publishedAt: -1 }).lean();
    res.json({ success: true, data: videos });
  } catch (err) {
    console.error("getVideos error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- GET by id ---------- */
export const getVideoById = async (req, res) => {
  try {
    const v = await Video.findById(req.params.id).lean();
    if (!v) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    res.json({ success: true, data: v });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST create ---------- */
export const createVideo = async (req, res) => {
  try {
    const payload = buildVideoPayload(req.body);

    // Required-field validation
    const missing = [];
    if (!payload.youtubeId) missing.push("youtubeId");
    if (!payload.title) missing.push("title");
    if (!payload.duration) missing.push("duration");
    if (!payload.category) missing.push("category");
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
        fields: missing,
      });
    }

    const video = await Video.create(payload);
    return res.status(201).json({ success: true, data: video });
  } catch (err) {
    console.error("createVideo error:", err);

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
      return res.status(409).json({
        success: false,
        message: "A video with that YouTube ID already exists.",
        keyValue: err.keyValue,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/* ---------- PUT update ---------- */
export const updateVideo = async (req, res) => {
  try {
    const payload = buildVideoPayload(req.body, { partial: true });

    const video = await Video.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    res.json({ success: true, data: video });
  } catch (err) {
    console.error("updateVideo error:", err);

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
      return res.status(409).json({
        success: false,
        message: "A video with that YouTube ID already exists.",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE ---------- */
export const deleteVideo = async (req, res) => {
  try {
    const v = await Video.findByIdAndDelete(req.params.id);
    if (!v) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    res.json({ success: true, message: "Video removed" });
  } catch (err) {
    console.error("deleteVideo error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};