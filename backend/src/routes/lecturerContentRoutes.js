// routes/lecturerContentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Content from "../models/Content.js";

const router = express.Router();

// Get contents created by the logged-in lecturer
router.get("/", protect, async (req, res) => {
  try {
    // Only lecturers can access this
    if (req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Access denied. Lecturer only." });
    }
    
    // Get contents where the lecturerId matches the logged-in user
    const contents = await Content.find({ lecturerId: req.user._id })
      .populate("subjectId", "name")
      .populate("courseId", "name")
      .sort({ createdAt: -1 });
    
    res.json(contents);
  } catch (err) {
    console.error("Error fetching lecturer contents:", err);
    res.status(500).json({ message: "Failed to fetch contents" });
  }
});

export default router;