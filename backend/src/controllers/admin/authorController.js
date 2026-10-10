// backend/src/controllers/admin/authorController.js
import mongoose from "mongoose";
import Author from "../../models/Author.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

/* ---------- Helpers ---------- */
const parseJSON = (val, fallback) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val !== "string") return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

const parseBool = (val, fallback = true) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
};

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try { return JSON.parse(val); } catch { /* fall through */ }
  }
  return String(val).split(",").map((s) => s.trim()).filter(Boolean);
};

const buildAuthorPayload = (body) => ({
  name: typeof body.name === "string" ? body.name.trim() : body.name,
  role: (body.role || "").trim(),
  credentials: (body.credentials || "").trim(),
  bio: (body.bio || "").trim(),
  email: (body.email || "").trim().toLowerCase(),
  avatar: typeof body.avatar === "string" ? body.avatar.trim() : "",
  active: parseBool(body.active, true),
  specialties: toArray(body.specialties),
  social: parseJSON(body.social, {}),
});

/* ---------- GET handlers (unchanged) ---------- */
export const getAuthors = async (req, res) => {
  try {
    const authors = await Author.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: authors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAuthorsForSelect = async (req, res) => {
  try {
    const authors = await Author.find({ active: true })
      .select("_id name email title role avatar credentials bio specialties social")
      .sort({ name: 1 })
      .lean();
    res.json({ success: true, data: authors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id).lean();
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.json({ success: true, data: author });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST ---------- */
export const createAuthor = async (req, res) => {
  console.log("createAuthor body:", req.body);
  console.log("createAuthor file:", req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  } : "none");

  try {
    const payload = buildAuthorPayload(req.body);

    if (!payload.name || !payload.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
        received: req.body,
      });
    }

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "blog/authors",
        });
        payload.avatar = result.secure_url;
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr);
        return res.status(502).json({
          success: false,
          message: `Cloudinary upload failed: ${cloudErr.message || cloudErr}`,
        });
      }
    }

    const author = await Author.create(payload);
    return res.status(201).json({ success: true, data: author });
  } catch (err) {
    console.error("createAuthor error:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      const fields = Object.keys(err.errors).reduce((acc, k) => {
        acc[k] = err.errors[k].message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fields,
      });
    }

    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: `Cast error on '${err.path}': ${err.message}`,
        value: err.value,
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

    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
      name: err.name,
    });
  }
};

/* ---------- PUT ---------- */
export const updateAuthor = async (req, res) => {
  try {
    const payload = buildAuthorPayload(req.body);

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "blog/authors",
        });
        payload.avatar = result.secure_url;
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr);
        return res.status(502).json({
          success: false,
          message: `Cloudinary upload failed: ${cloudErr.message || cloudErr}`,
        });
      }
    }

    const author = await Author.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.json({ success: true, data: author });
  } catch (err) {
    console.error("updateAuthor error:", err);

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
        message: "Duplicate slug.",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE ---------- */
export const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    res.json({ success: true, message: "Author deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};