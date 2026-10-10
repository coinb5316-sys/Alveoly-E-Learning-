// src/api/blogApi.js - COMPLETE FIXED
import API from "./axios";

const blogAPI = {
  // ==================== POST OPERATIONS ====================

  getPosts: async (params = {}) => {
    const response = await API.get("/blog/posts", { params });
    return response.data;
  },

  getPostById: async (id) => {
    const response = await API.get(`/blog/posts/${id}`);
    return response.data;
  },

  getPostBySlug: async (slug) => {
    const response = await API.get(`/blog/posts/slug/${slug}`);
    return response.data;
  },

  // ✅ FIXED: Removed manual Content-Type (Axios sets boundary automatically)
  // Admin endpoints are under /admin/blog (singular)
  createPost: async (formData) => {
    const response = await API.post("/admin/blog/posts", formData, {
      headers: { "Content-Type": undefined }, // let Axios set multipart boundary
      timeout: 120000, // 2 minutes for uploads
    });
    return response.data;
  },

  updatePost: async (id, formData) => {
    const response = await API.put(`/admin/blog/posts/${id}`, formData, {
      headers: { "Content-Type": undefined },
      timeout: 120000,
    });
    return response.data;
  },

  deletePost: async (id) => {
    const response = await API.delete(`/admin/blog/posts/${id}`);
    return response.data;
  },

  bulkDeletePosts: async (postIds) => {
    const response = await API.delete("/admin/blog/posts/bulk", {
      data: { postIds },
    });
    return response.data;
  },

  toggleFeatured: async (id) => {
    const response = await API.patch(`/admin/blog/posts/${id}/featured`);
    return response.data;
  },

  publishPost: async (id) => {
    const response = await API.patch(`/admin/blog/posts/${id}/publish`);
    return response.data;
  },

  archivePost: async (id) => {
    const response = await API.patch(`/admin/blog/posts/${id}/archive`);
    return response.data;
  },

  getPostStats: async () => {
    const response = await API.get("/admin/blog/posts/stats");
    return response.data;
  },

  // ==================== CATEGORY OPERATIONS ====================

  getCategories: async () => {
    const response = await API.get("/blog/categories");
    return response.data;
  },

  getCategoryBySlug: async (slug) => {
    const response = await API.get(`/blog/categories/${slug}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await API.post("/admin/blog/categories", data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await API.put(`/admin/blog/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await API.delete(`/admin/blog/categories/${id}`);
    return response.data;
  },

  // ==================== COMMENT OPERATIONS ====================

  getComments: async (postId, params = {}) => {
    const response = await API.get(`/blog/comments/${postId}`, { params });
    return response.data;
  },

  addComment: async (postId, data) => {
    const response = await API.post(`/blog/comments/${postId}`, data);
    return response.data;
  },

  approveComment: async (id) => {
    const response = await API.put(`/admin/blog/comments/${id}/approve`);
    return response.data;
  },

  rejectComment: async (id) => {
    const response = await API.put(`/admin/blog/comments/${id}/reject`);
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await API.delete(`/admin/blog/comments/${id}`);
    return response.data;
  },

  getCommentStats: async () => {
    const response = await API.get("/admin/blog/comments/stats");
    return response.data;
  },

  // ==================== AUTHOR OPERATIONS ====================

  getAuthors: async (params = {}) => {
    const response = await API.get("/admin/blog/authors", { params });
    return response.data;
  },

  getAuthorsForSelect: async () => {
    const response = await API.get("/admin/blog/authors/select");
    return response.data;
  },

  getAuthorById: async (id) => {
    const response = await API.get(`/admin/blog/authors/${id}`);
    return response.data;
  },

  getAuthorBySlug: async (slug) => {
    const response = await API.get(`/admin/blog/authors/slug/${slug}`);
    return response.data;
  },

  createAuthor: async (data) => {
    const response = await API.post("/admin/blog/authors", data);
    return response.data;
  },

  updateAuthor: async (id, data) => {
    const response = await API.put(`/admin/blog/authors/${id}`, data);
    return response.data;
  },

  deleteAuthor: async (id) => {
    const response = await API.delete(`/admin/blog/authors/${id}`);
    return response.data;
  },

  getAuthorStats: async () => {
    const response = await API.get("/admin/blog/authors/stats");
    return response.data;
  },

  // ==================== TAG OPERATIONS ====================

  getTags: async (params = {}) => {
    const response = await API.get("/admin/blog/tags", { params });
    return response.data;
  },

  getTagById: async (id) => {
    const response = await API.get(`/admin/blog/tags/${id}`);
    return response.data;
  },

  getTagBySlug: async (slug) => {
    const response = await API.get(`/admin/blog/tags/slug/${slug}`);
    return response.data;
  },

  createTag: async (data) => {
    const response = await API.post("/admin/blog/tags", data);
    return response.data;
  },

  updateTag: async (id, data) => {
    const response = await API.put(`/admin/blog/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id) => {
    const response = await API.delete(`/admin/blog/tags/${id}`);
    return response.data;
  },

  getTagStats: async () => {
    const response = await API.get("/admin/blog/tags/stats");
    return response.data;
  },

  // ==================== SEARCH OPERATIONS ====================

  searchPosts: async (query, params = {}) => {
    const response = await API.get("/blog/posts/search", {
      params: { q: query, ...params },
    });
    return response.data;
  },

  getPostsByCategory: async (category, params = {}) => {
    const response = await API.get(`/blog/posts/category/${category}`, { params });
    return response.data;
  },

  getPostsByAuthor: async (authorId, params = {}) => {
    const response = await API.get(`/blog/posts/author/${authorId}`, { params });
    return response.data;
  },

  getRelatedPosts: async (id) => {
    const response = await API.get(`/blog/posts/${id}/related`);
    return response.data;
  },

  incrementViews: async (id) => {
    const response = await API.post(`/blog/posts/${id}/view`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await API.post(`/blog/posts/${id}/like`);
    return response.data;
  },
};

export default blogAPI;