// backend/src/controllers/admin/authorController.js
import Author from "../../models/Author.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

/* Helpers ---------------------------------------------------- */
const parseJSON = (val, fallback) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val !== "string") return val;          // already object/array
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
  // Handle '["a","b"]' AND "a,b"
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try { return JSON.parse(val); } catch { /* fall through */ }
  }
  return String(val).split(",").map((s) => s.trim()).filter(Boolean);
};

/* Build a clean payload from req.body ------------------------ */
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

/* GET /api/admin/blog/authors */
export const getAuthors = async (req, res) => { /* unchanged */ };

/* GET for-select / by id — unchanged */

/* POST /api/admin/blog/authors */
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
    console.error("createAuthor error:", err);   // ← log the real error
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

/* PUT — same payload builder */
export const updateAuthor = async (req, res) => {
  try {
    const payload = buildAuthorPayload(req.body);

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "blog/authors",
      });
      payload.avatar = result.secure_url;
    }

    // Don't wipe fields the client didn't send
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "" && (k === "avatar" || k === "role" || k === "bio")) {
        // allow clearing these, so leave them
      }
    });

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

/* deleteAuthor — unchanged */

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