// src/api/blogApi.js
import axios from "axios";
import { API } from "./axios";

// Base API service for blog operations
const blogAPI = {
  // ==================== POST OPERATIONS ====================
  
  // Get all blog posts with pagination and filters
  getPosts: async (params = {}) => {
    try {
      const response = await API.get("/blogs/posts", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }
  },

  // Get a single blog post by ID
  getPostById: async (id) => {
    try {
      const response = await API.get(`/blogs/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post:", error);
      throw error;
    }
  },

  // Get a single blog post by slug
  getPostBySlug: async (slug) => {
    try {
      const response = await API.get(`/blogs/posts/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      throw error;
    }
  },

  // Create a new blog post (Admin only)
  createPost: async (formData) => {
    try {
      const response = await API.post("/blogs/posts", formData, {
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
      const response = await API.put(`/blogs/posts/${id}`, formData, {
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
      const response = await API.delete(`/blogs/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  },

  // Bulk delete posts (Admin only)
  bulkDeletePosts: async (postIds) => {
    try {
      const response = await API.delete("/blogs/posts/bulk", {
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
      const response = await API.patch(`/blogs/posts/${id}/featured`);
      return response.data;
    } catch (error) {
      console.error("Error toggling featured:", error);
      throw error;
    }
  },

  // Publish a blog post (Admin only)
  publishPost: async (id) => {
    try {
      const response = await API.patch(`/blogs/posts/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error("Error publishing post:", error);
      throw error;
    }
  },

  // Archive a blog post (Admin only)
  archivePost: async (id) => {
    try {
      const response = await API.patch(`/blogs/posts/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error("Error archiving post:", error);
      throw error;
    }
  },

  // Get post stats (Admin only)
  getPostStats: async () => {
    try {
      const response = await API.get("/blogs/posts/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching post stats:", error);
      throw error;
    }
  },

  // ==================== CATEGORY OPERATIONS ====================

  // Get all categories
  getCategories: async () => {
    try {
      const response = await API.get("/blogs/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    try {
      const response = await API.get(`/blogs/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  // Create a new category (Admin only)
  createCategory: async (data) => {
    try {
      const response = await API.post("/blogs/categories", data);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  // Update a category (Admin only)
  updateCategory: async (id, data) => {
    try {
      const response = await API.put(`/blogs/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  // Delete a category (Admin only)
  deleteCategory: async (id) => {
    try {
      const response = await API.delete(`/blogs/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // ==================== COMMENT OPERATIONS ====================

  // Get comments for a post
  getComments: async (postId, params = {}) => {
    try {
      const response = await API.get(`/blogs/comments/${postId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Add a comment
  addComment: async (postId, data) => {
    try {
      const response = await API.post(`/blogs/comments/${postId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // Approve a comment (Admin only)
  approveComment: async (id) => {
    try {
      const response = await API.put(`/blogs/comments/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error("Error approving comment:", error);
      throw error;
    }
  },

  // Reject a comment (Admin only)
  rejectComment: async (id) => {
    try {
      const response = await API.put(`/blogs/comments/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error("Error rejecting comment:", error);
      throw error;
    }
  },

  // Delete a comment (Admin only)
  deleteComment: async (id) => {
    try {
      const response = await API.delete(`/blogs/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Get comment stats (Admin only)
  getCommentStats: async () => {
    try {
      const response = await API.get("/blogs/comments/stats");
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
};

export default blogAPI;