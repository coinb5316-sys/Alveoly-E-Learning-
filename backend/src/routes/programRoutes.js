import express from "express";
import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (authenticated users can view programs)
router.get("/", protect, getPrograms);
router.get("/:id", protect, getProgramById);

// Admin only routes
router.post("/", protect, adminOnly, createProgram);
router.put("/:id", protect, adminOnly, updateProgram);
router.delete("/:id", protect, adminOnly, deleteProgram);

export default router;