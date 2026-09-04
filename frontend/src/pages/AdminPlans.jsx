// pages/AdminPlans.jsx
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCrown,
  FaSpinner,
  FaTimes,
  FaSave,
  FaCheck,
  FaClock,
  FaCalendarAlt,
  FaDollarSign,
  FaTag,
  FaRocket,
  FaLock,
  FaUnlock,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    duration: 1,
    durationUnit: "month",
    isFree: false,
    isActive: true,
    features: [],
    unlocksAllContent: true,
    subjects: [],
    courses: [],
    programs: [],
    accessLevel: "full",
    freeAccess: false
  });
  
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    fetchPlans();
    fetchSubjects();
    fetchCourses();
    fetchPrograms();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/plans");
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects/admin/all");
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await API.get("/programs");
      setPrograms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        title: plan.title || "",
        description: plan.description || "",
        price: plan.price || 0,
        duration: plan.duration || 1,
        durationUnit: plan.durationUnit || "month",
        isFree: plan.isFree || false,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        features: plan.features || [],
        unlocksAllContent: plan.unlocksAllContent !== undefined ? plan.unlocksAllContent : true,
        subjects: plan.subjects?.map(s => s._id || s) || [],
        courses: plan.courses?.map(c => c._id || c) || [],
        programs: plan.programs?.map(p => p._id || p) || [],
        accessLevel: plan.accessLevel || "full",
        freeAccess: plan.freeAccess || false
      });
    } else {
      setEditingPlan(null);
      setFormData({
        title: "",
        description: "",
        price: 0,
        duration: 1,
        durationUnit: "month",
        isFree: false,
        isActive: true,
        features: [],
        unlocksAllContent: true,
        subjects: [],
        courses: [],
        programs: [],
        accessLevel: "full",
        freeAccess: false
      });
    }
    setFeatureInput("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFeatureInput("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, [name]: selected }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // If free plan, set price to 0
      const submitData = {
        ...formData,
        price: formData.isFree || formData.freeAccess ? 0 : formData.price
      };
      
      let response;
      if (editingPlan) {
        response = await API.put(`/plans/${editingPlan._id}`, submitData);
        toast.success("Plan updated successfully!");
      } else {
        response = await API.post("/plans", submitData);
        toast.success("Plan created successfully!");
      }
      
      handleCloseModal();
      fetchPlans();
    } catch (err) {
      console.error("Error saving plan:", err);
      toast.error(err.response?.data?.message || "Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    
    try {
      setLoading(true);
      await API.delete(`/plans/${id}`);
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch (err) {
      console.error("Error deleting plan:", err);
      toast.error(err.response?.data?.message || "Failed to delete plan");
    } finally {
      setLoading(false);
    }
  };

  const getDurationLabel = (duration, unit) => {
    const units = {
      day: "Day",
      week: "Week",
      month: "Month",
      year: "Year"
    };
    return `${duration} ${units[unit] || unit}${duration > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Subscription Plans
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage subscription plans that unlock content access
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <FaPlus className="h-4 w-4" />
          <span className="text-sm font-medium">Create Plan</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="h-8 w-8 text-yellow-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">Loading plans...</p>
        </div>
      )}

      {/* Plans Grid */}
      {!loading && plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <FaCrown className="h-12 w-12 text-yellow-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No plans created yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-yellow-600 dark:text-yellow-400 font-medium hover:underline"
          >
            Create your first plan
          </button>
        </div>
      )}

      {/* Plans Grid */}
      {!loading && plans.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                plan.isActive
                  ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60"
              }`}
            >
              {/* Plan Header */}
              <div className={`p-4 ${plan.isFree ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-yellow-500 to-orange-600"} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {plan.isFree ? (
                      <FaTag className="h-4 w-4" />
                    ) : (
                      <FaCrown className="h-4 w-4" />
                    )}
                    <h3 className="font-semibold">{plan.title}</h3>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {plan.isFree ? "Free" : "Paid"}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-sm opacity-80 ml-1">
                    /{getDurationLabel(plan.duration, plan.durationUnit)}
                  </span>
                </div>
              </div>

              {/* Plan Body */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {plan.description || "No description"}
                </p>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Features
                    </p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaCheck className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{plan.features.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Access Level */}
                <div className="flex items-center gap-2 text-xs">
                  {plan.unlocksAllContent || plan.accessLevel === "full" ? (
                    <>
                      <FaUnlock className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Unlocks All Content</span>
                    </>
                  ) : (
                    <>
                      <FaLock className="h-3 w-3 text-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">Limited Access</span>
                    </>
                  )}
                </div>

                {/* Subjects/Programs count */}
                <div className="flex gap-4 text-xs text-gray-500">
                  {plan.subjects?.length > 0 && (
                    <span>{plan.subjects.length} Subjects</span>
                  )}
                  {plan.courses?.length > 0 && (
                    <span>{plan.courses.length} Courses</span>
                  )}
                  {plan.programs?.length > 0 && (
                    <span>{plan.programs.length} Programs</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors text-sm font-medium"
                  >
                    <FaEdit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-sm font-medium"
                  >
                    <FaTrash className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                  <FaCrown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {editingPlan ? "Edit Plan" : "Create New Plan"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {editingPlan ? "Update plan details" : "Configure a new subscription plan"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Plan Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Premium Monthly"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    disabled={formData.isFree || formData.freeAccess}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Describe what this plan includes..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all resize-none"
                />
              </div>

              {/* Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Duration Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleChange}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Free Plan (always available)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="unlocksAllContent"
                    checked={formData.unlocksAllContent}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Unlocks All Content
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="freeAccess"
                    checked={formData.freeAccess}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Free Access (no payment)
                  </label>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Features
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a feature..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Access Control - Specific Subjects/Courses/Programs */}
              {!formData.unlocksAllContent && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Specific Access Control
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Access Level
                    </label>
                    <select
                      name="accessLevel"
                      value={formData.accessLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                    >
                      <option value="full">Full Access</option>
                      <option value="subjects">Specific Subjects</option>
                      <option value="courses">Specific Courses</option>
                      <option value="programs">Specific Programs</option>
                      <option value="none">No Access</option>
                    </select>
                  </div>

                  {formData.accessLevel === "subjects" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Select Subjects
                      </label>
                      <select
                        name="subjects"
                        multiple
                        value={formData.subjects}
                        onChange={handleSelectChange}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                      >
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                  )}

                  {formData.accessLevel === "courses" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Select Courses
                      </label>
                      <select
                        name="courses"
                        multiple
                        value={formData.courses}
                        onChange={handleSelectChange}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                      >
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                  )}

                  {formData.accessLevel === "programs" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Select Programs
                      </label>
                      <select
                        name="programs"
                        multiple
                        value={formData.programs}
                        onChange={handleSelectChange}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                      >
                        {programs.map((program) => (
                          <option key={program._id} value={program._id}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaSave className="h-4 w-4" />}
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;