// backend/src/routes/qaRoutes.js
import express from "express";
import QAModel from "../models/QAModel.js";
import { clearQaCache } from "../controllers/botController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all Q&A (admin)
router.get("/list", protect, adminOnly, async (req, res) => {
  try {
    const list = await QAModel.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, list });
  } catch (error) {
    console.error("List error:", error);
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
    
    // Emit socket event if io is available
    if (req.app.get("io")) {
      req.app.get("io").to("admin").emit("qa_updated", { action: "add", qa });
    }
    
    res.json({ ok: true, qa });
  } catch (error) {
    console.error("Add error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Update Q&A (admin)
router.put("/update/:id", protect, adminOnly, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = await QAModel.findByIdAndUpdate(
      req.params.id,
      { question, answer, updatedAt: Date.now() },
      { new: true }
    );
    if (!qa) {
      return res.status(404).json({ ok: false, message: "Q&A not found" });
    }
    await clearQaCache();
    
    if (req.app.get("io")) {
      req.app.get("io").to("admin").emit("qa_updated", { action: "update", qa });
    }
    
    res.json({ ok: true, qa });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Delete Q&A (admin)
router.delete("/delete/:id", protect, adminOnly, async (req, res) => {
  try {
    const qa = await QAModel.findByIdAndDelete(req.params.id);
    if (!qa) {
      return res.status(404).json({ ok: false, message: "Q&A not found" });
    }
    await clearQaCache();
    
    if (req.app.get("io")) {
      req.app.get("io").to("admin").emit("qa_updated", { action: "delete", id: req.params.id });
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;