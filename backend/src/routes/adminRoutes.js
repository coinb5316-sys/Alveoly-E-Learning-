// src/routes/adminRoutes.js - COMPLETE FIXED VERSION
import express from "express";
import {
  getExamResults,
  deleteExamAttempt,
  allowResit,
  getExamDetails,
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { 
  assignLecturer, 
  getLecturerById, 
  getLecturers, 
  getLecturerStats, 
  removeLecturerAssignment, 
  toggleLecturerStatus 
} from "../controllers/adminLecturerController.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { createNotification } from "../controllers/notificationController.js";

const router = express.Router();

// ================= EXISTING ROUTES =================
router.get("/exam-results", protect, adminOnly, getExamResults);
router.delete("/exam-attempt/:attemptId", protect, adminOnly, deleteExamAttempt);
router.patch("/exam-attempt/:attemptId/resit", protect, adminOnly, allowResit);
router.get("/exam-attempt/:attemptId/details", protect, adminOnly, getExamDetails);

// ================= LECTURER MANAGEMENT ROUTES =================
router.get("/lecturers", protect, adminOnly, getLecturers);
router.get("/lecturers/:id", protect, adminOnly, getLecturerById);
router.get("/lecturers/:id/stats", protect, adminOnly, getLecturerStats);
router.post("/lecturers/assign", protect, adminOnly, assignLecturer);
router.delete("/lecturers/:lecturerId/assignments", protect, adminOnly, removeLecturerAssignment);
router.patch("/lecturers/:id/toggle-status", protect, adminOnly, toggleLecturerStatus);

// ================= NEW ROUTES FOR LIVE CLASSES =================

// Get all courses for admin
router.get("/courses", protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    console.log("✅ Fetched courses:", courses.length);
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all users (for lecturers list)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    console.log("✅ Fetched users:", users.length);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get subjects by course
router.get("/subjects", protect, adminOnly, async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = {};
    if (courseId && courseId !== "undefined" && courseId !== "null") {
      filter.courseId = courseId;
    }
    
    const subjects = await Subject.find(filter).populate("courseId", "name");
    console.log(`✅ Fetched subjects for course ${courseId || 'all'}:`, subjects.length);
    res.json(subjects);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get single course by ID
router.get("/courses/:id", protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get single subject by ID
router.get("/subjects/:id", protect, adminOnly, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate("courseId", "name");
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json(subject);
  } catch (err) {
    console.error("Error fetching subject:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;