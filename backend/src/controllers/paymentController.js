// controllers/paymentController.js - COMPLETE FIXED VERSION (USD to GHS Conversion)
import axios from "axios";
import Payment from "../models/Payment.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import { io } from "../../server.js";
import Plan from "../models/Plan.js";
import { createNotification } from "./notificationController.js";

// ================= CONSTANTS =================
const FALLBACK_USD_TO_GHS = 15.50;

// ================= HELPER: CALCULATE EXPIRY =================
const calculateExpiry = (duration, unit) => {
  const now = new Date();

  if (!duration || duration <= 0) {
    duration = 30;
    unit = "days";
  }

  const expiry = new Date(now);

  switch (unit) {
    case "minutes":
      expiry.setMinutes(expiry.getMinutes() + duration);
      break;
    case "hours":
      expiry.setHours(expiry.getHours() + duration);
      break;
    case "days":
      expiry.setDate(expiry.getDate() + duration);
      break;
    case "weeks":
      expiry.setDate(expiry.getDate() + duration * 7);
      break;
    case "months":
      expiry.setMonth(expiry.getMonth() + duration);
      break;
    case "years":
      expiry.setFullYear(expiry.getFullYear() + duration);
      break;
    default:
      expiry.setDate(expiry.getDate() + 30);
  }

  return expiry;
};

// ================= HELPER: RESOLVE GHS AMOUNT =================
// This is the CORE FIX. It uses the frontend-sent GHS amount
// or converts from USD using the frontend-sent exchange rate.
const resolveGHSAmount = ({ amountInGHS, exchangeRate, priceUSD }) => {
  const usdPrice = parseFloat(priceUSD) || 0;
  const rate = parseFloat(exchangeRate) || FALLBACK_USD_TO_GHS;
  const ghsFromFrontend = parseFloat(amountInGHS) || 0;

  let ghsAmount;
  let source;

  if (ghsFromFrontend > 0) {
    ghsAmount = ghsFromFrontend;
    source = "frontend amountInGHS";
  } else if (usdPrice > 0 && rate > 0) {
    ghsAmount = usdPrice * rate;
    source = "computed from USD × rate";
  } else {
    ghsAmount = 0;
    source = "invalid inputs";
  }

  // Round to 2 decimals to avoid floating point noise
  ghsAmount = Math.round(ghsAmount * 100) / 100;
  const pesewas = Math.round(ghsAmount * 100);

  return { ghsAmount, pesewas, rateUsed: rate, usdPrice, source };
};

// ================= INITIATE SUBJECT PAYMENT =================
export const initiatePayment = async (req, res) => {
  try {
    const {
      subjectId,
      amountInGHS,
      exchangeRate,
      priceUSD,
      currency,
    } = req.body;

    const user = req.user;

    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Prevent buying active subject again
    const existing = await Payment.findOne({
      userId: user._id,
      subjectId,
      status: "success",
      expiresAt: { $gt: new Date() },
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have access to this subject",
      });
    }

    // ============================================================
    // CALCULATE GHS AMOUNT
    // ============================================================
    const usdPriceFinal =
      parseFloat(priceUSD) > 0 ? parseFloat(priceUSD) : parseFloat(subject.price);

    const { ghsAmount, pesewas, rateUsed, source } = resolveGHSAmount({
      amountInGHS,
      exchangeRate,
      priceUSD: usdPriceFinal,
    });

    console.log("💳 [Subject Payment] Calculation:", {
      subjectName: subject.name,
      subjectPriceUSD: subject.price,
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

    const reference = `subject_${Date.now()}_${user._id}_${subjectId}`;

    // Save pending payment WITH GHS info
    await Payment.create({
      userId: user._id,
      subjectId,
      amount: ghsAmount,          // ← Store the GHS amount actually charged
      amountUSD: usdPriceFinal,   // ← Keep original USD price for records
      exchangeRateUsed: rateUsed, // ← Keep exchange rate for audit
      currency: "GHS",
      reference,
      status: "pending",
      accessType: "subject",
    });

    const callbackUrl = `${process.env.CLIENT_URL}/subject-payment-success?reference=${reference}&courseId=${subject.courseId}&subjectId=${subjectId}`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: pesewas,             // ← Paystack expects pesewas
        currency: "GHS",             // ← Force GHS
        reference,
        callback_url: callbackUrl,
        metadata: {
          subjectId: subject._id.toString(),
          userId: user._id.toString(),
          type: "subject",
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

    console.log("✅ [Subject Payment] Paystack init OK:", {
      reference,
      ghsAmount,
      authorizationUrl: response.data.data.authorization_url ? "present" : "missing",
    });

    res.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference,
      amountChargedGHS: ghsAmount,
      exchangeRateUsed: rateUsed,
    });
  } catch (err) {
    console.error(
      "❌ Subject Payment Init Error:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message:
        "Payment initialization failed: " +
        (err.response?.data?.message || err.message),
    });
  }
};

// ================= PLAN PAYMENT - FIXED =================
export const initiatePlanPayment = async (req, res) => {
  try {
    const {
      planId,
      userId,
      amountInGHS,
      exchangeRate,
      priceUSD,
      currency,
    } = req.body;

    console.log("💰 [Plan Payment] Init:", {
      planId,
      userId,
      amountInGHS,
      exchangeRate,
      priceUSD,
    });
    console.log("🔑 [Plan Payment] req.user:", req.user?._id);

    // Get user - prioritize req.user (from auth middleware), then userId param
    let user = req.user;
    if (!user && userId) {
      user = await User.findById(userId);
    }

    if (!user) {
      console.log("❌ [Plan Payment] User not found:", {
        userId,
        reqUser: req.user?._id,
      });
      return res
        .status(401)
        .json({ message: "User not found. Please login first." });
    }

    console.log("✅ [Plan Payment] User:", {
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check if user already has an active plan (User model)
    if (user.isPlanActive && user.planId) {
      const existingPlan = await Plan.findById(user.planId);
      if (existingPlan) {
        return res.status(400).json({
          message: `You already have an active plan: ${existingPlan.title}`,
        });
      }
    }

    // Check Payment model too
    const existingActivePlan = await Payment.findOne({
      userId: user._id,
      planId,
      status: "success",
      expiresAt: { $gt: new Date() },
    });

    if (existingActivePlan) {
      return res.status(400).json({
        message: "You already have an active plan",
      });
    }

    // ============================================================
    // CALCULATE GHS AMOUNT
    // ============================================================
    const usdPriceFinal =
      parseFloat(priceUSD) > 0 ? parseFloat(priceUSD) : parseFloat(plan.price);

    const { ghsAmount, pesewas, rateUsed, source } = resolveGHSAmount({
      amountInGHS,
      exchangeRate,
      priceUSD: usdPriceFinal,
    });

    console.log("💳 [Plan Payment] Calculation:", {
      planTitle: plan.title,
      planPriceUSD: plan.price,
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

    const reference = `plan_${Date.now()}_${user._id}`;

    // Save pending payment WITH GHS info
    await Payment.create({
      userId: user._id,
      planId,
      amount: ghsAmount,          // ← GHS amount actually charged
      amountUSD: usdPriceFinal,   // ← Original USD price
      exchangeRateUsed: rateUsed, // ← Rate used
      currency: "GHS",
      reference,
      status: "pending",
      accessType: "plan",
    });

    const callbackUrl = `${process.env.CLIENT_URL}/payment-success?reference=${reference}`;
    console.log("🔗 [Plan Payment] Callback URL:", callbackUrl);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: pesewas,             // ← Paystack expects pesewas
        currency: "GHS",             // ← Force GHS
        reference,
        callback_url: callbackUrl,
        metadata: {
          planId: plan._id.toString(),
          userId: user._id.toString(),
          type: "plan",
          planTitle: plan.title,
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

    console.log("✅ [Plan Payment] Paystack init OK:", {
      reference,
      ghsAmount,
      status: response.data.status,
      hasAuthUrl: !!response.data.data?.authorization_url,
    });

    res.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference,
      amountChargedGHS: ghsAmount,
      exchangeRateUsed: rateUsed,
    });
  } catch (err) {
    console.error(
      "❌ Plan payment initiation error:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message:
        "Plan payment failed: " +
        (err.response?.data?.message || err.message),
    });
  }
};

// ================= VERIFY PAYMENT =================
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ message: "Reference is required" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // Verify currency
    if (data.currency && data.currency !== "GHS") {
      console.warn(
        `⚠️ Payment currency is ${data.currency}, expected GHS for reference ${reference}`
      );
    }

    // Amount is in pesewas from Paystack
    const paidGHS = data.amount / 100;

    const payment = await Payment.findOne({ reference })
      .populate("userId", "name email")
      .populate("planId", "title duration durationUnit price");

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status === "success") {
      return res.json({ message: "Already verified", alreadyVerified: true });
    }

    // ============================================================
    // OPTIONAL: verify the amount matches what we recorded
    // ============================================================
    const expectedGHS = parseFloat(payment.amount) || 0;
    if (expectedGHS > 0 && Math.abs(paidGHS - expectedGHS) > 0.01) {
      console.warn("⚠️ [Verify] Amount mismatch:", {
        reference,
        paidGHS,
        expectedGHS,
        difference: paidGHS - expectedGHS,
      });
      // We still proceed — Paystack wouldn't let the user pay a different amount
      // than what we initialized, so this is only for logging.
    }

    payment.status = "success";
    payment.paidAt = new Date();
    payment.amountPaid = paidGHS;
    payment.currency = "GHS";

    // ================= PLAN =================
    if (payment.planId) {
      const plan = await Plan.findById(payment.planId);

      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const expiresAt = calculateExpiry(plan.duration, plan.durationUnit);
      payment.expiresAt = expiresAt;
      await payment.save();

      // Update user with plan
      const user = await User.findById(payment.userId);
      if (user) {
        user.planId = plan._id;
        user.planStartDate = new Date();
        user.planExpiryDate = expiresAt;
        user.isPlanActive = true;
        user.subscriptionStatus = "active";
        user.subscriptionExpiry = expiresAt;

        // If non-alveoly student, auto-approve
        if (user.userType === "non_alveoly_student") {
          user.isApproved = true;
          user.registrationCompleted = true;
        }

        await user.save();
      }

      // Send notification to student
      await createNotification(
        payment.userId,
        "student",
        "success",
        "🎉 Plan Activated!",
        `Your ${plan.title} plan has been activated successfully.`,
        "/student/dashboard",
        {
          planId: plan._id,
          planTitle: plan.title,
          amountGHS: paidGHS,
          expiresAt,
        }
      );

      // Notify admins about payment
      const adminUsers = await User.find({ role: "admin" });
      for (const admin of adminUsers) {
        await createNotification(
          admin._id,
          "admin",
          "success",
          "💰 New Plan Purchase",
          `${payment.userId?.name || "A student"} purchased ${
            plan.title
          } plan for GH₵${paidGHS.toFixed(2)}.`,
          "/admin/payments",
          {
            paymentId: payment._id,
            userId: payment.userId,
            amountGHS: paidGHS,
          }
        );
      }

      return res.json({
        success: true,
        message: "Plan activated successfully",
        expiresAt,
        planTitle: plan.title,
        amountPaidGHS: paidGHS,
      });
    }

    // ================= SUBJECT =================
    if (payment.subjectId) {
      const subject = await Subject.findById(payment.subjectId);

      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      const expiresAt = calculateExpiry(1, "months");
      payment.expiresAt = expiresAt;
      await payment.save();

      // Subject unlock
      if (!subject.studentsUnlocked) {
        subject.studentsUnlocked = [];
      }

      const exists = subject.studentsUnlocked.some(
        (id) => id.toString() === payment.userId.toString()
      );

      if (!exists) {
        subject.studentsUnlocked.push(payment.userId);
        await subject.save();
      }

      io.emit("subject:updated", subject);

      // Send notification to student
      await createNotification(
        payment.userId,
        "student",
        "success",
        "📚 Subject Unlocked!",
        `You have successfully purchased ${subject.name}. Access your content now!`,
        `/student/subjects?course=${subject.courseId}`,
        {
          subjectId: subject._id,
          subjectName: subject.name,
          amountGHS: paidGHS,
        }
      );

      // Notify admins about subject purchase
      const adminUsers = await User.find({ role: "admin" });
      for (const admin of adminUsers) {
        await createNotification(
          admin._id,
          "admin",
          "info",
          "📖 New Subject Purchase",
          `${payment.userId?.name || "A student"} purchased ${
            subject.name
          } for GH₵${paidGHS.toFixed(2)}.`,
          "/admin/payments",
          {
            paymentId: payment._id,
            userId: payment.userId,
            subjectId: subject._id,
            amountGHS: paidGHS,
          }
        );
      }

      return res.json({
        success: true,
        message: "Subject unlocked successfully",
        expiresAt,
        amountPaidGHS: paidGHS,
      });
    }

    return res.status(400).json({ message: "Invalid payment type" });
  } catch (err) {
    console.error(
      "❌ Verify Payment Error:",
      err.response?.data || err.message
    );
    res
      .status(500)
      .json({ message: "Verification failed: " + err.message });
  }
};

// ================= GET PUBLIC PLANS (No Auth Required) =================
export const getPublicPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .populate("subjects", "name isPaid price")
      .sort({ price: 1, createdAt: -1 });

    // Format plans for public display — include USD price (frontend converts to GHS)
    const formattedPlans = plans.map((plan) => ({
      _id: plan._id,
      title: plan.title,
      price: plan.price, // ← USD price (frontend converts)
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      subjects: plan.subjects || [],
      subjectCount: plan.subjects?.length || 0,
      isPopular: plan.isPopular || false,
      features: plan.features || [],
      description: plan.description || "",
    }));

    res.json(formattedPlans);
  } catch (err) {
    console.error("Get Public Plans Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET MY PAYMENTS =================
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate("subjectId", "name")
      .populate("planId", "title")
      .sort({ createdAt: -1 });

    const formatted = payments.map((p) => ({
      _id: p._id,
      planId: p.planId?._id || null,
      planTitle: p.planId?.title || null,
      subject: p.subjectId?.name || null,
      amount: p.amount,                 // ← GHS amount
      amountUSD: p.amountUSD || null,   // ← Original USD (if stored)
      exchangeRateUsed: p.exchangeRateUsed || null,
      currency: p.currency || "GHS",
      status: p.status,
      expiresAt: p.expiresAt,
      isExpired: p.expiresAt ? new Date(p.expiresAt) < new Date() : false,
      date: p.createdAt,
      paidAt: p.paidAt,
      reference: p.reference,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get My Payments Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL PAYMENTS (Admin) =================
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("subjectId", "name")
      .populate("planId", "title")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const formatted = payments.map((p) => ({
      _id: p._id,
      student: p.userId?.name || "N/A",
      email: p.userId?.email || "N/A",
      type: p.planId ? "Plan" : "Subject",
      title: p.planId?.title || p.subjectId?.name || "N/A",
      amount: p.amount,                 // ← GHS
      amountUSD: p.amountUSD || null,
      exchangeRateUsed: p.exchangeRateUsed || null,
      currency: p.currency || "GHS",
      status: p.status,
      expiresAt: p.expiresAt || null,
      isExpired: p.expiresAt ? new Date(p.expiresAt) < new Date() : false,
      date: p.createdAt,
      paidAt: p.paidAt,
      reference: p.reference,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get All Payments Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE PAYMENT =================
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    await payment.deleteOne();

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error("Delete Payment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET PAYMENT BY REFERENCE =================
export const getPaymentByReference = async (req, res) => {
  try {
    const { reference } = req.params;
    const payment = await Payment.findOne({ reference })
      .populate("subjectId", "name")
      .populate("planId", "title")
      .populate("userId", "name email");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    console.error("Get payment by reference error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET USER PURCHASED CONTENT =================
export const getUserPurchasedContent = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id,
      status: "success",
      subjectId: { $ne: null },
    }).populate("subjectId", "name price");

    const purchasedContent = payments
      .map((p) => ({
        _id: p.subjectId?._id,
        title: p.subjectId?.name,
        price: p.subjectId?.price,
        priceUSD: p.subjectId?.price,
        amountPaidGHS: p.amount,
        purchasedAt: p.paidAt || p.createdAt,
        paymentStatus: p.status,
        expiresAt: p.expiresAt,
      }))
      .filter((c) => c.title);

    res.json(purchasedContent);
  } catch (err) {
    console.error("Get purchased content error:", err);
    res
      .status(500)
      .json({ message: "Server error: " + err.message });
  }
};