// routes/adminBlogRoutes.js - COMPLETE FIXED
import express from "express";
import {
  // Posts
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  toggleFeatured,
  publishBlogPost,
  archiveBlogPost,
  bulkDeletePosts,
  getPostStats,
  getPostsByCategory,
  getPostsByAuthor,
  // Categories
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  // Comments
  getComments,
  approveComment,
  rejectComment,
  deleteComment,
  getCommentStats
} from "../controllers/blogController.js";

import {
  // Authors
  getAllAuthors,
  getAuthorById,
  getAuthorBySlug,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorStats,
  getAuthorsForSelect
} from "../controllers/adminAuthorController.js";

import {
  // Tags
  getAllTags,
  getTagById,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
  getTagStats
} from "../controllers/adminTagController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../../config/multer.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// ==================== POST MANAGEMENT ====================
router.get("/posts", getAllBlogPosts);
router.get("/posts/:id", getBlogPostById);
router.post("/posts", upload.single("featuredImage"), createBlogPost);
router.put("/posts/:id", upload.single("featuredImage"), updateBlogPost);
router.delete("/posts/:id", deleteBlogPost);
router.delete("/posts/bulk", bulkDeletePosts);
router.patch("/posts/:id/featured", toggleFeatured);
router.patch("/posts/:id/publish", publishBlogPost);
router.patch("/posts/:id/archive", archiveBlogPost);
router.get("/posts/stats", getPostStats);
router.get("/posts/category/:category", getPostsByCategory);
router.get("/posts/author/:authorId", getPostsByAuthor);

// ==================== CATEGORY MANAGEMENT ====================
router.get("/categories", getAllCategories);
router.get("/categories/:slug", getCategoryBySlug);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// ==================== COMMENT MANAGEMENT ====================
router.get("/comments", getComments);
router.get("/comments/stats", getCommentStats);
router.put("/comments/:id/approve", approveComment);
router.put("/comments/:id/reject", rejectComment);
router.delete("/comments/:id", deleteComment);

// ==================== AUTHOR MANAGEMENT ====================
router.get("/authors", getAllAuthors);
router.get("/authors/select", getAuthorsForSelect);
router.get("/authors/stats", getAuthorStats);
router.get("/authors/:id", getAuthorById);
router.get("/authors/slug/:slug", getAuthorBySlug);
router.post("/authors", createAuthor);
router.put("/authors/:id", updateAuthor);
router.delete("/authors/:id", deleteAuthor);

// ==================== TAG MANAGEMENT ====================
router.get("/tags", getAllTags);
router.get("/tags/stats", getTagStats);
router.get("/tags/:id", getTagById);
router.get("/tags/slug/:slug", getTagBySlug);
router.post("/tags", createTag);
router.put("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

export default router;