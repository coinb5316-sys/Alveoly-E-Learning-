// routes/contentRoutes.js
import express from "express";
import upload from "../middleware/upload.js";
import { 
  uploadContent, 
  getContents, 
  deleteContent, 
  updateContent,
  getLecturerContents,
  createLecturerContent,
  getContentById
} from "../controllers/contentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/upload", protect, adminOnly, upload.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]), uploadContent);
router.get("/", protect, adminOnly, getContents);
router.delete("/:id", protect, adminOnly, deleteContent);
router.put("/:id", protect, adminOnly, upload.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]), updateContent);

// Lecturer routes
router.get("/lecturer/content", protect, getLecturerContents);
router.post("/lecturer/content", protect, upload.single("file"), createLecturerContent);
router.put("/lecturer/content/:id", protect, upload.single("file"), updateContent);
router.delete("/lecturer/content/:id", protect, deleteContent);
router.get("/lecturer/content/:id", protect, getContentById);

// Public/Student routes (no auth required for viewing content list)
router.get("/public", getContents);

export default router;