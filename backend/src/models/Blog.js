// backend/src/models/Blog.js - Updated with comment approval
import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: "" }
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false }
});

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    
    featuredImage: {
      url: { type: String, default: "/blog-default.jpg" },
      publicId: { type: String, default: "" }
    },
    
    category: {
      type: String,
      enum: ['Health Sciences', 'Nursing', 'Medical', 'Education', 'Career Tips', 'Student Life', 'Announcements', 'Research', 'Technology', 'Success Stories'],
      default: 'Announcements'
    },
    tags: [{ type: String, trim: true }],
    author: {
      name: { type: String, default: 'Alveoly Admin' },
      avatar: { type: String, default: '' },
      bio: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    readingTime: { type: Number, default: 5 },
    
    // Track likes by users to prevent multiple likes
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    hasQuiz: { type: Boolean, default: false },
    quiz: {
      title: { type: String, default: "Test Your Knowledge" },
      description: { type: String, default: "How well did you understand this article?" },
      questions: [quizQuestionSchema],
      passingScore: { type: Number, default: 70 },
      attempts: { type: Number, default: 0 },
      completions: { type: Number, default: 0 }
    },
    
    comments: [commentSchema],
    
    // Newsletter subscribers
    subscribers: [{
      email: { type: String, required: true, unique: true },
      subscribedAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true }
    }],
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ 'comments.isApproved': 1 });
blogSchema.index({ 'comments.isRead': 1 });

export default mongoose.model('Blog', blogSchema);