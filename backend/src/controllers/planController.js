// controllers/planController.js
import Plan from "../models/Plan.js";
import { io } from "../../server.js";

// ================= GET ALL PLANS =================
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find()
      .populate("subjects", "name")
      .populate("courses", "name")
      .populate("programs", "name")
      .sort({ price: 1, createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error("Get Plans Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET PUBLIC PLANS =================
export const getPublicPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .populate("subjects", "name")
      .populate("courses", "name")
      .populate("programs", "name")
      .sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    console.error("Get Public Plans Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET SINGLE PLAN =================
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate("subjects", "name")
      .populate("courses", "name")
      .populate("programs", "name");
    
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  } catch (error) {
    console.error("Get Plan Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CREATE PLAN =================
export const createPlan = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      duration,
      durationUnit,
      isFree,
      isActive,
      features,
      unlocksAllContent,
      subjects,
      courses,
      programs,
      accessLevel,
      freeAccess
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Plan title is required" });
    }

    if (!price && price !== 0) {
      return res.status(400).json({ message: "Plan price is required" });
    }

    if (!duration) {
      return res.status(400).json({ message: "Plan duration is required" });
    }

    // If free plan, set price to 0
    const finalPrice = isFree || freeAccess ? 0 : price;

    const plan = await Plan.create({
      title,
      description: description || "",
      price: finalPrice,
      duration,
      durationUnit: durationUnit || "month",
      isFree: isFree || false,
      isActive: isActive !== undefined ? isActive : true,
      features: features || [],
      unlocksAllContent: unlocksAllContent || false,
      subjects: subjects || [],
      courses: courses || [],
      programs: programs || [],
      accessLevel: accessLevel || "full",
      freeAccess: freeAccess || false,
      createdBy: req.user._id
    });

    const populatedPlan = await Plan.findById(plan._id)
      .populate("subjects", "name")
      .populate("courses", "name")
      .populate("programs", "name");

    io.emit("plan:created", populatedPlan);

    res.status(201).json(populatedPlan);
  } catch (error) {
    console.error("Create Plan Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE PLAN =================
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const {
      title,
      description,
      price,
      duration,
      durationUnit,
      isFree,
      isActive,
      features,
      unlocksAllContent,
      subjects,
      courses,
      programs,
      accessLevel,
      freeAccess
    } = req.body;

    if (title) plan.title = title;
    if (description !== undefined) plan.description = description;
    if (price !== undefined) plan.price = isFree || freeAccess ? 0 : price;
    if (duration) plan.duration = duration;
    if (durationUnit) plan.durationUnit = durationUnit;
    if (isFree !== undefined) plan.isFree = isFree;
    if (isActive !== undefined) plan.isActive = isActive;
    if (features) plan.features = features;
    if (unlocksAllContent !== undefined) plan.unlocksAllContent = unlocksAllContent;
    if (subjects) plan.subjects = subjects;
    if (courses) plan.courses = courses;
    if (programs) plan.programs = programs;
    if (accessLevel) plan.accessLevel = accessLevel;
    if (freeAccess !== undefined) plan.freeAccess = freeAccess;

    await plan.save();

    const populatedPlan = await Plan.findById(plan._id)
      .populate("subjects", "name")
      .populate("courses", "name")
      .populate("programs", "name");

    io.emit("plan:updated", populatedPlan);

    res.json(populatedPlan);
  } catch (error) {
    console.error("Update Plan Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= DELETE PLAN =================
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    await plan.deleteOne();
    io.emit("plan:deleted", req.params.id);

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Delete Plan Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};