// models/StudentMatch.js - NEW MODEL for student matching
import mongoose from 'mongoose';

const studentMatchSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingGame',
    required: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  
  // Players
 // In models/StudentMatch.js - ensure players have attemptId
players: [{
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  email: String,
  avatar: String,
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean,
    timeSpent: Number,
    pointsEarned: Number
  }],
  status: {
    type: String,
    enum: ['waiting', 'ready', 'playing', 'completed', 'disconnected'],
    default: 'waiting'
  },
  joinedAt: { type: Date, default: Date.now },
  completedAt: Date,
  attemptId: { type: mongoose.Schema.Types.ObjectId }  // ← ADD THIS FIELD
}],
  
  // Match Configuration
  createdBy: {
    type: String,
    enum: ['lecturer', 'student', 'system'],
    default: 'student'
  },
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Match Status
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  matchCode: {
    type: String,
    unique: true,
    sparse: true
  },
  startedAt: Date,
  endedAt: Date,
  
  // Match Results
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isTie: {
    type: Boolean,
    default: false
  },
  
  // Settings
  timeLimitPerQuestion: {
    type: Number,
    default: 30
  },
  questionsPerMatch: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

// Indexes
studentMatchSchema.index({ matchCode: 1 });
studentMatchSchema.index({ gameId: 1, status: 1 });
studentMatchSchema.index({ programId: 1, courseId: 1, status: 1 });
studentMatchSchema.index({ lecturerId: 1, createdAt: -1 });

export default mongoose.model('StudentMatch', studentMatchSchema);