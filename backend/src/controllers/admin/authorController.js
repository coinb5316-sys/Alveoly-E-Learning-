// server/controllers/admin/authorController.js
import Author from "../../models/Author.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

// GET /api/admin/blog/authors
export const getAuthors = async (req, res) => {
  try {
    const authors = await Author.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: authors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/blog/authors/for-select
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

// GET /api/admin/blog/authors/:id
export const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id).lean();
    if (!author) {
      return res
        .status(404)
        .json({ success: false, message: "Author not found" });
    }
    res.json({ success: true, data: author });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/blog/authors
export const createAuthor = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Handle avatar upload if a file was sent
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "blog/authors",
      });
      payload.avatar = result.secure_url;
    }

    const author = await Author.create(payload);
    res.status(201).json({ success: true, data: author });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Slug already in use" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/blog/authors/:id
export const updateAuthor = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "blog/authors",
      });
      payload.avatar = result.secure_url;
    }

    const author = await Author.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!author) {
      return res
        .status(404)
        .json({ success: false, message: "Author not found" });
    }
    res.json({ success: true, data: author });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/blog/authors/:id
export const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res
        .status(404)
        .json({ success: false, message: "Author not found" });
    }
    res.json({ success: true, message: "Author deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};