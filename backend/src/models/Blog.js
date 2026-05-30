// backend/src/models/Blog.js
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

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const viewedBySchema = new mongoose.Schema({
  ip: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, maxlength: 500 },
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
    
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewedBy: [viewedBySchema],
    
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
    subscribers: [subscriberSchema],
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ 'comments.isApproved': 1 });
blogSchema.index({ 'comments.isRead': 1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export default mongoose.model('Blog', blogSchema);