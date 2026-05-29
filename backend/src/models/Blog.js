// backend/src/models/Blog.js - Updated with Cloudinary support
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
    excerpt: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    
    // Cloudinary image support
    featuredImage: {
      url: { type: String, default: "/blog-default.jpg" },
      publicId: { type: String, default: "" },
      format: { type: String, default: "" },
      size: { type: Number, default: 0 }
    },
    
    gallery: [{
      url: { type: String },
      publicId: { type: String },
      caption: { type: String }
    }],
    
    category: {
      type: String,
      enum: ['Health Sciences', 'Nursing', 'Medical', 'Education', 'Career Tips', 'Student Life', 'Announcements', 'Research', 'Technology', 'Success Stories'],
      default: 'Announcements'
    },
    tags: [{ type: String, trim: true }],
    author: {
      name: { type: String, default: 'Alveoly Admin' },
      avatar: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
      },
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
    
    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    
    // Quiz feature
    hasQuiz: { type: Boolean, default: false },
    quiz: {
      title: { type: String, default: "Test Your Knowledge" },
      description: { type: String, default: "How well did you understand this article? Take this quick quiz to find out!" },
      questions: [quizQuestionSchema],
      passingScore: { type: Number, default: 70 },
      attempts: { type: Number, default: 0 },
      completions: { type: Number, default: 0 }
    },
    
    // Engagement
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: { type: String, required: true },
      userEmail: { type: String },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      isApproved: { type: Boolean, default: false }
    }],
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Create slug from title
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Calculate reading time (200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  
  next();
});

// Index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model('Blog', blogSchema);