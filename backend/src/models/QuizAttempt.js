// backend/src/models/QuizAttempt.js
import mongoose from "mongoose";

const answerDetailSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userAnswer: { type: Number, required: true },
  correctAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  explanation: { type: String }
});

const quizAttemptSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  blogTitle: { type: String, required: true },
  blogSlug: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String, default: "" },
  answers: [answerDetailSchema],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  passingScore: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

quizAttemptSchema.index({ blogId: 1, completedAt: -1 });
quizAttemptSchema.index({ userId: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);