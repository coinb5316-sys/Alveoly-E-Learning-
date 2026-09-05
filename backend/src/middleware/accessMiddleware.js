// middleware/accessMiddleware.js - Updated with program access
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

    // Check if plan unlocks all content or has program access
    const plan = await Plan.findById(user.planId);
    if (plan.unlocksAllContent || plan.accessLevel === "full") {
      return next();
    }

    // Check if the requested resource is in the plan
    const { resourceType, resourceId, programId } = req.query;
    
    // Check program access
    if (resourceType === "program") {
      if (user.programAccess && user.programAccess.includes(resourceId)) {
        return next();
      }
      if (plan.programs && plan.programs.includes(resourceId)) {
        return next();
      }
    }
    
    if (resourceType === "subject" && plan.subjects.includes(resourceId)) {
      return next();
    }
    
    if (resourceType === "course" && plan.courses.includes(resourceId)) {
      return next();
    }
    
    // If user has program access, check if the subject/course belongs to that program
    if (user.programAccess && user.programAccess.length > 0) {
      // This will be handled by the specific route handlers
      next();
    } else {
      return res.status(403).json({
        message: "Your plan does not include access to this content.",
        requiresUpgrade: true
      });
    }

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

    // Check if user has program access
    const { programId } = req.query;
    if (programId && user.programAccess && user.programAccess.includes(programId)) {
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

// ================= REQUIRE SUBJECT ACCESS =================
export const requireSubjectAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Admins and lecturers have full access
    if (user.role === "admin" || user.role === "lecturer") {
      return next();
    }

    // Students need to check if they have access to the subject
    const userId = user._id;
    const subjectId = req.params.subjectId || req.params.id;
    
    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    // Get user with populated plan
    const userWithPlan = await User.findById(userId).populate("planId");
    
    // Check if user has an active plan
    if (!userWithPlan.planId || !userWithPlan.isPlanActive) {
      // Check for free plan
      const freePlan = await Plan.findOne({ isFree: true, isActive: true });
      if (freePlan) {
        userWithPlan.planId = freePlan._id;
        userWithPlan.isPlanActive = true;
        userWithPlan.planStartDate = new Date();
        userWithPlan.planExpiryDate = null;
        await userWithPlan.save();
        return next();
      }
      
      return res.status(403).json({
        message: "You need an active plan to access this subject.",
        requiresPlan: true
      });
    }

    // Check if plan has expired
    if (userWithPlan.planExpiryDate && new Date(userWithPlan.planExpiryDate) < new Date()) {
      userWithPlan.isPlanActive = false;
      await userWithPlan.save();
      return res.status(403).json({
        message: "Your plan has expired. Please renew.",
        requiresPlan: true
      });
    }

    // Check if plan unlocks all content
    const plan = await Plan.findById(userWithPlan.planId);
    if (plan.unlocksAllContent || plan.accessLevel === "full") {
      return next();
    }

    // Check if the subject is specifically included in the plan
    if (plan.subjects && plan.subjects.includes(subjectId)) {
      return next();
    }

    // If plan has specific courses, check if the subject belongs to any of those courses
    if (plan.courses && plan.courses.length > 0) {
      const Subject = (await import("../models/Subject.js")).default;
      const subject = await Subject.findById(subjectId);
      if (subject && plan.courses.includes(subject.courseId.toString())) {
        return next();
      }
    }

    // Check if user has program access
    if (userWithPlan.programAccess && userWithPlan.programAccess.length > 0) {
      const Subject = (await import("../models/Subject.js")).default;
      const subject = await Subject.findById(subjectId).populate("programId");
      if (subject && subject.programId) {
        const programId = subject.programId._id || subject.programId;
        if (userWithPlan.programAccess.some(id => id.toString() === programId.toString())) {
          return next();
        }
      }
    }

    return res.status(403).json({
      message: "Your plan does not include access to this subject.",
      requiresUpgrade: true
    });

  } catch (error) {
    console.error("Require Subject Access Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CHECK PROGRAM ACCESS =================
export const checkProgramAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const programId = req.params.programId || req.query.programId || req.body.programId;

    if (!programId) {
      return next();
    }

    // Admins and lecturers have full access
    if (user.role === "admin" || user.role === "lecturer") {
      return next();
    }

    // Check if user has program access from their plan
    const userWithPlan = await User.findById(user._id).populate("planId");
    
    if (userWithPlan.programAccess && userWithPlan.programAccess.includes(programId)) {
      return next();
    }

    // Check if plan has program access
    if (userWithPlan.planId) {
      const plan = await Plan.findById(userWithPlan.planId);
      if (plan && plan.programAccess && plan.programAccess.includes(programId)) {
        return next();
      }
      if (plan && (plan.unlocksAllContent || plan.accessLevel === "full")) {
        return next();
      }
    }

    return res.status(403).json({
      message: "Your plan does not include access to this program.",
      requiresUpgrade: true
    });

  } catch (error) {
    console.error("Check Program Access Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default {
  checkPlanAccess,
  checkContentAccess,
  requireSubjectAccess,
  checkProgramAccess
};