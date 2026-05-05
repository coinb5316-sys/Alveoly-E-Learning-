// routes/testimonialRoutes.js
import express from "express";
import {
  createTestimonial,
  getTestimonials,
  getMyTestimonials,
  approveTestimonial,
  rejectTestimonial,
  getPendingTestimonials,
  getAllTestimonials,
  deleteTestimonial,
  getTestimonialStats
} from "../controllers/testimonialController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getTestimonials);

// Protected routes (student only)
router.post("/", protect, createTestimonial);
router.get("/my", protect, getMyTestimonials);

// Admin only routes
router.get("/pending", protect, adminOnly, getPendingTestimonials);
router.get("/all", protect, adminOnly, getAllTestimonials);
router.get("/stats", protect, adminOnly, getTestimonialStats);
router.patch("/:id/approve", protect, adminOnly, approveTestimonial);
router.patch("/:id/reject", protect, adminOnly, rejectTestimonial);
router.delete("/:id", protect, adminOnly, deleteTestimonial);

export default router;