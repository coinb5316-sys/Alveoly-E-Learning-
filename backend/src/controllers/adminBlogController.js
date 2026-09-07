// controllers/adminBlogController.js - FIXED IMPORTS
import mongoose from "mongoose";
import BlogPost from "../models/BlogPost.js";
import BlogCategory from "../models/BlogCategory.js";
import BlogComment from "../models/BlogComment.js";
import User from "../models/User.js";
// FIX: Import from root config folder (../../config/)
import cloudinary, { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary.js";
// FIX: Import notification service
import { emitAdminNotification } from "../services/notificationService.js";

// ==================== POST MANAGEMENT ====================

export const getAllBlogPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sort = "-createdAt",
      featured
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    const sortOptions = {};
    if (sort === "latest") sortOptions.createdAt = -1;
    else if (sort === "oldest") sortOptions.createdAt = 1;
    else if (sort === "popular") sortOptions.views = -1;
    else if (sort === "trending") sortOptions.likes = -1;
    else sortOptions.createdAt = -1;

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .populate("author", "name email avatar role")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filter)
    ]);

    const categories = await BlogCategory.find({ isActive: true })
      .sort({ count: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        },
        categories,
        totalPosts: total
      }
    });
  } catch (error) {
    console.error("Admin get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message
    });
  }
};

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

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error("Admin get post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: error.message
    });
  }
};

// ==================== AUTHOR MANAGEMENT ====================

export const getAllAuthors = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = { role: { $in: ["admin", "lecturer"] } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const authors = await User.find(filter)
      .select("name email avatar role title bio status createdAt")
      .sort({ name: 1 })
      .lean();

    const authorsWithStats = await Promise.all(authors.map(async (author) => {
      const [postCount, totalLikes, totalViews] = await Promise.all([
        BlogPost.countDocuments({ author: author._id }),
        BlogPost.aggregate([
          { $match: { author: author._id } },
          { $group: { _id: null, total: { $sum: "$likes" } } }
        ]),
        BlogPost.aggregate([
          { $match: { author: author._id } },
          { $group: { _id: null, total: { $sum: "$views" } } }
        ])
      ]);

      return {
        ...author,
        postCount,
        totalLikes: totalLikes[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0
      };
    }));

    res.json({
      success: true,
      data: authorsWithStats
    });
  } catch (error) {
    console.error("Get authors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch authors",
      error: error.message
    });
  }
};

export const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;

    const author = await User.findById(id)
      .select("name email avatar role title bio status createdAt")
      .lean();

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    const [posts, postCount, totalLikes, totalViews] = await Promise.all([
      BlogPost.find({ author: id })
        .select("title slug featuredImage publishDate views likes comments status")
        .sort({ publishDate: -1 })
        .lean(),
      BlogPost.countDocuments({ author: id }),
      BlogPost.aggregate([
        { $match: { author: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: null, total: { $sum: "$likes" } } }
      ]),
      BlogPost.aggregate([
        { $match: { author: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: null, total: { $sum: "$views" } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        ...author,
        posts,
        stats: {
          postCount,
          totalLikes: totalLikes[0]?.total || 0,
          totalViews: totalViews[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error("Get author error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch author",
      error: error.message
    });
  }
};

export const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, bio, avatar, status } = req.body;

    const author = await User.findById(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    if (name) author.name = name;
    if (title !== undefined) author.title = title;
    if (bio !== undefined) author.bio = bio;
    if (avatar !== undefined) author.avatar = avatar;
    if (status !== undefined) author.status = status;

    await author.save();

    res.json({
      success: true,
      message: "Author updated successfully",
      data: author
    });
  } catch (error) {
    console.error("Update author error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update author",
      error: error.message
    });
  }
};

export const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const postCount = await BlogPost.countDocuments({ author: id });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete author with ${postCount} posts. Reassign posts first.`
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Author deleted successfully"
    });
  } catch (error) {
    console.error("Delete author error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete author",
      error: error.message
    });
  }
};

// ==================== TAG MANAGEMENT ====================

// Get all tags - from posts aggregation
export const getAllTags = async (req, res) => {
  try {
    const { search } = req.query;

    // Build aggregation pipeline
    let pipeline = [
      { $unwind: "$tags" },
      { $group: { 
        _id: "$tags", 
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ];

    if (search) {
      pipeline = [
        { $unwind: "$tags" },
        { $match: { tags: { $regex: search, $options: 'i' } } },
        { $group: { 
          _id: "$tags", 
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } }
      ];
    }

    const tags = await BlogPost.aggregate(pipeline);

    res.json({
      success: true,
      data: tags.map(tag => ({
        name: tag._id,
        slug: tag._id.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        count: tag.count,
        color: getTagColor(tag._id)
      }))
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
      error: error.message
    });
  }
};

// Create tag - just check if it exists in posts
export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    console.log("Creating tag with data:", { name, color });

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required"
      });
    }

    // Check if tag already exists in any post
    const existingPost = await BlogPost.findOne({ tags: name });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: "Tag already exists"
      });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Return the created tag (it will be added to posts when used)
    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: {
        name: name.trim(),
        slug,
        color: color || '#3b82f6',
        count: 0
      }
    });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tag",
      error: error.message
    });
  }
};

// Update tag - update in all posts
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required"
      });
    }

    // Find all posts with this tag
    const posts = await BlogPost.find({ tags: id });
    
    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    // Update tag in all posts
    for (const post of posts) {
      const tagIndex = post.tags.indexOf(id);
      if (tagIndex !== -1) {
        post.tags[tagIndex] = name;
        await post.save();
      }
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    res.json({
      success: true,
      message: "Tag updated successfully",
      data: {
        oldName: id,
        newName: name,
        slug,
        postsUpdated: posts.length
      }
    });
  } catch (error) {
    console.error("Update tag error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tag",
      error: error.message
    });
  }
};

// Delete tag - remove from all posts
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove tag from all posts
    await BlogPost.updateMany(
      { tags: id },
      { $pull: { tags: id } }
    );

    res.json({
      success: true,
      message: "Tag deleted successfully"
    });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tag",
      error: error.message
    });
  }
};

export const getTagBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const tagName = slug.replace(/-/g, " ");

    const posts = await BlogPost.find({
      tags: { $in: [tagName] }
    })
      .populate("author", "name email avatar role")
      .sort({ publishDate: -1 })
      .lean();

    const count = await BlogPost.countDocuments({
      tags: { $in: [tagName] }
    });

    res.json({
      success: true,
      data: {
        name: tagName,
        slug,
        count,
        posts
      }
    });
  } catch (error) {
    console.error("Get tag by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tag",
      error: error.message
    });
  }
};

const getTagColor = (tagName) => {
  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444",
    "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#6366f1",
    "#84cc16", "#d946ef", "#f43f5e", "#0ea5e9", "#22d3ee",
    "#a855f7", "#ec4899", "#14b8a6", "#f43f5e", "#22c55e"
  ];
  const index = tagName.length % colors.length;
  return colors[index];
};