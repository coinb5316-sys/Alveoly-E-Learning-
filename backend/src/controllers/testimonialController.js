// controllers/testimonialController.js - Fixed with better error handling
import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// Create testimonial (student)
export const createTestimonial = async (req, res) => {
  try {
    const { name, course, rating, feedback } = req.body;

    const testimonial = await Testimonial.create({
      studentId: req.user._id,
      name,
      course,
      rating,
      feedback,
      status: "pending",
    });

    // Notify student that testimonial is pending review
    await createNotification(
      req.user._id,
      "student",
      "info",
      "📝 Testimonial Submitted",
      `Thank you for your feedback! Your testimonial is pending review and will be published once approved.`,
      "/student/testimonials",
      { testimonialId: testimonial._id, action: "submitted" }
    );

    // Notify admins about new testimonial
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        "admin",
        "info",
        "New Testimonial Received",
        `${name} (${course}) submitted a ${rating}-star testimonial awaiting approval.`,
        "/admin/testimonials",
        { testimonialId: testimonial._id, studentId: req.user._id, rating }
      );
    }

    res.status(201).json(testimonial);
  } catch (err) {
    console.error("Create testimonial error:", err);
    res.status(500).json({ message: err.message || "Error creating testimonial" });
  }
};

// Get approved testimonials (public)
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(testimonials);
  } catch (err) {
    console.error("Get testimonials error:", err);
    res.status(500).json({ message: err.message || "Error fetching testimonials" });
  }
};

// Get testimonials for logged-in student
export const getMyTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ studentId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    console.error("Get my testimonials error:", err);
    res.status(500).json({ message: err.message || "Error fetching your testimonials" });
  }
};

// Admin approve testimonial
export const approveTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.status = "approved";
    await testimonial.save();

    // Notify student that their testimonial was approved
    await createNotification(
      testimonial.studentId,
      "student",
      "success",
      "🌟 Testimonial Approved!",
      `Your testimonial for "${testimonial.course}" has been approved and is now visible on our website. Thank you for sharing your experience!`,
      "/student/testimonials",
      { testimonialId: testimonial._id, action: "approved", course: testimonial.course }
    );

    res.json(testimonial);
  } catch (err) {
    console.error("Approve testimonial error:", err);
    res.status(500).json({ message: err.message || "Error approving testimonial" });
  }
};

// Admin reject testimonial
export const rejectTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.status = "rejected";
    await testimonial.save();

    // Notify student that their testimonial was rejected
    await createNotification(
      testimonial.studentId,
      "student",
      "warning",
      "📝 Testimonial Update",
      `Your testimonial for "${testimonial.course}" was not approved. Please ensure your feedback follows our guidelines and try again.`,
      "/student/testimonials",
      { testimonialId: testimonial._id, action: "rejected", course: testimonial.course }
    );

    res.json(testimonial);
  } catch (err) {
    console.error("Reject testimonial error:", err);
    res.status(500).json({ message: err.message || "Error rejecting testimonial" });
  }
};

// Get all pending testimonials (ADMIN)
export const getPendingTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "pending" })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${testimonials.length} pending testimonials`);
    res.json(testimonials);
  } catch (err) {
    console.error("Get pending testimonials error:", err);
    res.status(500).json({ message: err.message || "Error fetching pending testimonials" });
  }
};

// Get all testimonials (ADMIN) - optionally filtered by status
export const getAllTestimonials = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    
    const testimonials = await Testimonial.find(filter)
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    
    res.json(testimonials);
  } catch (err) {
    console.error("Get all testimonials error:", err);
    res.status(500).json({ message: err.message || "Error fetching testimonials" });
  }
};

// Delete testimonial (ADMIN)
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    
    const courseName = testimonial.course;
    const studentId = testimonial.studentId;
    
    await testimonial.deleteOne();
    
    // Notify student that their testimonial was deleted
    if (studentId) {
      await createNotification(
        studentId,
        "student",
        "warning",
        "📝 Testimonial Removed",
        `Your testimonial for "${courseName}" has been removed by an administrator.`,
        "/student/testimonials",
        { action: "deleted", course: courseName }
      );
    }
    
    res.json({ message: "Testimonial deleted successfully" });
  } catch (err) {
    console.error("Delete testimonial error:", err);
    res.status(500).json({ message: err.message || "Error deleting testimonial" });
  }
};

// Get testimonial statistics (ADMIN)
export const getTestimonialStats = async (req, res) => {
  try {
    const total = await Testimonial.countDocuments();
    const approved = await Testimonial.countDocuments({ status: "approved" });
    const pending = await Testimonial.countDocuments({ status: "pending" });
    const rejected = await Testimonial.countDocuments({ status: "rejected" });
    
    const averageRating = await Testimonial.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        total,
        approved,
        pending,
        rejected,
        averageRating: averageRating[0]?.avgRating || 0
      }
    });
  } catch (err) {
    console.error("Get testimonial stats error:", err);
    res.status(500).json({ message: err.message || "Error fetching testimonial stats" });
  }
};