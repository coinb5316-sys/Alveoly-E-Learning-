// middleware/accessMiddleware.js
import User from "../models/User.js";
import Plan from "../models/Plan.js";

// ================= CHECK IF USER HAS PLAN ACCESS =================
export const checkPlanAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Admins and lecturers have full access
    if (req.user.role === "admin" || req.user.role === "lecturer") {
      return next();
    }

    const user = await User.findById(req.user._id).populate("planId");
    
    // Check if user has a plan
    if (!user.planId) {
      // Check if there's a free plan available
      const freePlan = await Plan.findOne({ isFree: true, isActive: true });
      if (freePlan) {
        // Auto-assign free plan
        user.planId = freePlan._id;
        user.isPlanActive = true;
        user.planStartDate = new Date();
        user.planExpiryDate = null; // Never expires
        await user.save();
        return next();
      }
      
      return res.status(403).json({
        message: "You need an active plan to access this content. Please select a plan.",
        requiresPlan: true
      });
    }

    // Check if plan is active
    if (!user.isPlanActive) {
      return res.status(403).json({
        message: "Your plan has expired. Please renew or select a new plan.",
        requiresPlan: true
      });
    }

    // Check if plan has expired
    if (user.planExpiryDate && new Date(user.planExpiryDate) < new Date()) {
      user.isPlanActive = false;
      await user.save();
      return res.status(403).json({
        message: "Your plan has expired. Please renew or select a new plan.",
        requiresPlan: true
      });
    }

    // Check if plan unlocks all content
    const plan = await Plan.findById(user.planId);
    if (plan.unlocksAllContent || plan.accessLevel === "full") {
      return next();
    }

    // If plan has specific access, check if the requested resource is in the plan
    const { resourceType, resourceId } = req.query;
    
    if (resourceType === "subject" && plan.subjects.includes(resourceId)) {
      return next();
    }
    
    if (resourceType === "course" && plan.courses.includes(resourceId)) {
      return next();
    }
    
    if (resourceType === "program" && plan.programs.includes(resourceId)) {
      return next();
    }

    return res.status(403).json({
      message: "Your plan does not include access to this content.",
      requiresUpgrade: true
    });

  } catch (error) {
    console.error("Check Plan Access Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CHECK IF CONTENT IS UNLOCKED FOR USER =================
export const checkContentAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(req.user._id).populate("planId");
    
    // Admins and lecturers have full access
    if (user.role === "admin" || user.role === "lecturer") {
      return next();
    }

    // Check if user has an active plan
    if (!user.planId || !user.isPlanActive) {
      // Check for free plan
      const freePlan = await Plan.findOne({ isFree: true, isActive: true });
      if (freePlan) {
        user.planId = freePlan._id;
        user.isPlanActive = true;
        user.planStartDate = new Date();
        user.planExpiryDate = null;
        await user.save();
        return next();
      }
      
      return res.status(403).json({
        message: "You need an active plan to access this content.",
        requiresPlan: true
      });
    }

    // Check expiry
    if (user.planExpiryDate && new Date(user.planExpiryDate) < new Date()) {
      user.isPlanActive = false;
      await user.save();
      return res.status(403).json({
        message: "Your plan has expired. Please renew.",
        requiresPlan: true
      });
    }

    // Check if plan unlocks all content
    const plan = await Plan.findById(user.planId);
    if (plan.unlocksAllContent || plan.accessLevel === "full") {
      return next();
    }

    // For specific content access, check if the item is in the plan
    // This will be handled by the specific route handlers
    next();

  } catch (error) {
    console.error("Check Content Access Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};