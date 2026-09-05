// controllers/authController.js - COMPLETE FIXED VERSION
import User from "../models/User.js";
import Program from "../models/Program.js";
import Course from "../models/Course.js"; 
import Subject from "../models/Subject.js";
import Plan from "../models/Plan.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { createNotification } from "./notificationController.js";
import {
  sendApprovalEmail,
  sendApprovalConfirmationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPlanExpiryEmail
} from "../utils/emailService.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ================= GENERATE APPROVAL TOKEN =================
const generateApprovalToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// ================= REGISTER - ALVEOLY STUDENT (FORM) =================
export const registerAlveolyStudent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      registrationSource, 
      registrationDetails,
      userType,
      programId,
      courseId
    } = req.body;

    console.log("📝 Register Alveoly Student - Request body:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields required (name, email, password)" 
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate approval token
    const approvalToken = generateApprovalToken();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

    // Validate program and course if provided
    let validProgramId = null;
    let validCourseId = null;
    
    if (programId && programId !== "undefined" && programId !== "null" && programId !== "") {
      const program = await Program.findById(programId);
      if (program && program.isActive !== false) {
        validProgramId = programId;
      }
    }
    
    if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
      const course = await Course.findById(courseId);
      if (course) {
        validCourseId = courseId;
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: userType || "alveoly_student",
      registrationSource: registrationSource || "other",
      registrationDetails: registrationDetails || "",
      isApproved: false,
      approvalToken: approvalToken,
      tokenExpiresAt: tokenExpiresAt,
      registrationCompleted: false,
      programId: validProgramId,
      courseId: validCourseId,
      lastLoginAt: new Date(),
      lastActivityAt: new Date(),
      subscriptionStatus: "pending"
    });

    console.log("✅ Alveoly student created:", user._id);

    // Send approval email
    try {
      const emailSent = await sendApprovalEmail(user.email, user.name, approvalToken);
      console.log("📧 Approval email sent:", emailSent);
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name, "alveoly_student");
    } catch (emailErr) {
      console.error("Welcome email error:", emailErr.message);
    }

    // Notify admins with registration details
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        "admin",
        "info",
        "New Alveoly Student Registration Pending Approval",
        `${name} (${email}) has registered. Source: ${registrationSource || "Not specified"}${registrationDetails ? `. Details: ${registrationDetails}` : ''}`,
        "/admin/users",
        { 
          userId: user._id, 
          action: "new_user_pending",
          registrationSource,
          registrationDetails
        }
      );
    }

    res.status(201).json({
      success: true,
      message: "Registration submitted for approval. Please wait for admin approval.",
      requiresApproval: true,
      userId: user._id,
      email: user.email
    });

  } catch (err) {
    console.error("❌ REGISTER ALVEOLY STUDENT ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Server error" 
    });
  }
};

// ================= REGISTER - NON-ALVEOLY STUDENT =================
export const registerNonAlveolyStudent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      userType 
    } = req.body;

    console.log("📝 Register Non-Alveoly Student - Request body:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields required (name, email, password)" 
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with pending status - they must subscribe to a plan
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: userType || "non_alveoly_student",
      registrationSource: "none",
      registrationDetails: "",
      registrationCompleted: false,
      isApproved: false, // Not approved until they subscribe to a plan
      isPlanActive: false,
      subscriptionStatus: "pending",
      lastLoginAt: new Date(),
      lastActivityAt: new Date()
    });

    console.log("✅ Non-Alveoly student created (pending plan):", user._id);

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name, "non_alveoly_student");
    } catch (emailErr) {
      console.error("Welcome email error:", emailErr.message);
    }

    // Notify admins
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        "admin",
        "info",
        "New Non-Alveoly Student Registered - Awaiting Plan Subscription",
        `${name} (${email}) has registered. They need to subscribe to a plan.`,
        "/admin/users",
        { userId: user._id, action: "new_user_awaiting_plan" }
      );
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. Please subscribe to a plan to activate your account.",
      userId: user._id,
      email: user.email,
      requiresPlan: true,
      redirectTo: "/pricing" // Redirect to pricing page
    });

  } catch (err) {
    console.error("❌ REGISTER NON-ALVEOLY STUDENT ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Server error" 
    });
  }
};

// ================= ASSIGN PLAN TO USER (After Payment) =================
export const assignPlanAfterPayment = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ message: "User ID and Plan ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Calculate expiry
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    
    switch (plan.durationUnit) {
      case "day":
        expiryDate.setDate(expiryDate.getDate() + plan.duration);
        break;
      case "week":
        expiryDate.setDate(expiryDate.getDate() + (plan.duration * 7));
        break;
      case "month":
        expiryDate.setMonth(expiryDate.getMonth() + plan.duration);
        break;
      case "year":
        expiryDate.setFullYear(expiryDate.getFullYear() + plan.duration);
        break;
      default:
        expiryDate.setDate(expiryDate.getDate() + plan.duration);
    }

    // Update user with plan
    user.planId = planId;
    user.planStartDate = startDate;
    user.planExpiryDate = expiryDate;
    user.isPlanActive = true;
    user.manuallyAssignedPlan = false;
    user.subscriptionStatus = "active";
    user.subscriptionExpiry = expiryDate;
    user.isApproved = true; // Auto-approve after plan subscription
    user.registrationCompleted = true;

    await user.save();

    // Create notification for user
    await createNotification(
      user._id,
      "student",
      "success",
      "Plan Activated! 🎉",
      `Your "${plan.title}" plan has been activated. You can now select your program.`,
      "/select-program",
      { planId, action: "plan_activated_after_payment" }
    );

    // Notify admins about successful plan activation
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        "admin",
        "success",
        "Non-Alveoly Student Activated Plan",
        `${user.name} (${user.email}) has subscribed to "${plan.title}" plan and is now active.`,
        "/admin/users",
        { userId: user._id, planId: plan._id, action: "plan_activated" }
      );
    }

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("planId", "title duration price durationUnit")
      .populate("programId", "name code isActive")
      .populate("courseId", "name");

    res.json({
      success: true,
      message: `Plan "${plan.title}" activated successfully! Please select your program.`,
      user: populatedUser,
      requiresProgram: !populatedUser.programId
    });

  } catch (err) {
    console.error("ASSIGN PLAN AFTER PAYMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= COMPLETE REGISTRATION - SELECT PROGRAM =================
export const completeRegistration = async (req, res) => {
  try {
    const { userId, programId, courseId } = req.body;

    if (!userId || !programId) {
      return res.status(400).json({ message: "User ID and Program are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For Alveoly students - must be approved
    if (user.userType === "alveoly_student" && !user.isApproved) {
      return res.status(403).json({ 
        message: "Your account is pending approval. Please wait for admin approval." 
      });
    }

    // For Non-Alveoly students - must have an active plan
    if (user.userType === "non_alveoly_student") {
      if (!user.isPlanActive || !user.planId) {
        return res.status(403).json({ 
          message: "You need an active plan to continue. Please subscribe to a plan.",
          requiresPlan: true
        });
      }
      
      // Check if plan is expired
      if (user.planExpiryDate && new Date(user.planExpiryDate) < new Date()) {
        user.isPlanActive = false;
        user.subscriptionStatus = "expired";
        await user.save();
        return res.status(403).json({ 
          message: "Your plan has expired. Please renew your subscription.",
          requiresPlan: true
        });
      }
    }

    const program = await Program.findById(programId);
    if (!program || program.isActive === false) {
      return res.status(400).json({ message: "Invalid or inactive program selected" });
    }

    let validCourseId = courseId;
    if (!validCourseId) {
      const firstCourse = await Course.findOne({ programId: programId });
      if (firstCourse) {
        validCourseId = firstCourse._id;
      }
    }

    user.programId = programId;
    user.courseId = validCourseId || null;
    user.registrationCompleted = true;
    await user.save();

    await createNotification(
      user._id,
      "student",
      "success",
      "Program Selected! 📚",
      `You have been enrolled in ${program.name}${validCourseId ? ' with course' : ''}.`,
      "/student/dashboard",
      { programId, courseId: validCourseId, action: "program_selected" }
    );

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate("planId", "title duration price");

    res.json({
      success: true,
      message: "Registration completed successfully",
      user: populatedUser
    });

  } catch (err) {
    console.error("COMPLETE REGISTRATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= VERIFY APPROVAL TOKEN =================
export const verifyApprovalToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      approvalToken: token,
      tokenExpiresAt: { $gt: new Date() },
      isApproved: false
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired approval token. Please contact admin." 
      });
    }

    user.isApproved = true;
    user.approvalToken = null;
    user.tokenExpiresAt = null;
    user.registrationCompleted = true;
    await user.save();

    try {
      await sendApprovalConfirmationEmail(user.email, user.name);
    } catch (emailErr) {
      console.error("Approval email error:", emailErr.message);
    }

    await createNotification(
      user._id,
      "student",
      "success",
      "Account Approved! 🎉",
      "Your account has been approved. Please login and select your program.",
      "/login",
      { action: "account_approved" }
    );

    res.json({
      success: true,
      message: "Account approved successfully. You can now login.",
      email: user.email
    });

  } catch (err) {
    console.error("VERIFY APPROVAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if Alveoly student needs approval
    if (user.userType === "alveoly_student" && !user.isApproved) {
      return res.status(403).json({ 
        message: "Your account is pending approval. Please wait for admin approval.",
        requiresApproval: true
      });
    }

    // Check if Non-Alveoly student has active plan
    if (user.userType === "non_alveoly_student") {
      if (!user.isPlanActive || !user.planId) {
        return res.status(403).json({ 
          message: "You need an active plan to access your account. Please subscribe to a plan.",
          requiresPlan: true,
          redirectTo: "/pricing"
        });
      }
      
      // Check if plan is expired
      if (user.planExpiryDate && new Date(user.planExpiryDate) < new Date()) {
        user.isPlanActive = false;
        user.subscriptionStatus = "expired";
        await user.save();
        return res.status(403).json({ 
          message: "Your plan has expired. Please renew your subscription.",
          requiresPlan: true,
          redirectTo: "/pricing"
        });
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

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate("planId", "title duration price");

    const token = generateToken(user, user.activeSession);
    const requiresProgram = !populatedUser.programId && !populatedUser.courseId;

    res.json({ 
      token, 
      user: populatedUser, 
      requiresProgram
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  try {
    const { idToken, userType, registrationSource, registrationDetails, programId, courseId } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google token required" });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Check if Alveoly student needs approval
      if (user.userType === "alveoly_student" && !user.isApproved) {
        return res.status(403).json({ 
          message: "Your account is pending approval. Please wait for admin approval.",
          requiresApproval: true
        });
      }

      // Check if Non-Alveoly student has active plan
      if (user.userType === "non_alveoly_student") {
        if (!user.isPlanActive || !user.planId) {
          return res.status(403).json({ 
            message: "You need an active plan to access your account. Please subscribe to a plan.",
            requiresPlan: true,
            redirectTo: "/pricing"
          });
        }
        
        if (user.planExpiryDate && new Date(user.planExpiryDate) < new Date()) {
          user.isPlanActive = false;
          user.subscriptionStatus = "expired";
          await user.save();
          return res.status(403).json({ 
            message: "Your plan has expired. Please renew your subscription.",
            requiresPlan: true,
            redirectTo: "/pricing"
          });
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

      const populatedUser = await User.findById(user._id)
        .select("-password")
        .populate("programId", "name code isActive")
        .populate("courseId", "name")
        .populate("planId", "title duration price");

      const token = generateToken(user, user.activeSession);
      const requiresProgram = !populatedUser.programId && !populatedUser.courseId;

      return res.json({ 
        token, 
        user: populatedUser, 
        requiresProgram
      });
    }

    // New user - check if user type is provided
    if (!userType) {
      return res.status(404).json({ 
        message: "Please select your user type to create an account.",
        requiresUserType: true
      });
    }

    // Validate program and course if provided
    let validProgramId = null;
    let validCourseId = null;
    
    if (programId && programId !== "undefined" && programId !== "null" && programId !== "") {
      const program = await Program.findById(programId);
      if (program && program.isActive !== false) {
        validProgramId = programId;
      }
    }
    
    if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
      const course = await Course.findById(courseId);
      if (course) {
        validCourseId = courseId;
      }
    }

    let newUserData = {
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      avatar: picture || "",
      userType: userType,
      registrationCompleted: false,
      programId: validProgramId,
      courseId: validCourseId,
      lastLoginAt: new Date(),
      lastActivityAt: new Date()
    };

    if (userType === "alveoly_student") {
      const approvalToken = generateApprovalToken();
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

      newUserData = {
        ...newUserData,
        registrationSource: registrationSource || "other",
        registrationDetails: registrationDetails || "",
        isApproved: false,
        approvalToken: approvalToken,
        tokenExpiresAt: tokenExpiresAt,
        registrationCompleted: false,
        subscriptionStatus: "pending"
      };

      try {
        await sendApprovalEmail(email, name || email.split('@')[0], approvalToken);
        await sendWelcomeEmail(email, name || email.split('@')[0], "alveoly_student");
      } catch (emailErr) {
        console.error("Email error:", emailErr.message);
      }
      
    } else {
      // Non-Alveoly student - must subscribe to plan
      newUserData = {
        ...newUserData,
        registrationSource: "none",
        registrationDetails: "",
        isApproved: false,
        isPlanActive: false,
        registrationCompleted: false,
        subscriptionStatus: "pending"
      };
      
      try {
        await sendWelcomeEmail(email, name || email.split('@')[0], "non_alveoly_student");
      } catch (emailErr) {
        console.error("Email error:", emailErr.message);
      }
    }

    const newUser = await User.create(newUserData);

    // Notify admins
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      const notificationTitle = userType === "alveoly_student" 
        ? "New Alveoly Student Registration Pending Approval (Google)" 
        : "New Non-Alveoly Student Registered (Google) - Awaiting Plan";
      
      const notificationMessage = userType === "alveoly_student"
        ? `${name || email} (${email}) has registered via Google. Source: ${registrationSource || "Not specified"}${registrationDetails ? `. Details: ${registrationDetails}` : ''}`
        : `${name || email} (${email}) has registered via Google. They need to subscribe to a plan.`;
      
      await createNotification(
        admin._id,
        "admin",
        "info",
        notificationTitle,
        notificationMessage,
        "/admin/users",
        { 
          userId: newUser._id, 
          action: "new_user",
          registrationSource,
          registrationDetails,
          userType
        }
      );
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const deviceInfo = req.headers['user-agent'];
    
    newUser.lastLoginAt = new Date();
    newUser.lastActivityAt = new Date();
    newUser.loginCount += 1;
    newUser.lastLoginIP = ip;
    newUser.deviceInfo = deviceInfo;
    newUser.activeSession = crypto.randomBytes(16).toString("hex");

    await newUser.save();

    const populatedUser = await User.findById(newUser._id)
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate("planId", "title duration price");

    const token = generateToken(newUser, newUser.activeSession);
    const requiresProgram = !populatedUser.programId && !populatedUser.courseId;
    const requiresApproval = !populatedUser.isApproved && populatedUser.userType === "alveoly_student";
    const requiresPlan = populatedUser.userType === "non_alveoly_student" && !populatedUser.planId;

    return res.json({ 
      token, 
      user: populatedUser, 
      requiresProgram,
      requiresApproval,
      requiresPlan,
      redirectTo: requiresPlan ? "/pricing" : undefined
    });

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(401).json({ 
      message: "Google authentication failed: " + err.message
    });
  }
};

// ================= GET USER INFO =================
export const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("programId", "name code isActive")
      .populate("courseId", "_id name")
      .populate("planId", "title duration price durationUnit")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        populate: { path: 'courseId', select: 'name code' }
      });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.lastActivityAt = new Date();
    await user.save();

    const planStatus = {
      hasPlan: !!user.planId,
      isActive: user.hasActivePlan ? user.hasActivePlan() : false,
      expiryDate: user.planExpiryDate,
      planName: user.planId?.title || null
    };
    
    res.json({
      ...user._doc,
      planStatus
    });
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ADMIN APPROVE USER =================
export const adminApproveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.isApproved) {
      return res.status(400).json({ message: "User is already approved" });
    }
    
    // Only Alveoly students need approval
    if (user.userType !== "alveoly_student") {
      return res.status(400).json({ message: "Only Alveoly students need admin approval" });
    }
    
    user.isApproved = true;
    user.approvalToken = null;
    user.tokenExpiresAt = null;
    user.registrationCompleted = true;
    await user.save();
    
    // Send notification to user
    await createNotification(
      user._id,
      "student",
      "success",
      "Account Approved! 🎉",
      "Your account has been approved. You can now login and start your learning journey.",
      "/login",
      { action: "account_approved" }
    );
    
    // Send email
    try {
      await sendApprovalConfirmationEmail(user.email, user.name);
    } catch (emailErr) {
      console.error("Approval email error:", emailErr.message);
    }
    
    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate("planId", "title duration price durationUnit");
    
    res.json({
      success: true,
      message: "User approved successfully",
      user: updatedUser
    });
    
  } catch (err) {
    console.error("Admin approve user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ASSIGN PLAN TO USER (Admin) =================
export const assignPlanToUser = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ message: "User ID and Plan ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    
    switch (plan.durationUnit) {
      case "day":
        expiryDate.setDate(expiryDate.getDate() + plan.duration);
        break;
      case "week":
        expiryDate.setDate(expiryDate.getDate() + (plan.duration * 7));
        break;
      case "month":
        expiryDate.setMonth(expiryDate.getMonth() + plan.duration);
        break;
      case "year":
        expiryDate.setFullYear(expiryDate.getFullYear() + plan.duration);
        break;
      default:
        expiryDate.setDate(expiryDate.getDate() + plan.duration);
    }

    user.planId = planId;
    user.planStartDate = startDate;
    user.planExpiryDate = expiryDate;
    user.isPlanActive = true;
    user.manuallyAssignedPlan = true;
    user.subscriptionStatus = "active";
    user.subscriptionExpiry = expiryDate;
    
    // If non-alveoly student, auto-approve them
    if (user.userType === "non_alveoly_student") {
      user.isApproved = true;
      user.registrationCompleted = true;
    }

    await user.save();

    await createNotification(
      user._id,
      "student",
      "success",
      "Plan Assigned! 📋",
      `You have been assigned the "${plan.title}" plan.`,
      "/student/dashboard",
      { planId, action: "plan_assigned" }
    );

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("planId", "title duration price durationUnit");

    res.json({
      success: true,
      message: `Plan "${plan.title}" assigned to ${user.name}`,
      user: populatedUser
    });

  } catch (err) {
    console.error("ASSIGN PLAN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "No user found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 1000 * 60 * 15;
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, token);

    res.json({
      message: "Password reset email sent successfully",
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

// ================= REGISTER LECTURER =================
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
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    
    let validProgramId = null;
    if (programId && programId !== "undefined" && programId !== "null" && programId !== "") {
      const programExists = await Program.findById(programId);
      if (!programExists) {
        return res.status(400).json({ message: "Invalid program selected" });
      }
      validProgramId = programId;
    }
    
    let validCourseId = null;
    if (courseId && courseId !== "undefined" && courseId !== "null" && courseId !== "") {
      const courseExists = await Course.findById(courseId);
      if (!courseExists) {
        return res.status(400).json({ message: "Invalid course selected" });
      }
      validCourseId = courseId;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let validSubjectIds = [];
    if (assignedSubjects) {
      let subjectsArray = [];
      if (Array.isArray(assignedSubjects)) {
        subjectsArray = assignedSubjects;
      } else if (typeof assignedSubjects === 'string') {
        try {
          subjectsArray = JSON.parse(assignedSubjects);
        } catch (e) {
          subjectsArray = assignedSubjects.split(',').filter(s => s.trim());
        }
      }
      
      for (const subjectId of subjectsArray) {
        if (subjectId && subjectId !== "" && subjectId !== "undefined" && subjectId !== "null") {
          try {
            const subject = await Subject.findById(subjectId);
            if (subject) {
              validSubjectIds.push(subject._id);
            }
          } catch (err) {
            console.log(`Error finding subject:`, err.message);
          }
        }
      }
    }
    
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "lecturer",
      programId: validProgramId,
      courseId: validCourseId,
      isApproved: true,
      registrationCompleted: true,
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
    
    await createNotification(
      user._id,
      "lecturer",
      "success",
      "Welcome to Alveoly! 🎉",
      `Welcome ${name}! You have been added as a lecturer with ${validSubjectIds.length} subject(s).`,
      "/lecturer/dashboard",
      { action: "welcome" }
    );
    
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

// ================= ASSIGN COURSE =================
export const assignCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: "Course required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { courseId },
      { new: true }
    ).populate("courseId", "_id name");

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

// ================= ASSIGN PROGRAM =================
export const assignProgram = async (req, res) => {
  try {
    const { programId } = req.body;
    
    if (!programId) {
      return res.status(400).json({ message: "Program is required" });
    }

    const program = await Program.findById(programId);
    if (!program || program.isActive === false) {
      return res.status(400).json({ message: "Invalid or inactive program selected" });
    }

    const firstCourse = await Course.findOne({ programId: programId });
    
    const updateData = { programId };
    if (firstCourse) {
      updateData.courseId = firstCourse._id;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).populate("programId", "name code")
      .populate("courseId", "name");

    await createNotification(
      user._id,
      "student",
      "success",
      "Program & Course Assigned! 📚",
      `You have been enrolled in ${user.programId?.name || "a new program"}${firstCourse ? ` and course: ${firstCourse.name}` : ''}.`,
      "/student/dashboard",
      { programId, courseId: firstCourse?._id, action: "program_assigned" }
    );

    res.json(user);
  } catch (err) {
    console.error("ASSIGN PROGRAM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= SEND PLAN EXPIRY NOTIFICATION =================
export const sendPlanExpiryNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate("planId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.planId) {
      return res.status(400).json({ message: "User has no plan assigned" });
    }
    
    await sendPlanExpiryEmail(
      user.email,
      user.name,
      user.planId.title,
      user.planExpiryDate
    );
    
    res.json({
      success: true,
      message: "Plan expiry notification sent"
    });
  } catch (err) {
    console.error("SEND PLAN EXPIRY NOTIFICATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};