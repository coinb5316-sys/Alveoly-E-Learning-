// backend/src/controllers/admin/categoryController.js
import mongoose from "mongoose";
import Category from "../../models/Category.js";
import Post from "../../models/Post.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

/* ---------- Helpers ---------- */
const parseBool = (val, fallback = true) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
};

const parseNumber = (val, fallback = 0) => {
  if (val === undefined || val === null || val === "") return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

const buildCategoryPayload = (body) => ({
  name: typeof body.name === "string" ? body.name.trim() : body.name,
  slug: typeof body.slug === "string" ? body.slug.trim().toLowerCase() : undefined,
  description: (body.description || "").trim(),
  image: typeof body.image === "string" ? body.image.trim() : "",
  icon: (body.icon || "folder").trim() || "folder",
  color: (body.color || "").trim(),
  order: parseNumber(body.order, 0),
  active: parseBool(body.active, true),
});

/* ---------- GET list ---------- */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1, name: 1 })
      .lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- GET by id ---------- */
export const getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id).lean();
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST create ---------- */
export const createCategory = async (req, res) => {
  try {
    const payload = buildCategoryPayload(req.body);

    if (!payload.name || !payload.name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "blog/categories",
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

    const cat = await Category.create(payload);
    return res.status(201).json({ success: true, data: cat });
  } catch (err) {
    console.error("createCategory error:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fields: Object.keys(err.errors).reduce((acc, k) => {
          acc[k] = err.errors[k].message;
          return acc;
        }, {}),
      });
    }
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: `Cast error on '${err.path}': ${err.message}`,
      });
    }
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Slug already in use." });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/* ---------- PUT update ---------- */
export const updateCategory = async (req, res) => {
  try {
    const payload = buildCategoryPayload(req.body);
    // Don't let the user accidentally clobber slug to undefined
    if (!payload.slug) delete payload.slug;

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "blog/categories",
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

    const cat = await Category.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: cat });
  } catch (err) {
    console.error("updateCategory error:", err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Slug already in use." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE ---------- */
export const deleteCategory = async (req, res) => {
  try {
    const postCount = await Post.countDocuments({
      categoryId: req.params.id,
    });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `${postCount} stories use this category. Reassign them first.`,
      });
    }
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};