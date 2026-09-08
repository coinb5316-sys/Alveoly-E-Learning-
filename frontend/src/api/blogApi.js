// src/api/blogApi.js - COMPLETE WITH AUTHOR AND TAG METHODS
import API from "./axios";

// Base API service for blog operations
const blogAPI = {
  // ==================== POST OPERATIONS ====================
  
  getPosts: async (params = {}) => {
    try {
      const response = await API.get("/blog/posts", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }
  },

  getPostById: async (id) => {
    try {
      const response = await API.get(`/blog/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post:", error);
      throw error;
    }
  },

  getPostBySlug: async (slug) => {
    try {
      const response = await API.get(`/blog/posts/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      throw error;
    }
  },

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

  deletePost: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  },

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

  toggleFeatured: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/featured`);
      return response.data;
    } catch (error) {
      console.error("Error toggling featured:", error);
      throw error;
    }
  },

  publishPost: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error("Error publishing post:", error);
      throw error;
    }
  },

  archivePost: async (id) => {
    try {
      const response = await API.patch(`/admin/blog/posts/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error("Error archiving post:", error);
      throw error;
    }
  },

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

  getCategories: async () => {
    try {
      const response = await API.get("/blog/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  getCategoryBySlug: async (slug) => {
    try {
      const response = await API.get(`/blog/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  createCategory: async (data) => {
    try {
      const response = await API.post("/admin/blog/categories", data);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const response = await API.put(`/admin/blog/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

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

  getComments: async (postId, params = {}) => {
    try {
      const response = await API.get(`/blog/comments/${postId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  addComment: async (postId, data) => {
    try {
      const response = await API.post(`/blog/comments/${postId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  approveComment: async (id) => {
    try {
      const response = await API.put(`/admin/blog/comments/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error("Error approving comment:", error);
      throw error;
    }
  },

  rejectComment: async (id) => {
    try {
      const response = await API.put(`/admin/blog/comments/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error("Error rejecting comment:", error);
      throw error;
    }
  },

  deleteComment: async (id) => {
    try {
      const response = await API.delete(`/admin/blog/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  getCommentStats: async () => {
    try {
      const response = await API.get("/admin/blog/comments/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching comment stats:", error);
      throw error;
    }
  },

  // ==================== AUTHOR OPERATIONS ====================

  getAuthors: async (params = {}) => {
    try {
      const response = await API.get("/admin/blog/authors", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching authors:", error);
      throw error;
    }
  },

  getAuthorsForSelect: async () => {
    try {
      const response = await API.get("/admin/blog/authors/select");
      return response.data;
    } catch (error) {
      console.error("Error fetching authors for select:", error);
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

  getAuthorBySlug: async (slug) => {
    try {
      const response = await API.get(`/admin/blog/authors/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching author by slug:", error);
      throw error;
    }
  },

  createAuthor: async (data) => {
    try {
      const response = await API.post("/admin/blog/authors", data);
      return response.data;
    } catch (error) {
      console.error("Error creating author:", error);
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

  getAuthorStats: async () => {
    try {
      const response = await API.get("/admin/blog/authors/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching author stats:", error);
      throw error;
    }
  },

  // ==================== TAG OPERATIONS ====================

  getTags: async (params = {}) => {
    try {
      const response = await API.get("/admin/blog/tags", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },

  getTagById: async (id) => {
    try {
      const response = await API.get(`/admin/blog/tags/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tag:", error);
      throw error;
    }
  },

  getTagBySlug: async (slug) => {
    try {
      const response = await API.get(`/admin/blog/tags/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tag by slug:", error);
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

  getTagStats: async () => {
    try {
      const response = await API.get("/admin/blog/tags/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching tag stats:", error);
      throw error;
    }
  },

  // ==================== SEARCH OPERATIONS ====================

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

  getPostsByCategory: async (category, params = {}) => {
    try {
      const response = await API.get(`/blog/posts/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching posts by category:", error);
      throw error;
    }
  },

  getPostsByAuthor: async (authorId, params = {}) => {
    try {
      const response = await API.get(`/blog/posts/author/${authorId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching posts by author:", error);
      throw error;
    }
  },

  getRelatedPosts: async (id) => {
    try {
      const response = await API.get(`/blog/posts/${id}/related`);
      return response.data;
    } catch (error) {
      console.error("Error fetching related posts:", error);
      throw error;
    }
  },

  incrementViews: async (id) => {
    try {
      const response = await API.post(`/blog/posts/${id}/view`);
      return response.data;
    } catch (error) {
      console.error("Error incrementing views:", error);
      throw error;
    }
  },

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