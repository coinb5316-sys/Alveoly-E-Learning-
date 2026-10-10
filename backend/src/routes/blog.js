// server/routes/blog.js
import express from "express";
import Post from "../models/Post.js";
import Author from "../models/Author.js";
import Category from "../models/Category.js";
import Tag from "../models/Tag.js";
import Podcast from "../models/Podcast.js";
import Video from "../models/Video.js";
import Comment from "../models/Comment.js";
import Testimonial from "../models/Testimonial.js";
import Policy from "../models/Policy.js";
import { optionalAuth, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------- Posts (list + featured) ---------- */
router.get("/posts", async (req, res) => {
  try {
    const { page = 1, limit = 6, category, search, sort = "newest", publishedOnly } = req.query;

    const filter = {};
    if (publishedOnly === "true") filter.status = "published";
    if (category && category !== "all") {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.categoryId = cat._id;
    }
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
      popular: { views: -1 },
      trending: { views: -1, likes: -1 },
    };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("authorId", "name slug avatar role credentials title specialties social")
        .populate("categoryId", "name slug")
        .sort(sortMap[sort] || { publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Post.countDocuments(filter),
    ]);

    const shaped = posts.map((p) => ({
      ...p,
      author: p.authorId,
      category: p.categoryId?.name || null,
      categorySlug: p.categoryId?.slug || null,
    }));

    const featuredPost = await Post.findOne({
      featured: true,
      status: "published",
    })
      .populate("authorId", "name slug avatar role")
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1 })
      .lean();

    // Trending tags
    const trending = await Post.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        posts: shaped,
        featuredPost: featuredPost
          ? {
              ...featuredPost,
              author: featuredPost.authorId,
              category: featuredPost.categoryId?.name || null,
            }
          : null,
        trendingTags: trending,
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
});

/* ---------- Post by slug ---------- */
router.get("/posts/slug/:slug", async (req, res) => {
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

    const comments = await Comment.find({
      postId: post._id,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        ...post,
        author: post.authorId,
        reviewer: post.reviewedBy,
        related: post.relatedPosts || [],
        comments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Post by ID ---------- */
router.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("authorId")
      .populate("reviewedBy")
      .populate("categoryId")
      .lean();
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Category by slug ---------- */
router.get("/categories/slug/:slug", async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug }).lean();
    if (!cat)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Categories list ---------- */
router.get("/categories", async (req, res) => {
  try {
    const cats = await Category.find({ active: true })
      .sort({ order: 1, name: 1 })
      .lean();
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Posts by category ---------- */
router.get("/posts/category/:slug", async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug });
    if (!cat)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    const { page = 1, limit = 6, sort = "newest" } = req.query;
    const sortMap = {
      newest: { publishedAt: -1 },
      oldest: { publishedAt: 1 },
      popular: { views: -1 },
    };

    const [posts, total] = await Promise.all([
      Post.find({ categoryId: cat._id, status: "published" })
        .populate("authorId", "name avatar role")
        .sort(sortMap[sort] || { publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Post.countDocuments({ categoryId: cat._id, status: "published" }),
    ]);

    res.json({
      success: true,
      data: {
        category: cat,
        posts: posts.map((p) => ({ ...p, author: p.authorId })),
        pagination: {
          page: Number(page),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Author by id + their posts ---------- */
router.get("/authors/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id).lean();
    if (!author)
      return res
        .status(404)
        .json({ success: false, message: "Author not found" });

    const { page = 1, limit = 12 } = req.query;
    const [posts, total] = await Promise.all([
      Post.find({ authorId: author._id, status: "published" })
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Post.countDocuments({ authorId: author._id, status: "published" }),
    ]);

    res.json({
      success: true,
      data: {
        author,
        posts,
        pagination: { page: Number(page), total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Posts by tag ---------- */
router.get("/tags/:tag", async (req, res) => {
  try {
    const tag = req.params.tag.replace(/-/g, " ");
    const { page = 1, limit = 6 } = req.query;

    const filter = {
      status: "published",
      tags: { $regex: new RegExp(`^${tag}$`, "i") },
    };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("authorId", "name avatar role")
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        tag,
        posts: posts.map((p) => ({ ...p, author: p.authorId })),
        pagination: { page: Number(page), total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Search ---------- */
router.get("/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 6 } = req.query;
    if (!q) {
      return res.json({
        success: true,
        data: { posts: [], pagination: { total: 0, totalPages: 0 } },
      });
    }

    const filter = {
      status: "published",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("authorId", "name avatar role")
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        posts: posts.map((p) => ({ ...p, author: p.authorId })),
        pagination: { total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Archive (all published, grouped client-side) ---------- */
router.get("/archive", async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" })
      .populate("authorId", "name avatar")
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: posts.map((p) => ({
        ...p,
        author: p.authorId,
        category: p.categoryId?.name,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Podcasts ---------- */
router.get("/podcasts", async (req, res) => {
  try {
    const pods = await Podcast.find({ status: "published" })
      .sort({ episodeNumber: -1 })
      .lean();
    res.json({ success: true, data: pods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Videos ---------- */
router.get("/videos", async (req, res) => {
  try {
    const vids = await Video.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .lean();
    res.json({ success: true, data: vids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Comments (public) ---------- */
router.post("/posts/:id/comments", optionalAuth, async (req, res) => {
  try {
    const { content, authorName, authorEmail } = req.body;
    const comment = await Comment.create({
      postId: req.params.id,
      authorName,
      authorEmail,
      body: content,
      status: "pending",
    });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { comments: 1 } });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Post views ---------- */
router.post("/posts/:id/view", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Likes ---------- */
router.post("/posts/:id/like", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

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
});

/* ---------- Newsletter signup ---------- */
import Subscriber from "../models/Subscriber.js";
router.post("/subscribe", async (req, res) => {
  try {
    const { email, name, source = "footer" } = req.body;
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.json({
        success: true,
        message: "You're already subscribed",
      });
    }
    await Subscriber.create({ email, name, source });
    res.status(201).json({ success: true, message: "Subscribed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Testimonials (public) ---------- */
router.get("/testimonials/featured", async (req, res) => {
  try {
    const list = await Testimonial.find({
      status: "approved",
      featured: true,
    })
      .sort({ pinned: -1, createdAt: -1 })
      .limit(6)
      .lean();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------- Policies (public) ---------- */
router.get("/policies/:key", async (req, res) => {
  try {
    const policy = await Policy.findOne({ key: req.params.key }).lean();
    res.json({ success: true, data: policy || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;