// backend/src/routes/admin/blog.js
import express from "express";
import { adminAuth } from "../../middleware/adminAuth.js";
import {
  adminUpload as upload,
  adminUploadGallery as uploadGallery,
} from "../../middleware/adminUpload.js";

import * as authorCtrl from "../../controllers/admin/authorController.js";
import * as categoryCtrl from "../../controllers/admin/categoryController.js";
import * as tagCtrl from "../../controllers/admin/tagController.js";
import * as postCtrl from "../../controllers/admin/postController.js";
import * as commentCtrl from "../../controllers/admin/commentController.js";
import * as podcastCtrl from "../../controllers/admin/podcastController.js";
import * as videoCtrl from "../../controllers/admin/videoController.js";
import * as subscriberCtrl from "../../controllers/admin/subscriberController.js";
import * as testimonialCtrl from "../../controllers/admin/testimonialController.js";
import * as mediaCtrl from "../../controllers/admin/mediaController.js";
import * as policyCtrl from "../../controllers/admin/policyController.js";

const router = express.Router();

/* ---------- Authors ---------- */
router.get("/authors", adminAuth, authorCtrl.getAuthors);
router.get("/authors/for-select", adminAuth, authorCtrl.getAuthorsForSelect);
router.get("/authors/:id", adminAuth, authorCtrl.getAuthorById);
router.post(
  "/authors",
  adminAuth,
  upload.single("avatar"),
  authorCtrl.createAuthor
);
router.put(
  "/authors/:id",
  adminAuth,
  upload.single("avatar"),
  authorCtrl.updateAuthor
);
router.delete("/authors/:id", adminAuth, authorCtrl.deleteAuthor);

/* ---------- Categories ---------- */
router.get("/categories", adminAuth, categoryCtrl.getCategories);
router.get("/categories/:id", adminAuth, categoryCtrl.getCategoryById);
router.post(
  "/categories",
  adminAuth,
  upload.single("image"),
  categoryCtrl.createCategory
);
router.put(
  "/categories/:id",
  adminAuth,
  upload.single("image"),
  categoryCtrl.updateCategory
);
router.delete("/categories/:id", adminAuth, categoryCtrl.deleteCategory);

/* ---------- Tags ---------- */
router.get("/tags", adminAuth, tagCtrl.getTags);
router.post("/tags", adminAuth, tagCtrl.createTag);
router.put("/tags/:id", adminAuth, tagCtrl.updateTag);
router.delete("/tags/:id", adminAuth, tagCtrl.deleteTag);
router.post("/tags/merge", adminAuth, tagCtrl.mergeTag);

/* ---------- Posts ---------- */
router.get("/posts", adminAuth, postCtrl.getPosts);
router.get("/posts/featured", postCtrl.getFeaturedPost); // public
router.get("/posts/:id", adminAuth, postCtrl.getPostById);

router.post(
  "/posts",
  adminAuth,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  postCtrl.createPost
);

router.put(
  "/posts/:id",
  adminAuth,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  postCtrl.updatePost
);

router.delete("/posts/:id", adminAuth, postCtrl.deletePost);
router.post("/posts/bulk-update", adminAuth, postCtrl.bulkUpdatePosts);
router.post("/posts/bulk-delete", adminAuth, postCtrl.bulkDeletePosts);

/* ---------- Comments ---------- */
router.get("/comments", adminAuth, commentCtrl.getComments);
router.put("/comments/:id/status", adminAuth, commentCtrl.updateCommentStatus);
router.delete("/comments/:id", adminAuth, commentCtrl.deleteComment);
router.post("/comments/:id/reply", adminAuth, commentCtrl.replyToComment);
router.post("/comments/bulk-update", adminAuth, commentCtrl.bulkUpdateComments);
router.post("/comments/bulk-delete", adminAuth, commentCtrl.bulkDeleteComments);

/* ---------- Podcasts ---------- */
router.get("/podcasts", adminAuth, podcastCtrl.getPodcasts);
router.get("/podcasts/:id", adminAuth, podcastCtrl.getPodcastById);
router.post(
  "/podcasts",
  adminAuth,
  upload.single("image"),
  podcastCtrl.createPodcast
);
router.put(
  "/podcasts/:id",
  adminAuth,
  upload.single("image"),
  podcastCtrl.updatePodcast
);
router.delete("/podcasts/:id", adminAuth, podcastCtrl.deletePodcast);

/* ---------- Videos ---------- */
router.get("/videos", adminAuth, videoCtrl.getVideos);
router.get("/videos/:id", adminAuth, videoCtrl.getVideoById);
router.post("/videos", adminAuth, videoCtrl.createVideo);
router.put("/videos/:id", adminAuth, videoCtrl.updateVideo);
router.delete("/videos/:id", adminAuth, videoCtrl.deleteVideo);

/* ---------- Subscribers ---------- */
router.get("/subscribers", adminAuth, subscriberCtrl.getSubscribers);
router.post("/subscribers", adminAuth, subscriberCtrl.createSubscriber);
router.put("/subscribers/:id", adminAuth, subscriberCtrl.updateSubscriber);
router.delete("/subscribers/:id", adminAuth, subscriberCtrl.deleteSubscriber);
router.post(
  "/subscribers/bulk-update",
  adminAuth,
  subscriberCtrl.bulkUpdateSubscribers
);
router.post(
  "/subscribers/bulk-delete",
  adminAuth,
  subscriberCtrl.bulkDeleteSubscribers
);

/* ---------- Testimonials ---------- */
router.get("/testimonials", adminAuth, testimonialCtrl.getTestimonials);
router.post("/testimonials", adminAuth, testimonialCtrl.createTestimonial);
router.put("/testimonials/:id", adminAuth, testimonialCtrl.updateTestimonial);
router.delete("/testimonials/:id", adminAuth, testimonialCtrl.deleteTestimonial);

/* ---------- Media ---------- */
router.get("/media", adminAuth, mediaCtrl.getMedia);
router.post(
  "/media",
  adminAuth,
  upload.array("files", 20),
  mediaCtrl.uploadMedia
);

/* ---------- Policies ---------- */
router.get("/policies/:key", adminAuth, policyCtrl.getPolicy);
router.put("/policies/:key", adminAuth, policyCtrl.upsertPolicy);

export default router;