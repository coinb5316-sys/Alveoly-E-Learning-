// src/pages/admin/blog/AdminBlogAuthors.jsx - COMPLETE FIXED
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Calendar,
  Star,
  Eye,
  X,
  Save,
  AlertCircle,
  Search,
  RefreshCw,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Briefcase,
  Users,
  GraduationCap as GraduationCapIcon
} from 'lucide-react';
// Import social icons from react-icons
import { FaTwitter, FaLinkedin, FaFacebook, FaInstagram, FaYoutube, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import blogAPI from '../../../api/blogApi';

// FileText icon component
const FileText = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// GraduationCap component
const GraduationCap = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422M12 14l-6.16-3.422M12 14v6m-6 0h12" />
  </svg>
);

const AdminBlogAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    totalPosts: 0
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    professional: false,
    social: false
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    avatar: '',
    expertise: [],
    experience: 0,
    education: [],
    certifications: [],
    social: {
      twitter: '',
      linkedin: '',
      facebook: '',
      instagram: '',
      youtube: '',
      website: ''
    },
    status: 'active',
    metaDescription: ''
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [educationInput, setEducationInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');

  useEffect(() => {
    fetchAuthors();
  }, [currentPage, statusFilter, searchTerm, sortBy]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAuthors({
        page: currentPage,
        limit: 12,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        sort: sortBy
      });
      
      if (response.success) {
        setAuthors(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalAuthors(response.pagination?.total || 0);
        setStats(response.stats || { total: 0, active: 0, pending: 0, inactive: 0, totalPosts: 0 });
      } else {
        toast.error(response.message || 'Failed to load authors');
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error(error.response?.data?.message || 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (author = null) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        name: author.name || '',
        email: author.email || '',
        title: author.title || '',
        bio: author.bio || '',
        avatar: author.avatar || '',
        expertise: author.expertise || [],
        experience: author.experience || 0,
        education: author.education || [],
        certifications: author.certifications || [],
        social: author.social || { twitter: '', linkedin: '', facebook: '', instagram: '', youtube: '', website: '' },
        status: author.status || 'active',
        metaDescription: author.metaDescription || ''
      });
    } else {
      setEditingAuthor(null);
      setFormData({
        name: '',
        email: '',
        title: '',
        bio: '',
        avatar: '',
        expertise: [],
        experience: 0,
        education: [],
        certifications: [],
        social: { twitter: '', linkedin: '', facebook: '', instagram: '', youtube: '', website: '' },
        status: 'active',
        metaDescription: ''
      });
    }
    setErrors({});
    setExpandedSections({
      basic: true,
      professional: false,
      social: false
    });
    setExpertiseInput('');
    setEducationInput('');
    setCertificationInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAuthor(null);
    setFormData({
      name: '',
      email: '',
      title: '',
      bio: '',
      avatar: '',
      expertise: [],
      experience: 0,
      education: [],
      certifications: [],
      social: { twitter: '', linkedin: '', facebook: '', instagram: '', youtube: '', website: '' },
      status: 'active',
      metaDescription: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayAdd = (field, value, setter) => {
    if (!value.trim()) return;
    if (formData[field].includes(value.trim())) {
      toast.error('Item already added');
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setter('');
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      let response;
      
      if (editingAuthor) {
        response = await blogAPI.updateAuthor(editingAuthor._id, formData);
      } else {
        response = await blogAPI.createAuthor(formData);
      }
      
      if (response.success) {
        toast.success(editingAuthor ? 'Author updated successfully' : 'Author created successfully');
        fetchAuthors();
        handleCloseModal();
      } else {
        toast.error(response.message || 'Failed to save author');
      }
    } catch (error) {
      console.error('Error saving author:', error);
      toast.error(error.response?.data?.message || 'Failed to save author');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this author? This will remove all their posts.')) return;
    
    try {
      const response = await blogAPI.deleteAuthor(id);
      if (response.success) {
        toast.success('Author deleted successfully');
        fetchAuthors();
      } else {
        toast.error(response.message || 'Failed to delete author');
      }
    } catch (error) {
      console.error('Error deleting author:', error);
      toast.error(error.response?.data?.message || 'Failed to delete author');
    }
  };

  const handleViewAuthor = (author) => {
    setSelectedAuthor(author);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading authors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Authors</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage blog authors and contributors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuthors}
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
            Add Author
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total || totalAuthors}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Authors</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalPosts || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search authors by name, email, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A-Z</option>
            <option value="posts">Most Posts</option>
          </select>
        </div>
      </div>

      {/* Authors Grid */}
      {authors.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No authors found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {searchTerm ? 'Try adjusting your search' : 'No authors have been created yet'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create First Author
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <motion.div
                key={author._id || author.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-300 group relative"
              >
                <div className="flex items-start gap-4">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900/50"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {getInitials(author.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {author.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {author.title || 'Contributor'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewAuthor(author)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(author)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                          title="Edit author"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(author._id || author.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          title="Delete author"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(author.status)}`}>
                        {author.status?.charAt(0).toUpperCase() + author.status?.slice(1) || 'Active'}
                      </span>
                      {author.expertise && author.expertise.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                          {author.expertise[0]}
                          {author.expertise.length > 1 && ` +${author.expertise.length - 1}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {author.bio || 'No bio available'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {author.postCount || 0} posts
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {author.totalLikes || 0} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {author.totalViews || 0} views
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex-wrap">
                    {author.social?.twitter && (
                      <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#1da1f2]/10 text-[#1da1f2] rounded hover:bg-[#1da1f2]/20 transition">
                        <FaTwitter className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {author.social?.linkedin && (
                      <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#0a66c2]/10 text-[#0a66c2] rounded hover:bg-[#0a66c2]/20 transition">
                        <FaLinkedin className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {author.social?.facebook && (
                      <a href={author.social.facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#1877f2]/10 text-[#1877f2] rounded hover:bg-[#1877f2]/20 transition">
                        <FaFacebook className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {author.social?.instagram && (
                      <a href={author.social.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#e4405f]/10 text-[#e4405f] rounded hover:bg-[#e4405f]/20 transition">
                        <FaInstagram className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {author.social?.youtube && (
                      <a href={author.social.youtube} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#ff0000]/10 text-[#ff0000] rounded hover:bg-[#ff0000]/20 transition">
                        <FaYoutube className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {author.social?.website && (
                      <a href={author.social.website} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#4285f4]/10 text-[#4285f4] rounded hover:bg-[#4285f4]/20 transition">
                        <FaGlobe className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <a href={`mailto:${author.email}`} className="p-1.5 bg-[#ea4335]/10 text-[#ea4335] rounded hover:bg-[#ea4335]/20 transition">
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {authors.length} of {totalAuthors} authors
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingAuthor ? 'Edit Author' : 'Create Author'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingAuthor ? 'Update author details' : 'Add a new author to the blog'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Section */}
              <div>
                <button
                  onClick={() => toggleSection('basic')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Basic Information</span>
                    <span className="text-xs text-red-500">*</span>
                  </div>
                  {expandedSections.basic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.basic && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name..."
                        className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address..."
                        className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Chief Nursing Officer"
                        className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Write a brief bio..."
                        className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border ${errors.bio ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y`}
                      />
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.bio}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Avatar URL
                      </label>
                      <input
                        type="text"
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleChange}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                      {formData.avatar && (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={formData.avatar}
                            alt="Avatar preview"
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <span className="text-xs text-gray-400">Preview</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Section */}
              <div>
                <button
                  onClick={() => toggleSection('professional')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Professional Info</span>
                  </div>
                  {expandedSections.professional ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.professional && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expertise
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={expertiseInput}
                          onChange={(e) => setExpertiseInput(e.target.value)}
                          placeholder="Add expertise area..."
                          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleArrayAdd('expertise', expertiseInput, setExpertiseInput)}
                        />
                        <button
                          onClick={() => handleArrayAdd('expertise', expertiseInput, setExpertiseInput)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.expertise.map((item, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                            {item}
                            <button onClick={() => handleArrayRemove('expertise', index)} className="hover:text-purple-800">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Education
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={educationInput}
                          onChange={(e) => setEducationInput(e.target.value)}
                          placeholder="Add education..."
                          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleArrayAdd('education', educationInput, setEducationInput)}
                        />
                        <button
                          onClick={() => handleArrayAdd('education', educationInput, setEducationInput)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.education.map((item, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full text-sm">
                            <GraduationCap className="h-3 w-3" />
                            {item}
                            <button onClick={() => handleArrayRemove('education', index)} className="hover:text-green-800">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Certifications
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={certificationInput}
                          onChange={(e) => setCertificationInput(e.target.value)}
                          placeholder="Add certification..."
                          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleArrayAdd('certifications', certificationInput, setCertificationInput)}
                        />
                        <button
                          onClick={() => handleArrayAdd('certifications', certificationInput, setCertificationInput)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.certifications.map((item, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-full text-sm">
                            <Award className="h-3 w-3" />
                            {item}
                            <button onClick={() => handleArrayRemove('certifications', index)} className="hover:text-yellow-800">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Section */}
              <div>
                <button
                  onClick={() => toggleSection('social')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center gap-2">
                    <FaGlobe className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Social Links</span>
                  </div>
                  {expandedSections.social ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.social && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <FaTwitter className="h-4 w-4 inline mr-1 text-[#1da1f2]" /> Twitter
                        </label>
                        <input
                          type="text"
                          name="social.twitter"
                          value={formData.social.twitter}
                          onChange={handleChange}
                          placeholder="https://twitter.com/..."
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <FaLinkedin className="h-4 w-4 inline mr-1 text-[#0a66c2]" /> LinkedIn
                        </label>
                        <input
                          type="text"
                          name="social.linkedin"
                          value={formData.social.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <FaFacebook className="h-4 w-4 inline mr-1 text-[#1877f2]" /> Facebook
                        </label>
                        <input
                          type="text"
                          name="social.facebook"
                          value={formData.social.facebook}
                          onChange={handleChange}
                          placeholder="https://facebook.com/..."
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <FaInstagram className="h-4 w-4 inline mr-1 text-[#e4405f]" /> Instagram
                        </label>
                        <input
                          type="text"
                          name="social.instagram"
                          value={formData.social.instagram}
                          onChange={handleChange}
                          placeholder="https://instagram.com/..."
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <FaYoutube className="h-4 w-4 inline mr-1 text-[#ff0000]" /> YouTube
                        </label>
                        <input
                          type="text"
                          name="social.youtube"
                          value={formData.social.youtube}
                          onChange={handleChange}
                          placeholder="https://youtube.com/..."
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <FaGlobe className="h-4 w-4 inline mr-1 text-[#4285f4]" /> Website
                        </label>
                        <input
                          type="text"
                          name="social.website"
                          value={formData.social.website}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Description (SEO)
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Brief description for search engines..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {formData.metaDescription?.length || 0}/160 characters
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex gap-3">
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
                {editingAuthor ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Author Modal */}
      {isViewModalOpen && selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Author Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {selectedAuthor.avatar ? (
                  <img
                    src={selectedAuthor.avatar}
                    alt={selectedAuthor.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900/50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(selectedAuthor.name)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedAuthor.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedAuthor.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAuthor.status)}`}>
                      {selectedAuthor.status?.charAt(0).toUpperCase() + selectedAuthor.status?.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {formatDate(selectedAuthor.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedAuthor.email}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedAuthor.experience || 0} years</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{selectedAuthor.bio || 'No bio available'}</p>
              </div>

              {selectedAuthor.expertise && selectedAuthor.expertise.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAuthor.expertise.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAuthor.education && selectedAuthor.education.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Education</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAuthor.education.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full text-sm">
                        <GraduationCap className="h-3 w-3 inline mr-1" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAuthor.certifications && selectedAuthor.certifications.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAuthor.certifications.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-full text-sm">
                        <Award className="h-3 w-3 inline mr-1" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedAuthor.postCount || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Posts</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedAuthor.totalLikes || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Likes</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedAuthor.totalViews || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                </div>
              </div>

              {selectedAuthor.social && Object.values(selectedAuthor.social).some(v => v) && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 flex-wrap">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connect:</p>
                  {selectedAuthor.social.twitter && (
                    <a href={selectedAuthor.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1da1f2] text-white rounded-lg hover:shadow-lg transition">
                      <FaTwitter className="h-4 w-4" />
                    </a>
                  )}
                  {selectedAuthor.social.linkedin && (
                    <a href={selectedAuthor.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0a66c2] text-white rounded-lg hover:shadow-lg transition">
                      <FaLinkedin className="h-4 w-4" />
                    </a>
                  )}
                  {selectedAuthor.social.facebook && (
                    <a href={selectedAuthor.social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1877f2] text-white rounded-lg hover:shadow-lg transition">
                      <FaFacebook className="h-4 w-4" />
                    </a>
                  )}
                  {selectedAuthor.social.instagram && (
                    <a href={selectedAuthor.social.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#e4405f] text-white rounded-lg hover:shadow-lg transition">
                      <FaInstagram className="h-4 w-4" />
                    </a>
                  )}
                  {selectedAuthor.social.youtube && (
                    <a href={selectedAuthor.social.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#ff0000] text-white rounded-lg hover:shadow-lg transition">
                      <FaYoutube className="h-4 w-4" />
                    </a>
                  )}
                  {selectedAuthor.social.website && (
                    <a href={selectedAuthor.social.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#4285f4] text-white rounded-lg hover:shadow-lg transition">
                      <FaGlobe className="h-4 w-4" />
                    </a>
                  )}
                  <a href={`mailto:${selectedAuthor.email}`} className="p-2 bg-[#ea4335] text-white rounded-lg hover:shadow-lg transition">
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenModal(selectedAuthor);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Edit Author
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleDelete(selectedAuthor._id || selectedAuthor.id);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete Author
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogAuthors;