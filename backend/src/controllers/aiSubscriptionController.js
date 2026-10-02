// controllers/aiSubscriptionController.js - COMPLETE FIXED VERSION
import axios from "axios";
import AISubscription from "../models/AISubscription.js";
import AISubscriptionPlan from "../models/AISubscriptionPlan.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// ================= CONSTANTS =================
const FALLBACK_USD_TO_GHS = 15.50;
const MIN_REASONABLE_RATE = 5.0;   // sanity floor
const MAX_REASONABLE_RATE = 30.0;  // sanity ceiling

// ================= HELPER: FETCH LIVE RATE (SERVER-SIDE) =================
// This is the KEY FIX. The backend fetches its OWN rate.
// Never trust the frontend rate for charging real money.
const fetchServerExchangeRate = async () => {
  const apis = [
    {
      url: "https://api.exchangerate-api.com/v4/latest/USD",
      extract: (data) => data?.rates?.GHS,
    },
    {
      url: "https://open.er-api.com/v6/latest/USD",
      extract: (data) => data?.rates?.GHS,
    },
  ];

  for (const api of apis) {
    try {
      const response = await axios.get(api.url, { timeout: 5000 });
      const rate = api.extract(response.data);
      if (rate && rate >= MIN_REASONABLE_RATE && rate <= MAX_REASONABLE_RATE) {
        console.log(`💱 [Server Rate] ${api.url} → 1 USD = ${rate} GHS`);
        return rate;
      }
      if (rate) {
        console.warn(`⚠️ [Server Rate] Unreasonable rate from ${api.url}: ${rate}`);
      }
    } catch (err) {
      console.warn(`⚠️ [Server Rate] ${api.url} failed: ${err.message}`);
    }
  }

  console.warn(`⚠️ [Server Rate] All APIs failed — using fallback ${FALLBACK_USD_TO_GHS}`);
  return FALLBACK_USD_TO_GHS;
};

// ================= HELPER: RESOLVE GHS AMOUNT (SERVER-VERIFIED) =================
const resolveGHSAmount = async ({ amountInGHS, exchangeRate, priceUSD }) => {
  const usdPrice = parseFloat(priceUSD) || 0;
  const frontendRate = parseFloat(exchangeRate) || 0;
  const ghsFromFrontend = parseFloat(amountInGHS) || 0;

  // 1. If USD price is provided, ALWAYS convert server-side.
  //    This is the only safe way to charge real money.
  if (usdPrice > 0) {
    const serverRate = await fetchServerExchangeRate();

    // Compare frontend rate to server rate
    if (frontendRate > 0 && Math.abs(frontendRate - serverRate) > 0.5) {
      console.warn(
        `⚠️ [Rate Mismatch] Frontend: ${frontendRate}, Server: ${serverRate}. Using server rate.`
      );
    }

    const ghsAmount = Math.round(usdPrice * serverRate * 100) / 100;
    const pesewas = Math.round(ghsAmount * 100);

    return {
      ghsAmount,
      pesewas,
      rateUsed: serverRate,
      usdPrice,
      source: "server-verified conversion",
    };
  }

  // 2. If no USD but frontend GHS is provided, sanity-check it.
  if (ghsFromFrontend > 0 && frontendRate > 0) {
    const expectedGHS = Math.round(ghsFromFrontend * 100) / 100;
    const pesewas = Math.round(expectedGHS * 100);
    return {
      ghsAmount: expectedGHS,
      pesewas,
      rateUsed: frontendRate,
      usdPrice: 0,
      source: "frontend-only (no USD provided)",
    };
  }

  // 3. Nothing usable
  return {
    ghsAmount: 0,
    pesewas: 0,
    rateUsed: 0,
    usdPrice: 0,
    source: "invalid inputs",
  };
};

// ================= HELPER: CALCULATE EXPIRY =================
const calculateExpiry = (durationValue, durationUnit) => {
  const now = new Date();
  const expiry = new Date(now);
  switch (durationUnit) {
    case "minutes": expiry.setMinutes(expiry.getMinutes() + durationValue); break;
    case "hours":   expiry.setHours(expiry.getHours() + durationValue); break;
    case "days":    expiry.setDate(expiry.getDate() + durationValue); break;
    case "weeks":   expiry.setDate(expiry.getDate() + durationValue * 7); break;
    case "months":  expiry.setMonth(expiry.getMonth() + durationValue); break;
    case "years":   expiry.setFullYear(expiry.getFullYear() + durationValue); break;
    default:        expiry.setDate(expiry.getDate() + 30);
  }
  return expiry;
};

// ================= CREATE SUBSCRIPTION (Paystack Init) =================
export const createSubscription = async (req, res) => {
  try {
    const { planId, amountInGHS, exchangeRate, priceUSD, currency } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const plan = await AISubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check existing active subscription
    const existing = await AISubscription.findOne({
      userId: user._id,
      status: "active",
      expiryDate: { $gt: new Date() },
    });

    if (existing) {
      return res.status(400).json({
        message:
          "You already have an active AI subscription. It will expire on " +
          new Date(existing.expiryDate).toLocaleDateString(),
      });
    }

    // ============================================================
    // SERVER-VERIFIED GHS CALCULATION
    // The backend fetches its own rate — never trusts frontend for money.
    // ============================================================
    const usdPriceFinal = parseFloat(plan.price); // Always use DB price as source of truth

    const { ghsAmount, pesewas, rateUsed, source } = await resolveGHSAmount({
      amountInGHS,
      exchangeRate,
      priceUSD: usdPriceFinal,
    });

    console.log("💳 [AI Subscription] Calculation:", {
      planName: plan.name,
      dbPriceUSD: plan.price,
      frontendAmountInGHS: amountInGHS,
      frontendRate: exchangeRate,
      serverRate: rateUsed,
      computedGHS: ghsAmount,
      pesewas,
      source,
    });

    if (pesewas <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount. Please refresh and try again.",
      });
    }

    const reference = `ai_sub_${Date.now()}_${user._id}`;

    const subscription = await AISubscription.create({
      userId: user._id,
      planId: plan._id,
      amount: ghsAmount,
      amountUSD: usdPriceFinal,
      exchangeRateUsed: rateUsed,
      currency: "GHS",
      reference,
      status: "pending",
    });

    const callbackUrl = `${process.env.CLIENT_URL}/student/ai?reference=${reference}`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: pesewas,
        currency: "GHS",
        reference,
        callback_url: callbackUrl,
        metadata: {
          planId: plan._id.toString(),
          userId: user._id.toString(),
          type: "ai_subscription",
          planName: plan.name,
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
      return res.status(400).json({
        message: response.data.message || "Failed to initialize payment",
      });
    }

    console.log("✅ [AI Subscription] Paystack init OK:", {
      reference,
      ghsAmount,
      serverRate: rateUsed,
    });

    res.json({
      authorization_url: response.data.data.authorization_url,
      authorizationUrl: response.data.data.authorization_url,
      reference,
      amountChargedGHS: ghsAmount,
      exchangeRateUsed: rateUsed,
    });
  } catch (err) {
    console.error(
      "❌ AI Subscription init error:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message: "Subscription failed: " + (err.response?.data?.message || err.message),
    });
  }
};

// ================= VERIFY PAYMENT =================
export const verifySubscription = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ message: "Reference is required" });

    const existing = await AISubscription.findOne({ reference }).populate("planId");
    if (!existing) {
      return res.status(404).json({ message: "Subscription record not found" });
    }

    if (existing.status === "active") {
      return res.json({ active: true, subscription: existing, alreadyVerified: true });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = response.data.data;
    if (data.status !== "success") {
      existing.status = "failed";
      await existing.save();
      return res.status(400).json({ message: "Payment not successful", active: false });
    }

    const paidGHS = data.amount / 100;
    const expectedGHS = parseFloat(existing.amount) || 0;

    if (expectedGHS > 0 && Math.abs(paidGHS - expectedGHS) > 0.01) {
      console.warn("⚠️ [AI Sub Verify] Amount mismatch:", { paidGHS, expectedGHS });
    }

    const plan = await AISubscriptionPlan.findById(existing.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const startDate = new Date();
    const expiryDate = calculateExpiry(plan.durationValue, plan.durationUnit);

    existing.status = "active";
    existing.startDate = startDate;
    existing.expiryDate = expiryDate;
    existing.paidAt = new Date();
    existing.amountPaid = paidGHS;
    existing.currency = "GHS";
    await existing.save();

    await createNotification(
      existing.userId,
      "student",
      "success",
      "🎉 AI Subscription Activated!",
      `Your ${plan.name} AI subscription is now active. You paid GH₵${paidGHS.toFixed(2)}.`,
      "/student/ai",
      { planId: plan._id, planName: plan.name, amountGHS: paidGHS, expiresAt: expiryDate }
    );

    res.json({
      active: true,
      subscription: existing,
      amountPaidGHS: paidGHS,
    });
  } catch (err) {
    console.error("❌ AI Subscription verify error:", err.response?.data || err.message);
    res.status(500).json({ message: "Verification failed: " + err.message, active: false });
  }
};

// ================= GET ACTIVE SUBSCRIPTION =================
export const getSubscription = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.json({ active: false });

    const subscription = await AISubscription.findOne({
      userId: user._id,
      status: "active",
      expiryDate: { $gt: new Date() },
    }).populate("planId");

    if (!subscription) return res.json({ active: false });

    res.json({ active: true, subscription });
  } catch (err) {
    console.error("Get subscription error:", err);
    res.status(500).json({ message: "Server error", active: false });
  }
};