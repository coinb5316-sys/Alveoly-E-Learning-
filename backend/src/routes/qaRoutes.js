// backend/src/routes/qaRoutes.js - TEMPORARY VERSION (remove auth)
import express from "express";
import QAModel from "../models/QAModel.js";
import { clearQaCache } from "../controllers/botController.js";

const router = express.Router();

// Get all Q&A (temporarily public for testing)
router.get("/list", async (req, res) => {
  try {
    const list = await QAModel.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, list });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Add Q&A (temporarily public for testing)
router.post("/add", async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ ok: false, message: "Question and answer required" });
    }
    
    const qa = await QAModel.create({ question, answer });
    await clearQaCache();
    
    res.json({ ok: true, qa });
  } catch (error) {
    console.error("Add error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Update Q&A (temporarily public for testing)
router.put("/update/:id", async (req, res) => {
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
    
    res.json({ ok: true, qa });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Delete Q&A (temporarily public for testing)
router.delete("/delete/:id", async (req, res) => {
  try {
    const qa = await QAModel.findByIdAndDelete(req.params.id);
    if (!qa) {
      return res.status(404).json({ ok: false, message: "Q&A not found" });
    }
    await clearQaCache();
    
    res.json({ ok: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;