// controllers/contentPaymentController.js - COMPLETE FIXED VERSION (GHS Conversion)
import axios from "axios";
import Content from "../models/Content.js";
import ContentPayment from "../models/ContentPayment.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// ================= CONSTANTS =================
const FALLBACK_USD_TO_GHS = 11.74;   // Updated to current rate
const MIN_REASONABLE_RATE = 5.0;
const MAX_REASONABLE_RATE = 30.0;

// ================= HELPER: FETCH LIVE RATE (SERVER-SIDE) =================
const fetchServerExchangeRate = async () => {
  const apis = [
    {
      url: "https://open.er-api.com/v6/latest/USD",
      extract: (data) => data?.rates?.GHS,
    },
    {
      url: "https://api.exchangerate-api.com/v4/latest/USD",
      extract: (data) => data?.rates?.GHS,
    },
    {
      url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      extract: (data) => data?.usd?.ghs,
    },
  ];

  for (const api of apis) {
    try {
      const url = `${api.url}${api.url.includes("?") ? "&" : "?"}_t=${Date.now()}`;
      const response = await axios.get(url, {
        timeout: 5000,
        headers: { "Cache-Control": "no-cache" },
      });
      const rate = api.extract(response.data);

      if (rate && rate >= MIN_REASONABLE_RATE && rate <= MAX_REASONABLE_RATE) {
        console.log(`💱 [Content Server Rate] ${api.url} → 1 USD = ${rate} GHS`);
        return rate;
      }
    } catch (err) {
      console.warn(`⚠️ [Content Server Rate] ${api.url} failed: ${err.message}`);
    }
  }

  console.warn(
    `⚠️ [Content Server Rate] All APIs failed — using fallback ${FALLBACK_USD_TO_GHS}`
  );
  return FALLBACK_USD_TO_GHS;
};

// ================= HELPER: RESOLVE GHS AMOUNT (SERVER-VERIFIED) =================
const resolveGHSAmount = async ({ amountInGHS, exchangeRate, priceUSD }) => {
  const usdPrice = parseFloat(priceUSD) || 0;
  const frontendRate = parseFloat(exchangeRate) || 0;
  const ghsFromFrontend = parseFloat(amountInGHS) || 0;

  // Priority 1: If USD price is available, fetch server rate and compute
  if (usdPrice > 0) {
    const serverRate = await fetchServerExchangeRate();

    if (frontendRate > 0 && Math.abs(frontendRate - serverRate) > 0.5) {
      console.warn(
        `⚠️ [Content Rate Mismatch] Frontend: ${frontendRate}, Server: ${serverRate}. Using server rate.`
      );
    }

    const ghsAmount = Math.round(usdPrice * serverRate * 100) / 100;
    return {
      ghsAmount,
      pesewas: Math.round(ghsAmount * 100),
      rateUsed: serverRate,
      usdPrice,
      source: "server-verified conversion",
    };
  }

  // Priority 2: Use frontend GHS amount
  if (ghsFromFrontend > 0) {
    const ghsAmount = Math.round(ghsFromFrontend * 100) / 100;
    return {
      ghsAmount,
      pesewas: Math.round(ghsAmount * 100),
      rateUsed: frontendRate || FALLBACK_USD_TO_GHS,
      usdPrice: 0,
      source: "frontend-only",
    };
  }

  return {
    ghsAmount: 0,
    pesewas: 0,
    rateUsed: 0,
    usdPrice: 0,
    source: "invalid inputs",
  };
};

// ================= INITIATE CONTENT PAYMENT =================
export const initiateContentPayment = async (req, res) => {
  try {
    const {
      contentId,
      amountInGHS,
      exchangeRate,
      priceUSD,
      currency,
    } = req.body;

    const user = req.user;

    console.log("💳 [Content Payment] Init:", {
      contentId,
      amountInGHS,
      exchangeRate,
      priceUSD,
    });
    console.log("👤 User:", user?.email);

    if (!contentId) {
      return res.status(400).json({ message: "Content ID is required" });
    }

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

    // ============================================================
    // CALCULATE GHS AMOUNT (with server-side rate verification)
    // ============================================================
    const usdPriceFinal =
      parseFloat(priceUSD) > 0 ? parseFloat(priceUSD) : parseFloat(content.price);

    const { ghsAmount, pesewas, rateUsed, source } = await resolveGHSAmount({
      amountInGHS,
      exchangeRate,
      priceUSD: usdPriceFinal,
    });

    console.log("💳 [Content Payment] Calculation:", {
      contentTitle: content.title,
      contentPriceUSD: content.price,
      frontendAmountInGHS: amountInGHS,
      frontendExchangeRate: exchangeRate,
      computedGHS: ghsAmount,
      pesewas,
      rateUsed,
      source,
    });

    if (pesewas <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount. Please refresh the page and try again.",
      });
    }

    const reference = `content_${Date.now()}_${user._id}_${contentId}`;

    // Create pending payment record WITH GHS info
    await ContentPayment.create({
      userId: user._id,
      contentId,
      amount: ghsAmount,             // ← GHS amount actually charged
      amountUSD: usdPriceFinal,      // ← Original USD price
      exchangeRateUsed: rateUsed,    // ← Rate used
      currency: "GHS",
      reference,
      status: "pending",
    });

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const callbackUrl = `${frontendUrl}/content-payment-success?contentId=${contentId}&reference=${reference}`;

    console.log("🔗 [Content Payment] Callback URL:", callbackUrl);
    console.log("💰 [Content Payment] Sending to Paystack:", {
      amountPesewas: pesewas,
      currency: "GHS",
    });

    // Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: pesewas,             // ← Pesewas (GHS × 100)
        currency: "GHS",             // ← Force GHS
        reference: reference,
        callback_url: callbackUrl,
        metadata: {
          contentId: content._id.toString(),
          userId: user._id.toString(),
          type: "content",
          contentTitle: content.title,
          priceUSD: usdPriceFinal.toString(),
          exchangeRateUsed: rateUsed.toString(),
          ghsAmountCharged: ghsAmount.toString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.status) {
      console.error("❌ Paystack init failed:", response.data);
      throw new Error(response.data.message || "Paystack initialization failed");
    }

    console.log("✅ [Content Payment] Paystack init OK:", {
      reference,
      ghsAmount,
      rate: rateUsed,
      hasAuthUrl: !!response.data.data?.authorization_url,
    });

    res.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference: reference,
      callbackUrl: callbackUrl,
      amountChargedGHS: ghsAmount,
      exchangeRateUsed: rateUsed,
    });
  } catch (err) {
    console.error(
      "❌ Content payment initiation error:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message:
        "Payment initiation failed: " +
        (err.response?.data?.message || err.message),
    });
  }
};

// ================= VERIFY CONTENT PAYMENT =================
export const verifyContentPayment = async (req, res) => {
  try {
    const { reference, contentId } = req.body;

    console.log("🔍 [Content Verify] Verifying:", { reference, contentId });

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

    if (paymentData.status !== "success") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not successful" });
    }

    // Verify currency
    if (paymentData.currency && paymentData.currency !== "GHS") {
      console.warn(
        `⚠️ [Content Verify] Payment currency is ${paymentData.currency}, expected GHS`
      );
    }

    // Amount is in pesewas from Paystack
    const paidGHS = paymentData.amount / 100;
    console.log(`💰 [Content Verify] Paid GHS: ${paidGHS}`);

    // Find the payment record
    let payment = await ContentPayment.findOne({ reference });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    if (payment.status === "success") {
      return res.json({
        success: true,
        message: "Already verified",
        alreadyVerified: true,
      });
    }

    // Optional: verify amount matches
    const expectedGHS = parseFloat(payment.amount) || 0;
    if (expectedGHS > 0 && Math.abs(paidGHS - expectedGHS) > 0.01) {
      console.warn("⚠️ [Content Verify] Amount mismatch:", {
        reference,
        paidGHS,
        expectedGHS,
      });
    }

    // Update payment status
    payment.status = "success";
    payment.paidAt = new Date();
    payment.amountPaid = paidGHS;
    payment.currency = "GHS";
    await payment.save();

    // Mark the content as unlocked for this user
    const content = await Content.findById(payment.contentId);
    if (content) {
      if (!content.unlockedBy) {
        content.unlockedBy = [];
      }
      if (!content.unlockedBy.includes(payment.userId)) {
        content.unlockedBy.push(payment.userId);
        await content.save();
        console.log(
          `✅ Content "${content.title}" unlocked for user ${payment.userId}`
        );

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
      contentId: payment.contentId,
      amountPaidGHS: paidGHS,
    });
  } catch (err) {
    console.error(
      "❌ Content payment verification error:",
      err.response?.data || err.message
    );
    res
      .status(500)
      .json({ success: false, message: "Verification failed: " + err.message });
  }
};

// ================= CHECK CONTENT ACCESS =================
export const checkContentAccess = async (req, res) => {
  try {
    const { contentId } = req.params;
    const user = req.user;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (!content.isPaid) {
      return res.json({ hasAccess: true, isPaid: false });
    }

    const hasAccess =
      content.unlockedBy &&
      content.unlockedBy.some((id) => id.toString() === user._id.toString());

    const payment = await ContentPayment.findOne({
      userId: user._id,
      contentId,
      status: "success",
    });

    const isUnlocked = hasAccess || !!payment;

    res.json({
      hasAccess: isUnlocked,
      isPaid: true,
      isUnlocked: isUnlocked,
    });
  } catch (err) {
    console.error("Check content access error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ================= GET USER'S PURCHASED CONTENT =================
export const getUserPurchasedContent = async (req, res) => {
  try {
    const payments = await ContentPayment.find({
      userId: req.user._id,
      status: "success",
    }).populate("contentId", "title type thumbnailUrl price");

    const purchasedContent = payments
      .map((p) => ({
        _id: p.contentId?._id,
        title: p.contentId?.title,
        type: p.contentId?.type,
        price: p.contentId?.price,           // USD
        priceUSD: p.contentId?.price,        // USD alias
        amountPaidGHS: p.amount,             // GHS paid
        exchangeRateUsed: p.exchangeRateUsed,
        purchasedAt: p.paidAt || p.createdAt,
        paymentStatus: p.status,
      }))
      .filter((c) => c.title);

    res.json(purchasedContent);
  } catch (err) {
    console.error("Get purchased content error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};