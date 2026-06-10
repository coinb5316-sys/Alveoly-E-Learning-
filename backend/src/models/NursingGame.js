// models/NursingGame.js - UPDATED with program, course, subject support
import mongoose from 'mongoose';

const nursingGameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // ========== NEW: PROGRAM/COURSE/SUBJECT INTEGRATION ==========
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
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  category: {
    type: String,
    enum: ['medication', 'assessment', 'emergency', 'procedures', 'diagnosis', 'communication', 'ethics', 'leadership'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  timeLimit: {
    type: Number,
    default: 300
  },
  points: {
    type: Number,
    default: 100
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'scenario', 'drag-drop', 'image-based'],
      default: 'multiple-choice'
    },
    diagramUrl: {
      type: String,
      default: null
    },
    diagramCaption: {
      type: String,
      default: null
    },
    options: [{
      text: String,
      isCorrect: Boolean,
      explanation: String
    }],
    explanation: {
      type: String,
      required: true
    },
    nursingConcept: {
      type: String,
      required: true
    },
    clinicalTip: {
      type: String,
      default: null
    },
    points: {
      type: Number,
      default: 10
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  tags: [String],
  estimatedDuration: {
    type: Number,
    default: 15
  },
  badgeReward: {
    type: String,
    default: null
  },
  passingScore: {
    type: Number,
    default: 70
  },
  attemptsAllowed: {
    type: Number,
    default: 3
  },
  
  // ========== NEW: MATCHING/DUEL SUPPORT ==========
  gameType: {
    type: String,
    enum: ['solo', 'duel', 'tournament'],
    default: 'solo'
  },
  allowMatching: {
    type: Boolean,
    default: false
  },
  maxPlayers: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for faster queries
nursingGameSchema.index({ programId: 1, courseId: 1, subjectId: 1 });
nursingGameSchema.index({ lecturerId: 1, isPublished: 1 });
nursingGameSchema.index({ programId: 1, isPublished: 1 });

export default mongoose.model('NursingGame', nursingGameSchema);