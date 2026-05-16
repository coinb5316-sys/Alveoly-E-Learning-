// controllers/userController.js - UPDATE THIS FILE
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("courseId", "name")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        populate: { path: 'courseId', select: 'name code' }
      })
      .populate('lecturerInfo.assignedCourses', 'name code');

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE USER ROLE =================
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "admin", "lecturer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    user.role = role;
    
    if (role === "lecturer" && !user.lecturerInfo) {
      user.lecturerInfo = {
        department: "",
        title: "",
        specialization: "",
        bio: "",
        assignedSubjects: [],
        assignedCourses: [],
        phoneNumber: "",
        isActive: true,
        hireDate: new Date()
      };
    }
    
    await user.save();

    await createNotification(
      user._id,
      role,
      "info",
      "Role Updated",
      `Your account role has been changed to ${role}.`,
      role === "lecturer" ? "/lecturer/dashboard" : "/dashboard",
      { action: "role_change", oldRole: user.role, newRole: role }
    );

    res.json({ 
      success: true,
      message: `User role updated to ${role} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= FULL UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, courseId, lecturerInfo } = req.body;
    const userId = req.params.id;
    
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: "Use profile settings to edit your own account" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ["student", "admin", "lecturer"].includes(role)) {
      user.role = role;
    }
    if (courseId !== undefined) {
      user.courseId = courseId || null;
    }
    
    // Update lecturer-specific fields
    if (role === "lecturer" && lecturerInfo) {
      if (!user.lecturerInfo) {
        user.lecturerInfo = {};
      }
      
      // Preserve existing values and update new ones
      user.lecturerInfo.title = lecturerInfo.title || user.lecturerInfo.title || "";
      user.lecturerInfo.bio = lecturerInfo.bio || user.lecturerInfo.bio || "";
      user.lecturerInfo.phoneNumber = lecturerInfo.phoneNumber || user.lecturerInfo.phoneNumber || "";
      user.lecturerInfo.department = lecturerInfo.department || user.lecturerInfo.department || "";
      user.lecturerInfo.specialization = lecturerInfo.specialization || user.lecturerInfo.specialization || "";
      
      // IMPORTANT: Handle assignedCourses and assignedSubjects
      if (lecturerInfo.assignedCourses !== undefined) {
        user.lecturerInfo.assignedCourses = Array.isArray(lecturerInfo.assignedCourses) 
          ? lecturerInfo.assignedCourses 
          : [];
      }
      
      if (lecturerInfo.assignedSubjects !== undefined) {
        user.lecturerInfo.assignedSubjects = Array.isArray(lecturerInfo.assignedSubjects) 
          ? lecturerInfo.assignedSubjects 
          : [];
        console.log("✅ Saving assigned subjects to user:", user.lecturerInfo.assignedSubjects);
      }
      
      if (!user.lecturerInfo.isActive) user.lecturerInfo.isActive = true;
      if (!user.lecturerInfo.hireDate) user.lecturerInfo.hireDate = new Date();
    } else if (role !== "lecturer") {
      user.lecturerInfo = undefined;
    }
    
    await user.save();
    console.log("✅ User saved successfully with subjects:", user.lecturerInfo?.assignedSubjects);
    
    // Send notification about profile update
    await createNotification(
      user._id,
      user.role,
      "info",
      "Profile Updated",
      "Your account information has been updated by an administrator.",
      user.role === "lecturer" ? "/lecturer/profile" : "/profile",
      { action: "profile_update" }
    );
    
    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("courseId", "name")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        populate: { path: 'courseId', select: 'name code' }
      })
      .populate('lecturerInfo.assignedCourses', 'name code');
    
    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};