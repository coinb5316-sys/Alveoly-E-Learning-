// backend/src/controllers/admin/testimonialController.js
import mongoose from "mongoose";
import Testimonial from "../../models/Testimonial2.js";

/* ---------- Constants ---------- */
const VALID_STATUSES = ["pending", "approved", "hidden"];

/* ---------- Helpers ---------- */
const parseBool = (val, fallback = false) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
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
      /* fall through */
    }
  }
  return String(val)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const buildTestimonialPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (body.author !== undefined) {
    payload.author = typeof body.author === "string" ? body.author.trim() : body.author;
  }
  if (body.role !== undefined) {
    payload.role = (body.role || "").trim();
  }
  if (body.avatar !== undefined) {
    payload.avatar = (body.avatar || "").trim();
  }
  if (body.email !== undefined) {
    payload.email = (body.email || "").trim().toLowerCase();
  }
  if (body.body !== undefined) {
    payload.body = (body.body || "").trim();
  }
  if (body.source !== undefined) {
    // Empty string means "no source" → null
    payload.source = body.source ? body.source : null;
  }
  if (body.sourceLabel !== undefined) {
    payload.sourceLabel = (body.sourceLabel || "").trim();
  }
  if (body.status !== undefined && VALID_STATUSES.includes(body.status)) {
    payload.status = body.status;
  }
  if (body.featured !== undefined) {
    payload.featured = parseBool(body.featured, false);
  }
  if (body.pinned !== undefined) {
    payload.pinned = parseBool(body.pinned, false);
  }
  if (body.tags !== undefined) {
    payload.tags = toArray(body.tags);
  }

  if (!partial) {
    if (payload.status === undefined) payload.status = "pending";
    if (payload.featured === undefined) payload.featured = false;
    if (payload.pinned === undefined) payload.pinned = false;
  }

  return payload;
};

/* ---------- GET /api/admin/blog/testimonials ---------- */
export const getTestimonials = async (req, res) => {
  try {
    const { status, featured, sort = "newest" } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (featured === "true") filter.featured = true;

    // Always pinned-first, then by chosen sort
    const sortMap = {
      newest: { pinned: -1, createdAt: -1 },
      oldest: { pinned: -1, createdAt: 1 },
      name: { pinned: -1, author: 1 },
    };

    const list = await Testimonial.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .lean();

    res.json({ success: true, data: list });
  } catch (err) {
    console.error("getTestimonials error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/testimonials ---------- */
export const createTestimonial = async (req, res) => {
  try {
    const payload = buildTestimonialPayload(req.body);

    if (!payload.author) {
      return res
        .status(400)
        .json({ success: false, message: "Author name is required." });
    }
    if (!payload.body) {
      return res
        .status(400)
        .json({ success: false, message: "Testimonial text is required." });
    }
    if (payload.body.length > 400) {
      return res
        .status(400)
        .json({ success: false, message: "Keep the quote under 400 characters." });
    }

    const t = await Testimonial.create(payload);
    res.status(201).json({ success: true, data: t });
  } catch (err) {
    console.error("createTestimonial error:", err);

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
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: `Cast error on '${err.path}': ${err.message}`,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/* ---------- PUT /api/admin/blog/testimonials/:id ---------- */
export const updateTestimonial = async (req, res) => {
  try {
    const payload = buildTestimonialPayload(req.body, { partial: true });

    if (payload.body && payload.body.length > 400) {
      return res
        .status(400)
        .json({ success: false, message: "Keep the quote under 400 characters." });
    }

    const t = await Testimonial.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!t) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, data: t });
  } catch (err) {
    console.error("updateTestimonial error:", err);

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
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: `Cast error on '${err.path}': ${err.message}`,
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE /api/admin/blog/testimonials/:id ---------- */
export const deleteTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id);
    if (!t) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    console.error("deleteTestimonial error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Public: GET /api/blog/testimonials/featured ---------- */
export const getFeaturedTestimonials = async (req, res) => {
  try {
    const list = await Testimonial.find({
      status: "approved",
      featured: true,
    })
      .sort({ pinned: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ success: true, data: list });
  } catch (err) {
    console.error("getFeaturedTestimonials error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};