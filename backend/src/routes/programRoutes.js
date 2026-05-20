// routes/programRoutes.js - UPDATED with public route
import express from "express";
import {
  getPrograms,
  getPublicPrograms,  // ADD THIS
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= PUBLIC ROUTES (No authentication required) =================
router.get("/public", getPublicPrograms);  // NEW: Public endpoint for signup page

// ================= AUTHENTICATED ROUTES (require login) =================
router.get("/", protect, getPrograms);
router.get("/:id", protect, getProgramById);

// ================= ADMIN ONLY ROUTES =================
router.post("/", protect, adminOnly, createProgram);
router.put("/:id", protect, adminOnly, updateProgram);
router.delete("/:id", protect, adminOnly, deleteProgram);

export default router;