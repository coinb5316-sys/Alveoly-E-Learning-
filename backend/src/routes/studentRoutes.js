import express from "express";
import { getStudentStats } from "../controllers/StudentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, getStudentStats);

export default router;