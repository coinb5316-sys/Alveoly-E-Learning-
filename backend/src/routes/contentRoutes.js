// routes/contentRoutes.js - FIXED ROUTE ORDER
import express from "express";
import upload from "../middleware/upload.js";
import { 
  uploadContent, 
  getContents, 
  deleteContent, 
  updateContent,
  getLecturerContents,
  getContentById 
} from "../controllers/contentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getContents);

// Protected routes (require authentication)
router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadContent
);

// IMPORTANT: Specific routes MUST come before dynamic routes
// This route must come BEFORE /:id
router.get("/lecturer", protect, getLecturerContents);

// Dynamic route - this should come AFTER specific routes
router.get("/:id", protect, getContentById);

router.delete("/:id", protect, deleteContent);
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateContent
);

export default router;