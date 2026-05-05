// routes/contentPaymentRoutes.js - COMPLETELY FIXED
import express from "express";
import {
  initiateContentPayment,
  verifyContentPayment,
  checkContentAccess,
  getUserPurchasedContent,
} from "../controllers/contentPaymentController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import ContentPayment from "../models/ContentPayment.js"; // ✅ THIS IS THE MISSING IMPORT
import Content from "../models/Content.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/initiate", protect, initiateContentPayment);
router.post("/verify", protect, verifyContentPayment);
router.get("/check/:contentId", protect, checkContentAccess);
router.get("/my-purchases", protect, getUserPurchasedContent);

// Check status endpoint
router.get("/check-status/:reference", protect, async (req, res) => {
  try {
    const { reference } = req.params;
    const payment = await ContentPayment.findOne({ reference });
    
    if (!payment) {
      return res.json({ exists: false });
    }
    
    res.json({
      exists: true,
      status: payment.status,
      amount: payment.amount,
      contentId: payment.contentId,
      paidAt: payment.paidAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin all endpoint - FIXED WITH PROPER IMPORTS
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    console.log("Admin content payments request received");
    
    // Simple direct query first to test
    const allPayments = await ContentPayment.find().sort({ createdAt: -1 }).lean();
    console.log(`Found ${allPayments.length} total payments in database`);
    
    // If no payments, return empty array
    if (allPayments.length === 0) {
      return res.json([]);
    }
    
    // Get all unique user IDs and content IDs
    const userIds = [...new Set(allPayments.map(p => p.userId?.toString()).filter(Boolean))];
    const contentIds = [...new Set(allPayments.map(p => p.contentId?.toString()).filter(Boolean))];
    
    // Fetch users and contents
    const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
    const contents = await Content.find({ _id: { $in: contentIds } }).select("title").lean();
    
    // Create maps for quick lookup
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });
    
    const contentMap = {};
    contents.forEach(c => { contentMap[c._id.toString()] = c; });
    
    // Format the response
    const formatted = allPayments.map(p => ({
      _id: p._id,
      studentName: userMap[p.userId?.toString()]?.name || "Unknown User",
      studentEmail: userMap[p.userId?.toString()]?.email || "No email",
      contentTitle: contentMap[p.contentId?.toString()]?.title || "Deleted Content",
      amount: p.amount,
      status: p.status,
      reference: p.reference,
      createdAt: p.createdAt,
      paidAt: p.paidAt
    }));
    
    console.log(`Returning ${formatted.length} formatted payments`);
    res.json(formatted);
    
  } catch (err) {
    console.error("Error in admin/all endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;