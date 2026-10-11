// backend/src/controllers/admin/mediaController.js
import Post from "../../models/Post.js";
import Podcast from "../../models/Podcast.js";
import Author from "../../models/Author.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../../config/cloudinary.js";

/* ---------- Helpers ---------- */
const fileNameFromUrl = (url = "") => {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(last) || "image";
  } catch {
    return url.split("/").pop() || "image";
  }
};

/* Extract the Cloudinary public_id from a secure_url.
   URL pattern: .../upload/v<version>/<folder>/<filename>.<ext>
   Public ID:  <folder>/<filename>  (no extension for images) */
const publicIdFromUrl = (url = "") => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) return null;
    // Skip the version segment (v1234567890) if present
    let rest = parts.slice(uploadIdx + 1);
    if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
    // Strip the extension from the last segment
    const joined = rest.join("/");
    return joined.replace(/\.[a-z0-9]+$/i, "");
  } catch {
    return null;
  }
};

/* ---------- GET /api/admin/blog/media ----------
   Build a catalog of every image URL in the journal + its usages. */
export const getMedia = async (req, res) => {
  try {
    const catalog = new Map();

    const register = (url, source) => {
      if (!url || typeof url !== "string") return;
      if (!/^https?:\/\//i.test(url)) return;
      if (!catalog.has(url)) {
        catalog.set(url, {
          id: Buffer.from(url).toString("base64").slice(0, 20),
          url,
          fileName: fileNameFromUrl(url),
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
      if (p.image) {
        register(p.image, {
          type: "post-cover",
          id: p._id,
          title: p.title,
          slug: p.slug,
        });
      }
      (p.gallery || []).forEach((g) => {
        register(g, {
          type: "post-gallery",
          id: p._id,
          title: p.title,
          slug: p.slug,
        });
      });
    });

    podcasts.forEach((pod) => {
      if (pod.image) {
        register(pod.image, {
          type: "podcast-cover",
          id: pod._id,
          title: pod.title,
        });
      }
    });

    authors.forEach((a) => {
      if (a.avatar) {
        register(a.avatar, {
          type: "author-avatar",
          id: a._id,
          title: a.name,
        });
      }
    });

    res.json({ success: true, data: [...catalog.values()] });
  } catch (err) {
    console.error("getMedia error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/media ----------
   Upload one or more images. Returns the same shape as `getMedia` so
   the client can merge them into the library immediately. */
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
      id: u.public_id,              // stable identifier from Cloudinary
      url: u.secure_url,            // canonical URL — matches `getMedia` catalog key
      fileName: u.original_filename
        ? `${u.original_filename}.${u.format}`
        : fileNameFromUrl(u.secure_url),
      size: u.bytes,
      width: u.width,
      height: u.height,
      uploadedAt: u.created_at || new Date().toISOString(),
      usages: [],
    }));

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("uploadMedia error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE /api/admin/blog/media ----------
   Bulk delete by URL list. Refuses to delete any URL that is still
   referenced by a post, podcast, or author. Body: { urls: [string] } */
export const deleteMedia = async (req, res) => {
  try {
    const urls = Array.isArray(req.body?.urls) ? req.body.urls : [];
    if (!urls.length) {
      return res
        .status(400)
        .json({ success: false, message: "No URLs provided" });
    }

    // Build the current usage catalog so we can refuse in-use assets
    const [posts, podcasts, authors] = await Promise.all([
      Post.find().select("image gallery").lean(),
      Podcast.find().select("image").lean(),
      Author.find().select("avatar").lean(),
    ]);

    const inUse = new Set();
    posts.forEach((p) => {
      if (p.image) inUse.add(p.image);
      (p.gallery || []).forEach((g) => inUse.add(g));
    });
    podcasts.forEach((p) => p.image && inUse.add(p.image));
    authors.forEach((a) => a.avatar && inUse.add(a.avatar));

    const blocked = [];
    const deletable = [];
    urls.forEach((u) => {
      if (inUse.has(u)) blocked.push(u);
      else deletable.push(u);
    });

    if (blocked.length) {
      return res.status(409).json({
        success: false,
        message: `${blocked.length} of these assets are still in use.`,
        blocked,
      });
    }

    // Delete each from Cloudinary (best-effort — log failures but don't
    // fail the whole request)
    const results = await Promise.allSettled(
      deletable.map(async (url) => {
        const publicId = publicIdFromUrl(url);
        if (!publicId) throw new Error(`Cannot parse public_id from ${url}`);
        return deleteFromCloudinary(publicId);
      })
    );

    const failures = results
      .map((r, i) => ({ r, url: deletable[i] }))
      .filter(({ r }) => r.status === "rejected");

    return res.json({
      success: true,
      message: `Deleted ${deletable.length - failures.length} of ${deletable.length} assets.`,
      deleted: deletable.filter((_, i) => results[i].status === "fulfilled"),
      failed: failures.map(({ url, r }) => ({
        url,
        reason: r.reason?.message || String(r.reason),
      })),
    });
  } catch (err) {
    console.error("deleteMedia error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};