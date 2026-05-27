// controllers/authController.js - Updated with Program support
import User from "../models/User.js";
import Program from "../models/Program.js";
import Course from "../models/Course.js"; 
import Subject from "../models/Subject.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { createNotification } from "./notificationController.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google token required" });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({ 
        name, 
        email,
        avatar: picture,
        lastLoginAt: new Date(),
        lastActivityAt: new Date()
      });
      
      await createNotification(
        user._id,
        "student",
        "success",
        "Welcome to Alveoly! 🎉",
        `Welcome ${name}! Start your learning journey with us today.`,
        "/student/dashboard",
        { action: "welcome", isNewUser: true }
      );
      
      const adminUsers = await User.find({ role: "admin" });
      for (const admin of adminUsers) {
        await createNotification(
          admin._id,
          "admin",
          "info",
          "New Student Registration",
          `${name} (${email}) has registered as a new student.`,
          "/admin/users",
          { userId: user._id, action: "new_user" }
        );
      }
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const deviceInfo = req.headers['user-agent'];
    
    user.lastLoginAt = new Date();
    user.lastActivityAt = new Date();
    user.loginCount += 1;
    user.lastLoginIP = ip;
    user.deviceInfo = deviceInfo;
    user.activeSession = crypto.randomBytes(16).toString("hex");

    await user.save();

    const token = generateToken(user, user.activeSession);
    const requiresProgram = !user.programId && !user.courseId;

    res.json({ token, user, requiresProgram });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(401).json({ 
      message: "Google authentication failed: " + err.message,
      error: err.toString()
    });
  }
};

// ================= EMAIL/PASSWORD REGISTER (WITH AUTO COURSE ASSIGNMENT) =================
export const register = async (req, res) => {
  try {
    const { name, email, password, programId, courseId } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Validate program if provided
    let validProgramId = null;
    let validCourseId = null;
    
    if (programId && programId !== "undefined" && programId !== "null" && programId !== "") {
      const program = await Program.findById(programId);
      if (!program || program.isActive === false) {
        return res.status(400).json({ message: "Invalid or inactive program selected" });
      }
      validProgramId = programId;
      
      // ========== CRITICAL FIX: Automatically assign a course ==========
      // If courseId was provided, use it
      if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
        const course = await Course.findById(courseId);
        if (course && course.programId.toString() === programId) {
          validCourseId = courseId;
        } else {
          // Find first course in this program
          const firstCourse = await Course.findOne({ programId: programId });
          if (firstCourse) {
            validCourseId = firstCourse._id;
            console.log(`✅ Auto-assigned course: ${firstCourse.name} to student`);
          }
        }
      } else {
        // No courseId provided, find first course in this program
        const firstCourse = await Course.findOne({ programId: programId });
        if (firstCourse) {
          validCourseId = firstCourse._id;
          console.log(`✅ Auto-assigned course: ${firstCourse.name} to student`);
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      programId: validProgramId,
      courseId: validCourseId,  // ← Now always has a value if program exists
      lastLoginAt: new Date(),
      lastActivityAt: new Date()
    });

    // Send welcome notification to student
    await createNotification(
      user._id,
      "student",
      "success",
      "Welcome to Alveoly! 🎉",
      `Welcome ${name}! You have been enrolled in ${user.courseId ? 'your course' : 'the platform'}.`,
      "/student/dashboard",
      { action: "welcome" }
    );

    // Notify admins about new registration
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        "admin",
        "info",
        "New Student Registration",
        `${name} (${email}) has registered as a new student.`,
        "/admin/users",
        { userId: user._id, action: "new_user" }
      );
    }

    // Record login info
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const deviceInfo = req.headers['user-agent'];
    
    user.lastLoginAt = new Date();
    user.lastActivityAt = new Date();
    user.loginCount += 1;
    user.lastLoginIP = ip;
    user.deviceInfo = deviceInfo;
    user.activeSession = crypto.randomBytes(16).toString("hex");
    
    await user.save();

    // Populate the user before sending response
    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name");

    res.status(201).json({ 
      token: generateToken(user, user.activeSession), 
      user: populatedUser,
      requiresProgram: false  // Always false now because we auto-assigned a course
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ASSIGN PROGRAM (NEW) =================
export const assignProgram = async (req, res) => {
  try {
    const { programId } = req.body;
    
    if (!programId) {
      return res.status(400).json({ message: "Program is required" });
    }

    // Verify program exists and is active
    const program = await Program.findById(programId);
    if (!program || program.isActive === false) {
      return res.status(400).json({ message: "Invalid or inactive program selected" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { programId },
      { new: true }
    ).populate("programId", "name code");

    // Notify user about program assignment
    await createNotification(
      user._id,
      "student",
      "success",
      "Program Assigned! 📚",
      `You have been enrolled in ${user.programId?.name || "a new program"}.`,
      "/student/courses",
      { programId, action: "program_assigned" }
    );

    res.json(user);
  } catch (err) {
    console.error("ASSIGN PROGRAM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ASSIGN COURSE (Updated with program check) =================
export const assignCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: "Course required" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { courseId },
      { new: true }
    ).populate("courseId", "_id name");

    // Notify user about course assignment
    await createNotification(
      user._id,
      "student",
      "success",
      "Course Assigned! 📚",
      `You have been enrolled in ${user.courseId?.name || "a new course"}.`,
      "/student/courses",
      { courseId, action: "course_assigned" }
    );

    res.json(user);
  } catch (err) {
    console.error("ASSIGN COURSE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= EMAIL/PASSWORD LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password)
      return res.status(400).json({ message: "Please login with Google" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const deviceInfo = req.headers['user-agent'];
    
    user.lastLoginAt = new Date();
    user.lastActivityAt = new Date();
    user.loginCount += 1;
    user.lastLoginIP = ip;
    user.deviceInfo = deviceInfo;
    user.activeSession = crypto.randomBytes(16).toString("hex");

    await user.save();

    const token = generateToken(user, user.activeSession);
    const requiresProgram = !user.programId && !user.courseId;

    res.json({ token, user, requiresProgram });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET CURRENT USER =================
// controllers/authController.js - Make sure getMyInfo is like this:
export const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("programId", "name code isActive")
      .populate("courseId", "_id name")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        populate: { path: 'courseId', select: 'name code' }
      });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.lastActivityAt = new Date();
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 1000 * 60 * 15;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    res.json({
      message: "Password reset link generated",
      resetLink,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password required" });

    const user = await User.findOne({ 
      resetToken: token, 
      resetTokenExpire: { $gt: Date.now() } 
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    await createNotification(
      user._id,
      user.role === "admin" ? "admin" : "student",
      "info",
      "Password Changed 🔐",
      "Your password has been successfully changed.",
      "/login",
      { action: "password_reset" }
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= REGISTER LECTURER - COMPLETELY REWRITTEN =================
export const registerLecturer = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      programId, 
      courseId, 
      title, 
      assignedSubjects
    } = req.body;
    
    console.log("========== REGISTER LECTURER ==========");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Program ID:", programId);
    console.log("Course ID:", courseId);
    console.log("Assigned Subjects RAW:", assignedSubjects);
    console.log("Assigned Subjects type:", typeof assignedSubjects);
    console.log("Is array:", Array.isArray(assignedSubjects));
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    
    // Validate program
    let validProgramId = null;
    if (programId && programId !== "undefined" && programId !== "null" && programId !== "") {
      const programExists = await Program.findById(programId);
      if (!programExists) {
        return res.status(400).json({ message: "Invalid program selected" });
      }
      validProgramId = programId;
    }
    
    // Validate course
    let validCourseId = null;
    if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
      const courseExists = await Course.findById(courseId);
      if (!courseExists) {
        return res.status(400).json({ message: "Invalid course selected" });
      }
      validCourseId = courseId;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ========== CRITICAL: Process assignedSubjects ==========
    let validSubjectIds = [];
    
    // Handle different possible formats of assignedSubjects
    if (assignedSubjects) {
      let subjectsArray = [];
      
      // If it's already an array
      if (Array.isArray(assignedSubjects)) {
        subjectsArray = assignedSubjects;
      } 
      // If it's a string (maybe from form data)
      else if (typeof assignedSubjects === 'string') {
        try {
          subjectsArray = JSON.parse(assignedSubjects);
        } catch (e) {
          subjectsArray = assignedSubjects.split(',').filter(s => s.trim());
        }
      }
      
      console.log("Subjects array to process:", subjectsArray);
      
      // Process each subject ID
      for (const subjectId of subjectsArray) {
        if (subjectId && subjectId !== "" && subjectId !== "undefined" && subjectId !== "null") {
          try {
            // Verify subject exists
            const subject = await Subject.findById(subjectId);
            if (subject) {
              validSubjectIds.push(subject._id);
              console.log(`✅ Subject added: ${subject.name} (${subject._id})`);
            } else {
              console.log(`❌ Subject not found: ${subjectId}`);
            }
          } catch (err) {
            console.log(`❌ Error finding subject ${subjectId}:`, err.message);
          }
        }
      }
    }
    
    console.log(`Final valid subject IDs count: ${validSubjectIds.length}`);
    // ==========================================
    
    // Create the lecturer with proper structure
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "lecturer",
      programId: validProgramId,
      courseId: validCourseId,
      lecturerInfo: {
        title: title || "Dr.",
        department: "",
        specialization: "",
        phoneNumber: "",
        bio: "",
        isActive: true,
        hireDate: new Date(),
        assignedCourses: validCourseId ? [validCourseId] : [],
        assignedSubjects: validSubjectIds
      }
    });
    
    await user.save();
    
    console.log(`✅ Lecturer created: ${user._id}`);
    console.log(`✅ Assigned ${validSubjectIds.length} subjects to lecturer`);
    
    // Send notifications
    await createNotification(
      user._id,
      "lecturer",
      "success",
      "Welcome to Alveoly! 🎉",
      `Welcome ${name}! You have been added as a lecturer with ${validSubjectIds.length} subject(s).`,
      "/lecturer/dashboard",
      { action: "welcome" }
    );
    
    // Notify admins
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        "admin",
        "info",
        "New Lecturer Added",
        `${name} (${email}) has been added as a new lecturer with ${validSubjectIds.length} subject(s).`,
        "/admin/users",
        { userId: user._id, action: "new_lecturer" }
      );
    }
    
    // Fetch and return the created user
    const createdUser = await User.findById(user._id)
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        model: 'Subject',
        select: 'name courseId'
      });
    
    res.status(201).json({
      success: true,
      message: `Lecturer created with ${validSubjectIds.length} subject(s) assigned`,
      user: createdUser
    });
    
  } catch (err) {
    console.error("Register lecturer error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Debug endpoint to check subjects
export const debugSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("programId", "name")
      .populate("courseId", "name");
    
    console.log("All subjects in database:", subjects.map(s => ({
      id: s._id,
      name: s.name,
      courseId: s.courseId,
      programId: s.programId
    })));
    
    res.json({
      count: subjects.length,
      subjects: subjects.map(s => ({
        _id: s._id,
        name: s.name,
        courseId: s.courseId,
        courseName: s.courseId?.name,
        programId: s.programId,
        programName: s.programId?.name
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE ACTIVITY =================
export const updateActivity = async (req, res) => {
  try {
    await req.user.updateActivity();
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE ACTIVITY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};