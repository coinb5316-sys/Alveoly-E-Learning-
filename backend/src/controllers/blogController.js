// backend/src/controllers/blogController.js - COMPLETE FIXED VERSION
import Blog from "../models/Blog.js";
import QuizAttempt from "../models/QuizAttempt.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import Subscriber from "../models/Subscriber.js";
import BlogLike from "../models/BlogLike.js";
import BlogView from "../models/BlogView.js";
import BlogComment from "../models/BlogComment.js";

// ================= CREATE BLOG (FIXED) =================
export const createBlog = async (req, res) => {
  try {
    const {
      title, excerpt, content, featuredImage, category,
      tags, status, publishedAt, hasQuiz, quiz
    } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: "Title, excerpt, and content are required" });
    }

    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    let existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    // FIXED: Better reading time calculation
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    console.log(`📖 Reading time: ${wordCount} words → ${readingTime} min`);

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
      readingTime,  // Now correctly calculated
      featuredImage: finalFeaturedImage,
      category: category || 'Announcements',
      tags: tags || [],
      author: {
        name: req.user?.name || 'Alveoly Admin',
        avatar: req.user?.avatar || '',
        bio: ''
      },
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : (publishedAt || new Date()),
      hasQuiz: hasQuiz || false,
      quiz: hasQuiz ? quiz : {},
      createdBy: req.user?._id,
      viewsCount: 0,      // FIXED: Use viewsCount
      likesCount: 0,      // FIXED: Use likesCount
      commentsCount: 0
    });

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

// ================= GET PUBLIC BLOGS (FIXED) =================
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
    
    const formattedBlogs = blogs.map(blog => {
      const blogObj = blog.toObject();
      if (blogObj.featuredImage && typeof blogObj.featuredImage === 'object') {
        blogObj.featuredImage = blogObj.featuredImage.url || "/blog-default.jpg";
      }
      // FIXED: Use correct field names
      blogObj.views = blogObj.viewsCount || 0;
      blogObj.likes = blogObj.likesCount || 0;
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

// ================= GET BLOG BY SLUG (Count EVERY view) =================
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
                     req.ip ||
                     'unknown';
    
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userId = req.user?._id || null;
    
    // FIXED: ALWAYS record view (NO 24-hour cooldown)
    await BlogView.create({
      blogId: blog._id,
      ip: clientIp,
      userId,
      userAgent,
      viewedAt: new Date()
    });
    
    // Increment view count
    blog.viewsCount = (blog.viewsCount || 0) + 1;
    await blog.save();
    console.log(`✅ View counted for ${slug} from IP ${clientIp} - Total views: ${blog.viewsCount}`);
    
    // Get like count and comment count
    const likesCount = blog.likesCount || 0;
    const commentsCount = await BlogComment.countDocuments({ 
      blogId: blog._id, 
      isApproved: true 
    });
    
    const blogData = blog.toObject();
    
    // Format featuredImage for frontend
    if (blogData.featuredImage && typeof blogData.featuredImage === 'object') {
      blogData.featuredImage = blogData.featuredImage.url || "/blog-default.jpg";
    }
    
    // Add counts to response (using 'views' and 'likes' for frontend compatibility)
    blogData.likes = likesCount;
    blogData.views = blog.viewsCount;
    blogData.commentsCount = commentsCount;
    
    // Remove correct answers from quiz for security
    if (blogData.quiz && blogData.quiz.questions) {
      blogData.quiz = {
        ...blogData.quiz,
        questions: blogData.quiz.questions.map(q => ({
          question: q.question,
          options: q.options,
          explanation: q.explanation
        }))
      };
    }
    
    res.json(blogData);
  } catch (error) {
    console.error("Get Blog By Slug Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ================= GET BLOG BY ID =================
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

// ================= UPDATE BLOG (FIXED) =================
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const updates = req.body;
    
    if (updates.status === 'published' && blog.status !== 'published') {
      updates.publishedAt = new Date();
    }
    
    // FIXED: If content is updated, recalculate reading time
    if (updates.content && updates.content !== blog.content) {
      const plainText = updates.content.replace(/<[^>]*>/g, '');
      const words = plainText.split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      updates.readingTime = Math.max(1, Math.ceil(wordCount / 200));
      console.log(`📖 Updated reading time: ${wordCount} words → ${updates.readingTime} min`);
    }
    
    Object.assign(blog, updates);
    
    if (updates.title && updates.title !== blog.title) {
      let newSlug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const existingBlog = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      if (existingBlog) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      blog.slug = newSlug;
    }
    
    await blog.save();
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
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= TOGGLE LIKE (Using IP address - NO LOGIN REQUIRED) =================
export const toggleLike = async (req, res) => {
  console.log("🔵 toggleLike called");
  console.log("🔵 Request params:", req.params);
  console.log("🔵 Request headers - IP:", req.ip);
  
  try {
    const { slug } = req.params;
    
    // Get client IP address
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.socket.remoteAddress || 
                     req.ip ||
                     'unknown';
    
    console.log("🔵 Client IP:", clientIp);
    
    if (!clientIp || clientIp === 'unknown') {
      return res.status(400).json({ liked: false, likes: 0, message: "Could not identify your device" });
    }
    
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ liked: false, likes: 0, message: "Blog not found" });
    }
    
    // Check if this IP already liked this blog
    const existingLike = await BlogLike.findOne({ 
      blogId: blog._id, 
      ipAddress: clientIp 
    });
    
    if (!existingLike) {
      // Add like
      await BlogLike.create({ 
        blogId: blog._id, 
        ipAddress: clientIp, 
        likedAt: new Date() 
      });
      blog.likesCount = (blog.likesCount || 0) + 1;
      await blog.save();
      console.log(`✅ Like added from IP ${clientIp} - New likes count: ${blog.likesCount}`);
      return res.json({ liked: true, likes: blog.likesCount });
    } else {
      // Remove like (dislike)
      await BlogLike.deleteOne({ _id: existingLike._id });
      blog.likesCount = Math.max(0, (blog.likesCount || 0) - 1);
      await blog.save();
      console.log(`✅ Like removed from IP ${clientIp} - New likes count: ${blog.likesCount}`);
      return res.json({ liked: false, likes: blog.likesCount });
    }
  } catch (error) {
    console.error("🔴 Toggle Like Error:", error);
    res.status(500).json({ liked: false, likes: 0, message: error.message });
  }
};


// ================= CHECK IF IP HAS LIKED =================
export const checkUserLiked = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Get client IP address
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.socket.remoteAddress || 
                     req.ip ||
                     'unknown';
    
    if (!clientIp || clientIp === 'unknown') {
      return res.json({ liked: false });
    }
    
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const like = await BlogLike.findOne({ 
      blogId: blog._id, 
      ipAddress: clientIp 
    });
    
    res.json({ liked: !!like });
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
    const answerDetails = [];
    
    blog.quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;
      
      answerDetails.push({
        question: question.question,
        userAnswer: userAnswer !== undefined ? userAnswer : -1,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });
    
    const percentage = (score / blog.quiz.questions.length) * 100;
    const passed = percentage >= blog.quiz.passingScore;
    
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
    
    blog.quiz.attempts = (blog.quiz.attempts || 0) + 1;
    if (passed) blog.quiz.completions = (blog.quiz.completions || 0) + 1;
    await blog.save();
    
    res.json({
      score,
      total: blog.quiz.questions.length,
      percentage,
      passed,
      passingScore: blog.quiz.passingScore
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET ALL QUIZ RESULTS =================
export const getAllQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .sort({ completedAt: -1 })
      .populate('userId', 'name email');
    
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

// ================= ADD COMMENT (Using separate model) =================
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
    
    const comment = await BlogComment.create({
      blogId: blog._id,
      userId: userId || null,
      userName,
      userEmail: userEmail || '',
      content,
      isApproved: false,
      isRead: false
    });
    
    // Update comment count on blog
    blog.commentsCount = (blog.commentsCount || 0) + 1;
    await blog.save();
    
    res.json({ message: "Comment submitted for approval", comment });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET APPROVED COMMENTS (Using separate model) =================
export const getApprovedComments = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    const approvedComments = await BlogComment.find({
      blogId: blog._id,
      isApproved: true
    }).sort({ createdAt: -1 });
    
    res.json(approvedComments);
  } catch (error) {
    console.error("Get Approved Comments Error:", error);
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
    
    const formattedBlogs = relatedBlogs.map(b => {
      const blogObj = b.toObject();
      if (blogObj.featuredImage && typeof blogObj.featuredImage === 'object') {
        blogObj.featuredImage = blogObj.featuredImage.url || "/blog-default.jpg";
      }
      return blogObj;
    });
    
    res.json(formattedBlogs);
  } catch (error) {
    console.error("Get Related Blogs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET BLOG STATS (Updated with separate models) =================
export const getBlogStats = async (req, res) => {
  try {
    const total = await Blog.countDocuments();
    const published = await Blog.countDocuments({ status: 'published' });
    const drafts = await Blog.countDocuments({ status: 'draft' });
    
    const totalViewsAgg = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$viewsCount' } } }
    ]);
    const totalViews = totalViewsAgg[0]?.total || 0;
    
    const totalLikesAgg = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);
    const totalLikes = totalLikesAgg[0]?.total || 0;
    
    const topPosts = await Blog.find({ status: 'published' })
      .select('title slug viewsCount likesCount featuredImage')
      .sort({ viewsCount: -1 })
      .limit(5);
    
    // Format top posts for frontend
    const formattedTopPosts = topPosts.map(post => ({
      _id: post._id,
      title: post.title,
      slug: post.slug,
      views: post.viewsCount,
      likes: post.likesCount,
      featuredImage: post.featuredImage
    }));
    
    res.json({
      total,
      published,
      drafts,
      totalViews,
      totalLikes,
      topPosts: formattedTopPosts
    });
  } catch (error) {
    console.error("Get Blog Stats Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// ================= SUBSCRIBE TO NEWSLETTER (SIMPLIFIED) =================
export const subscribeNewsletter = async (req, res) => {
  console.log("📧 Subscribe request received for:", req.body.email);
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    
    // Check if already subscribed
    let existingSubscriber = await Subscriber.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: "This email is already subscribed to our newsletter!" 
        });
      } else {
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();
        console.log(`✅ Reactivated subscriber: ${email}`);
        return res.json({ 
          success: true, 
          message: "Welcome back! You have been re-subscribed successfully!" 
        });
      }
    }
    
    // Create new subscriber
    const newSubscriber = new Subscriber({
      email,
      subscribedAt: new Date(),
      isActive: true
    });
    
    await newSubscriber.save();
    console.log(`✅ New subscriber added: ${email}`);
    
    res.json({ 
      success: true, 
      message: "Successfully subscribed to our newsletter!" 
    });
  } catch (error) {
    console.error("Subscribe Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already subscribed!" 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: "Failed to subscribe. Please try again later." 
    });
  }
};

// backend/src/controllers/blogController.js

// ================= GET SUBSCRIBERS (FIXED - using Subscriber model) =================
export const getSubscribers = async (req, res) => {
  try {
    console.log("🔵 Fetching subscribers from Subscriber model...");
    
    // Get all active subscribers
    const subscribers = await Subscriber.find({ isActive: true })
      .sort({ subscribedAt: -1 });
    
    const inactiveCount = await Subscriber.countDocuments({ isActive: false });
    
    console.log(`✅ Found ${subscribers.length} active subscribers`);
    
    res.json({ 
      subscribers: subscribers,
      total: subscribers.length,
      inactive: inactiveCount 
    });
  } catch (error) {
    console.error("Get Subscribers Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ================= UNSUBSCRIBE NEWSLETTER (FIXED) =================
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`🔵 Unsubscribe request for: ${email}`);
    
    const subscriber = await Subscriber.findOne({ email });
    
    if (subscriber) {
      subscriber.isActive = false;
      await subscriber.save();
      console.log(`✅ Unsubscribed: ${email}`);
      return res.json({ success: true, message: "Successfully unsubscribed from our newsletter." });
    }
    
    res.json({ success: true, message: "Email not found in subscribers list." });
  } catch (error) {
    console.error("Unsubscribe Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET PENDING COMMENTS =================
export const getPendingComments = async (req, res) => {
  try {
    const pendingComments = await BlogComment.find({ isApproved: false })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    // Get blog titles for each comment
    const commentsWithBlogs = await Promise.all(pendingComments.map(async (comment) => {
      const blog = await Blog.findById(comment.blogId).select('title slug');
      return {
        id: comment._id,
        blogId: comment.blogId,
        blogTitle: blog?.title || 'Unknown',
        blogSlug: blog?.slug || '',
        userName: comment.userName,
        userEmail: comment.userEmail,
        content: comment.content,
        createdAt: comment.createdAt,
        isApproved: comment.isApproved
      };
    }));
    
    res.json(commentsWithBlogs);
  } catch (error) {
    console.error("Get Pending Comments Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ================= APPROVE COMMENT =================
export const approveComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    
    const comment = await BlogComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    comment.isApproved = true;
    await comment.save();
    
    res.json({ message: "Comment approved successfully", comment });
  } catch (error) {
    console.error("Approve Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ================= DELETE COMMENT =================
export const deleteComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    
    const comment = await BlogComment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Update blog comment count
    const blog = await Blog.findById(blogId);
    if (blog) {
      blog.commentsCount = Math.max(0, (blog.commentsCount || 0) - 1);
      await blog.save();
    }
    
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPLOAD FEATURED IMAGE =================
export const uploadFeaturedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
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

// ================= DELETE IMAGE =================
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