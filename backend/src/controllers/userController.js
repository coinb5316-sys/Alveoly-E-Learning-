// controllers/userController.js - FULLY UPDATED with programId population
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// ================= GET ALL USERS =================
// controllers/userController.js - Make sure getAllUsers has proper population
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
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

    console.log("Fetched users with subjects:", users.map(u => ({
      name: u.name,
      role: u.role,
      subjects: u.lecturerInfo?.assignedSubjects?.length || 0
    })));

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET USER BY ID =================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("programId", "name code isActive")  // ✅ ADD THIS
      .populate("courseId", "name")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        populate: { path: 'courseId', select: 'name code' }
      })
      .populate('lecturerInfo.assignedCourses', 'name code');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
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

    // Fetch updated user with populated fields
    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("programId", "name code isActive")
      .populate("courseId", "name");

    res.json({ 
      success: true,
      message: `User role updated to ${role} successfully`,
      user: updatedUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/userController.js - FIXED updateUser function

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, programId, courseId, lecturerInfo } = req.body;
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
    
    // Update program and course
    if (programId !== undefined) {
      user.programId = programId && programId !== "undefined" && programId !== "null" ? programId : null;
    }
    
    if (courseId !== undefined) {
      user.courseId = courseId && courseId !== "undefined" && courseId !== "null" ? courseId : null;
    }
    
    // Update lecturer-specific fields
    if (role === "lecturer" && lecturerInfo) {
      if (!user.lecturerInfo) {
        user.lecturerInfo = {};
      }
      
      user.lecturerInfo.title = lecturerInfo.title || user.lecturerInfo.title || "";
      user.lecturerInfo.bio = lecturerInfo.bio || user.lecturerInfo.bio || "";
      user.lecturerInfo.phoneNumber = lecturerInfo.phoneNumber || user.lecturerInfo.phoneNumber || "";
      user.lecturerInfo.department = lecturerInfo.department || user.lecturerInfo.department || "";
      user.lecturerInfo.specialization = lecturerInfo.specialization || user.lecturerInfo.specialization || "";
      
      if (lecturerInfo.assignedCourses !== undefined) {
        user.lecturerInfo.assignedCourses = Array.isArray(lecturerInfo.assignedCourses) 
          ? lecturerInfo.assignedCourses.filter(c => c && c !== "")
          : [];
      }
      
      if (lecturerInfo.assignedSubjects !== undefined) {
        // Filter valid subject IDs
        const validSubjects = Array.isArray(lecturerInfo.assignedSubjects) 
          ? lecturerInfo.assignedSubjects.filter(s => s && s !== "" && s !== "undefined" && s !== "null")
          : [];
        
        user.lecturerInfo.assignedSubjects = validSubjects;
        console.log("✅ Saving assigned subjects to user:", validSubjects);
      }
      
      if (!user.lecturerInfo.isActive) user.lecturerInfo.isActive = true;
      if (!user.lecturerInfo.hireDate) user.lecturerInfo.hireDate = new Date();
    } else if (role !== "lecturer") {
      user.lecturerInfo = undefined;
    }
    
    await user.save();
    console.log("✅ User saved successfully with program:", user.programId);
    
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
      .populate("programId", "name code isActive")
      .populate("courseId", "name")
      .populate({
        path: 'lecturerInfo.assignedSubjects',
        model: 'Subject',
        populate: {
          path: 'courseId',
          model: 'Course',
          select: 'name code'
        }
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

// ================= GET USER STATS =================
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalLecturers = await User.countDocuments({ role: "lecturer" });
    const activeToday = await User.countDocuments({
      lastActivityAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Get users by program
    const usersByProgram = await User.aggregate([
      { $match: { programId: { $ne: null } } },
      { $group: { _id: "$programId", count: { $sum: 1 } } },
      { $lookup: { from: "programs", localField: "_id", foreignField: "_id", as: "program" } },
      { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
      { $project: { programName: "$program.name", count: 1 } }
    ]);
    
    res.json({
      totalUsers,
      totalStudents,
      totalAdmins,
      totalLecturers,
      activeToday,
      usersByProgram
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};