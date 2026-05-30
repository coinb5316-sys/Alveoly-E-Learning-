// backend/src/models/Blog.js - Simplified version
import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: "" }
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
    readingTime: { type: Number, default: 5 },
    
    // Cache counts for performance
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    
    hasQuiz: { type: Boolean, default: false },
    quiz: {
      title: { type: String, default: "Test Your Knowledge" },
      description: { type: String, default: "How well did you understand this article?" },
      questions: [quizQuestionSchema],
      passingScore: { type: Number, default: 70 },
      attempts: { type: Number, default: 0 },
      completions: { type: Number, default: 0 }
    },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export default mongoose.model('Blog', blogSchema);