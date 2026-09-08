// controllers/adminAuthorController.js - COMPLETELY FIXED
import mongoose from "mongoose";
import BlogAuthor from "../models/BlogAuthor.js";
import BlogPost from "../models/BlogPost.js";
import User from "../models/User.js";

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ==================== GET ALL AUTHORS ====================
export const getAllAuthors = async (req, res) => {
  try {
    const { status, search, sort = "-createdAt", page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } }
      ];
    }

    const sortOptions = {};
    if (sort === "latest") sortOptions.createdAt = -1;
    else if (sort === "oldest") sortOptions.createdAt = 1;
    else if (sort === "name") sortOptions.name = 1;
    else if (sort === "posts") sortOptions.postCount = -1;
    else sortOptions.createdAt = -1;

    const [authors, total] = await Promise.all([
      BlogAuthor.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogAuthor.countDocuments(filter)
    ]);

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
        postCount: postCount || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0
      };
    }));

    const stats = {
      total: await BlogAuthor.countDocuments(),
      active: await BlogAuthor.countDocuments({ status: "active" }),
      pending: await BlogAuthor.countDocuments({ status: "pending" }),
      inactive: await BlogAuthor.countDocuments({ status: "inactive" }),
      totalPosts: await BlogPost.countDocuments()
    };

    res.json({
      success: true,
      data: authorsWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      stats
    });
  } catch (error) {
    console.error("❌ Get authors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch authors",
      error: error.message
    });
  }
};

// ==================== GET AUTHOR BY ID ====================
export const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;

    const author = await BlogAuthor.findById(id).lean();
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    const posts = await BlogPost.find({ author: id })
      .select("title slug featuredImage publishDate views likes comments status")
      .sort({ publishDate: -1 })
      .lean();

    const [postCount, totalLikes, totalViews] = await Promise.all([
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
          postCount: postCount || 0,
          totalLikes: totalLikes[0]?.total || 0,
          totalViews: totalViews[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error("❌ Get author error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch author",
      error: error.message
    });
  }
};

// ==================== GET AUTHOR BY SLUG ====================
export const getAuthorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const author = await BlogAuthor.findOne({ slug }).lean();
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    const posts = await BlogPost.find({ author: author._id, status: "published" })
      .select("title slug featuredImage publishDate views likes comments status")
      .sort({ publishDate: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        ...author,
        posts
      }
    });
  } catch (error) {
    console.error("❌ Get author by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch author",
      error: error.message
    });
  }
};

// ==================== CREATE AUTHOR - COMPLETELY FIXED ====================
export const createAuthor = async (req, res) => {
  try {
    console.log("📝 Create author request:", req.body);

    const {
      name,
      email,
      title,
      bio,
      avatar,
      expertise,
      experience,
      education,
      certifications,
      social,
      status,
      userId,
      metaDescription
    } = req.body;

    // Validate required fields
    if (!name || !email || !title || !bio) {
      return res.status(400).json({
        success: false,
        message: "Name, email, title, and bio are required"
      });
    }

    // Check if email already exists
    const existingAuthor = await BlogAuthor.findOne({ email });
    if (existingAuthor) {
      return res.status(400).json({
        success: false,
        message: "An author with this email already exists"
      });
    }

    // Check if user already exists
    if (userId) {
      const existingUser = await BlogAuthor.findOne({ userId });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "This user is already an author"
        });
      }
    }

    // Parse JSON fields
    const parsedExpertise = expertise ? (typeof expertise === "string" ? JSON.parse(expertise) : expertise) : [];
    const parsedEducation = education ? (typeof education === "string" ? JSON.parse(education) : education) : [];
    const parsedCertifications = certifications ? (typeof certifications === "string" ? JSON.parse(certifications) : certifications) : [];
    const parsedSocial = social ? (typeof social === "string" ? JSON.parse(social) : social) : {};

    // Generate slug explicitly
    const slug = generateSlug(name);

    // Check if slug already exists
    const existingSlug = await BlogAuthor.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "An author with this slug already exists. Please use a different name."
      });
    }

    const newAuthor = new BlogAuthor({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      title: title.trim(),
      bio: bio.trim(),
      avatar: avatar || "",
      expertise: parsedExpertise,
      experience: parseInt(experience) || 0,
      education: parsedEducation,
      certifications: parsedCertifications,
      social: parsedSocial,
      status: status || "active",
      userId: userId || null,
      metaDescription: metaDescription || "",
      slug: slug // Explicitly set slug
    });

    await newAuthor.save();
    console.log("✅ Author created:", newAuthor._id);

    res.status(201).json({
      success: true,
      message: "Author created successfully",
      data: newAuthor
    });
  } catch (error) {
    console.error("❌ Create author error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An author with this email, name, or slug already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create author",
      error: error.message
    });
  }
};

// ==================== UPDATE AUTHOR ====================
export const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📝 Update author:", id);
    console.log("📋 Update data:", req.body);

    const author = await BlogAuthor.findById(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    const {
      name,
      email,
      title,
      bio,
      avatar,
      expertise,
      experience,
      education,
      certifications,
      social,
      status,
      userId,
      metaDescription,
      isActive
    } = req.body;

    // Check if email is being changed and if it already exists
    if (email && email.trim() !== author.email) {
      const trimmedEmail = email.trim().toLowerCase();
      const existingAuthor = await BlogAuthor.findOne({ 
        email: trimmedEmail,
        _id: { $ne: id }
      });
      if (existingAuthor) {
        return res.status(400).json({
          success: false,
          message: "Another author with this email already exists"
        });
      }
      author.email = trimmedEmail;
    }

    // Check if name is being changed and update slug
    if (name && name.trim() !== author.name) {
      const trimmedName = name.trim();
      const newSlug = generateSlug(trimmedName);
      
      // Check if another author has this slug
      const existingSlug = await BlogAuthor.findOne({ 
        slug: newSlug,
        _id: { $ne: id }
      });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: "Another author with this name/slug already exists"
        });
      }
      
      author.name = trimmedName;
      author.slug = newSlug;
    }

    if (title) author.title = title.trim();
    if (bio) author.bio = bio.trim();
    if (avatar !== undefined) author.avatar = avatar;
    if (status) author.status = status;
    if (userId !== undefined) author.userId = userId;
    if (metaDescription !== undefined) author.metaDescription = metaDescription;
    if (isActive !== undefined) author.isActive = isActive;

    // Parse JSON fields
    if (expertise) {
      author.expertise = typeof expertise === "string" ? JSON.parse(expertise) : expertise;
    }
    if (education) {
      author.education = typeof education === "string" ? JSON.parse(education) : education;
    }
    if (certifications) {
      author.certifications = typeof certifications === "string" ? JSON.parse(certifications) : certifications;
    }
    if (social) {
      author.social = typeof social === "string" ? JSON.parse(social) : social;
    }
    if (experience !== undefined) {
      author.experience = parseInt(experience) || 0;
    }

    await author.save();

    // Update author stats
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

    author.postCount = postCount || 0;
    author.totalLikes = totalLikes[0]?.total || 0;
    author.totalViews = totalViews[0]?.total || 0;
    await author.save();

    res.json({
      success: true,
      message: "Author updated successfully",
      data: author
    });
  } catch (error) {
    console.error("❌ Update author error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Another author with this email, name, or slug already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update author",
      error: error.message
    });
  }
};

// ==================== DELETE AUTHOR ====================
export const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const author = await BlogAuthor.findById(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    const postCount = await BlogPost.countDocuments({ author: id });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete author with ${postCount} posts. Reassign or delete posts first.`
      });
    }

    await BlogAuthor.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Author deleted successfully"
    });
  } catch (error) {
    console.error("❌ Delete author error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete author",
      error: error.message
    });
  }
};

// ==================== GET AUTHOR STATS ====================
export const getAuthorStats = async (req, res) => {
  try {
    const [total, active, pending, inactive] = await Promise.all([
      BlogAuthor.countDocuments(),
      BlogAuthor.countDocuments({ status: "active" }),
      BlogAuthor.countDocuments({ status: "pending" }),
      BlogAuthor.countDocuments({ status: "inactive" })
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        pending,
        inactive
      }
    });
  } catch (error) {
    console.error("❌ Get author stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch author stats",
      error: error.message
    });
  }
};

// ==================== GET ALL AUTHORS (PUBLIC - FOR BLOG POST FORM) ====================
export const getAuthorsForSelect = async (req, res) => {
  try {
    const authors = await BlogAuthor.find({ status: "active", isActive: true })
      .select("_id name email title avatar bio")
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: authors
    });
  } catch (error) {
    console.error("❌ Get authors for select error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch authors",
      error: error.message
    });
  }
};