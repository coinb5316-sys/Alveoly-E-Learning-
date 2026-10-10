// backend/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: { type: String },
    avatar: { type: String, default: "" },
    userType: {
      type: String,
      enum: ["alveoly_student", "non_alveoly_student"],
      default: null,
    },

    // ================= REGISTRATION TRACKING =================
    registrationSource: {
      type: String,
      enum: ["phone", "other", "none"],
      default: "none",
    },
    registrationDetails: { type: String, default: "" },
    isApproved: { type: Boolean, default: false },
    approvalToken: { type: String, default: null },
    tokenExpiresAt: { type: Date, default: null },
    registrationCompleted: { type: Boolean, default: false },

    // ================= ROLE, PROGRAM & COURSE =================
    role: {
      type: String,
      enum: ["student", "admin", "lecturer"],
      default: "student",
    },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

    // ================= LECTURER SPECIFIC FIELDS =================
    lecturerInfo: {
      department: { type: String, default: "" },
      title: { type: String, default: "" },
      specialization: { type: String, default: "" },
      bio: { type: String, default: "" },
      assignedSubjects: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      ],
      assignedCourses: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      ],
      phoneNumber: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
      hireDate: { type: Date, default: Date.now },
    },

    // ================= PLAN & SUBSCRIPTION =================
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    planStartDate: { type: Date, default: null },
    planExpiryDate: { type: Date, default: null },
    isPlanActive: { type: Boolean, default: false },
    manuallyAssignedPlan: { type: Boolean, default: false },
    planDeactivatedByAdmin: { type: Boolean, default: false },

    // ================= PROGRAM ACCESS =================
    programAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],

    // ================= PASSWORD RESET =================
    resetToken: String,
    resetTokenExpire: Date,

    // ================= ANTI-SHARING & SECURITY =================
    activeSession: String,
    deviceInfo: String,
    lastLoginIP: String,

    // ================= ANALYTICS & TRACKING =================
    lastLoginAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // ================= PROGRESS TRACKING =================
    totalQuizzesTaken: { type: Number, default: 0 },
    totalExamsTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },

    // ================= PAYMENT & SUBSCRIPTION =================
    totalSpent: { type: Number, default: 0 },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "expired", "pending", "deactivated"],
      default: "none",
    },
    subscriptionExpiry: { type: Date, default: null },
    planDeactivatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ================= INDEXES =================
// Note: `email` already has a unique index from `unique: true`, so the
// explicit `userSchema.index({ email: 1 })` below is redundant. Left out
// to avoid duplicate-index warnings on every boot.
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
userSchema.index({ programAccess: 1 });
userSchema.index({ planDeactivatedByAdmin: 1 });
userSchema.index({ subscriptionStatus: 1 });

// ================= VIRTUAL =================
userSchema.virtual("isRecentlyActive").get(function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.lastLoginAt >= thirtyDaysAgo;
});

// ================= METHODS =================
userSchema.methods.hasActivePlan = function () {
  if (!this.planId) return false;
  if (!this.isPlanActive) return false;
  if (this.planDeactivatedByAdmin) return false;
  if (this.planExpiryDate && new Date(this.planExpiryDate) < new Date()) {
    this.isPlanActive = false;
    this.subscriptionStatus = "expired";
    return false;
  }
  return true;
};

userSchema.methods.hasProgramAccess = function (programId) {
  if (!this.programAccess || this.programAccess.length === 0) return false;
  return this.programAccess.some(
    (id) => id.toString() === programId.toString()
  );
};

userSchema.methods.updateActivity = async function () {
  this.lastActivityAt = new Date();
  await this.save();
};

userSchema.methods.recordLogin = async function (ip, deviceInfo) {
  this.lastLoginAt = new Date();
  this.lastActivityAt = new Date();
  this.loginCount += 1;
  this.lastLoginIP = ip;
  this.deviceInfo = deviceInfo;
  await this.save();
};

userSchema.methods.updateQuizStats = async function (score) {
  this.totalQuizzesTaken += 1;
  this.averageScore =
    (this.averageScore * (this.totalQuizzesTaken - 1) + score) /
    this.totalQuizzesTaken;
  await this.save();
};

// ================= STATICS =================
userSchema.statics.getActiveUsersCount = async function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.countDocuments({ lastLoginAt: { $gte: cutoffDate } });
};

export default mongoose.model("User", userSchema);