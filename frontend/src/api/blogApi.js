// src/api/blogApi.js - COMPLETE FIXED
import API from "./axios";

// Base API service for blog operations
const blogAPI = {
  // ==================== POST OPERATIONS ====================
  
  // Get all blog posts with pagination and filters
  getPosts: async (params = {}) => {
    try {
      // FIXED: Use /blog/posts (public)
      const response = await API.get("/blog/posts", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }
  },

  // Get a single blog post by ID
  getPostById: async (id) => {
    try {
      // FIXED: Use /blog/posts (public)
      const response = await API.get(`/blog/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post:", error);
      throw error;
    }
  },

  // Get a single blog post by slug
  getPostBySlug: async (slug) => {
    try {
      // FIXED: Use /blog/posts/slug (public)
      const response = await API.get(`/blog/posts/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      throw error;
    }
  },

  // Create a new blog post (Admin only)
  createPost: async (formData) => {
    try {
      // FIXED: Use /admin/blog/posts (admin only)
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

  // Update a blog post (Admin only)
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

  // Delete a blog post (Admin only)
  deletePost: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  },

  // Bulk delete posts (Admin only)
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

  // Toggle featured status (Admin only)
  toggleFeatured: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/featured`);
      return response.data;
    } catch (error) {
      console.error("Error toggling featured:", error);
      throw error;
    }
  },

  // Publish a blog post (Admin only)
  publishPost: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error("Error publishing post:", error);
      throw error;
    }
  },

  // Archive a blog post (Admin only)
  archivePost: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error("Error archiving post:", error);
      throw error;
    }
  },

  // Get post stats (Admin only)
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

  // Get all categories - FIXED: Use /blog/categories (public)
  getCategories: async () => {
    try {
      const response = await API.get("/blog/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    try {
      const response = await API.get(`/blog/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  // Create a new category (Admin only)
  createCategory: async (data) => {
    try {
      const response = await API.post("/admin/blog/categories", data);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  // Update a category (Admin only)
  updateCategory: async (id, data) => {
    try {
      const response = await API.put(`/admin/blog/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  // Delete a category (Admin only)
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

  // Get comments for a post - FIXED: Use /blog/comments (public)
  getComments: async (postId, params = {}) => {
    try {
      const response = await API.get(`/blog/comments/${postId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Add a comment - FIXED: Use /blog/comments (public)
  addComment: async (postId, data) => {
    try {
      const response = await API.post(`/blog/comments/${postId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // Approve a comment (Admin only)
  approveComment: async (id) => {
    try {
      const response = await API.put(`/admin/blog/comments/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error("Error approving comment:", error);
      throw error;
    }
  },

  // Reject a comment (Admin only)
  rejectComment: async (id) => {
    try {
      const response = await API.put(`/admin/blog/comments/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error("Error rejecting comment:", error);
      throw error;
    }
  },

  // Delete a comment (Admin only)
  deleteComment: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Get comment stats (Admin only)
  getCommentStats: async () => {
    try {
      const response = await API.get("/admin/blog/comments/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching comment stats:", error);
      throw error;
    }
  },

  // ==================== AUTHOR OPERATIONS (Admin only) ====================

  // Get all authors
  getAuthors: async (params = {}) => {
    try {
      const response = await API.get("/admin/blog/authors", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching authors:", error);
      throw error;
    }
  },

  // Get author by ID
  getAuthorById: async (id) => {
    try {
      const response = await API.get(`/admin/blog/authors/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching author:", error);
      throw error;
    }
  },

  // Update an author (Admin only)
  updateAuthor: async (id, data) => {
    try {
      const response = await API.put(`/admin/blog/authors/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating author:", error);
      throw error;
    }
  },

  // Delete an author (Admin only)
  deleteAuthor: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/authors/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting author:", error);
      throw error;
    }
  },

  // ==================== TAG OPERATIONS (Admin only) ====================

  // Get all tags
  getTags: async (params = {}) => {
    try {
      const response = await API.get("/admin/blog/tags", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },

  // Get tag by slug
  getTagBySlug: async (slug) => {
    try {
      const response = await API.get(`/admin/blog/tags/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tag:", error);
      throw error;
    }
  },

  // Create a new tag (Admin only)
  createTag: async (data) => {
    try {
      const response = await API.post("/admin/blog/tags", data);
      return response.data;
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  },

  // Update a tag (Admin only)
  updateTag: async (id, data) => {
    try {
      const response = await API.put(`/admin/blog/tags/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating tag:", error);
      throw error;
    }
  },

  // Delete a tag (Admin only)
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

  // Search posts - FIXED: Use /blog/posts/search (public)
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

  // Get posts by category - FIXED: Use /blog/posts/category (public)
  getPostsByCategory: async (category, params = {}) => {
    try {
      const response = await API.get(`/blog/posts/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching posts by category:", error);
      throw error;
    }
  },

  // Get posts by author - FIXED: Use /blog/posts/author (public)
  getPostsByAuthor: async (authorId, params = {}) => {
    try {
      const response = await API.get(`/blog/posts/author/${authorId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching posts by author:", error);
      throw error;
    }
  },

  // Get related posts - FIXED: Use /blog/posts (public)
  getRelatedPosts: async (id) => {
    try {
      const response = await API.get(`/blog/posts/${id}/related`);
      return response.data;
    } catch (error) {
      console.error("Error fetching related posts:", error);
      throw error;
    }
  },

  // Increment views - FIXED: Use /blog/posts (public)
  incrementViews: async (id) => {
    try {
      const response = await API.post(`/blog/posts/${id}/view`);
      return response.data;
    } catch (error) {
      console.error("Error incrementing views:", error);
      throw error;
    }
  },

  // Toggle like - FIXED: Use /blog/posts (public)
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