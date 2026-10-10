// src/api/blogApi.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://alveoly-e-learning-755w.onrender.com/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* =============== ADMIN =============== */
const adminBlogAPI = {
  // Authors
  getAuthors: () => api.get("/admin/blog/authors").then((r) => r.data),
  getAuthorsForSelect: () => api.get("/admin/blog/authors/for-select").then((r) => r.data),
  getAuthorById: (id) => api.get(`/admin/blog/authors/${id}`).then((r) => r.data),
  createAuthor: (data) => api.post("/admin/blog/authors", data).then((r) => r.data),
  updateAuthor: (id, data) => api.put(`/admin/blog/authors/${id}`, data).then((r) => r.data),
  deleteAuthor: (id) => api.delete(`/admin/blog/authors/${id}`).then((r) => r.data),

  // Categories
  getCategories: () => api.get("/admin/blog/categories").then((r) => r.data),
  getCategoryById: (id) => api.get(`/admin/blog/categories/${id}`).then((r) => r.data),
  createCategory: (data) => api.post("/admin/blog/categories", data).then((r) => r.data),
  updateCategory: (id, data) => api.put(`/admin/blog/categories/${id}`, data).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/blog/categories/${id}`).then((r) => r.data),

  // Tags
  getTags: () => api.get("/admin/blog/tags").then((r) => r.data),
  createTag: (data) => api.post("/admin/blog/tags", data).then((r) => r.data),
  updateTag: (id, data) => api.put(`/admin/blog/tags/${id}`, data).then((r) => r.data),
  deleteTag: (id) => api.delete(`/admin/blog/tags/${id}`).then((r) => r.data),
  mergeTags: (data) => api.post("/admin/blog/tags/merge", data).then((r) => r.data),

  // Posts
  getAdminPosts: (params) => api.get("/admin/blog/posts", { params }).then((r) => r.data),
  getPostById: (id) => api.get(`/admin/blog/posts/${id}`).then((r) => r.data),
  createPost: (formData) =>
    api.post("/admin/blog/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  updatePost: (id, formData) =>
    api.put(`/admin/blog/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  deletePost: (id) => api.delete(`/admin/blog/posts/${id}`).then((r) => r.data),
  bulkUpdatePosts: (ids, updates) =>
    api.post("/admin/blog/posts/bulk-update", { ids, updates }).then((r) => r.data),
  bulkDeletePosts: (ids) =>
    api.post("/admin/blog/posts/bulk-delete", { ids }).then((r) => r.data),

  // Comments
  getAdminComments: (params) =>
    api.get("/admin/blog/comments", { params }).then((r) => r.data),
  updateCommentStatus: (id, status) =>
    api.put(`/admin/blog/comments/${id}/status`, { status }).then((r) => r.data),
  deleteComment: (id) => api.delete(`/admin/blog/comments/${id}`).then((r) => r.data),
  replyToComment: (id, body) =>
    api.post(`/admin/blog/comments/${id}/reply`, { body }).then((r) => r.data),
  bulkUpdateComments: (ids, status) =>
    api.post("/admin/blog/comments/bulk-update", { ids, status }).then((r) => r.data),
  bulkDeleteComments: (ids) =>
    api.post("/admin/blog/comments/bulk-delete", { ids }).then((r) => r.data),

  // Podcasts
  getPodcasts: () => api.get("/admin/blog/podcasts").then((r) => r.data),
  createPodcast: (data) => api.post("/admin/blog/podcasts", data).then((r) => r.data),
  updatePodcast: (id, data) => api.put(`/admin/blog/podcasts/${id}`, data).then((r) => r.data),
  deletePodcast: (id) => api.delete(`/admin/blog/podcasts/${id}`).then((r) => r.data),

  // Videos
  getVideos: () => api.get("/admin/blog/videos").then((r) => r.data),
  createVideo: (data) => api.post("/admin/blog/videos", data).then((r) => r.data),
  updateVideo: (id, data) => api.put(`/admin/blog/videos/${id}`, data).then((r) => r.data),
  deleteVideo: (id) => api.delete(`/admin/blog/videos/${id}`).then((r) => r.data),

  // Subscribers
  getSubscribers: (params) => api.get("/admin/blog/subscribers", { params }).then((r) => r.data),
  createSubscriber: (data) => api.post("/admin/blog/subscribers", data).then((r) => r.data),
  updateSubscriber: (id, data) => api.put(`/admin/blog/subscribers/${id}`, data).then((r) => r.data),
  deleteSubscriber: (id) => api.delete(`/admin/blog/subscribers/${id}`).then((r) => r.data),
  bulkUpdateSubscribers: (ids, status) =>
    api.post("/admin/blog/subscribers/bulk-update", { ids, status }).then((r) => r.data),
  bulkDeleteSubscribers: (ids) =>
    api.post("/admin/blog/subscribers/bulk-delete", { ids }).then((r) => r.data),

  // Testimonials
  getAdminTestimonials: (params) =>
    api.get("/admin/blog/testimonials", { params }).then((r) => r.data),
  createTestimonial: (data) =>
    api.post("/admin/blog/testimonials", data).then((r) => r.data),
  updateTestimonial: (id, data) =>
    api.put(`/admin/blog/testimonials/${id}`, data).then((r) => r.data),
  deleteTestimonial: (id) =>
    api.delete(`/admin/blog/testimonials/${id}`).then((r) => r.data),

  // Media
  getMedia: () => api.get("/admin/blog/media").then((r) => r.data),
  uploadMedia: (formData) =>
    api.post("/admin/blog/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),

  // Policies
  getAdminPolicy: (key) =>
    api.get(`/admin/blog/policies/${key}`).then((r) => r.data),
  upsertPolicy: (key, data) =>
    api.put(`/admin/blog/policies/${key}`, data).then((r) => r.data),
};

/* =============== PUBLIC =============== */
const publicBlogAPI = {
  getPosts: (params) => api.get("/blog/posts", { params }).then((r) => r.data),
  getPostBySlug: (slug) => api.get(`/blog/posts/slug/${slug}`).then((r) => r.data),
  getPostById: (id) => api.get(`/blog/posts/${id}`).then((r) => r.data),
  getPostsByCategory: (slug, params) =>
    api.get(`/blog/posts/category/${slug}`, { params }).then((r) => r.data),
  getPostsByAuthor: (id, params) =>
    api.get(`/blog/authors/${id}`, { params }).then((r) => r.data),
  searchPosts: (q, params) =>
    api.get("/blog/search", { params: { q, ...params } }).then((r) => r.data),
  getArchive: () => api.get("/blog/archive").then((r) => r.data),
  getCategories: () => api.get("/blog/categories").then((r) => r.data),
  getCategoryBySlug: (slug) => api.get(`/blog/categories/slug/${slug}`).then((r) => r.data),
  getPodcasts: () => api.get("/blog/podcasts").then((r) => r.data),
  getVideos: () => api.get("/blog/videos").then((r) => r.data),
  getFeaturedTestimonials: () =>
    api.get("/blog/testimonials/featured").then((r) => r.data),
  getPolicy: (key) => api.get(`/blog/policies/${key}`).then((r) => r.data),
  subscribe: (data) => api.post("/blog/subscribe", data).then((r) => r.data),
  incrementViews: (id) => api.post(`/blog/posts/${id}/view`).then((r) => r.data),
  toggleLike: (id) => api.post(`/blog/posts/${id}/like`).then((r) => r.data),
  addComment: (postId, data) =>
    api.post(`/blog/posts/${postId}/comments`, data).then((r) => r.data),
};

export { adminBlogAPI, publicBlogAPI };