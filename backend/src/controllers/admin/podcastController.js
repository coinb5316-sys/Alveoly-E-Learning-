// backend/src/controllers/admin/podcastController.js
import mongoose from "mongoose";
import Podcast from "../../models/Podcast.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

/* ---------- Helpers ---------- */
const parseBool = (val, fallback) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
};

const parseNumber = (val, fallback = undefined) => {
  if (val === undefined || val === null || val === "") return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

const toArray = (val) => {
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  if (!val) return [];
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed)
        ? parsed.map((s) => String(s).trim()).filter(Boolean)
        : [];
    } catch {
      /* fall through to comma-split */
    }
  }
  return String(val)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

/* Build a payload from req.body.
   Pass `partial = true` on updates so we don't overwrite fields the
   client didn't send. */
const buildPodcastPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (body.title !== undefined) {
    payload.title = typeof body.title === "string" ? body.title.trim() : body.title;
  }
  if (body.description !== undefined) {
    payload.description = (body.description || "").trim();
  }
  if (body.audioUrl !== undefined) {
    payload.audioUrl = (body.audioUrl || "").trim();
  }
  if (body.duration !== undefined) {
    payload.duration = (body.duration || "").trim();
  }
  if (body.image !== undefined) {
    payload.image = (body.image || "").trim();
  }
  if (body.guests !== undefined) {
    payload.guests = toArray(body.guests);
  }
  if (body.episodeNumber !== undefined) {
    const n = parseNumber(body.episodeNumber);
    if (n !== undefined) payload.episodeNumber = n;
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

  // If nothing was sent for create, use the schema defaults.
  if (!partial) {
    if (payload.status === undefined) payload.status = "draft";
    if (payload.featured === undefined) payload.featured = false;
  }

  return payload;
};

/* ---------- GET list ---------- */
export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find().sort({ episodeNumber: -1 }).lean();
    res.json({ success: true, data: podcasts });
  } catch (err) {
    console.error("getPodcasts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- GET by id ---------- */
export const getPodcastById = async (req, res) => {
  try {
    const pod = await Podcast.findById(req.params.id).lean();
    if (!pod) {
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });
    }
    res.json({ success: true, data: pod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST create ---------- */
export const createPodcast = async (req, res) => {
  try {
    const payload = buildPodcastPayload(req.body);

    // Required-field validation
    const missing = [];
    if (!payload.title) missing.push("title");
    if (!payload.audioUrl) missing.push("audioUrl");
    if (!payload.duration) missing.push("duration");
    if (payload.episodeNumber === undefined) missing.push("episodeNumber");
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
        fields: missing,
      });
    }

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "blog/podcasts",
        });
        payload.image = result.secure_url;
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr);
        return res.status(502).json({
          success: false,
          message: `Cloudinary upload failed: ${cloudErr.message || cloudErr}`,
        });
      }
    }

    const pod = await Podcast.create(payload);
    return res.status(201).json({ success: true, data: pod });
  } catch (err) {
    console.error("createPodcast error:", err);

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
        message: "That episode number is already used.",
        keyValue: err.keyValue,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/* ---------- PUT update ---------- */
export const updatePodcast = async (req, res) => {
  try {
    const payload = buildPodcastPayload(req.body, { partial: true });

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "blog/podcasts",
        });
        payload.image = result.secure_url;
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr);
        return res.status(502).json({
          success: false,
          message: `Cloudinary upload failed: ${cloudErr.message || cloudErr}`,
        });
      }
    }

    const pod = await Podcast.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!pod) {
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });
    }
    res.json({ success: true, data: pod });
  } catch (err) {
    console.error("updatePodcast error:", err);

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
        .json({ success: false, message: "That episode number is already used." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE ---------- */
export const deletePodcast = async (req, res) => {
  try {
    const pod = await Podcast.findByIdAndDelete(req.params.id);
    if (!pod) {
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });
    }
    res.json({ success: true, message: "Episode deleted" });
  } catch (err) {
    console.error("deletePodcast error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};