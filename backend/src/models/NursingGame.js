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
    type: Number, // in seconds
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
    default: 15 // minutes
  },
  badgeReward: {
    type: String,
    default: null
  },
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  attemptsAllowed: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

export default mongoose.model('NursingGame', nursingGameSchema);