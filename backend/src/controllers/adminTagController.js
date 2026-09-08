// controllers/adminTagController.js - COMPLETE FIXED
import BlogTag from "../models/BlogTag.js";
import BlogPost from "../models/BlogPost.js";

// ==================== GET ALL TAGS ====================
export const getAllTags = async (req, res) => {
  try {
    const { search, sort = "-count", page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }
      ];
    }

    // Sort options
    const sortOptions = {};
    if (sort === "latest") sortOptions.createdAt = -1;
    else if (sort === "oldest") sortOptions.createdAt = 1;
    else if (sort === "name") sortOptions.name = 1;
    else if (sort === "count") sortOptions.count = -1;
    else sortOptions.count = -1;

    const [tags, total] = await Promise.all([
      BlogTag.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogTag.countDocuments(filter)
    ]);

    // Get stats
    const stats = {
      total: await BlogTag.countDocuments(),
      active: await BlogTag.countDocuments({ isActive: true }),
      totalMentions: tags.reduce((sum, tag) => sum + (tag.count || 0), 0),
      popular: await BlogTag.countDocuments({ count: { $gt: 5 } })
    };

    res.json({
      success: true,
      data: tags,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      stats
    });
  } catch (error) {
    console.error("❌ Get tags error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
      error: error.message
    });
  }
};

// ==================== GET TAG BY ID ====================
export const getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await BlogTag.findById(id).lean();
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    // Get posts with this tag
    const posts = await BlogPost.find({ tags: tag.name, status: "published" })
      .select("title slug featuredImage publishDate views likes")
      .sort({ publishDate: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        ...tag,
        posts
      }
    });
  } catch (error) {
    console.error("❌ Get tag error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tag",
      error: error.message
    });
  }
};

// ==================== GET TAG BY SLUG ====================
export const getTagBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tag = await BlogTag.findOne({ slug }).lean();
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    const posts = await BlogPost.find({ tags: tag.name, status: "published" })
      .select("title slug featuredImage publishDate views likes")
      .sort({ publishDate: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        ...tag,
        posts
      }
    });
  } catch (error) {
    console.error("❌ Get tag by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tag",
      error: error.message
    });
  }
};

// ==================== CREATE TAG ====================
export const createTag = async (req, res) => {
  try {
    console.log("📝 Create tag request:", req.body);

    const { name, color, icon, description, metaDescription } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required"
      });
    }

    // Check if tag already exists
    const existingTag = await BlogTag.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "A tag with this name already exists"
      });
    }

    const newTag = new BlogTag({
      name: name.trim(),
      color: color || "#3b82f6",
      icon: icon || "",
      description: description || "",
      metaDescription: metaDescription || ""
    });

    await newTag.save();
    console.log("✅ Tag created:", newTag._id);

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: newTag
    });
  } catch (error) {
    console.error("❌ Create tag error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A tag with this name already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create tag",
      error: error.message
    });
  }
};

// ==================== UPDATE TAG ====================
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📝 Update tag:", id);
    console.log("📋 Update data:", req.body);

    const tag = await BlogTag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    const { name, color, icon, description, metaDescription, isActive } = req.body;

    // Check if name is being changed and if it already exists
    if (name && name !== tag.name) {
      const existingTag = await BlogTag.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "Another tag with this name already exists"
        });
      }
      tag.name = name.trim();
      // Update slug in all posts that have this tag
      await BlogPost.updateMany(
        { tags: tag.name },
        { $set: { "tags.$": name.trim() } }
      );
    }

    if (color !== undefined) tag.color = color;
    if (icon !== undefined) tag.icon = icon;
    if (description !== undefined) tag.description = description;
    if (metaDescription !== undefined) tag.metaDescription = metaDescription;
    if (isActive !== undefined) tag.isActive = isActive;

    // Update count
    const count = await BlogPost.countDocuments({ tags: tag.name });
    tag.count = count || 0;

    await tag.save();

    res.json({
      success: true,
      message: "Tag updated successfully",
      data: tag
    });
  } catch (error) {
    console.error("❌ Update tag error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Another tag with this name already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update tag",
      error: error.message
    });
  }
};

// ==================== DELETE TAG ====================
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

    await BlogTag.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Tag deleted successfully"
    });
  } catch (error) {
    console.error("❌ Delete tag error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tag",
      error: error.message
    });
  }
};

// ==================== GET TAG STATS ====================
export const getTagStats = async (req, res) => {
  try {
    const [total, active, popular] = await Promise.all([
      BlogTag.countDocuments(),
      BlogTag.countDocuments({ isActive: true }),
      BlogTag.countDocuments({ count: { $gt: 5 } })
    ]);

    const totalMentions = await BlogTag.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        popular,
        totalMentions: totalMentions[0]?.total || 0
      }
    });
  } catch (error) {
    console.error("❌ Get tag stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tag stats",
      error: error.message
    });
  }
};