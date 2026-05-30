// backend/src/controllers/blogController.js - Updated upload functions
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { io } from "../../server.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import QuizAttempt from "../models/QuizAttempt.js";

// ================= UPLOAD FEATURED IMAGE =================
export const uploadFeaturedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "alveoly-blogs",
          transformation: [{ width: 1200, height: 630, crop: "fill" }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// ================= UPLOAD GALLERY IMAGES =================
export const uploadGalleryImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    
    const images = [];
    
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "alveoly-blog-images",
            transformation: [{ width: 1920, height: 1080, crop: "limit" }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
      
      images.push({
        url: result.secure_url,
        publicId: result.public_id,
        caption: ""
      });
    }
    
    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to upload images" });
  }
};

// ================= DELETE IMAGE FROM CLOUDINARY =================
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: "Public ID is required" });
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
};

// backend/src/controllers/blogController.js - REPLACE createBlog function

export const createBlog = async (req, res) => {
  try {
    const {
      title, excerpt, content, featuredImage, category,
      tags, status, publishedAt, hasQuiz, quiz
    } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: "Title, excerpt, and content are required" });
    }

    // Generate slug manually in controller (NO MIDDLEWARE)
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Check for duplicate slug
    let existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    // Calculate reading time
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Handle featuredImage
    let finalFeaturedImage = { url: "/blog-default.jpg", publicId: "" };
    if (featuredImage) {
      if (typeof featuredImage === 'object' && featuredImage.url) {
        finalFeaturedImage = featuredImage;
      } else if (typeof featuredImage === 'string' && featuredImage !== "/blog-default.jpg") {
        finalFeaturedImage = { url: featuredImage, publicId: "" };
      }
    }

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      readingTime,
      featuredImage: finalFeaturedImage,
      category: category || 'Announcements',
      tags: tags || [],
      author: {
        name: req.user.name || 'Alveoly Admin',
        avatar: typeof req.user.avatar === 'string' ? req.user.avatar : (req.user.avatar?.url || ''),
        bio: ''
      },
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : (publishedAt || new Date()),
      hasQuiz: hasQuiz || false,
      quiz: hasQuiz ? quiz : {},
      createdBy: req.user.id
    });

    io.emit("blog:created", blog);
    res.status(201).json(blog);
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ================= GET ALL BLOGS (ADMIN) =================
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email');
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// In getPublicBlogs function, ensure featuredImage is properly formatted
export const getPublicBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag } = req.query;
    const query = { status: 'published' };
    
    if (category && category !== 'all') query.category = category;
    if (tag) query.tags = tag;
    
    const blogs = await Blog.find(query)
      .select('-content -quiz.questions.correctAnswer')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Format featuredImage for frontend
    const formattedBlogs = blogs.map(blog => {
      const blogObj = blog.toObject();
      // Ensure featuredImage is a string URL for frontend
      if (blogObj.featuredImage && typeof blogObj.featuredImage === 'object') {
        blogObj.featuredImage = blogObj.featuredImage.url || "/blog-default.jpg";
      }
      return blogObj;
    });
    
    const total = await Blog.countDocuments(query);
    const categories = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      blogs: formattedBlogs,
      categories,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get Public Blogs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET BLOG BY SLUG (with IP-based view counting) =================
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug, status: 'published' });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    // Get client IP address
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.socket.remoteAddress || 
                     req.ip;
    
    // Initialize viewedBy array if it doesn't exist
    if (!blog.viewedBy) {
      blog.viewedBy = [];
    }
    
    // Check if this IP has viewed before (in last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentView = blog.viewedBy.find(view => 
      view.ip === clientIp && view.timestamp > twentyFourHoursAgo
    );
    
    // Only count view if no recent view from this IP
    if (!recentView) {
      blog.views += 1;
      blog.viewedBy.push({ ip: clientIp, timestamp: new Date() });
      
      // Keep only last 30 days of view records to prevent array growing too large
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      blog.viewedBy = blog.viewedBy.filter(view => view.timestamp > thirtyDaysAgo);
      
      await blog.save();
    }
    
    // Format the blog data
    const blogData = blog.toObject();
    
    // Ensure featuredImage is a string URL
    if (blogData.featuredImage && typeof blogData.featuredImage === 'object') {
      blogData.featuredImage = blogData.featuredImage.url || "/blog-default.jpg";
    }
    
    // Remove correct answers from quiz for security
    if (blogData.quiz && blogData.quiz.questions) {
      blogData.quiz = {
        ...blogData.quiz,
        questions: blogData.quiz.questions.map(q => ({
          ...q,
          correctAnswer: undefined
        }))
      };
    }
    
    // Remove viewedBy from response
    delete blogData.viewedBy;
    
    res.json(blogData);
  } catch (error) {
    console.error("Get Blog By Slug Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET BLOG BY ID (ADMIN) =================
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    console.error("Get Blog By ID Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE BLOG =================
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const updates = req.body;
    
    // If status changing to published, set publishedAt
    if (updates.status === 'published' && blog.status !== 'published') {
      updates.publishedAt = new Date();
    }
    
    Object.assign(blog, updates);
    
    // Update slug if title changed
    if (updates.title && updates.title !== blog.title) {
      let newSlug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const existingBlog = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      if (existingBlog) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      blog.slug = newSlug;
    }
    
    await blog.save();
    
    io.emit("blog:updated", blog);
    
    res.json(blog);
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= DELETE BLOG =================
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    await blog.deleteOne();
    io.emit("blog:deleted", req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= TOGGLE LIKE (Like/Dislike functionality) =================
export const toggleLike = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: "User ID required", liked: false, likes: 0 });
    }
    
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    // Initialize likedBy if it doesn't exist
    if (!blog.likedBy) {
      blog.likedBy = [];
    }
    
    // Check if user already liked
    const userLikedIndex = blog.likedBy.findIndex(id => id.toString() === userId);
    
    if (userLikedIndex === -1) {
      // User hasn't liked - add like
      blog.likedBy.push(userId);
      blog.likes = (blog.likes || 0) + 1;
      await blog.save();
      return res.json({ liked: true, likes: blog.likes });
    } else {
      // User has liked - remove like (dislike)
      blog.likedBy.splice(userLikedIndex, 1);
      blog.likes = Math.max(0, (blog.likes || 0) - 1);
      await blog.save();
      return res.json({ liked: false, likes: blog.likes });
    }
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET APPROVED COMMENTS =================
export const getApprovedComments = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const approvedComments = blog.comments.filter(c => c.isApproved);
    res.json(approvedComments);
  } catch (error) {
    console.error("Get Approved Comments Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// backend/src/controllers/blogController.js - REPLACE the subscribeNewsletter function

// ================= SUBSCRIBE TO NEWSLETTER =================
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    
    // Find or create master blog document for subscribers
    let masterBlog = await Blog.findOne({ title: "MASTER_SUBSCRIBERS" });
    if (!masterBlog) {
      // Create master blog WITHOUT requiring user - use null for createdBy
      masterBlog = new Blog({
        title: "MASTER_SUBSCRIBERS",
        slug: "master-subscribers",
        excerpt: "System document for storing newsletter subscribers",
        content: "System document - Do not delete",
        createdBy: null, // Allow null for system document
        status: "published"
      });
      
      // Save with validation disabled temporarily
      await masterBlog.save({ validateBeforeSave: false });
    }
    
    // Check if already subscribed
    const existingSubscriber = masterBlog.subscribers.find(s => s.email === email);
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({ message: "This email is already subscribed to our newsletter!" });
      } else {
        // Reactivate inactive subscriber
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await masterBlog.save();
        return res.json({ success: true, message: "Welcome back! You have been re-subscribed successfully!" });
      }
    }
    
    // Add new subscriber
    masterBlog.subscribers.push({ 
      email, 
      subscribedAt: new Date(), 
      isActive: true 
    });
    await masterBlog.save();
    
    console.log(`✅ New subscriber: ${email}`);
    res.json({ success: true, message: "Successfully subscribed to our newsletter!" });
  } catch (error) {
    console.error("Subscribe Error:", error);
    res.status(500).json({ message: error.message || "Failed to subscribe. Please try again later." });
  }
};

// ================= GET SUBSCRIBERS =================
export const getSubscribers = async (req, res) => {
  try {
    const masterBlog = await Blog.findOne({ title: "MASTER_SUBSCRIBERS" });
    if (!masterBlog) {
      return res.json({ subscribers: [] });
    }
    
    const activeSubscribers = masterBlog.subscribers.filter(s => s.isActive === true);
    const inactiveSubscribers = masterBlog.subscribers.filter(s => s.isActive === false);
    
    res.json({ 
      subscribers: activeSubscribers,
      total: activeSubscribers.length,
      inactive: inactiveSubscribers.length 
    });
  } catch (error) {
    console.error("Get Subscribers Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.params;
    
    const masterBlog = await Blog.findOne({ title: "MASTER_SUBSCRIBERS" });
    if (masterBlog) {
      const subscriber = masterBlog.subscribers.find(s => s.email === email);
      if (subscriber) {
        subscriber.isActive = false;
        await masterBlog.save();
        console.log(`✅ Unsubscribed: ${email}`);
        return res.json({ success: true, message: "Successfully unsubscribed from our newsletter." });
      }
    }
    
    res.json({ success: true, message: "Email not found in subscribers list." });
  } catch (error) {
    console.error("Unsubscribe Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= DELETE COMMENT =================
export const deleteComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    blog.comments = blog.comments.filter(c => c._id.toString() !== commentId);
    await blog.save();
    
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
 
// ================= APPROVE COMMENT =================
export const approveComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    comment.isApproved = true;
    await blog.save();
    
    res.json({ message: "Comment approved successfully", comment });
  } catch (error) {
    console.error("Approve Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET PENDING COMMENTS FOR ADMIN =================
export const getPendingComments = async (req, res) => {
  try {
    const blogs = await Blog.find(
      { 'comments.isApproved': false },
      'title slug comments'
    ).populate('comments.user', 'name email');
    
    const pendingComments = [];
    blogs.forEach(blog => {
      blog.comments.forEach(comment => {
        if (!comment.isApproved) {
          pendingComments.push({
            id: comment._id,
            blogId: blog._id,
            blogTitle: blog.title,
            blogSlug: blog.slug,
            userName: comment.userName,
            userEmail: comment.userEmail,
            content: comment.content,
            createdAt: comment.createdAt,
            isApproved: comment.isApproved
          });
        }
      });
    });
    
    // Sort by newest first
    pendingComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(pendingComments);
  } catch (error) {
    console.error("Get Pending Comments Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CHECK IF USER LIKED BLOG =================
export const checkUserLiked = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.json({ liked: false });
    }
    
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const liked = blog.likedBy.some(id => id.toString() === userId);
    res.json({ liked });
  } catch (error) {
    console.error("Check User Liked Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ================= SUBMIT QUIZ =================
export const submitQuiz = async (req, res) => {
  try {
    const { slug } = req.params;
    const { answers, userName, userId, userEmail } = req.body;
    
    const blog = await Blog.findOne({ slug });
    if (!blog || !blog.hasQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    let score = 0;
    const results = [];
    const answerDetails = [];
    
    blog.quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;
      
      answerDetails.push({
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
      
      results.push({
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });
    
    const percentage = (score / blog.quiz.questions.length) * 100;
    const passed = percentage >= blog.quiz.passingScore;
    
    // Save quiz attempt to database
    const quizAttempt = await QuizAttempt.create({
      blogId: blog._id,
      blogTitle: blog.title,
      blogSlug: blog.slug,
      userId: userId || null,
      userName: userName || "Anonymous",
      userEmail: userEmail || "",
      answers: answerDetails,
      score: score,
      totalQuestions: blog.quiz.questions.length,
      percentage: percentage,
      passed: passed,
      passingScore: blog.quiz.passingScore
    });
    
    // Update quiz stats
    blog.quiz.attempts = (blog.quiz.attempts || 0) + 1;
    if (passed) blog.quiz.completions = (blog.quiz.completions || 0) + 1;
    await blog.save();
    
    res.json({
      score,
      total: blog.quiz.questions.length,
      percentage,
      passed,
      passingScore: blog.quiz.passingScore,
      results
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET ALL QUIZ RESULTS (ADMIN) =================
export const getAllQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .sort({ completedAt: -1 })
      .populate('userId', 'name email');
    
    // Format results for frontend
    const formattedResults = attempts.map(attempt => ({
      id: attempt._id,
      userName: attempt.userName,
      userEmail: attempt.userEmail,
      blogTitle: attempt.blogTitle,
      blogSlug: attempt.blogSlug,
      blogId: attempt.blogId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      passed: attempt.passed,
      passingScore: attempt.passingScore,
      completedAt: attempt.completedAt,
      answers: attempt.answers
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error("Get All Quiz Results Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= ADD COMMENT (Updated to track for admin) =================
export const addComment = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userName, userEmail, content, userId } = req.body;
    
    if (!userName || !content) {
      return res.status(400).json({ message: "Name and comment are required" });
    }
    
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const comment = {
      user: userId || null,
      userName,
      userEmail: userEmail || '',
      content,
      isApproved: false,
      isRead: false,
      createdAt: new Date()
    };
    
    blog.comments.push(comment);
    await blog.save();
    
    // Emit socket event for real-time admin notification
    if (io) {
      io.emit("blog:new-comment", {
        blogId: blog._id,
        blogTitle: blog.title,
        comment: comment
      });
    }
    
    res.json({ message: "Comment submitted for approval", comment });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET RELATED BLOGS =================
export const getRelatedBlogs = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      status: 'published',
      category: blog.category
    })
      .select('-content -quiz')
      .limit(3)
      .sort({ publishedAt: -1 });
    
    res.json(relatedBlogs);
  } catch (error) {
    console.error("Get Related Blogs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET BLOG STATS (ADMIN) =================
export const getBlogStats = async (req, res) => {
  try {
    const total = await Blog.countDocuments();
    const published = await Blog.countDocuments({ status: 'published' });
    const drafts = await Blog.countDocuments({ status: 'draft' });
    const totalViews = await Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const totalLikes = await Blog.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }]);
    
    const topPosts = await Blog.find({ status: 'published' })
      .select('title slug views likes featuredImage')
      .sort({ views: -1 })
      .limit(5);
    
    res.json({
      total,
      published,
      drafts,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      topPosts
    });
  } catch (error) {
    console.error("Get Blog Stats Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};