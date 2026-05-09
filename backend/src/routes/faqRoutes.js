import express from "express";
import {
  getAllFAQs, getFAQById, createFAQ, updateFAQ, deleteFAQ, searchFAQs, markHelpful
} from "../controllers/faqController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllFAQs);
router.get("/search", searchFAQs);
router.get("/:id", getFAQById);
router.post("/:id/helpful", markHelpful);
router.post("/", protect, adminOnly, createFAQ);
router.put("/:id", protect, adminOnly, updateFAQ);
router.delete("/:id", protect, adminOnly, deleteFAQ);

export default router;