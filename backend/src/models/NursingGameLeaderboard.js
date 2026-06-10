import mongoose from 'mongoose';

const nursingGameLeaderboardSchema = new mongoose.Schema({
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
  bestScore: {
    type: Number,
    default: 0
  },
  bestPercentage: {
    type: Number,
    default: 0
  },
  fastestTime: {
    type: Number,
    default: null
  },
  attemptsCount: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  },
  badgesEarned: [String]
}, {
  timestamps: true
});

nursingGameLeaderboardSchema.index({ gameId: 1, bestPercentage: -1, fastestTime: 1 });
nursingGameLeaderboardSchema.index({ gameId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('NursingGameLeaderboard', nursingGameLeaderboardSchema);