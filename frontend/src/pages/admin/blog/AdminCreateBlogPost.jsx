// src/pages/admin/blog/AdminCreateBlogPost.jsx - COMPLETE FIXED WITH ALL FEATURES
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  Tag,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Video,
  Music,
  Link as LinkIcon,
  Quote,
  List,
  Heading1,
  Heading2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Minus,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Expand,
  Compress,
  Share2,
  Heart,
  MessageCircle,
  Eye as EyeIcon,
  Star,
  Bookmark,
  Send,
  Paperclip,
  Smile,
  Image,
  Film,
  File,
  Music2,
  Mic,
  Camera,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import blogAPI from '../../../api/blogApi';

// Custom GraduationCap icon
const GraduationCap = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422M12 14l-6.16-3.422M12 14v6m-6 0h12" />
  </svg>
);

// Custom Checkmark icon
const CheckmarkIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AdminCreateBlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const contentEditorRef = useRef(null);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category: '',
    tags: [],
    featuredImage: null,
    galleryImages: [],
    videoUrl: '',
    videoEmbed: '',
    audioUrl: '',
    status: 'draft',
    featured: false,
    publishDate: null,
    metaDescription: '',
    metaKeywords: '',
    author: '',
    authorBio: '',
    authorImage: null,
    references: [],
    learningObjectives: [],
    statistics: [],
    relatedPosts: [],
    readingTime: 5,
    allowComments: true,
    showAuthor: true,
    showShareButtons: true
  });
  
  const [categories, setCategories] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [refInput, setRefInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('');
  const [statLabel, setStatLabel] = useState('');
  const [statValue, setStatValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [activeSection, setActiveSection] = useState('general');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [relatedSearch, setRelatedSearch] = useState('');
  const [showRelatedDropdown, setShowRelatedDropdown] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchAllPosts();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await blogAPI.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await blogAPI.getTags();
      if (response.success) {
        setAvailableTags(response.data.map(tag => tag.name) || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const response = await blogAPI.getPosts({ limit: 100, publishedOnly: false });
      if (response.success) {
        setAllPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getPostById(id);
      
      if (response.success) {
        const post = response.data;
        setFormData({
          title: post.title || '',
          subtitle: post.subtitle || '',
          content: post.content || '',
          category: post.category || '',
          tags: post.tags || [],
          featuredImage: post.featuredImage || null,
          galleryImages: post.galleryImages || [],
          videoUrl: post.videoUrl || '',
          videoEmbed: post.videoEmbed || '',
          audioUrl: post.audioUrl || '',
          status: post.status || 'draft',
          featured: post.featured || false,
          publishDate: post.publishDate ? post.publishDate.split('T')[0] : null,
          metaDescription: post.metaDescription || '',
          metaKeywords: post.metaKeywords || '',
          author: post.authorName || '',
          authorBio: post.authorBio || '',
          authorImage: post.authorImage || null,
          references: post.references || [],
          learningObjectives: post.learningObjectives || [],
          statistics: post.statistics || [],
          relatedPosts: post.relatedPosts ? post.relatedPosts.map(p => p._id || p) : [],
          readingTime: post.readingTime || 5,
          allowComments: post.allowComments !== undefined ? post.allowComments : true,
          showAuthor: post.showAuthor !== undefined ? post.showAuthor : true,
          showShareButtons: post.showShareButtons !== undefined ? post.showShareButtons : true
        });
        
        if (post.featuredImage) {
          setImagePreview(post.featuredImage);
        }
        if (post.galleryImages && post.galleryImages.length > 0) {
          setGalleryPreviews(post.galleryImages);
        }
      } else {
        toast.error(response.message || 'Failed to load post');
        navigate('/admin/blog/posts');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error(error.response?.data?.message || 'Failed to load post');
      navigate('/admin/blog/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, featuredImage: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result]);
        setFormData(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, file]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = (tag) => {
    if (!tag.trim()) return;
    if (formData.tags.includes(tag.trim())) {
      toast.error('Tag already added');
      return;
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag.trim()]
    }));
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleAddReference = () => {
    if (!refInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, refInput.trim()]
    }));
    setRefInput('');
  };

  const handleRemoveReference = (index) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const handleAddObjective = () => {
    if (!objectiveInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, objectiveInput.trim()]
    }));
    setObjectiveInput('');
  };

  const handleRemoveObjective = (index) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const handleAddStatistic = () => {
    if (!statLabel.trim() || !statValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      statistics: [...prev.statistics, { value: statValue.trim(), label: statLabel.trim() }]
    }));
    setStatLabel('');
    setStatValue('');
  };

  const handleRemoveStatistic = (index) => {
    setFormData(prev => ({
      ...prev,
      statistics: prev.statistics.filter((_, i) => i !== index)
    }));
  };

  // Related Posts handlers
  const handleAddRelatedPost = (postId) => {
    if (formData.relatedPosts.includes(postId)) {
      toast.info('Post already added');
      return;
    }
    // Don't add current post as related
    if (isEditing && postId === id) {
      toast.error('Cannot add current post');
      return;
    }
    setFormData(prev => ({
      ...prev,
      relatedPosts: [...prev.relatedPosts, postId]
    }));
    setRelatedSearch('');
    setShowRelatedDropdown(false);
  };

  const handleRemoveRelatedPost = (postId) => {
    setFormData(prev => ({
      ...prev,
      relatedPosts: prev.relatedPosts.filter(id => id !== postId)
    }));
  };

  const getRelatedPostTitle = (postId) => {
    const post = allPosts.find(p => p._id === postId);
    return post ? post.title : 'Unknown Post';
  };

  const getFilteredRelatedPosts = () => {
    if (!relatedSearch.trim()) return [];
    return allPosts
      .filter(p => 
        p._id !== id && 
        !formData.relatedPosts.includes(p._id) &&
        p.title.toLowerCase().includes(relatedSearch.toLowerCase())
      )
      .slice(0, 10);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status = 'draft') => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      
      // Basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle || '');
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', status);
      formDataToSend.append('featured', formData.featured);
      formDataToSend.append('readingTime', formData.readingTime);
      formDataToSend.append('allowComments', formData.allowComments);
      formDataToSend.append('showAuthor', formData.showAuthor);
      formDataToSend.append('showShareButtons', formData.showShareButtons);
      
      // Media fields
      formDataToSend.append('videoUrl', formData.videoUrl || '');
      formDataToSend.append('videoEmbed', formData.videoEmbed || '');
      formDataToSend.append('audioUrl', formData.audioUrl || '');
      
      // Author fields
      formDataToSend.append('authorTitle', formData.author || '');
      formDataToSend.append('authorBio', formData.authorBio || '');
      formDataToSend.append('authorImage', formData.authorImage || '');
      
      // SEO
      formDataToSend.append('metaDescription', formData.metaDescription || '');
      formDataToSend.append('metaKeywords', formData.metaKeywords || '');
      
      // JSON fields
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('references', JSON.stringify(formData.references));
      formDataToSend.append('learningObjectives', JSON.stringify(formData.learningObjectives));
      formDataToSend.append('statistics', JSON.stringify(formData.statistics));
      formDataToSend.append('relatedPosts', JSON.stringify(formData.relatedPosts));
      
      // Gallery images - handle both URLs and files
      const galleryUrls = formData.galleryImages.filter(img => typeof img === 'string');
      if (galleryUrls.length > 0) {
        formDataToSend.append('galleryImages', JSON.stringify(galleryUrls));
      }
      
      // Publish date
      if (formData.publishDate) {
        formDataToSend.append('publishDate', formData.publishDate);
      }
      
      // Featured image - if it's a File object, append it
      if (formData.featuredImage && typeof formData.featuredImage === 'object') {
        formDataToSend.append('featuredImage', formData.featuredImage);
      }

      let response;
      if (isEditing) {
        response = await blogAPI.updatePost(id, formDataToSend);
      } else {
        response = await blogAPI.createPost(formDataToSend);
      }
      
      if (response.success) {
        toast.success(isEditing ? 'Post updated successfully!' : 'Post created successfully!');
        if (status === 'published') {
          navigate('/admin/blog/posts');
        } else {
          toast.info('Draft saved successfully');
          if (!isEditing) {
            navigate(`/admin/blog/edit/${response.data._id}`);
          }
        }
      } else {
        toast.error(response.message || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    handleSave('published');
  };

  const insertText = (before, after = '') => {
    const textarea = contentEditorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    setFormData(prev => ({
      ...prev,
      content: prev.content.substring(0, start) + newText + prev.content.substring(end)
    }));
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('<strong>', '</strong>'), label: 'Bold' },
    { icon: Italic, action: () => insertText('<em>', '</em>'), label: 'Italic' },
    { icon: Underline, action: () => insertText('<u>', '</u>'), label: 'Underline' },
    { type: 'divider' },
    { icon: Heading1, action: () => insertText('<h1>', '</h1>'), label: 'Heading 1' },
    { icon: Heading2, action: () => insertText('<h2>', '</h2>'), label: 'Heading 2' },
    { icon: List, action: () => insertText('<ul>\n  <li>', '</li>\n</ul>'), label: 'List' },
    { type: 'divider' },
    { icon: Quote, action: () => insertText('<blockquote>\n  ', '\n</blockquote>'), label: 'Quote' },
    { icon: LinkIcon, action: () => {
      const url = prompt('Enter URL:');
      if (url) insertText(`<a href="${url}">`, '</a>');
    }, label: 'Link' },
    { icon: Image, action: () => {
      const url = prompt('Enter image URL:');
      if (url) insertText(`<img src="${url}" alt="Image" />`, '');
    }, label: 'Image' },
    { icon: Video, action: () => {
      const url = prompt('Enter video URL (YouTube/Vimeo):');
      if (url) insertText(`<figure>\n  <iframe src="${url}" allowfullscreen></iframe>\n  <figcaption>Video caption</figcaption>\n</figure>`, '');
    }, label: 'Video' },
    { type: 'divider' },
    { icon: AlignLeft, action: () => insertText('<p style="text-align: left;">', '</p>'), label: 'Align Left' },
    { icon: AlignCenter, action: () => insertText('<p style="text-align: center;">', '</p>'), label: 'Align Center' },
    { icon: AlignRight, action: () => insertText('<p style="text-align: right;">', '</p>'), label: 'Align Right' },
    { type: 'divider' },
    { icon: Minus, action: () => insertText('<hr />', ''), label: 'Divider' },
    { icon: Code, action: () => insertText('<code>', '</code>'), label: 'Code' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 bg-gray-50 dark:bg-gray-950/95 backdrop-blur-sm -mx-4 px-4 py-4 md:-mx-6 md:px-6 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog/posts')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditing ? 'Update your blog post' : 'Write a new blog post'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2"
          >
            {showPreview ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {isEditing ? 'Update' : 'Publish'}
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title..."
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              {formData.title.length}/150 characters
            </p>
          </div>

          {/* Subtitle */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="Enter post subtitle..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="mt-2 text-xs text-gray-400">
              A brief subtitle that appears below the title
            </p>
          </div>

          {/* Content Editor */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-800/50">
              {toolbarButtons.map((btn, index) => {
                if (btn.type === 'divider') {
                  return <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />;
                }
                const Icon = btn.icon;
                return (
                  <button
                    key={index}
                    onClick={btn.action}
                    title={btn.label}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-gray-600 dark:text-gray-400"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <textarea
                ref={contentEditorRef}
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={20}
                placeholder="Write your post content here... Use the toolbar above for formatting."
                className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border-0 focus:ring-0 outline-none transition resize-y font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
              />
              {errors.content && (
                <p className="absolute bottom-2 left-4 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.content}
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 p-2 bg-gray-50 dark:bg-gray-800/50 flex justify-between text-xs text-gray-400">
              <span>HTML content supported</span>
              <span>{formData.content.length} characters</span>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Gallery Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition">
                <div className="flex flex-col items-center gap-1">
                  <Plus className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Add images</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                  ref={galleryInputRef}
                />
              </label>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video Content
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  YouTube/Vimeo URL
                </label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Embed Code
                </label>
                <input
                  type="text"
                  name="videoEmbed"
                  value={formData.videoEmbed}
                  onChange={handleChange}
                  placeholder="<iframe ...>"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>
            {formData.videoUrl && (
              <div className="mt-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={formData.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video preview"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Audio / Podcast Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <Music2 className="h-4 w-4" />
              Audio / Podcast
            </h3>
            <input
              type="text"
              name="audioUrl"
              value={formData.audioUrl}
              onChange={handleChange}
              placeholder="https://example.com/podcast.mp3"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
            {formData.audioUrl && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <audio controls className="w-full">
                  <source src={formData.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(e.target.value.length > 1);
                  }}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags..."
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={() => handleAddTag(tagInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {showTagSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {availableTags
                    .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
                    .slice(0, 10)
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                      >
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span>{tag}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-800 dark:hover:text-blue-300 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Related Posts - NEW SECTION */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Related Posts
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Select posts that are related to this article
            </p>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={relatedSearch}
                    onChange={(e) => {
                      setRelatedSearch(e.target.value);
                      setShowRelatedDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowRelatedDropdown(true)}
                    placeholder="Search for related posts..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>
              </div>
              
              {showRelatedDropdown && getFilteredRelatedPosts().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {getFilteredRelatedPosts().map(post => (
                    <button
                      key={post._id}
                      onClick={() => handleAddRelatedPost(post._id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{post.title}</span>
                      <span className="text-xs text-gray-400 ml-auto">{post.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.relatedPosts.map(postId => {
                const post = allPosts.find(p => p._id === postId);
                return (
                  <span
                    key={postId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-full text-sm"
                  >
                    {post ? post.title : 'Unknown Post'}
                    <button
                      onClick={() => handleRemoveRelatedPost(postId)}
                      className="hover:text-purple-800 dark:hover:text-purple-300 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* References */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              References
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="Add reference..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddReference()}
              />
              <button
                onClick={handleAddReference}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2 mt-3">
              {formData.references.map((ref, index) => (
                <li key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">[{index + 1}]</span>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{ref}</span>
                  <button
                    onClick={() => handleRemoveReference(index)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Objectives */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Learning Objectives
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                placeholder="Add learning objective..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddObjective()}
              />
              <button
                onClick={handleAddObjective}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2 mt-3">
              {formData.learningObjectives.map((obj, index) => (
                <li key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CheckmarkIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{obj}</span>
                  <button
                    onClick={() => handleRemoveObjective(index)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statistics / Key Metrics
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={statValue}
                onChange={(e) => setStatValue(e.target.value)}
                placeholder="Value (e.g., 40%)"
                className="w-32 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
              <input
                type="text"
                value={statLabel}
                onChange={(e) => setStatLabel(e.target.value)}
                placeholder="Label (e.g., Reduced Time)"
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStatistic()}
              />
              <button
                onClick={handleAddStatistic}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {formData.statistics.map((stat, index) => (
                <div key={index} className="relative p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stat.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <button
                    onClick={() => handleRemoveStatistic(index)}
                    className="absolute top-1 right-1 text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Author Info - Full Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Author Information
            </h3>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Author Title
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g., Chief Nursing Officer"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Author Bio
              </label>
              <textarea
                name="authorBio"
                value={formData.authorBio}
                onChange={handleChange}
                rows={3}
                placeholder="Author biography..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm resize-y"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Author Image URL
              </label>
              <input
                type="text"
                name="authorImage"
                value={formData.authorImage || ''}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Featured Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, featuredImage: null }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Click to upload image
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG, WEBP up to 5MB
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border ${errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Reading Time */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reading Time (minutes)
            </label>
            <input
              type="number"
              name="readingTime"
              value={formData.readingTime}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Status Options */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Post Settings</h3>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Feature this post
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="allowComments"
                checked={formData.allowComments}
                onChange={handleChange}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Allow comments
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showAuthor"
                checked={formData.showAuthor}
                onChange={handleChange}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <User className="h-4 w-4" />
                Show author
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showShareButtons"
                checked={formData.showShareButtons}
                onChange={handleChange}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Show share buttons
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="pending">Pending Review</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {formData.status === 'published' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publish Date
                </label>
                <input
                  type="date"
                  name="publishDate"
                  value={formData.publishDate || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              SEO Settings
            </h3>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription || ''}
                onChange={handleChange}
                rows={2}
                placeholder="Brief description for search engines..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">
                {formData.metaDescription?.length || 0}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                name="metaKeywords"
                value={formData.metaKeywords || ''}
                onChange={handleChange}
                placeholder="Separate with commas..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Save Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-3 sticky top-20">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isEditing ? 'Update Post' : 'Publish Post'}
                  <CheckCircle className="h-4 w-4" />
                </>
              )}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <EyeIcon className="h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Preview Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Post Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Featured Image */}
                {imagePreview && (
                  <img src={imagePreview} alt={formData.title} className="w-full h-64 object-cover rounded-xl" />
                )}
                
                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formData.title}</h1>
                
                {/* Subtitle */}
                {formData.subtitle && (
                  <p className="text-xl text-gray-600 dark:text-gray-400">{formData.subtitle}</p>
                )}
                
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  {formData.authorImage ? (
                    <img src={formData.authorImage} alt={formData.author} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {formData.author?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formData.author || 'Author'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formData.authorBio || 'Author bio'}</p>
                  </div>
                </div>
                
                {/* Content */}
                <div
                  className="prose prose-lg prose-blue max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
                
                {/* Gallery Images */}
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryPreviews.map((img, index) => (
                      <img key={index} src={img} alt={`Gallery ${index + 1}`} className="rounded-lg object-cover h-48 w-full" />
                    ))}
                  </div>
                )}
                
                {/* Video */}
                {formData.videoUrl && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe src={formData.videoUrl} className="w-full h-full" allowFullScreen title="Video" />
                  </div>
                )}
                
                {/* Audio / Podcast */}
                {formData.audioUrl && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Podcast</h3>
                    <audio controls className="w-full">
                      <source src={formData.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                
                {/* Statistics */}
                {formData.statistics.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                    {formData.statistics.map((stat, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 text-center border border-blue-100 dark:border-blue-800/50">
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {stat.value}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Learning Objectives */}
                {formData.learningObjectives.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                      <GraduationCap className="text-blue-600" />
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {formData.learningObjectives.map((obj, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                          <CheckmarkIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Related Posts */}
                {formData.relatedPosts.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Related Articles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.relatedPosts.map(postId => {
                        const post = allPosts.find(p => p._id === postId);
                        return post ? (
                          <div key={postId} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                            {post.featuredImage && (
                              <img src={post.featuredImage} alt={post.title} className="w-16 h-16 object-cover rounded-lg" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{post.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{post.category}</p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {/* References */}
                {formData.references.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">References</h3>
                    <ul className="space-y-2">
                      {formData.references.map((ref, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                          <span className="text-blue-600 font-bold text-sm">[{index + 1}]</span>
                          <span>{ref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCreateBlogPost;