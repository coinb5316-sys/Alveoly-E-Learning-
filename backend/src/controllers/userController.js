// controllers/userController.js - UPDATE THIS FILE
import User from "../models/User.js";

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("courseId", "name");

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

    // ✅ ADD "lecturer" to allowed roles
    if (!["student", "admin", "lecturer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Prevent admin from changing their own role
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    user.role = role;
    
    // If promoting to lecturer, initialize lecturerInfo if not exists
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

    // Send notification to the user about role change
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

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Prevent self delete
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