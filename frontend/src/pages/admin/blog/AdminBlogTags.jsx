// src/pages/admin/blog/AdminBlogTags.jsx - FIXED DATA HANDLING
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Hash,
  Calendar,
  Search,
  X,
  Save,
  AlertCircle,
  RefreshCw,
  Loader2,
  Check,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import blogAPI from '../../../api/blogApi';

const colorOptions = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#6366f1',
  '#84cc16', '#d946ef', '#f43f5e', '#0ea5e9', '#22d3ee',
  '#a855f7', '#ec4899', '#14b8a6', '#f43f5e', '#22c55e'
];

const AdminBlogTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', color: '#3b82f6' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getTags();
      
      console.log('Tags API Response:', response);
      
      // FIX: Check the response structure correctly
      if (response && response.success) {
        // The data is in response.data
        const tagsData = response.data || [];
        console.log('Tags data:', tagsData);
        setTags(tagsData);
      } else {
        // If response doesn't have success flag, try to use response directly
        if (Array.isArray(response)) {
          setTags(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setTags(response.data);
        } else {
          console.warn('Unexpected response format:', response);
          setTags([]);
          toast.error('Unexpected response format from server');
        }
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error(error.response?.data?.message || 'Failed to load tags');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        slug: tag.slug,
        color: tag.color || '#3b82f6'
      });
      setSelectedColor(tag.color || '#3b82f6');
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        slug: '',
        color: '#3b82f6'
      });
      setSelectedColor('#3b82f6');
    }
    setErrors({});
    setIsModalOpen(true);
    setShowColorPicker(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormData({
      name: '',
      slug: '',
      color: '#3b82f6'
    });
    setErrors({});
    setShowColorPicker(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setFormData(prev => ({ ...prev, color }));
    setShowColorPicker(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    // Check for duplicate name
    const existingTag = tags.find(t => 
      t.name.toLowerCase() === formData.name.toLowerCase() && 
      (!editingTag || t._id !== editingTag._id)
    );
    if (existingTag) {
      newErrors.name = 'A tag with this name already exists';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      let response;
      
      if (editingTag) {
        response = await blogAPI.updateTag(editingTag._id, formData);
      } else {
        response = await blogAPI.createTag(formData);
      }
      
      console.log('Save tag response:', response);
      
      if (response && response.success) {
        toast.success(editingTag ? 'Tag updated successfully' : 'Tag created successfully');
        await fetchTags(); // Refresh the list
        handleCloseModal();
      } else {
        toast.error(response?.message || 'Failed to save tag');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error(error.response?.data?.message || 'Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag? This will remove it from all posts.')) return;
    
    try {
      const response = await blogAPI.deleteTag(id);
      if (response && response.success) {
        toast.success('Tag deleted successfully');
        await fetchTags(); // Refresh the list
      } else {
        toast.error(response?.message || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error(error.response?.data?.message || 'Failed to delete tag');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTagColor = (color) => {
    return color || '#3b82f6';
  };

  // Filter tags
  const filteredTags = tags.filter(tag =>
    tag.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tags</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage blog tags for better content organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTags}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            New Tag
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tags.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tags</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {tags.filter(t => (t.count || 0) > 0).length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Tags</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {tags.reduce((sum, t) => sum + (t.count || 0), 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Mentions</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {tags.filter(t => (t.count || 0) > 5).length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Popular Tags</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Tags Grid */}
      {filteredTags.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Tag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No tags found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Create your first tag'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Tag
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTags.map((tag) => (
            <motion.div
              key={tag._id || tag.id || tag.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all duration-300 group relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: getTagColor(tag.color) }}
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {tag.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    /{tag.slug}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {tag.count || 0} posts
                    </span>
                    {tag.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(tag.createdAt)}
                      </span>
                    )}
                  </div>
                  {(tag.count || 0) > 5 && (
                    <div className="mt-1">
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        Popular
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(tag)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                    title="Edit tag"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag._id || tag.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    title="Delete tag"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal - Same as before */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingTag ? 'Edit Tag' : 'Create Tag'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingTag ? 'Update tag details' : 'Add a new tag for content organization'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter tag name..."
                  className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  This will be displayed as #{formData.name || 'tagname'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="tag-slug"
                  className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border ${errors.slug ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.slug}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Used in URL: /blog/tag/{formData.slug || 'tag-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">
                      {selectedColor}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showColorPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10">
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                              selectedColor === color
                                ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                                : ''
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && (
                              <Check className="h-4 w-4 text-white mx-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Preview</p>
                <div className="mt-2 flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: selectedColor + '20',
                      color: selectedColor
                    }}
                  >
                    #{formData.name || 'tagname'}
                  </span>
                  <span className="text-xs text-gray-400">or</span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: selectedColor }}
                  >
                    #{formData.name || 'tagname'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {editingTag ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogTags;