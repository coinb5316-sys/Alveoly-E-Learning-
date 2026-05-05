// controllers/contentPaymentController.js - FIXED VERSION
import axios from "axios";
import Content from "../models/Content.js";
import ContentPayment from "../models/ContentPayment.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// Initiate content payment
// controllers/contentPaymentController.js - Fix the callback URL
export const initiateContentPayment = async (req, res) => {
  try {
    const { contentId } = req.body;
    const user = req.user;

    console.log("Initiate payment for content:", contentId);
    console.log("User:", user.email);

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (!content.isPaid) {
      return res.status(400).json({ message: "This content is free" });
    }

    // Check if already purchased
    const existingPayment = await ContentPayment.findOne({
      userId: user._id,
      contentId,
      status: "success",
    });

    if (existingPayment) {
      return res.status(400).json({ message: "You already own this content" });
    }

    const reference = `content_${Date.now()}_${user._id}_${contentId}`;

    // Create pending payment record
    await ContentPayment.create({
      userId: user._id,
      contentId,
      amount: content.price,
      reference,
      status: "pending",
    });

    // IMPORTANT: The callback URL MUST be the full URL of your frontend
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const callbackUrl = `${frontendUrl}/content-payment-success?contentId=${contentId}&reference=${reference}`;
    
    console.log("Callback URL:", callbackUrl);
    console.log("Amount:", content.price * 100);

    // Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: Math.round(content.price * 100),
        reference: reference,
        callback_url: callbackUrl,
        metadata: {
          contentId: content._id.toString(),
          userId: user._id.toString(),
          type: "content",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Paystack response:", response.data);

    if (!response.data.status) {
      throw new Error(response.data.message || "Paystack initialization failed");
    }

    // Also store the callback URL in the response for debugging
    res.json({
      authorizationUrl: response.data.data.authorization_url,
      reference: reference,
      callbackUrl: callbackUrl,
    });
  } catch (err) {
    console.error("Content payment initiation error:", err.response?.data || err.message);
    res.status(500).json({ 
      message: "Payment initiation failed: " + (err.response?.data?.message || err.message) 
    });
  }
};

// Verify content payment - FIXED
export const verifyContentPayment = async (req, res) => {
  try {
    const { reference, contentId } = req.body;

    console.log("Verifying payment:", { reference, contentId });

    if (!reference) {
      return res.status(400).json({ message: "Reference is required" });
    }

    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    console.log("Paystack verification response:", paymentData.status);

    if (paymentData.status !== "success") {
      return res.status(400).json({ success: false, message: "Payment not successful" });
    }

    // Find the payment record
    let payment = await ContentPayment.findOne({ reference });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    if (payment.status === "success") {
      return res.json({ success: true, message: "Already verified", alreadyVerified: true });
    }

    // Update payment status
    payment.status = "success";
    payment.paidAt = new Date();
    await payment.save();

    // IMPORTANT: Mark the content as unlocked for this user
    const content = await Content.findById(payment.contentId);
    if (content) {
      if (!content.unlockedBy) {
        content.unlockedBy = [];
      }
      if (!content.unlockedBy.includes(payment.userId)) {
        content.unlockedBy.push(payment.userId);
        await content.save();
        console.log(`✅ Content ${content.title} unlocked for user ${payment.userId}`);
        
        // Send notification to user
        await createNotification(
          payment.userId,
          "student",
          "success",
          "🎉 Content Unlocked!",
          `Your payment for "${content.title}" was successful. You now have access to this content.`,
          `/student/lessons/${content.subjectId}`,
          { contentId: content._id, title: content.title }
        );
      }
    }

    res.json({ 
      success: true, 
      message: "Payment verified successfully. Content unlocked!",
      contentId: payment.contentId
    });
  } catch (err) {
    console.error("Content payment verification error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Verification failed: " + err.message });
  }
};

// Check if user has purchased a specific content - FIXED
export const checkContentAccess = async (req, res) => {
  try {
    const { contentId } = req.params;
    const user = req.user;

    console.log("Checking access for content:", contentId, "User:", user._id);

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Free content is always accessible
    if (!content.isPaid) {
      return res.json({ hasAccess: true, isPaid: false });
    }

    // Check if user is in the unlockedBy array
    const hasAccess = content.unlockedBy && content.unlockedBy.some(
      id => id.toString() === user._id.toString()
    );
    
    // Also check payment record as backup
    const payment = await ContentPayment.findOne({
      userId: user._id,
      contentId,
      status: "success",
    });

    const isUnlocked = hasAccess || !!payment;

    console.log("Access result:", { hasAccess, isUnlocked });

    res.json({ 
      hasAccess: isUnlocked, 
      isPaid: true,
      isUnlocked: isUnlocked
    });
  } catch (err) {
    console.error("Check content access error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// Get user's purchased content
// Update getUserPurchasedContent to include purchase date
export const getUserPurchasedContent = async (req, res) => {
  try {
    const payments = await ContentPayment.find({ 
      userId: req.user._id, 
      status: "success" 
    }).populate("contentId", "title type thumbnailUrl price");
    
    const purchasedContent = payments.map(p => ({
      _id: p.contentId?._id,
      title: p.contentId?.title,
      type: p.contentId?.type,
      price: p.contentId?.price,
      purchasedAt: p.paidAt || p.createdAt,
      paymentStatus: p.status
    })).filter(c => c.title); // Filter out any null content
    
    console.log(`Found ${purchasedContent.length} purchased items for user ${req.user._id}`);
    res.json(purchasedContent);
  } catch (err) {
    console.error("Get purchased content error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};