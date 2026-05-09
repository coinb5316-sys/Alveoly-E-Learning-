// backend/src/routes/qaRoutes.js
import express from "express";
import QAModel from "../models/QAModel.js";
import { clearQaCache, loadQaCache } from "../controllers/botController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all Q&A (admin)
router.get("/list", protect, adminOnly, async (req, res) => {
  try {
    const list = await QAModel.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, list });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Add Q&A (admin)
router.post("/add", protect, adminOnly, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ ok: false, message: "Question and answer required" });
    }
    
    const qa = await QAModel.create({ question, answer });
    await clearQaCache();
    res.json({ ok: true, qa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Update Q&A (admin)
router.put("/update/:id", protect, adminOnly, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = await QAModel.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );
    await clearQaCache();
    res.json({ ok: true, qa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Delete Q&A (admin)
router.delete("/delete/:id", protect, adminOnly, async (req, res) => {
  try {
    await QAModel.findByIdAndDelete(req.params.id);
    await clearQaCache();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;