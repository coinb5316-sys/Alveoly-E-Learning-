// server/controllers/admin/postController.js
import Post from "../../models/Post.js";
import Author from "../../models/Author.js";
import Category from "../../models/Category.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

/* ---------- Helpers ---------- */
const parseJSONField = (val, fallback) => {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const calculateReadingTime = (html = "") => {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

/* ---------- List ---------- */
export const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      author,
      search,
      sort = "newest",
      publishedOnly,
    } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (category && category !== "all") filter.categoryId = category;
    if (author && author !== "all") filter.authorId = author;
    if (publishedOnly === "true") filter.status = "published";
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const sortMap = {
      newest: { publishedAt: -1 },
      oldest: { publishedAt: 1 },
      title: { title: 1 },
      views: { views: -1 },
      likes: { likes: -1 },
    };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("authorId", "name avatar role credentials")
        .populate("categoryId", "name slug")
        .sort(sortMap[sort] || { publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Attach full author as `author` for the frontend shape
    const shaped = posts.map((p) => ({
      ...p,
      author: p.authorId,
      category: p.categoryId?.name || null,
      categorySlug: p.categoryId?.slug || null,
    }));

    res.json({
      success: true,
      data: {
        posts: shaped,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFeaturedPost = async (req, res) => {
  try {
    const featured =
      (await Post.findOne({ featured: true, editorsPick: true, status: "published" })
        .populate("authorId", "name avatar role")
        .populate("categoryId", "name slug")
        .lean()) ||
      (await Post.findOne({ featured: true, status: "published" })
        .populate("authorId", "name avatar role")
        .populate("categoryId", "name slug")
        .lean());

    res.json({ success: true, data: featured || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Read one ---------- */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("authorId")
      .populate("reviewedBy")
      .populate("categoryId")
      .populate("relatedPosts")
      .lean();

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({
      success: true,
      data: {
        ...post,
        author: post.authorId,
        reviewer: post.reviewedBy,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate("authorId")
      .populate("reviewedBy")
      .populate("categoryId")
      .populate({
        path: "relatedPosts",
        select: "title slug subtitle image categoryId readingTime",
      })
      .lean();

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Attach the related posts as `related` for the frontend
    res.json({
      success: true,
      data: {
        ...post,
        author: post.authorId,
        reviewer: post.reviewedBy,
        related: post.relatedPosts || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Create ---------- */
export const createPost = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Parse JSON-encoded fields
    payload.tags = parseJSONField(req.body.tags, []);
    payload.references = parseJSONField(req.body.references, []);
    payload.learningObjectives = parseJSONField(req.body.learningObjectives, []);
    payload.statistics = parseJSONField(req.body.statistics, []);
    payload.relatedPosts = parseJSONField(req.body.relatedPosts, []);

    // Booleans from FormData arrive as strings
    payload.featured = req.body.featured === "true" || req.body.featured === true;
    payload.editorsPick = req.body.editorsPick === "true" || req.body.editorsPick === true;
    payload.medicallyReviewed = req.body.medicallyReviewed === "true" || req.body.medicallyReviewed === true;

    // Auto reading time
    payload.readingTime = calculateReadingTime(payload.content || "");

    // Featured image upload
    if (req.files?.featuredImage?.[0]) {
      const result = await uploadToCloudinary(
        req.files.featuredImage[0].buffer,
        { folder: "blog/posts" }
      );
      payload.image = result.secure_url;
    }

    // Gallery images
    if (req.files?.galleryImages) {
      const uploaded = await Promise.all(
        req.files.galleryImages.map((f) =>
          uploadToCloudinary(f.buffer, { folder: "blog/posts/gallery" })
        )
      );
      payload.gallery = uploaded.map((r) => r.secure_url);
    } else {
      payload.gallery = parseJSONField(req.body.galleryImages, []);
    }

    // Reviewer: clear if empty string
    if (!payload.reviewedBy) payload.reviewedBy = null;

    const post = await Post.create(payload);

    // Update author's post count
    await Author.findByIdAndUpdate(payload.authorId, {
      $inc: { postCount: 1 },
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Slug already in use" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Update ---------- */
export const updatePost = async (req, res) => {
  try {
    const payload = { ...req.body };

    payload.tags = parseJSONField(req.body.tags, []);
    payload.references = parseJSONField(req.body.references, []);
    payload.learningObjectives = parseJSONField(req.body.learningObjectives, []);
    payload.statistics = parseJSONField(req.body.statistics, []);
    payload.relatedPosts = parseJSONField(req.body.relatedPosts, []);

    payload.featured = req.body.featured === "true" || req.body.featured === true;
    payload.editorsPick = req.body.editorsPick === "true" || req.body.editorsPick === true;
    payload.medicallyReviewed = req.body.medicallyReviewed === "true" || req.body.medicallyReviewed === true;

    if (payload.content) {
      payload.readingTime = calculateReadingTime(payload.content);
    }

    if (req.files?.featuredImage?.[0]) {
      const result = await uploadToCloudinary(
        req.files.featuredImage[0].buffer,
        { folder: "blog/posts" }
      );
      payload.image = result.secure_url;
    }

    if (req.files?.galleryImages) {
      const uploaded = await Promise.all(
        req.files.galleryImages.map((f) =>
          uploadToCloudinary(f.buffer, { folder: "blog/posts/gallery" })
        )
      );
      payload.gallery = uploaded.map((r) => r.secure_url);
    }

    if (!payload.reviewedBy) payload.reviewedBy = null;

    const post = await Post.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Delete ---------- */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    if (post.authorId) {
      await Author.findByIdAndUpdate(post.authorId, {
        $inc: { postCount: -1 },
      });
    }
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Bulk actions ---------- */
export const bulkUpdatePosts = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    if (!ids?.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }
    await Post.updateMany({ _id: { $in: ids } }, { $set: updates });
    res.json({ success: true, message: `${ids.length} posts updated` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkDeletePosts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }
    await Post.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} posts deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Public: increment views ---------- */
export const incrementViews = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Public: toggle like ---------- */
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const hasLiked = post.likedBy.some((id) => id.equals(userId));

    if (hasLiked) {
      post.likedBy.pull(userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();
    res.json({ success: true, likes: post.likes, liked: !hasLiked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};