// backend/src/controllers/admin/authorController.js
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
  role: body.role || "",
  credentials: body.credentials || "",
  bio: body.bio || "",
  email: (body.email || "").toLowerCase(),
  avatar: body.avatar || "",
  active: parseBool(body.active, true),
  specialties: toArray(body.specialties),
  social: parseJSON(body.social, {}),
});

/* ---------- GET /api/admin/blog/authors ---------- */
export const getAuthors = async (req, res) => {
  try {
    const authors = await Author.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: authors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- GET /api/admin/blog/authors/for-select ---------- */
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

/* ---------- GET /api/admin/blog/authors/:id ---------- */
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

/* ---------- POST /api/admin/blog/authors ---------- */
export const createAuthor = async (req, res) => {
  try {
    const payload = buildAuthorPayload(req.body);

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "blog/authors",
      });
      payload.avatar = result.secure_url;
    }

    const author = await Author.create(payload);
    res.status(201).json({ success: true, data: author });
  } catch (err) {
    console.error("createAuthor error:", err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Slug already in use" });
    }
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- PUT /api/admin/blog/authors/:id ---------- */
export const updateAuthor = async (req, res) => {
  try {
    const payload = buildAuthorPayload(req.body);

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
    console.error("updateAuthor error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE /api/admin/blog/authors/:id ---------- */
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