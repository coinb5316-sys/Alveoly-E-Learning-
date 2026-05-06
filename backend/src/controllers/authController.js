// controllers/authController.js - SIMPLIFIED VERSION
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { createNotification } from "./notificationController.js";

// Use the same client ID for all environments (simpler)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google token required" });
    }

    console.log("Google login attempt - Client ID used:", GOOGLE_CLIENT_ID);
    console.log("Request origin:", req.headers.origin);

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
    const requiresCourse = !user.courseId;

    res.json({ token, user, requiresCourse });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(401).json({ 
      message: "Google authentication failed: " + err.message,
      error: err.toString()
    });
  }
};

// Rest of your functions remain the same...


// ================= EMAIL/PASSWORD REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, courseId } = req.body;
    if (!name || !email || !password || !courseId)
      return res.status(400).json({ message: "All fields required" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      courseId,
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

    // Record login with IP and device info
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const deviceInfo = req.headers['user-agent'];
    
    user.lastLoginAt = new Date();
    user.lastActivityAt = new Date();
    user.loginCount += 1;
    user.lastLoginIP = ip;
    user.deviceInfo = deviceInfo;
    user.activeSession = crypto.randomBytes(16).toString("hex");
    
    await user.save();

    res.status(201).json({ token: generateToken(user, user.activeSession), user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
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

    // Record login with IP and device info
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

    res.json({ token, user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ASSIGN COURSE =================
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

// ================= GET CURRENT USER =================
export const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("courseId", "_id name");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Update last activity
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

    // Notify user about password reset
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