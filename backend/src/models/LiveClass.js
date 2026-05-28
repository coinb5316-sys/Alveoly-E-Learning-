// models/LiveClass.js - COMPLETE WITH PROGRAM SUPPORT
import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["student", "lecturer", "admin"], default: "student" },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
  duration: { type: Number, default: 0 },
  audioEnabled: { type: Boolean, default: true },
  videoEnabled: { type: Boolean, default: true },
  cameraMode: { type: String, enum: ["front", "back"], default: "front" },
  networkQuality: { type: String, enum: ["good", "poor", "bad"], default: "good" },
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  }
});

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  message: { type: String },
  messageType: { type: String, enum: ["text", "audio", "file"], default: "text" },
  audioUrl: { type: String },
  audioDuration: { type: Number },
  timestamp: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  replyTo: {
    messageId: { type: mongoose.Schema.Types.ObjectId },
    userId: { type: mongoose.Schema.Types.ObjectId },
    userName: { type: String },
    message: { type: String },
    messageType: { type: String }
  },
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
});

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scheduledStartTime: { type: Date, required: true },
  scheduledEndTime: { type: Date, required: true },
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
  status: { 
    type: String, 
    enum: ["scheduled", "ongoing", "completed", "cancelled"], 
    default: "scheduled" 
  },
  maxParticipants: { type: Number, default: 100 },
  participants: [participantSchema],
  chatMessages: [chatMessageSchema],
  
  recordingAvailable: { type: Boolean, default: false },
  recordingUrl: { type: String },
  recordingPassword: { type: String },
  recordingStartedAt: { type: Date },
  recordingEndedAt: { type: Date },
  recordingDuration: { type: Number },
  
  timerDuration: { type: Number },
  timerStartedAt: { type: Date },
  timerReminderSent: { type: Boolean, default: false },
  autoEndEnabled: { type: Boolean, default: true },
  
  totalAttendance: { type: Number, default: 0 },
  averageAttendanceDuration: { type: Number, default: 0 },
  peakConcurrentParticipants: { type: Number, default: 0 },
  
  isBeingRecorded: { type: Boolean, default: false },
  streamKey: { type: String },
  playbackUrl: { type: String },
  
  settings: {
    allowChat: { type: Boolean, default: true },
    allowScreenShare: { type: Boolean, default: true },
    allowRecording: { type: Boolean, default: true },
    waitingRoom: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: false },
    muteOnEntry: { type: Boolean, default: false },
    videoOnEntry: { type: Boolean, default: true }
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, {
  timestamps: true
});

// Indexes
liveClassSchema.index({ scheduledStartTime: 1, status: 1 });
liveClassSchema.index({ programId: 1, status: 1 });
liveClassSchema.index({ courseId: 1, status: 1 });
liveClassSchema.index({ lecturerId: 1, status: 1 });
liveClassSchema.index({ "participants.userId": 1 });

liveClassSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === "ongoing" && 
         now >= this.scheduledStartTime && 
         now <= this.scheduledEndTime;
};

liveClassSchema.methods.getActiveParticipantCount = function() {
  return this.participants.filter(p => !p.leftAt).length;
};

liveClassSchema.methods.updatePeakParticipants = function() {
  const currentCount = this.getActiveParticipantCount();
  if (currentCount > this.peakConcurrentParticipants) {
    this.peakConcurrentParticipants = currentCount;
  }
  return this.peakConcurrentParticipants;
};

liveClassSchema.methods.calculateAverageAttendance = function() {
  const participantsWithDuration = this.participants.filter(p => p.duration > 0);
  if (participantsWithDuration.length === 0) return 0;
  
  const totalDuration = participantsWithDuration.reduce((sum, p) => sum + p.duration, 0);
  this.averageAttendanceDuration = totalDuration / participantsWithDuration.length;
  this.totalAttendance = participantsWithDuration.length;
  
  return this.averageAttendanceDuration;
};

liveClassSchema.methods.updateTimer = function() {
  if (this.status === "ongoing" && this.timerDuration && this.timerStartedAt) {
    const timerEndTime = new Date(this.timerStartedAt.getTime() + this.timerDuration * 60000);
    const timeLeft = timerEndTime - new Date();
    const fiveMinutesInMs = 5 * 60000;
    
    if (timeLeft <= fiveMinutesInMs && timeLeft > 0 && !this.timerReminderSent) {
      this.timerReminderSent = true;
      return { timeLeft, shouldRemind: true };
    }
    
    if (timeLeft <= 0 && this.autoEndEnabled) {
      this.status = "completed";
      this.actualEndTime = new Date();
      return { timeLeft, shouldEnd: true };
    }
  }
  return { shouldRemind: false, shouldEnd: false };
};

const LiveClass = mongoose.model("LiveClass", liveClassSchema);
export default LiveClass;