import BlogAuthor from "../models/BlogAuthor.js";
import BlogPost from "../models/BlogPost.js";

// ==================== GET ALL AUTHORS ====================
export const getAuthors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      search,
      sort = "latest"
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } }
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

    // Get stats
    const [active, pending, inactive, totalPosts] = await Promise.all([
      BlogAuthor.countDocuments({ status: "active" }),
      BlogAuthor.countDocuments({ status: "pending" }),
      BlogAuthor.countDocuments({ status: "inactive" }),
      BlogPost.countDocuments()
    ]);

    res.json({
      success: true,
      data: authors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      stats: {
        total,
        active,
        pending,
        inactive,
        totalPosts
      }
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

// ==================== CREATE AUTHOR ====================
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
      metaDescription
    } = req.body;

    // Validate required fields
    if (!name || !email || !title || !bio) {
      return res.status(400).json({
        success: false,
        message: "Name, email, title, and bio are required"
      });
    }

    // Check if author with email already exists
    const existingAuthor = await BlogAuthor.findOne({ email: email.toLowerCase() });
    if (existingAuthor) {
      return res.status(400).json({
        success: false,
        message: "An author with this email already exists"
      });
    }

    const author = new BlogAuthor({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      title: title.trim(),
      bio: bio.trim(),
      avatar: avatar || "",
      expertise: Array.isArray(expertise) ? expertise : [],
      experience: parseInt(experience) || 0,
      education: Array.isArray(education) ? education : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      social: social || {},
      status: status || "active",
      metaDescription: metaDescription || ""
    });

    await author.save();
    console.log("✅ Author created:", author._id);

    res.status(201).json({
      success: true,
      message: "Author created successfully",
      data: author
    });
  } catch (error) {
    console.error("❌ Create author error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An author with this email already exists"
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
    const updates = { ...req.body };

    const author = await BlogAuthor.findById(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    // If email is being changed, check for duplicates
    if (updates.email && updates.email !== author.email) {
      const existing = await BlogAuthor.findOne({
        email: updates.email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "An author with this email already exists"
        });
      }
      updates.email = updates.email.toLowerCase();
    }

    // Parse experience
    if (updates.experience !== undefined) {
      updates.experience = parseInt(updates.experience) || 0;
    }

    const updatedAuthor = await BlogAuthor.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Author updated successfully",
      data: updatedAuthor
    });
  } catch (error) {
    console.error("❌ Update author error:", error);
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

    // Delete author's posts
    await BlogPost.deleteMany({ author: id });
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