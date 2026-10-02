// controllers/aiPlanController.js - COMPLETE UPDATED VERSION (USD → GHS support)
import AISubscriptionPlan from "../models/AISubscriptionPlan.js";

const FALLBACK_USD_TO_GHS = 15.50;

// ================= GET ALL ACTIVE PLANS =================
export const getPlans = async (req, res) => {
  try {
    const plans = await AISubscriptionPlan.find({ isActive: true }).sort({
      price: 1,
      createdAt: -1,
    });
    res.json(plans);
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
};

// ================= CREATE PLAN (USD + GHS) =================
export const createPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,                      // USD
      priceInGHS,                 // GHS equivalent (from frontend)
      exchangeRateAtCreation,     // rate used
      currency,                   // "USD"
      durationValue,
      durationUnit,
      isPopular,
    } = req.body;

    // Validate
    if (!name || price === undefined || !durationValue || !durationUnit) {
      return res.status(400).json({
        message: "Missing required fields: name, price, durationValue, durationUnit",
      });
    }

    const usdPrice = parseFloat(price);
    if (isNaN(usdPrice) || usdPrice < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    // Prefer frontend GHS, fall back to computing from rate
    const rate = parseFloat(exchangeRateAtCreation) || FALLBACK_USD_TO_GHS;
    const ghsPrice =
      priceInGHS && parseFloat(priceInGHS) > 0
        ? parseFloat(priceInGHS)
        : usdPrice * rate;

    const plan = new AISubscriptionPlan({
      name: name.trim(),
      description: description || "",
      price: usdPrice,
      priceInGHS: Math.round(ghsPrice * 100) / 100,
      exchangeRateAtCreation: rate,
      currency: currency || "USD",
      durationValue: parseInt(durationValue),
      durationUnit,
      isPopular: !!isPopular,
    });

    await plan.save();

    console.log("✅ [AI Plan] Created:", {
      name: plan.name,
      priceUSD: plan.price,
      priceGHS: plan.priceInGHS,
      rate: plan.exchangeRateAtCreation,
    });

    res.status(201).json(plan);
  } catch (err) {
    console.error("Create plan error:", err);
    res.status(500).json({ message: err.message || "Failed to create plan" });
  }
};

// ================= UPDATE PLAN (USD + GHS) =================
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Convert numeric fields
    if (updates.price !== undefined) {
      updates.price = parseFloat(updates.price);
      if (isNaN(updates.price)) {
        return res.status(400).json({ message: "Invalid price" });
      }
    }

    if (updates.durationValue !== undefined) {
      updates.durationValue = parseInt(updates.durationValue);
      if (isNaN(updates.durationValue)) {
        return res.status(400).json({ message: "Invalid duration" });
      }
    }

    // Recompute GHS if USD changed and GHS wasn't explicitly sent
    if (updates.price !== undefined && !updates.priceInGHS) {
      const rate =
        parseFloat(updates.exchangeRateAtCreation) ||
        FALLBACK_USD_TO_GHS;
      updates.priceInGHS = Math.round(updates.price * rate * 100) / 100;
      updates.exchangeRateAtCreation = rate;
    } else if (updates.priceInGHS) {
      updates.priceInGHS = parseFloat(updates.priceInGHS);
      if (updates.exchangeRateAtCreation) {
        updates.exchangeRateAtCreation = parseFloat(
          updates.exchangeRateAtCreation
        );
      }
    }

    const plan = await AISubscriptionPlan.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    console.log("✅ [AI Plan] Updated:", {
      name: plan.name,
      priceUSD: plan.price,
      priceGHS: plan.priceInGHS,
      rate: plan.exchangeRateAtCreation,
    });

    res.json(plan);
  } catch (err) {
    console.error("Update plan error:", err);
    res.status(500).json({ message: err.message || "Failed to update plan" });
  }
};

// ================= DELETE PLAN =================
export const deletePlan = async (req, res) => {
  try {
    const plan = await AISubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("Delete plan error:", err);
    res.status(500).json({ message: "Failed to delete plan" });
  }
};