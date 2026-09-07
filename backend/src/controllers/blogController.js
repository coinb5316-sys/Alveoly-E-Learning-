// controllers/blogController.js - FIXED IMPORTS
import mongoose from "mongoose";
import BlogPost from "../models/BlogPost.js";
import BlogCategory from "../models/BlogCategory.js";
import BlogComment from "../models/BlogComment.js";
import User from "../models/User.js";
// CORRECTED: Import from root config folder (../../config/)
import cloudinary, { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary.js";

// Import notification service
import { emitAdminNotification } from "../services/notificationService.js";

// ==================== POST CONTROLLERS ====================

// Create a new blog post
export const createBlogPost = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      content,
      category,
      tags,
      videoUrl,
      videoEmbed,
      audioUrl,
      status = "draft",
      featured = false,
      publishDate,
      metaDescription,
      metaKeywords,
      authorBio,
      authorTitle,
      authorImage,
      references,
      learningObjectives,
      statistics,
      allowComments,
      showAuthor,
      showShareButtons,
      galleryImages
    } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required"
      });
    }

    // Upload featured image if provided (from memory buffer)
    let featuredImage = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "blog/featured",
          public_id: `featured_${Date.now()}`,
          transformation: [
            { width: 1200, height: 630, crop: "fill" },
            { quality: "auto" }
          ]
        });
        featuredImage = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: uploadError.message
        });
      }
    }

    // Process gallery images
    let processedGalleryImages = [];
    if (galleryImages) {
      try {
        processedGalleryImages = typeof galleryImages === "string" 
          ? JSON.parse(galleryImages) 
          : galleryImages;
      } catch (e) {
        processedGalleryImages = [];
      }
    }

    // Get author details
    const author = await User.findById(req.user.id);
    const authorName = author.name;
    const authorTitleFinal = authorTitle || author.title || "Contributor";

    // Create slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      slug += `-${Date.now()}`;
    }

    // Parse JSON fields
    const parsedTags = tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [];
    const parsedReferences = references ? (typeof references === "string" ? JSON.parse(references) : references) : [];
    const parsedLearningObjectives = learningObjectives ? (typeof learningObjectives === "string" ? JSON.parse(learningObjectives) : learningObjectives) : [];
    const parsedStatistics = statistics ? (typeof statistics === "string" ? JSON.parse(statistics) : statistics) : [];

    const newPost = new BlogPost({
      title,
      subtitle,
      content,
      category,
      tags: parsedTags,
      featuredImage,
      galleryImages: processedGalleryImages,
      videoUrl,
      videoEmbed,
      audioUrl,
      author: req.user.id,
      authorName,
      authorTitle: authorTitleFinal,
      authorBio: authorBio || author.bio || "",
      authorImage: authorImage || author.avatar || "",
      status,
      featured,
      publishDate: publishDate || (status === "published" ? new Date() : null),
      metaDescription,
      metaKeywords,
      references: parsedReferences,
      learningObjectives: parsedLearningObjectives,
      statistics: parsedStatistics,
      allowComments: allowComments !== undefined ? allowComments : true,
      showAuthor: showAuthor !== undefined ? showAuthor : true,
      showShareButtons: showShareButtons !== undefined ? showShareButtons : true,
      slug,
      isPublished: status === "published"
    });

    await newPost.save();

    // Update category count
    await BlogCategory.findOneAndUpdate(
      { name: category },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    // Populate author details for response
    const populatedPost = await BlogPost.findById(newPost._id)
      .populate("author", "name email avatar role")
      .lean();

    // Send notification to admin
    emitAdminNotification({
      type: "blog_post_created",
      message: `New blog post "${title}" created`,
      data: { postId: newPost._id, title }
    });

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: populatedPost
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: error.message
    });
  }
};

// Get all blog posts with pagination and filters
export const getAllBlogPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      tag,
      author,
      search,
      sort = "-publishDate",
      featured,
      publishedOnly = true
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};
    
    if (publishedOnly === "true" || publishedOnly === true) {
      filter.status = "published";
      filter.isPublished = true;
    }
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (featured === "true" || featured === true) filter.featured = true;
    if (author) filter.author = author;
    if (tag) filter.tags = { $in: [tag] };
    
    // Search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // Build sort
    const sortOptions = {};
    if (sort === "latest") sortOptions.publishDate = -1;
    else if (sort === "oldest") sortOptions.publishDate = 1;
    else if (sort === "popular") sortOptions.views = -1;
    else if (sort === "trending") sortOptions.likes = -1;
    else if (sort === "featured") { sortOptions.featured = -1; sortOptions.publishDate = -1; }
    else sortOptions.createdAt = -1;

    // Execute query
    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .populate("author", "name email avatar role title")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filter)
    ]);

    // Get featured post
    let featuredPost = null;
    if (pageNum === 1 && !search && !category && !status) {
      featuredPost = await BlogPost.findOne({ featured: true, status: "published" })
        .populate("author", "name email avatar role title")
        .sort({ publishDate: -1 })
        .lean();
    }

    // Get categories with counts
    const categories = await BlogCategory.find({ isActive: true })
      .sort({ count: -1 })
      .lean();

    // Get trending tags
    const tagAggregation = await BlogPost.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    const trendingTags = tagAggregation.map(t => ({ name: t._id, count: t.count }));

    // Get author stats
    const authorAggregation = await BlogPost.aggregate([
      { $match: { status: "published" } },
      { $group: { 
        _id: "$author", 
        count: { $sum: 1 },
        totalLikes: { $sum: "$likes" },
        totalViews: { $sum: "$views" }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const authorIds = authorAggregation.map(a => a._id);
    const authors = await User.find({ _id: { $in: authorIds } })
      .select("name email avatar role title")
      .lean();

    const authorStats = authorAggregation.map(a => {
      const user = authors.find(u => u._id.toString() === a._id.toString());
      return {
        author: user,
        postCount: a.count,
        totalLikes: a.totalLikes,
        totalViews: a.totalViews
      };
    });

    res.json({
      success: true,
      data: {
        posts,
        featuredPost,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        },
        categories,
        trendingTags,
        authorStats,
        totalPosts: total
      }
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog posts",
      error: error.message
    });
  }
};

// Get blog post by slug
export const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ slug, status: "published" })
      .populate("author", "name email avatar role title bio")
      .populate("relatedPosts", "title slug featuredImage readTime")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    // Increment view count
    await BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    // Get comments
    const comments = await BlogComment.find({ 
      postId: post._id, 
      status: "approved" 
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get related posts
    let relatedPosts = post.relatedPosts || [];
    if (relatedPosts.length === 0) {
      relatedPosts = await BlogPost.find({
        _id: { $ne: post._id },
        category: post.category,
        status: "published"
      })
        .select("title slug featuredImage readTime")
        .limit(3)
        .lean();
    }

    res.json({
      success: true,
      data: {
        ...post,
        comments,
        relatedPosts
      }
    });
  } catch (error) {
    console.error("Get blog post by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog post",
      error: error.message
    });
  }
};

// Get blog post by ID
export const getBlogPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id)
      .populate("author", "name email avatar role title bio")
      .populate("relatedPosts", "title slug featuredImage readTime")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    // Get comments
    const comments = await BlogComment.find({ 
      postId: post._id, 
      status: "approved" 
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: {
        ...post,
        comments
      }
    });
  } catch (error) {
    console.error("Get blog post by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog post",
      error: error.message
    });
  }
};

// Update blog post
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find existing post
    const existingPost = await BlogPost.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    // Handle featured image upload from buffer
    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (existingPost.featuredImage) {
          const oldPublicId = existingPost.featuredImage.split("/").pop().split(".")[0];
          await deleteFromCloudinary(`blog/featured/${oldPublicId}`);
        }

        // Upload new image
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "blog/featured",
          public_id: `featured_${Date.now()}`,
          transformation: [
            { width: 1200, height: 630, crop: "fill" },
            { quality: "auto" }
          ]
        });
        updates.featuredImage = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: uploadError.message
        });
      }
    }

    // Parse JSON fields
    const jsonFields = ['galleryImages', 'tags', 'references', 'learningObjectives', 'statistics'];
    for (const field of jsonFields) {
      if (updates[field] && typeof updates[field] === "string") {
        try {
          updates[field] = JSON.parse(updates[field]);
        } catch (e) {
          updates[field] = [];
        }
      }
    }

    // Update slug if title changed
    if (updates.title && updates.title !== existingPost.title) {
      let newSlug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      const existingSlug = await BlogPost.findOne({ 
        slug: newSlug, 
        _id: { $ne: id } 
      });
      if (existingSlug) {
        newSlug += `-${Date.now()}`;
      }
      updates.slug = newSlug;
    }

    // Set publish date if status changed to published
    if (updates.status === "published" && existingPost.status !== "published") {
      updates.publishDate = new Date();
      updates.isPublished = true;
    }

    // Update the post
    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("author", "name email avatar role title");

    res.json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedPost
    });
  } catch (error) {
    console.error("Update blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog post",
      error: error.message
    });
  }
};

// Delete blog post
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    // Delete featured image from Cloudinary
    if (post.featuredImage) {
      try {
        const publicId = post.featuredImage.split("/").pop().split(".")[0];
        await deleteFromCloudinary(`blog/featured/${publicId}`);
      } catch (err) {
        console.error("Failed to delete featured image:", err);
      }
    }

    // Delete gallery images from Cloudinary
    if (post.galleryImages && post.galleryImages.length > 0) {
      for (const image of post.galleryImages) {
        try {
          const publicId = image.split("/").pop().split(".")[0];
          await deleteFromCloudinary(`blog/gallery/${publicId}`);
        } catch (err) {
          console.error("Failed to delete gallery image:", err);
        }
      }
    }

    // Delete comments
    await BlogComment.deleteMany({ postId: id });

    // Delete the post
    await BlogPost.findByIdAndDelete(id);

    // Update category count
    await BlogCategory.findOneAndUpdate(
      { name: post.category },
      { $inc: { count: -1 } }
    );

    res.json({
      success: true,
      message: "Blog post deleted successfully"
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog post",
      error: error.message
    });
  }
};

// Bulk delete posts
export const bulkDeletePosts = async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post IDs array is required"
      });
    }

    // Get posts to delete
    const posts = await BlogPost.find({ _id: { $in: postIds } });
    
    // Delete images from Cloudinary
    for (const post of posts) {
      if (post.featuredImage) {
        try {
          const publicId = post.featuredImage.split("/").pop().split(".")[0];
          await deleteFromCloudinary(`blog/featured/${publicId}`);
        } catch (err) {
          console.error("Failed to delete image:", err);
        }
      }
    }

    // Delete comments
    await BlogComment.deleteMany({ postId: { $in: postIds } });

    // Delete posts
    await BlogPost.deleteMany({ _id: { $in: postIds } });

    res.json({
      success: true,
      message: `${postIds.length} blog posts deleted successfully`
    });
  } catch (error) {
    console.error("Bulk delete posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete posts",
      error: error.message
    });
  }
};

// Toggle featured
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    post.featured = !post.featured;
    await post.save();

    res.json({
      success: true,
      message: `Post ${post.featured ? "featured" : "unfeatured"}`,
      data: { featured: post.featured }
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle featured",
      error: error.message
    });
  }
};

// Publish blog post
export const publishBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    post.status = "published";
    post.isPublished = true;
    post.publishDate = new Date();
    await post.save();

    // Send notification to admin
    if (global.io) {
      global.io.to("admin").emit("new_notification", {
        type: "blog_post_published",
        message: `Blog post "${post.title}" published`,
        data: { postId: post._id, title: post.title }
      });
    }

    res.json({
      success: true,
      message: "Blog post published successfully",
      data: post
    });
  } catch (error) {
    console.error("Publish blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish blog post",
      error: error.message
    });
  }
};

// Archive blog post
export const archiveBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    post.status = "archived";
    post.isPublished = false;
    await post.save();

    res.json({
      success: true,
      message: "Blog post archived successfully",
      data: post
    });
  } catch (error) {
    console.error("Archive blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive blog post",
      error: error.message
    });
  }
};

// Get featured posts
export const getFeaturedPosts = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const posts = await BlogPost.find({ 
      featured: true, 
      status: "published" 
    })
      .populate("author", "name email avatar role title")
      .sort({ publishDate: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error("Get featured posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured posts",
      error: error.message
    });
  }
};

// Get trending posts
export const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const posts = await BlogPost.find({ status: "published" })
      .populate("author", "name email avatar role title")
      .sort({ views: -1, likes: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error("Get trending posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending posts",
      error: error.message
    });
  }
};

// Get related posts
export const getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    const relatedPosts = await BlogPost.find({
      _id: { $ne: id },
      status: "published",
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } }
      ]
    })
      .populate("author", "name email avatar role title")
      .sort({ publishDate: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: relatedPosts
    });
  } catch (error) {
    console.error("Get related posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related posts",
      error: error.message
    });
  }
};

// Get posts by category
export const getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { 
      category, 
      status: "published" 
    };

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .populate("author", "name email avatar role title")
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get posts by category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message
    });
  }
};

// Get posts by author
export const getPostsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { 
      author: authorId,
      status: "published" 
    };

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .populate("author", "name email avatar role title bio")
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filter)
    ]);

    // Get author stats
    const author = await User.findById(authorId).select("name email avatar role title bio");

    const [totalPosts, totalLikes, totalViews] = await Promise.all([
      BlogPost.countDocuments({ author: authorId, status: "published" }),
      BlogPost.aggregate([
        { $match: { author: new mongoose.Types.ObjectId(authorId), status: "published" } },
        { $group: { _id: null, total: { $sum: "$likes" } } }
      ]),
      BlogPost.aggregate([
        { $match: { author: new mongoose.Types.ObjectId(authorId), status: "published" } },
        { $group: { _id: null, total: { $sum: "$views" } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        author,
        posts,
        stats: {
          totalPosts,
          totalLikes: totalLikes[0]?.total || 0,
          totalViews: totalViews[0]?.total || 0
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get posts by author error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message
    });
  }
};

// Search posts
export const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10, category, tag } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const searchRegex = new RegExp(q.trim(), "i");
    const filter = {
      status: "published",
      $or: [
        { title: searchRegex },
        { subtitle: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } },
        { authorName: searchRegex }
      ]
    };

    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .populate("author", "name email avatar role title")
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        posts,
        query: q,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        },
        suggestions: await getSearchSuggestions(q)
      }
    });
  } catch (error) {
    console.error("Search posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search posts",
      error: error.message
    });
  }
};

// Get search suggestions
const getSearchSuggestions = async (query) => {
  try {
    const regex = new RegExp(query.trim(), "i");
    
    const [titles, tags, categories] = await Promise.all([
      BlogPost.find({ status: "published", title: regex })
        .select("title")
        .limit(5)
        .lean(),
      BlogPost.aggregate([
        { $match: { status: "published", tags: { $in: [regex] } } },
        { $unwind: "$tags" },
        { $match: { tags: regex } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      BlogPost.find({ status: "published", category: regex })
        .distinct("category")
        .limit(5)
    ]);

    return {
      titles: titles.map(t => t.title),
      tags: tags.map(t => t._id),
      categories
    };
  } catch (error) {
    console.error("Get search suggestions error:", error);
    return { titles: [], tags: [], categories: [] };
  }
};

// Get post stats
export const getPostStats = async (req, res) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      pendingPosts,
      archivedPosts,
      featuredPosts,
      totalViews,
      totalLikes,
      totalComments
    ] = await Promise.all([
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: "published" }),
      BlogPost.countDocuments({ status: "draft" }),
      BlogPost.countDocuments({ status: "pending" }),
      BlogPost.countDocuments({ status: "archived" }),
      BlogPost.countDocuments({ featured: true, status: "published" }),
      BlogPost.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      BlogPost.aggregate([{ $group: { _id: null, total: { $sum: "$likes" } } }]),
      BlogComment.countDocuments({ status: "approved" })
    ]);

    res.json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        pendingPosts,
        archivedPosts,
        featuredPosts,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments
      }
    });
  } catch (error) {
    console.error("Get post stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message
    });
  }
};

// Toggle like
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    // If user is authenticated, track their like
    if (userId) {
      const likedBy = post.likedBy || [];
      const hasLiked = likedBy.includes(userId);

      if (hasLiked) {
        post.likes = Math.max(0, post.likes - 1);
        post.likedBy = likedBy.filter(id => id.toString() !== userId);
      } else {
        post.likes += 1;
        post.likedBy = [...likedBy, userId];
      }
    } else {
      // Anonymous like
      post.likes += 1;
    }

    await post.save();

    res.json({
      success: true,
      data: { likes: post.likes }
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error.message
    });
  }
};

// Increment views
export const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    await BlogPost.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      message: "View counted"
    });
  } catch (error) {
    console.error("Increment views error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to increment views",
      error: error.message
    });
  }
};

// ==================== CATEGORY CONTROLLERS ====================

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingCategory = await BlogCategory.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await BlogCategory.create({
      name,
      slug,
      description,
      icon,
      color
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message
    });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find({ isActive: true })
      .sort({ count: -1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await BlogCategory.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, isActive } = req.body;

    const category = await BlogCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    if (name && name !== category.name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      const existing = await BlogCategory.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists"
        });
      }
      category.slug = slug;
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.icon = icon !== undefined ? icon : category.icon;
    category.color = color !== undefined ? color : category.color;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await BlogCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if there are posts in this category
    const postCount = await BlogPost.countDocuments({ category: category.name });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${postCount} posts. Reassign posts first.`
      });
    }

    await BlogCategory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message
    });
  }
};

// ==================== COMMENT CONTROLLERS ====================

// Add comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, authorName, authorEmail } = req.body;

    if (!content || !authorName || !authorEmail) {
      return res.status(400).json({
        success: false,
        message: "Content, author name, and email are required"
      });
    }

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    if (!post.allowComments) {
      return res.status(403).json({
        success: false,
        message: "Comments are disabled for this post"
      });
    }

    const comment = await BlogComment.create({
      postId,
      author: req.user?.id,
      authorName,
      authorEmail,
      content,
      status: "pending",
      authorAvatar: req.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`
    });

    // Increment comment count
    await BlogPost.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

    // Notify admin
    if (global.io) {
      global.io.to("admin").emit("new_notification", {
        type: "blog_comment",
        message: `New comment on "${post.title}" from ${authorName}`,
        data: { postId, commentId: comment._id, postTitle: post.title }
      });
    }

    res.status(201).json({
      success: true,
      message: "Comment submitted for approval",
      data: comment
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message
    });
  }
};

// Get comments
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status = "approved", page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { postId };
    if (status !== "all") filter.status = status;

    const [comments, total] = await Promise.all([
      BlogComment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogComment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message
    });
  }
};

// Approve comment
export const approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await BlogComment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    comment.status = "approved";
    comment.isApproved = true;
    await comment.save();

    res.json({
      success: true,
      message: "Comment approved successfully",
      data: comment
    });
  } catch (error) {
    console.error("Approve comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve comment",
      error: error.message
    });
  }
};

// Reject comment
export const rejectComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await BlogComment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    comment.status = "rejected";
    await comment.save();

    res.json({
      success: true,
      message: "Comment rejected successfully",
      data: comment
    });
  } catch (error) {
    console.error("Reject comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject comment",
      error: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await BlogComment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Decrement comment count
    await BlogPost.findByIdAndUpdate(comment.postId, { $inc: { comments: -1 } });

    await BlogComment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message
    });
  }
};

// Get comment stats
export const getCommentStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected, spam] = await Promise.all([
      BlogComment.countDocuments(),
      BlogComment.countDocuments({ status: "pending" }),
      BlogComment.countDocuments({ status: "approved" }),
      BlogComment.countDocuments({ status: "rejected" }),
      BlogComment.countDocuments({ status: "spam" })
    ]);

    // Get recent comments
    const recent = await BlogComment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("postId", "title slug")
      .lean();

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        spam,
        recent
      }
    });
  } catch (error) {
    console.error("Get comment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comment stats",
      error: error.message
    });
  }
};