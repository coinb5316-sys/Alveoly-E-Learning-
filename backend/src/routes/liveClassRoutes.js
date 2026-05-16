// routes/liveClassRoutes.js - COMPLETE WITH ALL ENDPOINTS (IN CORRECT ORDER)
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import LiveClass from "../models/LiveClass.js";
import User from "../models/User.js";
import { createNotification } from "../controllers/notificationController.js";

const router = express.Router();

// ================= ADMIN GET ALL CLASSES =================
router.get("/admin/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const liveClasses = await LiveClass.find({})
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    console.log(`Found ${liveClasses.length} live classes for admin`);
    res.json(liveClasses);
  } catch (err) {
    console.error("Get all live classes error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= LECTURER GET MY CLASSES =================
router.get("/lecturer/my-classes", protect, async (req, res) => {
  try {
    if (req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Access denied. Lecturer only." });
    }

    const liveClasses = await LiveClass.find({ lecturerId: req.user._id })
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .sort({ scheduledStartTime: 1 });

    console.log(`Found ${liveClasses.length} live classes for lecturer ${req.user.name}`);
    res.json(liveClasses);
  } catch (err) {
    console.error("Get lecturer classes error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= STUDENT GET MY CLASSES =================
router.get("/student/my-classes", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Student only." });
    }

    // Get all classes (for now, since students might not have enrolledCourses populated)
    // You can modify this later to filter by enrolled courses
    const liveClasses = await LiveClass.find({})
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .sort({ scheduledStartTime: 1 });

    console.log(`Found ${liveClasses.length} live classes for student ${req.user.name}`);
    res.json(liveClasses);
  } catch (err) {
    console.error("Get student classes error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN CREATE CLASS =================
router.post("/admin/create", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create live classes" });
    }

    const {
      title, description, courseId, subjectId, lecturerId,
      scheduledStartTime, scheduledEndTime, maxParticipants, timerDuration
    } = req.body;

    if (!title || !courseId || !subjectId || !lecturerId || !scheduledStartTime || !scheduledEndTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const liveClass = await LiveClass.create({
      title, description, courseId, subjectId, lecturerId,
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      maxParticipants: maxParticipants || 100,
      createdBy: req.user._id,
      status: "scheduled",
      timerDuration: timerDuration || null,
      autoEndEnabled: true
    });

    const populatedClass = await LiveClass.findById(liveClass._id)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar");

    // Notify lecturer
    try {
      await createNotification(lecturerId, "lecturer", "info",
        "📅 Live Class Scheduled",
        `You have been scheduled to teach "${title}" on ${new Date(scheduledStartTime).toLocaleString()}`,
        `/lecturer/live-class/${liveClass._id}`,
        { classId: liveClass._id, action: "class_scheduled" }
      );
    } catch (notifyErr) {
      console.error("Failed to notify lecturer:", notifyErr.message);
    }

    res.status(201).json({ success: true, message: "Live class created successfully", liveClass: populatedClass });
  } catch (err) {
    console.error("Create live class error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN UPDATE CLASS =================
router.put("/admin/:classId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update live classes" });
    }

    const {
      title, description, courseId, subjectId, lecturerId,
      scheduledStartTime, scheduledEndTime, maxParticipants, timerDuration
    } = req.body;

    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }

    if (liveClass.status === "ongoing") {
      return res.status(400).json({ message: "Cannot edit an ongoing class" });
    }
    
    if (liveClass.status === "completed") {
      return res.status(400).json({ message: "Cannot edit a completed class" });
    }

    if (title) liveClass.title = title;
    if (description !== undefined) liveClass.description = description;
    if (courseId) liveClass.courseId = courseId;
    if (subjectId) liveClass.subjectId = subjectId;
    if (lecturerId) liveClass.lecturerId = lecturerId;
    if (scheduledStartTime) liveClass.scheduledStartTime = new Date(scheduledStartTime);
    if (scheduledEndTime) liveClass.scheduledEndTime = new Date(scheduledEndTime);
    if (maxParticipants) liveClass.maxParticipants = maxParticipants;
    if (timerDuration !== undefined) liveClass.timerDuration = timerDuration;

    await liveClass.save();

    const populatedClass = await LiveClass.findById(liveClass._id)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar");

    res.json({ success: true, message: "Live class updated successfully", liveClass: populatedClass });
  } catch (err) {
    console.error("Update live class error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN DELETE CLASS =================
router.delete("/admin/:classId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }

    if (liveClass.status === "ongoing") {
      return res.status(400).json({ message: "Cannot delete an ongoing class. Please end it first." });
    }

    await liveClass.deleteOne();
    res.json({ success: true, message: "Live class deleted successfully" });
  } catch (err) {
    console.error("Delete live class error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= JOIN/LEAVE ROUTES =================
router.post("/:classId/join", protect, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    const now = new Date();
    const classStartTime = new Date(liveClass.scheduledStartTime);
    const canJoin = liveClass.status === "ongoing" || 
                   (liveClass.status === "scheduled" && (classStartTime - now) <= 15 * 60 * 1000);

    if (!canJoin) {
      return res.status(400).json({ message: "Cannot join this class at this time" });
    }

    const isLecturer = liveClass.lecturerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    let role = "student";
    
    if (isLecturer) role = "lecturer";
    else if (isAdmin) role = "admin";

    const existingParticipant = liveClass.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (existingParticipant && !existingParticipant.leftAt) {
      return res.json({ success: true, message: "Already joined", liveClass });
    }

    if (existingParticipant && existingParticipant.leftAt) {
      existingParticipant.leftAt = null;
      existingParticipant.joinedAt = new Date();
    } else {
      liveClass.participants.push({
        userId: req.user._id,
        role: role,
        joinedAt: new Date(),
        audioEnabled: true,
        videoEnabled: true
      });
    }

    await liveClass.save();
    res.json({ success: true, message: "Joined live class successfully", liveClass });
  } catch (err) {
    console.error("Join live class error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/:classId/leave", protect, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    const participant = liveClass.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (participant && !participant.leftAt) {
      participant.leftAt = new Date();
      participant.duration = Math.round((participant.leftAt - participant.joinedAt) / 1000 / 60);
    }

    await liveClass.save();
    res.json({ success: true, message: "Left live class successfully" });
  } catch (err) {
    console.error("Leave live class error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= LECTURER START/END CLASS =================
router.post("/lecturer/:classId/start", protect, async (req, res) => {
  try {
    if (req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Only lecturers can start classes" });
    }

    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });
    if (liveClass.lecturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the assigned lecturer" });
    }
    if (liveClass.status !== "scheduled") {
      return res.status(400).json({ message: `Cannot start class with status: ${liveClass.status}` });
    }

    liveClass.status = "ongoing";
    liveClass.actualStartTime = new Date();
    
    if (liveClass.timerDuration) {
      liveClass.timerStartedAt = new Date();
    }

    await liveClass.save();
    res.json({ success: true, message: "Live class started successfully", liveClass });
  } catch (err) {
    console.error("Start live class error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/lecturer/:classId/end", protect, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    const isAuthorized = liveClass.lecturerId.toString() === req.user._id.toString() || req.user.role === "admin";
    if (!isAuthorized) {
      return res.status(403).json({ message: "Only lecturer or admin can end the class" });
    }

    liveClass.status = "completed";
    liveClass.actualEndTime = new Date();

    for (const participant of liveClass.participants) {
      if (participant.joinedAt && !participant.leftAt) {
        participant.leftAt = new Date();
        participant.duration = Math.round((participant.leftAt - participant.joinedAt) / 1000 / 60);
      }
    }

    await liveClass.save();
    res.json({ success: true, message: "Live class ended successfully", liveClass });
  } catch (err) {
    console.error("End live class error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= CHAT MESSAGE ROUTES =================
router.post("/:classId/chat", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    const newMessage = {
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "",
      message: message,
      messageType: "text",
      timestamp: new Date(),
      reactions: []
    };

    liveClass.chatMessages.push(newMessage);
    await liveClass.save();

    res.json({ success: true, message: "Message sent", chatMessage: newMessage });
  } catch (err) {
    console.error("Send chat error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= GET SINGLE CLASS (MUST BE LAST) =================
router.get("/:classId", protect, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.classId)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .populate("participants.userId", "name email avatar")
      .populate("createdBy", "name");

    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    res.json(liveClass);
  } catch (err) {
    console.error("Get live class details error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;