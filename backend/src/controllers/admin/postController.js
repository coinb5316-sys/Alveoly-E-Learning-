// backend/src/controllers/admin/postController.js
import mongoose from "mongoose";
import Post from "../../models/Post.js";
import Author from "../../models/Author.js";
import Category from "../../models/Category.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

/* ---------- Helpers ---------- */
const parseJSONField = (val, fallback) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const parseBool = (val, fallback) => {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
};

const calculateReadingTime = (html = "") => {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

/* Build the write payload.
   - On create (partial = false), fill in schema defaults.
   - On update (partial = true), ONLY include keys the client actually sent.
     This is what prevents a one-field toggle from wiping metadata. */
const buildPostPayload = (body, { partial = false } = {}) => {
  const payload = {};

  const copyString = (key) => {
    if (body[key] !== undefined) {
      payload[key] =
        typeof body[key] === "string" ? body[key] : String(body[key]);
    }
  };

  [
    "title",
    "slug",
    "subtitle",
    "excerpt",
    "content",
    "image",
    "videoUrl",
    "audioUrl",
    "metaDescription",
    "metaKeywords",
  ].forEach(copyString);

  if (body.categoryId !== undefined) {
    payload.categoryId = body.categoryId || null;
  }
  if (body.authorId !== undefined) {
    payload.authorId = body.authorId || null;
  }
  if (body.reviewedBy !== undefined) {
    payload.reviewedBy = body.reviewedBy || null;
  }
  if (body.status !== undefined) {
    payload.status = body.status;
  }

  if (body.featured !== undefined) {
    payload.featured = parseBool(body.featured, false);
  }
  if (body.editorsPick !== undefined) {
    payload.editorsPick = parseBool(body.editorsPick, false);
  }
  if (body.medicallyReviewed !== undefined) {
    payload.medicallyReviewed = parseBool(body.medicallyReviewed, false);
  }

  if (body.tags !== undefined) {
    payload.tags = parseJSONField(body.tags, []);
  }
  if (body.references !== undefined) {
    payload.references = parseJSONField(body.references, []);
  }
  if (body.learningObjectives !== undefined) {
    payload.learningObjectives = parseJSONField(body.learningObjectives, []);
  }
  if (body.statistics !== undefined) {
    payload.statistics = parseJSONField(body.statistics, []);
  }
  if (body.relatedPosts !== undefined) {
    payload.relatedPosts = parseJSONField(body.relatedPosts, []);
  }

  if (body.publishedAt !== undefined) {
    const d = new Date(body.publishedAt);
    if (!Number.isNaN(d.getTime())) payload.publishedAt = d;
  }

  if (payload.content !== undefined) {
    payload.readingTime = calculateReadingTime(payload.content);
  }

  if (!partial) {
    if (payload.status === undefined) payload.status = "draft";
    if (payload.featured === undefined) payload.featured = false;
    if (payload.editorsPick === undefined) payload.editorsPick = false;
    if (payload.medicallyReviewed === undefined) payload.medicallyReviewed = false;
  }

  return payload;
};

/* Consistent shape for every response that returns a post */
const shapePost = (p) => ({
  ...p,
  id: p._id,
  author: p.authorId,
  authorId: p.authorId?._id || p.authorId,
  reviewer: p.reviewedBy,
  category: p.categoryId,
  categoryId: p.categoryId?._id || p.categoryId,
  categoryName: p.categoryId?.name || null,
  categorySlug: p.categoryId?.slug || null,
  status: p.status || "published",
  featured: p.featured === true,
  editorsPick: p.editorsPick === true,
  medicallyReviewed: p.medicallyReviewed === true,
});

/* Populate + shape in one call */
const findPopulated = (id) =>
  Post.findById(id)
    .populate("authorId", "name slug avatar role credentials title specialties social")
    .populate("categoryId", "name slug")
    .lean();

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
      newest: { publishedAt: -1, createdAt: -1 },
      oldest: { publishedAt: 1, createdAt: 1 },
      title: { title: 1 },
      views: { views: -1 },
      likes: { likes: -1 },
    };

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 500);
    const safePage = Math.max(Number(page) || 1, 1);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("authorId", "name slug avatar role credentials title specialties social")
        .populate("categoryId", "name slug")
        .sort(sortMap[sort] || sortMap.newest)
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        posts: posts.map(shapePost),
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      },
    });
  } catch (err) {
    console.error("getPosts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Featured (public) ---------- */
export const getFeaturedPost = async (req, res) => {
  try {
    const featured =
      (await Post.findOne({
        featured: true,
        editorsPick: true,
        status: "published",
      })
        .populate("authorId", "name avatar role")
        .populate("categoryId", "name slug")
        .lean()) ||
      (await Post.findOne({ featured: true, status: "published" })
        .populate("authorId", "name avatar role")
        .populate("categoryId", "name slug")
        .lean());

    res.json({ success: true, data: featured ? shapePost(featured) : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Read one (admin, full populate) ---------- */
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

    res.json({ success: true, data: shapePost(post) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Public read by slug ---------- */
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

    res.json({
      success: true,
      data: {
        ...shapePost(post),
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
    const payload = buildPostPayload(req.body);

    if (!payload.title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required." });
    }
    if (!payload.content) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required." });
    }
    if (!payload.authorId) {
      return res
        .status(400)
        .json({ success: false, message: "Author is required." });
    }
    if (!payload.categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Category is required." });
    }

    // Featured image — file upload wins over a pasted URL
    if (req.files?.featuredImage?.[0]) {
      const result = await uploadToCloudinary(
        req.files.featuredImage[0].buffer,
        { folder: "blog/posts" }
      );
      payload.image = result.secure_url;
    }

    // Gallery: merge pasted URLs (JSON string) + uploaded files
    const existingGalleryUrls = parseJSONField(req.body.galleryImages, []);
    const uploadedGallery = req.files?.galleryImages
      ? await Promise.all(
          req.files.galleryImages.map((f) =>
            uploadToCloudinary(f.buffer, { folder: "blog/posts/gallery" })
          )
        )
      : [];
    payload.gallery = [
      ...existingGalleryUrls,
      ...uploadedGallery.map((r) => r.secure_url),
    ];

    const post = await Post.create(payload);

    if (payload.authorId) {
      await Author.findByIdAndUpdate(payload.authorId, {
        $inc: { postCount: 1 },
      });
    }

    const populated = await findPopulated(post._id);
    res.status(201).json({ success: true, data: shapePost(populated) });
  } catch (err) {
    console.error("createPost error:", err);

    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Slug already in use." });
    }
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fields: Object.keys(err.errors).reduce((a, k) => {
          a[k] = err.errors[k].message;
          return a;
        }, {}),
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Update (partial-aware) ---------- */
export const updatePost = async (req, res) => {
  try {
    const payload = buildPostPayload(req.body, { partial: true });

    // Cover: file wins; otherwise keep whatever the client sent as `image`
    if (req.files?.featuredImage?.[0]) {
      const result = await uploadToCloudinary(
        req.files.featuredImage[0].buffer,
        { folder: "blog/posts" }
      );
      payload.image = result.secure_url;
    }

    // Gallery: only touch it if the client sent something for it
    const sentGalleryField = req.body.galleryImages !== undefined;
    const sentGalleryFiles =
      Array.isArray(req.files?.galleryImages) &&
      req.files.galleryImages.length > 0;

    if (sentGalleryField || sentGalleryFiles) {
      const existingUrls = parseJSONField(req.body.galleryImages, []);
      const uploaded = sentGalleryFiles
        ? await Promise.all(
            req.files.galleryImages.map((f) =>
              uploadToCloudinary(f.buffer, { folder: "blog/posts/gallery" })
            )
          )
        : [];
      payload.gallery = [
        ...existingUrls,
        ...uploaded.map((r) => r.secure_url),
      ];
    }

    const post = await Post.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const populated = await findPopulated(post._id);
    res.json({ success: true, data: shapePost(populated) });
  } catch (err) {
    console.error("updatePost error:", err);

    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Slug already in use." });
    }
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fields: Object.keys(err.errors).reduce((a, k) => {
          a[k] = err.errors[k].message;
          return a;
        }, {}),
      });
    }
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

/* ---------- Bulk update ---------- */
export const bulkUpdatePosts = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }

    // Whitelist — only these fields can be bulk-updated.
    const allowed = ["status", "featured", "editorsPick", "medicallyReviewed"];
    const clean = {};
    Object.keys(updates || {}).forEach((k) => {
      if (!allowed.includes(k)) return;
      if (k === "status") {
        clean.status = updates[k];
      } else {
        clean[k] = parseBool(updates[k], false);
      }
    });

    if (Object.keys(clean).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    const result = await Post.updateMany(
      { _id: { $in: ids } },
      { $set: clean }
    );
    res.json({
      success: true,
      message: `${result.modifiedCount} posts updated`,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Bulk delete ---------- */
export const bulkDeletePosts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }

    const posts = await Post.find({ _id: { $in: ids } })
      .select("authorId")
      .lean();
    const result = await Post.deleteMany({ _id: { $in: ids } });

    const countsByAuthor = new Map();
    posts.forEach((p) => {
      if (!p.authorId) return;
      const key = String(p.authorId);
      countsByAuthor.set(key, (countsByAuthor.get(key) || 0) + 1);
    });
    await Promise.all(
      [...countsByAuthor.entries()].map(([authorId, n]) =>
        Author.findByIdAndUpdate(authorId, { $inc: { postCount: -n } })
      )
    );

    res.json({
      success: true,
      message: `${result.deletedCount} posts deleted`,
    });
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

/* ---------- Admin archive (all statuses) ---------- */
export const getArchive = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("authorId", "name avatar role")
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: posts.map(shapePost) });
  } catch (err) {
    console.error("getArchive error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};