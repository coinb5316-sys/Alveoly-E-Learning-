import mongoose from 'mongoose';

const nursingGameAttemptSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingGame',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number,
    default: 0 // seconds
  },
  answers: [{
    questionId: {
      type: Number,
      required: true
    },
    selectedOptionIndex: Number,
    isCorrect: Boolean,
    pointsEarned: {
      type: Number,
      default: 0
    },
    timeSpentOnQuestion: {
      type: Number,
      default: 0
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  percentageScore: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  earnedBadge: {
    type: String,
    default: null
  },
  feedback: {
    type: String,
    default: null
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  }
}, {
  timestamps: true
});

nursingGameAttemptSchema.index({ gameId: 1, studentId: 1, attemptNumber: 1 });
nursingGameAttemptSchema.index({ studentId: 1, status: 1 });

export default mongoose.model('NursingGameAttempt', nursingGameAttemptSchema);