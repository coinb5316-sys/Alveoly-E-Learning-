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

// ================= EMAIL/PASSWORD REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, programId, courseId } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // If programId is provided, verify it exists and is active
    if (programId) {
      const program = await Program.findById(programId);
      if (!program || program.isActive === false) {
        return res.status(400).json({ message: "Invalid or inactive program selected" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      programId: programId || null,
      courseId: courseId || null,
      lastLoginAt: new Date(),
      lastActivityAt: new Date()
    });

    // Send welcome notification to student
    await createNotification(
      user._id,
      "student",
      "success",
      "Welcome to Alveoly! 🎉",
      `Welcome ${name}! Start your learning journey with us today.`,
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

    res.status(201).json({ 
      token: generateToken(user, user.activeSession), 
      user,
      requiresProgram: !user.programId && !user.courseId
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

// ================= REGISTER LECTURER - COMPLETELY FIXED =================
export const registerLecturer = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      programId, 
      courseId, 
      title, 
      assignedSubjects,
      department,
      specialization,
      phoneNumber
    } = req.body;
    
    // ========== DEBUG LOGGING ==========
    console.log("========== REGISTER LECTURER DEBUG ==========");
    console.log("Received assignedSubjects:", assignedSubjects);
    console.log("assignedSubjects type:", typeof assignedSubjects);
    console.log("assignedSubjects is array:", Array.isArray(assignedSubjects));
    console.log("assignedSubjects length:", assignedSubjects?.length);
    // ====================================
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    
    // Validate program if provided
    let validProgramId = null;
    if (programId && programId !== "undefined" && programId !== "null" && programId !== "") {
      const programExists = await Program.findById(programId);
      if (!programExists) {
        return res.status(400).json({ message: "Invalid program selected" });
      }
      validProgramId = new mongoose.Types.ObjectId(programId);
    }
    
    // Validate course if provided
    let validCourseId = null;
    if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
      const courseExists = await Course.findById(courseId);
      if (!courseExists) {
        return res.status(400).json({ message: "Invalid course selected" });
      }
      validCourseId = new mongoose.Types.ObjectId(courseId);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ========== PROCESS SUBJECTS - CRITICAL FIX ==========
    let validSubjectIds = [];
    
    // Check if assignedSubjects exists and is an array with values
    if (assignedSubjects && Array.isArray(assignedSubjects) && assignedSubjects.length > 0) {
      console.log("Processing assignedSubjects, length:", assignedSubjects.length);
      
      for (let i = 0; i < assignedSubjects.length; i++) {
        const subjectId = assignedSubjects[i];
        console.log(`Checking subject ${i}: ${subjectId}`);
        
        if (subjectId && typeof subjectId === 'string' && subjectId.trim() !== "") {
          try {
            // Verify the subject exists in database
            const subjectExists = await Subject.findById(subjectId);
            if (subjectExists) {
              // Verify subject belongs to the selected course (if course is selected)
              if (validCourseId && subjectExists.courseId.toString() !== validCourseId.toString()) {
                console.log(`⚠️ Subject ${subjectId} does NOT belong to course ${validCourseId}`);
                continue;
              }
              
              // Add the valid ObjectId
              validSubjectIds.push(subjectExists._id);
              console.log(`✅ Subject ${subjectId} (${subjectExists.name}) validated and added`);
            } else {
              console.log(`❌ Subject ${subjectId} not found in database`);
            }
          } catch (err) {
            console.log(`❌ Error processing subject ${subjectId}:`, err.message);
          }
        }
      }
    } else {
      console.log("assignedSubjects is not an array or is empty");
    }
    
    console.log(`Final validSubjectIds count: ${validSubjectIds.length}`);
    console.log("Final validSubjectIds:", validSubjectIds.map(id => id.toString()));
    // ====================================
    
    // Create the lecturer user
    const lecturerData = {
      name,
      email,
      password: hashedPassword,
      role: "lecturer",
      programId: validProgramId,
      courseId: validCourseId,
      lecturerInfo: {
        title: title || "Dr.",
        department: department || "",
        specialization: specialization || "",
        phoneNumber: phoneNumber || "",
        bio: "",
        isActive: true,
        hireDate: new Date(),
        assignedCourses: validCourseId ? [validCourseId] : [],
        assignedSubjects: validSubjectIds
      }
    };
    
    console.log("Creating lecturer with assignedSubjects count:", lecturerData.lecturerInfo.assignedSubjects.length);
    
    const user = await User.create(lecturerData);
    
    console.log("✅ Lecturer created with ID:", user._id);
    console.log("✅ Saved assignedSubjects count:", user.lecturerInfo?.assignedSubjects?.length);
    console.log("✅ Saved assignedSubjects:", user.lecturerInfo?.assignedSubjects);
    
    // Send welcome notification
    await createNotification(
      user._id,
      "lecturer",
      "success",
      "Welcome to Alveoly! 🎉",
      `Welcome ${name}! You have been added as a lecturer.`,
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
        `${name} (${email}) has been added as a new lecturer.`,
        "/admin/users",
        { userId: user._id, action: "new_lecturer" }
      );
    }
    
    // Fetch the created user with ALL populated fields
    const createdUser = await User.findById(user._id)
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        model: 'Subject',
        select: 'name courseId',
        populate: {
          path: 'courseId',
          model: 'Course',
          select: 'name'
        }
      })
      .populate('lecturerInfo.assignedCourses', 'name code');
    
    console.log("Returning user with subjects count:", createdUser.lecturerInfo?.assignedSubjects?.length);
    
    res.status(201).json({
      success: true,
      message: "Lecturer created successfully",
      user: createdUser
    });
    
  } catch (err) {
    console.error("Register lecturer error:", err);
    res.status(500).json({ message: err.message });
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