// backend/src/routes/blogRoutes.js - Add upload endpoints
import express from "express";
import {
  createBlog,
  getBlogs,
  getPublicBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike,
  submitQuiz,
  addComment,
  getRelatedBlogs,
  getBlogStats,
  uploadFeaturedImage,
  uploadGalleryImages,
  deleteImage
} from "../controllers/blogController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { upload, uploadImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.get("/public", getPublicBlogs);
router.get("/public/:slug", getBlogBySlug);
router.get("/public/:slug/related", getRelatedBlogs);
router.post("/public/:slug/like", toggleLike);
router.post("/public/:slug/quiz", submitQuiz);
router.post("/public/:slug/comment", addComment);

// ================= PROTECTED ROUTES =================
router.get("/", protect, adminOnly, getBlogs);
router.get("/stats", protect, adminOnly, getBlogStats);
router.get("/:id", protect, adminOnly, getBlogById);
router.post("/", protect, adminOnly, createBlog);
router.put("/:id", protect, adminOnly, updateBlog);
router.delete("/:id", protect, adminOnly, deleteBlog);

// ================= IMAGE UPLOAD ROUTES =================
router.post(
  "/upload/featured",
  protect,
  adminOnly,
  upload.single("image"),
  uploadFeaturedImage
);

router.post(
  "/upload/gallery",
  protect,
  adminOnly,
  uploadImages.array("images", 10),
  uploadGalleryImages
);

router.delete(
  "/image/:publicId",
  protect,
  adminOnly,
  deleteImage
);

export default router;