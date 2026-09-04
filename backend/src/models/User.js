// models/User.js - Updated with registration tracking fields
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
      default: ""
    },
    userType: {
      type: String,
      enum: ["alveoly_student", "non_alveoly_student"],
      default: null,
    },

    // ================= REGISTRATION TRACKING =================
    registrationSource: {
      type: String,
      enum: ["phone", "other", "none"],
      default: "none"
    },
    registrationDetails: {
      type: String,
      default: ""
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvalToken: {
      type: String,
      default: null
    },
    tokenExpiresAt: {
      type: Date,
      default: null
    },
    registrationCompleted: {
      type: Boolean,
      default: false
    },

    // ================= ROLE, PROGRAM & COURSE =================
    role: {
      type: String,
      enum: ["student", "admin", "lecturer"],
      default: "student",
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    
    // ================= LECTURER SPECIFIC FIELDS =================
    lecturerInfo: {
      department: { type: String, default: "" },
      title: { type: String, default: "" },
      specialization: { type: String, default: "" },
      bio: { type: String, default: "" },
      assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
      assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
      phoneNumber: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
      hireDate: { type: Date, default: Date.now },
    },

    // ================= PLAN & SUBSCRIPTION =================
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null
    },
    planStartDate: {
      type: Date,
      default: null
    },
    planExpiryDate: {
      type: Date,
      default: null
    },
    isPlanActive: {
      type: Boolean,
      default: false
    },
    manuallyAssignedPlan: {
      type: Boolean,
      default: false
    },

    // ================= PASSWORD RESET =================
    resetToken: String,
    resetTokenExpire: Date,

    // ================= ANTI-SHARING & SECURITY =================
    activeSession: String,
    deviceInfo: String,
    lastLoginIP: String,

    // ================= ANALYTICS & TRACKING =================
    lastLoginAt: {
      type: Date,
      default: Date.now
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    },
    loginCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    
    // ================= PROGRESS TRACKING =================
    totalQuizzesTaken: {
      type: Number,
      default: 0
    },
    totalExamsTaken: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    
    // ================= PAYMENT & SUBSCRIPTION =================
    totalSpent: {
      type: Number,
      default: 0
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "expired", "pending"],
      default: "none"
    },
    subscriptionExpiry: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

// ================= INDEXES =================
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ programId: 1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });
userSchema.index({ "lecturerInfo.assignedSubjects": 1 });
userSchema.index({ "lecturerInfo.assignedCourses": 1 });
userSchema.index({ isApproved: 1 });
userSchema.index({ planId: 1 });
userSchema.index({ isPlanActive: 1 });
userSchema.index({ planExpiryDate: 1 });

// ================= VIRTUAL: Check if user is active =================
userSchema.virtual('isRecentlyActive').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.lastLoginAt >= thirtyDaysAgo;
});

// ================= METHOD: Check if user has active plan =================
userSchema.methods.hasActivePlan = function() {
  if (!this.planId) return false;
  if (!this.isPlanActive) return false;
  if (this.planExpiryDate && new Date(this.planExpiryDate) < new Date()) {
    this.isPlanActive = false;
    this.subscriptionStatus = "expired";
    return false;
  }
  return true;
};

// ================= METHOD: Update last activity =================
userSchema.methods.updateActivity = async function() {
  this.lastActivityAt = new Date();
  await this.save();
};

// ================= METHOD: Increment login count =================
userSchema.methods.recordLogin = async function(ip, deviceInfo) {
  this.lastLoginAt = new Date();
  this.lastActivityAt = new Date();
  this.loginCount += 1;
  this.lastLoginIP = ip;
  this.deviceInfo = deviceInfo;
  await this.save();
};

// ================= METHOD: Update quiz stats =================
userSchema.methods.updateQuizStats = async function(score) {
  this.totalQuizzesTaken += 1;
  this.averageScore = ((this.averageScore * (this.totalQuizzesTaken - 1)) + score) / this.totalQuizzesTaken;
  await this.save();
};

// ================= STATIC: Get active users count =================
userSchema.statics.getActiveUsersCount = async function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return await this.countDocuments({
    lastLoginAt: { $gte: cutoffDate }
  });
};

// ================= STATIC: Get user growth =================
userSchema.statics.getUserGrowth = async function(startDate, endDate, groupBy = "day") {
  let groupFormat;
  switch (groupBy) {
    case "day":
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      break;
    case "week":
      groupFormat = { $week: "$createdAt" };
      break;
    case "month":
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
      break;
    case "year":
      groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
      break;
    default:
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }
  
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);
};

export default mongoose.model("User", userSchema);