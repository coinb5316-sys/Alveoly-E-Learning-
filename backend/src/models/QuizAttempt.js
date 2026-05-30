import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  blogTitle: { type: String, required: true },
  blogSlug: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String },
  answers: [{
    question: String,
    userAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    explanation: String
  }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  passingScore: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model('QuizAttempt', quizAttemptSchema);