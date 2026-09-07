// routes/blogRoutes.js - COMPLETE FIXED
import express from "express";
import {
  // Posts
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
  // Likes/Views
  toggleLike,
  incrementViews
} from "../controllers/blogController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../../config/multer.js";

const router = express.Router();

// ==================== POST ROUTES - PUBLIC ====================
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

// ==================== INTERACTION ROUTES - PUBLIC ====================
router.post("/posts/:id/like", toggleLike);
router.post("/posts/:id/view", incrementViews);

// ==================== CATEGORY ROUTES - PUBLIC ====================
router.get("/categories", getAllCategories);
router.get("/categories/:slug", getCategoryBySlug);

// ==================== COMMENT ROUTES - PUBLIC ====================
router.get("/comments/:postId", getComments);
router.post("/comments/:postId", addComment);

// ==================== ADMIN ROUTES - PROTECTED ====================
// These are also available through /admin/blog but kept here for backward compatibility
router.post("/admin/posts", protect, adminOnly, upload.single("featuredImage"), createBlogPost);
router.put("/admin/posts/:id", protect, adminOnly, upload.single("featuredImage"), updateBlogPost);
router.delete("/admin/posts/:id", protect, adminOnly, deleteBlogPost);
router.delete("/admin/posts/bulk", protect, adminOnly, bulkDeletePosts);
router.patch("/admin/posts/:id/featured", protect, adminOnly, toggleFeatured);
router.patch("/admin/posts/:id/publish", protect, adminOnly, publishBlogPost);
router.patch("/admin/posts/:id/archive", protect, adminOnly, archiveBlogPost);

// Admin category routes
router.post("/admin/categories", protect, adminOnly, createCategory);
router.put("/admin/categories/:id", protect, adminOnly, updateCategory);
router.delete("/admin/categories/:id", protect, adminOnly, deleteCategory);

// Admin comment routes
router.put("/admin/comments/:id/approve", protect, adminOnly, approveComment);
router.put("/admin/comments/:id/reject", protect, adminOnly, rejectComment);
router.delete("/admin/comments/:id", protect, adminOnly, deleteComment);
router.get("/admin/comments/stats", protect, adminOnly, getCommentStats);

export default router;