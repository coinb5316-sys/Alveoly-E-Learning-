// src/api/blogApi.js - COMPLETE FIXED
import API from "./axios";

// Base API service for blog operations
const blogAPI = {
  // ==================== POST OPERATIONS ====================
  
  // Get all blog posts with pagination and filters - PUBLIC
  getPosts: async (params = {}) => {
    try {
      const response = await API.get("/blog/posts", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }
  },

  // Get a single blog post by ID - PUBLIC
  getPostById: async (id) => {
    try {
      const response = await API.get(`/blog/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post:", error);
      throw error;
    }
  },

  // Get a single blog post by slug - PUBLIC
  getPostBySlug: async (slug) => {
    try {
      const response = await API.get(`/blog/posts/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      throw error;
    }
  },

  // Create a new blog post - ADMIN ONLY
  createPost: async (formData) => {
    try {
      const response = await API.post("/admin/blog/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating blog post:", error);
      throw error;
    }
  },

  // Update a blog post - ADMIN ONLY
  updatePost: async (id, formData) => {
    try {
      const response = await API.put(`/admin/blog/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating blog post:", error);
      throw error;
    }
  },

  // Delete a blog post - ADMIN ONLY
  deletePost: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  },

  // Bulk delete posts - ADMIN ONLY
  bulkDeletePosts: async (postIds) => {
    try {
      const response = await API.delete("/admin/blog/posts/bulk", {
        data: { postIds },
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk deleting posts:", error);
      throw error;
    }
  },

  // Toggle featured status - ADMIN ONLY
  toggleFeatured: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/featured`);
      return response.data;
    } catch (error) {
      console.error("Error toggling featured:", error);
      throw error;
    }
  },

  // Publish a blog post - ADMIN ONLY
  publishPost: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error("Error publishing post:", error);
      throw error;
    }
  },

  // Archive a blog post - ADMIN ONLY
  archivePost: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error("Error archiving post:", error);
      throw error;
    }
  },

  // Get post stats - ADMIN ONLY
  getPostStats: async () => {
    try {
      const response = await API.get("/admin/blog/posts/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching post stats:", error);
      throw error;
    }
  },

  // ==================== CATEGORY OPERATIONS ====================

  // Get all categories - PUBLIC
  getCategories: async () => {
    try {
      const response = await API.get("/blog/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get category by slug - PUBLIC
  getCategoryBySlug: async (slug) => {
    try {
      const response = await API.get(`/blog/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  // Create a new category - ADMIN ONLY
  createCategory: async (data) => {
    try {
      const response = await API.post("/admin/blog/categories", data);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  // Update a category - ADMIN ONLY
  updateCategory: async (id, data) => {
    try {
      const response = await API.put(`/admin/blog/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  // Delete a category - ADMIN ONLY
  deleteCategory: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // ==================== COMMENT OPERATIONS ====================

  // Get comments for a post - PUBLIC
  getComments: async (postId, params = {}) => {
    try {
      const response = await API.get(`/blog/comments/${postId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Add a comment - PUBLIC (but requires user auth for better experience)
  addComment: async (postId, data) => {
    try {
      const response = await API.post(`/blog/comments/${postId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // Approve a comment - ADMIN ONLY
  approveComment: async (id) => {
    try {
      const response = await API.put(`/admin/blog/comments/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error("Error approving comment:", error);
      throw error;
    }
  },

  // Reject a comment - ADMIN ONLY
  rejectComment: async (id) => {
    try {
      const response = await API.put(`/admin/blog/comments/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error("Error rejecting comment:", error);
      throw error;
    }
  },

  // Delete a comment - ADMIN ONLY
  deleteComment: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Get comment stats - ADMIN ONLY
  getCommentStats: async () => {
    try {
      const response = await API.get("/admin/blog/comments/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching comment stats:", error);
      throw error;
    }
  },

  // ==================== AUTHOR OPERATIONS - ADMIN ONLY ====================

  getAuthors: async (params = {}) => {
    try {
      const response = await API.get("/admin/blog/authors", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching authors:", error);
      throw error;
    }
  },

  getAuthorById: async (id) => {
    try {
      const response = await API.get(`/admin/blog/authors/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching author:", error);
      throw error;
    }
  },

  updateAuthor: async (id, data) => {
    try {
      const response = await API.put(`/admin/blog/authors/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating author:", error);
      throw error;
    }
  },

  deleteAuthor: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/authors/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting author:", error);
      throw error;
    }
  },

  // ==================== TAG OPERATIONS - ADMIN ONLY ====================

  getTags: async (params = {}) => {
    try {
      const response = await API.get("/admin/blog/tags", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },

  getTagBySlug: async (slug) => {
    try {
      const response = await API.get(`/admin/blog/tags/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tag:", error);
      throw error;
    }
  },

  createTag: async (data) => {
    try {
      const response = await API.post("/admin/blog/tags", data);
      return response.data;
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  },

  updateTag: async (id, data) => {
    try {
      const response = await API.put(`/admin/blog/tags/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating tag:", error);
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/tags/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  },

  // ==================== SEARCH OPERATIONS ====================

  // Search posts - PUBLIC
  searchPosts: async (query, params = {}) => {
    try {
      const response = await API.get("/blog/posts/search", {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching posts:", error);
      throw error;
    }
  },

  // Get posts by category - PUBLIC
  getPostsByCategory: async (category, params = {}) => {
    try {
      const response = await API.get(`/blog/posts/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching posts by category:", error);
      throw error;
    }
  },

  // Get posts by author - PUBLIC
  getPostsByAuthor: async (authorId, params = {}) => {
    try {
      const response = await API.get(`/blog/posts/author/${authorId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching posts by author:", error);
      throw error;
    }
  },

  // Get related posts - PUBLIC
  getRelatedPosts: async (id) => {
    try {
      const response = await API.get(`/blog/posts/${id}/related`);
      return response.data;
    } catch (error) {
      console.error("Error fetching related posts:", error);
      throw error;
    }
  },

  // Increment views - PUBLIC
  incrementViews: async (id) => {
    try {
      const response = await API.post(`/blog/posts/${id}/view`);
      return response.data;
    } catch (error) {
      console.error("Error incrementing views:", error);
      throw error;
    }
  },

  // Toggle like - PUBLIC
  toggleLike: async (id) => {
    try {
      const response = await API.post(`/blog/posts/${id}/like`);
      return response.data;
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  },
};

export default blogAPI;