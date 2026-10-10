// server/controllers/admin/mediaController.js
import Post from "../../models/Post.js";
import Podcast from "../../models/Podcast.js";
import Author from "../../models/Author.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

/* Build a catalog of every image URL in the journal + its usages */
export const getMedia = async (req, res) => {
  try {
    const catalog = new Map();

    const register = (url, source) => {
      if (!url || typeof url !== "string") return;
      if (!/^https?:\/\//i.test(url)) return;
      if (!catalog.has(url)) {
        catalog.set(url, {
          id: Buffer.from(url).toString("base64").slice(0, 16),
          url,
          fileName: url.split("/").pop() || "image",
          uploadedAt: new Date().toISOString(),
          usages: [],
        });
      }
      catalog.get(url).usages.push(source);
    };

    const [posts, podcasts, authors] = await Promise.all([
      Post.find().select("title slug image gallery").lean(),
      Podcast.find().select("title image").lean(),
      Author.find().select("name avatar").lean(),
    ]);

    posts.forEach((p) => {
      if (p.image)
        register(p.image, { type: "post-cover", id: p._id, title: p.title, slug: p.slug });
      (p.gallery || []).forEach((g) =>
        register(g, { type: "post-gallery", id: p._id, title: p.title, slug: p.slug })
      );
    });

    podcasts.forEach((pod) => {
      if (pod.image)
        register(pod.image, { type: "podcast-cover", id: pod._id, title: pod.title });
    });

    authors.forEach((a) => {
      if (a.avatar)
        register(a.avatar, { type: "author-avatar", id: a._id, title: a.name });
    });

    res.json({ success: true, data: [...catalog.values()] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* Upload one or more images */
export const uploadMedia = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const uploaded = await Promise.all(
      files.map((f) =>
        uploadToCloudinary(f.buffer, { folder: "blog/media" })
      )
    );

    const data = uploaded.map((u) => ({
      id: u.public_id,
      url: u.secure_url,
      fileName: u.original_filename || "image",
      size: u.bytes,
      width: u.width,
      height: u.height,
      uploadedAt: u.created_at,
      usages: [],
    }));

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};