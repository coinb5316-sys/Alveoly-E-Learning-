// controllers/adminBlogController.js - FIXED IMPORTS
import mongoose from "mongoose";
import BlogPost from "../models/BlogPost.js";
import BlogCategory from "../models/BlogCategory.js";
import BlogComment from "../models/BlogComment.js";
import BlogTag from "../models/BlogTag.js";
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

export const getAllTags = async (req, res) => {
  try {
    const { search } = req.query;

    // Query the Tag model directly
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const tags = await BlogTag.find(query)
      .sort({ count: -1, name: 1 })
      .lean();

    // If no tags in the Tag model, fallback to aggregating from posts
    if (tags.length === 0) {
      const pipeline = [
        { $unwind: "$tags" },
        { $group: { 
          _id: "$tags", 
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } }
      ];

      if (search) {
        pipeline.unshift({ 
          $match: { tags: { $regex: search, $options: 'i' } } 
        });
      }

      const aggregatedTags = await BlogPost.aggregate(pipeline);

      return res.json({
        success: true,
        data: aggregatedTags.map(tag => ({
          name: tag._id,
          slug: tag._id.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          count: tag.count,
          color: getTagColor(tag._id)
        }))
      });
    }

    res.json({
      success: true,
      data: tags
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

    // Check if tag already exists in Tag model
    const existingTag = await BlogTag.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "Tag already exists"
      });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create new tag
    const tag = new BlogTag({
      name: name.trim(),
      slug,
      color: color || '#3b82f6',
      count: 0
    });

    await tag.save();

    console.log("Tag created successfully:", tag);

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: tag
    });
  } catch (error) {
    console.error("Create tag error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Tag with this name or slug already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create tag",
      error: error.message
    });
  }
};

export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required"
      });
    }

    const tag = await BlogTag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    // Check if new name already exists
    if (name !== tag.name) {
      const existingTag = await BlogTag.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "Tag with this name already exists"
        });
      }

      // Generate new slug
      tag.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Update tag name in all posts
      await BlogPost.updateMany(
        { tags: tag.name },
        { $set: { "tags.$": name } }
      );
    }

    tag.name = name.trim();
    if (color) tag.color = color;

    await tag.save();

    res.json({
      success: true,
      message: "Tag updated successfully",
      data: tag
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

export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await BlogTag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    // Remove tag from all posts
    await BlogPost.updateMany(
      { tags: tag.name },
      { $pull: { tags: tag.name } }
    );

    // Delete the tag
    await BlogTag.findByIdAndDelete(id);

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

    const tag = await BlogTag.findOne({ slug });
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    // Get posts with this tag
    const posts = await BlogPost.find({
      tags: tag.name,
      status: "published"
    })
      .populate("author", "name email avatar role")
      .sort({ publishDate: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        ...tag.toObject(),
        posts,
        postCount: posts.length
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