// routes/adminBlogRoutes.js - FULLY FIXED
import express from "express";
import {
  // Posts - from blogController
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  toggleFeatured,
  publishBlogPost,
  archiveBlogPost,
  bulkDeletePosts,
  // Categories - from blogController
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  // Comments - from blogController (these exist there)
  getComments,
  approveComment,
  rejectComment,
  deleteComment,
  getCommentStats,
} from "../controllers/blogController.js";

import {
  // Authors - from adminBlogController
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  // Tags - from adminBlogController
  getAllTags,
  getTagBySlug,
  updateTag,
  deleteTag,
  createTag
} from "../controllers/adminBlogController.js";

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
router.get("/authors/:id", getAuthorById);
router.put("/authors/:id", updateAuthor);
router.delete("/authors/:id", deleteAuthor);

// ==================== TAG MANAGEMENT ====================
router.get("/tags", getAllTags);
router.get("/tags/:slug", getTagBySlug);
router.post("/tags", createTag);
router.put("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

export default router;