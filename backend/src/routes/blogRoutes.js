// routes/blogRoutes.js
import express from "express";
import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  toggleFeatured,
  publishBlogPost,
  archiveBlogPost,
  getFeaturedPosts,
  getTrendingPosts,
  getRelatedPosts,
  getPostsByCategory,
  getPostsByAuthor,
  searchPosts,
  getPostStats,
  bulkDeletePosts,
  // Categories
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  // Comments
  addComment,
  getComments,
  approveComment,
  rejectComment,
  deleteComment,
  getCommentStats,
  // Likes
  toggleLike,
  // Views
  incrementViews
} from "../controllers/blogController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../../config/multer.js";

const router = express.Router();

// ==================== POST ROUTES ====================

// Public routes
router.get("/posts", getAllBlogPosts);
router.get("/posts/featured", getFeaturedPosts);
router.get("/posts/trending", getTrendingPosts);
router.get("/posts/search", searchPosts);
router.get("/posts/stats", getPostStats);
router.get("/posts/category/:category", getPostsByCategory);
router.get("/posts/author/:authorId", getPostsByAuthor);
router.get("/posts/slug/:slug", getBlogPostBySlug);
router.get("/posts/:id", getBlogPostById);
router.get("/posts/:id/related", getRelatedPosts);

// Protected routes (Admin only)
router.post(
  "/posts",
  protect,
  adminOnly,
  upload.single("featuredImage"),
  createBlogPost
);

router.put(
  "/posts/:id",
  protect,
  adminOnly,
  upload.single("featuredImage"),
  updateBlogPost
);

router.delete("/posts/:id", protect, adminOnly, deleteBlogPost);
router.delete("/posts/bulk", protect, adminOnly, bulkDeletePosts);
router.patch("/posts/:id/featured", protect, adminOnly, toggleFeatured);
router.patch("/posts/:id/publish", protect, adminOnly, publishBlogPost);
router.patch("/posts/:id/archive", protect, adminOnly, archiveBlogPost);

// Public interaction routes
router.post("/posts/:id/like", toggleLike);
router.post("/posts/:id/view", incrementViews);

// ==================== CATEGORY ROUTES ====================

router.get("/categories", getAllCategories);
router.get("/categories/:slug", getCategoryBySlug);

router.post("/categories", protect, adminOnly, createCategory);
router.put("/categories/:id", protect, adminOnly, updateCategory);
router.delete("/categories/:id", protect, adminOnly, deleteCategory);

// ==================== COMMENT ROUTES ====================

router.get("/comments/:postId", getComments);
router.post("/comments/:postId", addComment);

router.put("/comments/:id/approve", protect, adminOnly, approveComment);
router.put("/comments/:id/reject", protect, adminOnly, rejectComment);
router.delete("/comments/:id", protect, adminOnly, deleteComment);
router.get("/comments/stats", protect, adminOnly, getCommentStats);

export default router;