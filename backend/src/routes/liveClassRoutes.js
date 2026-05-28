// routes/liveClassRoutes.js - COMPLETE WITH PROGRAM-BASED ACCESS CONTROL
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import LiveClass from "../models/LiveClass.js";
import User from "../models/User.js";
import Program from "../models/Program.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import ManualAccess from "../models/ManualAccess.js";
import { createNotification } from "../controllers/notificationController.js";

const router = express.Router();

// Helper function to check if a student has access to a program
const hasProgramAccess = async (userId, programId) => {
  const now = new Date();
  
  // Check if user has a plan covering this program
  const planPayment = await Payment.findOne({
    userId,
    status: "success",
    expiresAt: { $gt: now },
  }).populate({
    path: "planId",
    populate: { path: "subjects", select: "programId" }
  });
  
  if (planPayment?.planId) {
    const hasProgramInPlan = planPayment.planId.subjects.some(
      subject => subject.programId?.toString() === programId.toString()
    );
    if (hasProgramInPlan) return true;
  }
  
  // Check manual access for program
  const manualAccess = await ManualAccess.findOne({
    userId,
    programId,
    status: "active",
    expiresAt: { $gt: now }
  });
  if (manualAccess) return true;
  
  return false;
};

// ================= ADMIN GET ALL CLASSES =================
router.get("/admin/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const liveClasses = await LiveClass.find({})
      .populate("programId", "name code")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(liveClasses);
  } catch (err) {
    console.error("Get all live classes error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN GET PROGRAMS (for form) =================
router.get("/admin/programs", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const programs = await Program.find({ isActive: { $ne: false } })
      .select("_id name code");
    res.json(programs);
  } catch (err) {
    console.error("Get programs error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN GET COURSES BY PROGRAM =================
router.get("/admin/courses/:programId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const courses = await Course.find({ programId: req.params.programId })
      .select("_id name");
    res.json(courses);
  } catch (err) {
    console.error("Get courses error:", err);
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
      .populate("programId", "name code")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .sort({ scheduledStartTime: 1 });

    res.json(liveClasses);
  } catch (err) {
    console.error("Get lecturer classes error:", err);
    res.status(500).json({ message: err.message });
  }
});

// routes/liveClassRoutes.js - FIXED STUDENT ENDPOINT (replace the student section)

// ================= STUDENT GET MY CLASSES (filter by program only - no payment check) =================
router.get("/student/my-classes", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Student only." });
    }

    const { programId } = req.query;
    
    // If programId is provided in query, use it
    let targetProgramId = programId;
    
    // If no programId in query, get from user's profile
    if (!targetProgramId) {
      const user = await User.findById(req.user._id).populate("programId");
      targetProgramId = user.programId?._id || user.programId;
    }
    
    if (!targetProgramId) {
      return res.status(400).json({ message: "No program assigned to this student" });
    }
    
    // Get only classes for the student's program
    const liveClasses = await LiveClass.find({ programId: targetProgramId })
      .populate("programId", "name code")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .sort({ scheduledStartTime: 1 });

    console.log(`Found ${liveClasses.length} live classes for student ${req.user.name} in program ${targetProgramId}`);
    res.json(liveClasses);
  } catch (err) {
    console.error("Get student classes error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= GET SINGLE CLASS (simplified for students - no payment check) =================
router.get("/:classId", protect, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.classId)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .populate("participants.userId", "name email avatar")
      .populate("createdBy", "name");

    if (!liveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }

    // For students, check if they are in the same program
    if (req.user.role === "student") {
      const user = await User.findById(req.user._id);
      const userProgramId = user.programId?._id || user.programId;
      const classProgramId = liveClass.programId?._id || liveClass.programId;
      
      if (userProgramId?.toString() !== classProgramId?.toString()) {
        return res.status(403).json({ 
          message: "You do not have access to this class. This class is for a different program." 
        });
      }
    }
    
    return res.json(liveClass);
  } catch (err) {
    console.error("Get live class details error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= JOIN CLASS (simplified - only program check, no payment) =================
router.post("/:classId/join", protect, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    // For students, check if they are in the same program
    if (req.user.role === "student") {
      const user = await User.findById(req.user._id);
      const userProgramId = user.programId?._id || user.programId;
      const classProgramId = liveClass.programId?._id || liveClass.programId;
      
      if (!userProgramId) {
        return res.status(403).json({ message: "You are not assigned to any program." });
      }
      
      if (userProgramId.toString() !== classProgramId.toString()) {
        return res.status(403).json({ 
          message: "You cannot join this class. This class is for a different program." 
        });
      }
    }

    const now = new Date();
    const classStartTime = new Date(liveClass.scheduledStartTime);
    const canJoin = liveClass.status === "ongoing" || 
                   (liveClass.status === "scheduled" && (classStartTime - now) <= 15 * 60 * 1000);

    if (!canJoin) {
      if (liveClass.status === "scheduled" && classStartTime > now) {
        return res.status(400).json({ message: `Class starts on ${new Date(classStartTime).toLocaleString()}. You can join 15 minutes before start time.` });
      }
      if (liveClass.status === "completed" || now > new Date(liveClass.scheduledEndTime)) {
        return res.status(400).json({ message: "This class has already ended." });
      }
      return res.status(400).json({ message: "Cannot join this class at this time." });
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

// ================= ADMIN CREATE CLASS =================
router.post("/admin/create", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create live classes" });
    }

    const {
      title, description, programId, courseId, subjectId, lecturerId,
      scheduledStartTime, scheduledEndTime, maxParticipants, timerDuration
    } = req.body;

    if (!title || !programId || !courseId || !subjectId || !lecturerId || !scheduledStartTime || !scheduledEndTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify program exists
    const program = await Program.findById(programId);
    if (!program || program.isActive === false) {
      return res.status(400).json({ message: "Invalid or inactive program" });
    }

    // Verify course belongs to program
    const course = await Course.findById(courseId);
    if (!course || course.programId.toString() !== programId) {
      return res.status(400).json({ message: "Course does not belong to selected program" });
    }

    // Verify lecturer exists
    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(400).json({ message: "Invalid lecturer selected" });
    }

    const liveClass = await LiveClass.create({
      title,
      description,
      programId,
      courseId,
      subjectId,
      lecturerId,
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      maxParticipants: maxParticipants || 100,
      createdBy: req.user._id,
      status: "scheduled",
      timerDuration: timerDuration || null,
      autoEndEnabled: true
    });

    const populatedClass = await LiveClass.findById(liveClass._id)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar");

    // Notify lecturer
    try {
      await createNotification(lecturerId, "lecturer", "info",
        "📅 Live Class Scheduled",
        `You have been scheduled to teach "${title}" for ${program.name} on ${new Date(scheduledStartTime).toLocaleString()}`,
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
      title, description, programId, courseId, subjectId, lecturerId,
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

    if (programId) {
      const program = await Program.findById(programId);
      if (!program || program.isActive === false) {
        return res.status(400).json({ message: "Invalid or inactive program" });
      }
      liveClass.programId = programId;
    }

    if (courseId && liveClass.programId) {
      const course = await Course.findById(courseId);
      if (!course || course.programId.toString() !== liveClass.programId.toString()) {
        return res.status(400).json({ message: "Course does not belong to selected program" });
      }
      liveClass.courseId = courseId;
    }

    if (lecturerId) {
      const lecturer = await User.findById(lecturerId);
      if (!lecturer || lecturer.role !== "lecturer") {
        return res.status(400).json({ message: "Invalid lecturer selected" });
      }
      liveClass.lecturerId = lecturerId;
    }

    if (title) liveClass.title = title;
    if (description !== undefined) liveClass.description = description;
    if (subjectId) liveClass.subjectId = subjectId;
    if (scheduledStartTime) liveClass.scheduledStartTime = new Date(scheduledStartTime);
    if (scheduledEndTime) liveClass.scheduledEndTime = new Date(scheduledEndTime);
    if (maxParticipants) liveClass.maxParticipants = maxParticipants;
    if (timerDuration !== undefined) liveClass.timerDuration = timerDuration;

    await liveClass.save();

    const populatedClass = await LiveClass.findById(liveClass._id)
      .populate("programId", "name code")
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

// ================= GET SINGLE CLASS (with access check) =================
router.get("/:classId", protect, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.classId)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("lecturerId", "name email avatar")
      .populate("participants.userId", "name email avatar")
      .populate("createdBy", "name");

    if (!liveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }

    // Access control
    const isAdmin = req.user.role === "admin";
    const isLecturer = liveClass.lecturerId?._id.toString() === req.user._id.toString();
    const isStudent = req.user.role === "student";
    
    if (isAdmin || isLecturer) {
      return res.json(liveClass);
    }
    
    if (isStudent) {
      const hasAccess = await hasProgramAccess(req.user._id, liveClass.programId._id);
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this class. Please purchase the program first." });
      }
      return res.json(liveClass);
    }
    
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    console.error("Get live class details error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= JOIN CLASS (with access check) =================
router.post("/:classId/join", protect, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    // Access control for students
    if (req.user.role === "student") {
      const hasAccess = await hasProgramAccess(req.user._id, liveClass.programId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this class. Please purchase the program first." });
      }
    }

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

// ================= LEAVE CLASS =================
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

// ================= LECTURER START CLASS =================
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

// ================= LECTURER/ADMIN END CLASS =================
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

// ================= CHAT MESSAGE =================
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

export default router;