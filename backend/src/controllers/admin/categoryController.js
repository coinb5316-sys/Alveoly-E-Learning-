// server/controllers/admin/categoryController.js
import Category from "../../models/Category.js";
import Post from "../../models/Post.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id).lean();
    if (!cat)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "blog/categories",
      });
      payload.image = result.secure_url;
    }
    const cat = await Category.create(payload);
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Slug already in use" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "blog/categories",
      });
      payload.image = result.secure_url;
    }
    const cat = await Category.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!cat)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    // Block deletion if posts reference this category
    const postCount = await Post.countDocuments({ categoryId: req.params.id });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `${postCount} stories use this category. Reassign them first.`,
      });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};