// backend/src/routes/blogRoutes.js - Add new routes
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
  checkUserLiked,
  submitQuiz,
  addComment,
  getApprovedComments,
  getPendingComments,
  approveComment,
  deleteComment,
  getRelatedBlogs,
  getBlogStats,
  uploadFeaturedImage,
  uploadGalleryImages,
  deleteImage,
  subscribeNewsletter,
  getSubscribers,
  unsubscribeNewsletter
} from "../controllers/blogController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.get("/public", getPublicBlogs);
router.get("/public/:slug", getBlogBySlug);
router.get("/public/:slug/related", getRelatedBlogs);
router.get("/public/:slug/comments", getApprovedComments);
router.post("/public/:slug/like", toggleLike);
router.get("/public/:slug/liked", checkUserLiked);
router.post("/public/:slug/quiz", submitQuiz);
router.get("/quiz-results", protect, adminOnly, getAllQuizResults);
router.post("/public/:slug/comment", addComment);
router.post("/subscribe", subscribeNewsletter);
router.post("/unsubscribe/:email", unsubscribeNewsletter);

// ================= PROTECTED ROUTES (Admin Only) =================
router.get("/", protect, adminOnly, getBlogs);
router.get("/stats", protect, adminOnly, getBlogStats);
router.get("/comments/pending", protect, adminOnly, getPendingComments);
router.get("/subscribers", protect, adminOnly, getSubscribers);
router.get("/:id", protect, adminOnly, getBlogById);
router.post("/", protect, adminOnly, createBlog);
router.put("/:id", protect, adminOnly, updateBlog);
router.delete("/:id", protect, adminOnly, deleteBlog);
router.put("/:blogId/comments/:commentId/approve", protect, adminOnly, approveComment);
router.delete("/:blogId/comments/:commentId", protect, adminOnly, deleteComment);

// ================= IMAGE UPLOAD ROUTES =================
router.post("/upload/featured", protect, adminOnly, upload.single("image"), uploadFeaturedImage);
router.post("/upload/gallery", protect, adminOnly, upload.array("images", 10), uploadGalleryImages);
router.delete("/image/:publicId", protect, adminOnly, deleteImage);

export default router;