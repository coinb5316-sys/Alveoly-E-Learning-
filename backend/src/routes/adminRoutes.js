// src/routes/adminRoutes.js
import express from "express";
import {
  getExamResults,
  deleteExamAttempt,
  allowResit,
  getExamDetails,  // Add this import
} from "../controllers/adminController.js";
// routes/adminRoutes.js - Add these endpoints

import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { assignLecturer, getLecturerById, getLecturers, getLecturerStats, removeLecturerAssignment, toggleLecturerStatus } from "../controllers/adminLecturerController.js";

const router = express.Router();

router.get("/exam-results", protect, adminOnly, getExamResults);
router.delete("/exam-attempt/:attemptId", protect, adminOnly, deleteExamAttempt);
router.patch("/exam-attempt/:attemptId/resit", protect, adminOnly, allowResit);
router.get("/exam-attempt/:attemptId/details", protect, adminOnly, getExamDetails);  // Add this route

// Lecturer Management Routes
router.get("/lecturers", protect, adminOnly, getLecturers);
router.get("/lecturers/:id", protect, adminOnly, getLecturerById);
router.get("/lecturers/:id/stats", protect, adminOnly, getLecturerStats);
router.post("/lecturers/assign", protect, adminOnly, assignLecturer);
router.delete("/lecturers/:lecturerId/assignments", protect, adminOnly, removeLecturerAssignment);
router.patch("/lecturers/:id/toggle-status", protect, adminOnly, toggleLecturerStatus);

// Add to your admin routes file
// routes/adminRoutes.js - Add these endpoints

// Assign lecturer to course/subject
router.post("/lecturers/assign", async (req, res) => {
  try {
    const { lecturerId, courseId, subjectId } = req.body;
    
    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(404).json({ message: "Lecturer not found" });
    }
    
    if (courseId && !lecturer.lecturerInfo.assignedCourses.includes(courseId)) {
      lecturer.lecturerInfo.assignedCourses.push(courseId);
    }
    
    if (subjectId && !lecturer.lecturerInfo.assignedSubjects.includes(subjectId)) {
      lecturer.lecturerInfo.assignedSubjects.push(subjectId);
    }
    
    await lecturer.save();
    
    // Notify lecturer
    await createNotification(
      lecturerId,
      "lecturer",
      "info",
      "New Assignment",
      `You have been assigned to a new ${courseId ? "course" : "subject"}.`,
      "/lecturer/dashboard",
      { courseId, subjectId }
    );
    
    res.json({ success: true, message: "Lecturer assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all lecturers
router.get("/lecturers", async (req, res) => {
  try {
    const lecturers = await User.find({ role: "lecturer" })
      .select("name email lecturerInfo createdAt")
      .populate("lecturerInfo.assignedCourses", "name")
      .populate("lecturerInfo.assignedSubjects", "name");
    
    res.json(lecturers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;