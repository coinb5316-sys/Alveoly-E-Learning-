// controllers/adminLecturerController.js
import User from "../models/User.js";
import LecturerContent from "../models/LecturerContent.js";
import LecturerAttempt from "../models/LecturerAttempt.js";
import { createNotification } from "./notificationController.js";

export const getLecturers = async (req, res) => {
  try {
    const lecturers = await User.find({ role: "lecturer" })
      .select("name email lecturerInfo createdAt updatedAt")
      .populate("lecturerInfo.assignedCourses", "name")
      .populate("lecturerInfo.assignedSubjects", "name")
      .sort({ createdAt: -1 });
    
    res.json(lecturers);
  } catch (err) {
    console.error("Get lecturers error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getLecturerById = async (req, res) => {
  try {
    const lecturer = await User.findById(req.params.id)
      .select("name email lecturerInfo createdAt updatedAt")
      .populate("lecturerInfo.assignedCourses", "name description")
      .populate("lecturerInfo.assignedSubjects", "name");
    
    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(404).json({ message: "Lecturer not found" });
    }
    
    res.json(lecturer);
  } catch (err) {
    console.error("Get lecturer error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getLecturerStats = async (req, res) => {
  try {
    const lecturerId = req.params.id;
    
    const content = await LecturerContent.find({ lecturerId });
    const attempts = await LecturerAttempt.find({ lecturerId });
    
    const uniqueStudents = [...new Set(attempts.map(a => a.studentId.toString()))];
    const completedAttempts = attempts.filter(a => a.status === "completed");
    const averageScore = completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length)
      : 0;
    
    res.json({
      totalContent: content.length,
      publishedContent: content.filter(c => c.isPublished).length,
      totalStudents: uniqueStudents.length,
      averageScore
    });
  } catch (err) {
    console.error("Get lecturer stats error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const assignLecturer = async (req, res) => {
  try {
    const { lecturerId, courseId, subjectId } = req.body;
    
    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(404).json({ message: "Lecturer not found" });
    }
    
    if (!lecturer.lecturerInfo) {
      lecturer.lecturerInfo = {};
    }
    
    if (courseId) {
      if (!lecturer.lecturerInfo.assignedCourses) lecturer.lecturerInfo.assignedCourses = [];
      if (!lecturer.lecturerInfo.assignedCourses.includes(courseId)) {
        lecturer.lecturerInfo.assignedCourses.push(courseId);
      }
    }
    
    if (subjectId) {
      if (!lecturer.lecturerInfo.assignedSubjects) lecturer.lecturerInfo.assignedSubjects = [];
      if (!lecturer.lecturerInfo.assignedSubjects.includes(subjectId)) {
        lecturer.lecturerInfo.assignedSubjects.push(subjectId);
      }
    }
    
    await lecturer.save();
    
    // Send notification
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
    console.error("Assign lecturer error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const toggleLecturerStatus = async (req, res) => {
  try {
    const lecturer = await User.findById(req.params.id);
    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(404).json({ message: "Lecturer not found" });
    }
    
    lecturer.lecturerInfo.isActive = !lecturer.lecturerInfo.isActive;
    await lecturer.save();
    
    const status = lecturer.lecturerInfo.isActive ? "activated" : "deactivated";
    res.json({ success: true, message: `Lecturer ${status} successfully` });
  } catch (err) {
    console.error("Toggle lecturer status error:", err);
    res.status(500).json({ message: err.message });
  }
};