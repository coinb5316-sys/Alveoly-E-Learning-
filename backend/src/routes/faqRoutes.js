// backend/src/routes/faqRoutes.js
import express from "express";
import {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  searchFAQs,
  markHelpful
} from "../controllers/faqController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllFAQs);
router.get("/search", searchFAQs);
router.get("/:id", getFAQById);
router.post("/:id/helpful", markHelpful);

// Admin only routes (require authentication and admin role)
router.post("/", protect, adminOnly, createFAQ);
router.put("/:id", protect, adminOnly, updateFAQ);
router.delete("/:id", protect, adminOnly, deleteFAQ);

export default router;