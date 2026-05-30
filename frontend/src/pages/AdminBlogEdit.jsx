// src/pages/AdminBlogEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FaSpinner, FaArrowLeft, FaPlus, FaTrash, FaSave, FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import ImageUploader from "../components/ImageUploader";

const AdminBlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Announcements",
    tags: "",
    status: "draft",
    featuredImage: { url: "", publicId: "" },
    hasQuiz: false,
    quiz: {
      title: "Test Your Knowledge",
      description: "How well did you understand this article?",
      passingScore: 70,
      questions: []
    }
  });

  const categories = [
    'Health Sciences', 'Nursing', 'Medical', 'Education', 
    'Career Tips', 'Student Life', 'Announcements', 'Research', 
    'Technology', 'Success Stories'
  ];

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/blogs/${id}`);
      const blog = res.data;
      
      setForm({
        title: blog.title || "",
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        category: blog.category || "Announcements",
        tags: blog.tags?.join(", ") || "",
        status: blog.status || "draft",
        featuredImage: blog.featuredImage || { url: "", publicId: "" },
        hasQuiz: blog.hasQuiz || false,
        quiz: blog.quiz || {
          title: "Test Your Knowledge",
          description: "How well did you understand this article?",
          passingScore: 70,
          questions: []
        }
      });
    } catch (err) {
      console.error("Error fetching blog:", err);
      toast.error("Failed to load blog post");
      navigate("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageData) => {
    setForm(prev => ({
      ...prev,
      featuredImage: {
        url: imageData.url,
        publicId: imageData.publicId
      }
    }));
  };

  const handleImageRemove = () => {
    setForm(prev => ({
      ...prev,
      featuredImage: { url: "", publicId: "" }
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuizChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      quiz: { ...prev.quiz, [field]: value }
    }));
  };

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [
          ...prev.quiz.questions,
          { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
        ]
      }
    }));
  };

  const updateQuestion = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.map((q, i) =>
          i === index ? { ...q, [field]: value } : q
        )
      }
    }));
  };

  const updateOption = (qIndex, optIndex, value) => {
    setForm(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.map((q, i) =>
          i === qIndex ? { ...q, options: q.options.map((o, j) => j === optIndex ? value : o) } : q
        )
      }
    }));
  };

  const removeQuestion = (index) => {
    setForm(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.excerpt || !form.content) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setSubmitting(true);
    try {
      const submitData = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        status: form.status,
        featuredImage: form.featuredImage.url ? form.featuredImage : { url: "/blog-default.jpg", publicId: "" },
        hasQuiz: form.hasQuiz,
        quiz: form.hasQuiz ? form.quiz : null
      };
      
      await API.put(`/blogs/${id}`, submitData);
      toast.success("Blog updated successfully!");
      navigate("/admin/blog");
    } catch (err) {
      console.error("Error updating blog:", err);
      toast.error(err.response?.data?.message || "Failed to update blog");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="text-4xl md:text-5xl text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading blog post...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl xl:max-w-5xl mx-auto pb-8 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate("/admin/blog")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Edit Blog Post</h1>
        </div>
        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm md:text-base"
                placeholder="Enter blog title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt *</label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm md:text-base"
                placeholder="Brief summary of the article (max 200 characters)"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{form.excerpt.length}/200 characters</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm md:text-base"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="nursing, healthcare, study-tips"
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm md:text-base"
                />
              </div>
            </div>
            
            <ImageUploader
              onUploadComplete={handleImageUpload}
              onRemove={handleImageRemove}
              existingImage={form.featuredImage.url ? form.featuredImage : null}
              label="Featured Image"
            />
            
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={form.status === "published"}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={form.status === "draft"}
                  onChange={handleChange}
                  className="w-4 h-4 text-yellow-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Draft</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="archived"
                  checked={form.status === "archived"}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-600 dark:text-gray-400"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Archived</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Content *</h2>
          <div className="prose-editor">
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
              className="h-64 md:h-96 mb-12 md:mb-16"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image', 'video'],
                  ['clean']
                ]
              }}
              placeholder="Write your blog content here..."
            />
          </div>
        </div>

        {/* Quiz Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Quiz (Optional)</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasQuiz"
                  checked={form.hasQuiz}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable Quiz</span>
              </label>
            </div>
            {form.hasQuiz && (
              <button
                type="button"
                onClick={() => setQuizExpanded(!quizExpanded)}
                className="sm:hidden flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400"
              >
                {quizExpanded ? <FaChevronUp /> : <FaChevronDown />}
                {quizExpanded ? "Collapse" : "Expand"} Quiz
              </button>
            )}
          </div>
          
          {form.hasQuiz && (
            <div className={`space-y-4 transition-all duration-300 ${quizExpanded ? 'block' : 'hidden sm:block'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={form.quiz.title}
                    onChange={(e) => handleQuizChange("title", e.target.value)}
                    className="w-full px-3 md:px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    value={form.quiz.passingScore}
                    onChange={(e) => handleQuizChange("passingScore", parseInt(e.target.value))}
                    className="w-full sm:w-32 px-3 md:px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quiz Description</label>
                <textarea
                  value={form.quiz.description}
                  onChange={(e) => handleQuizChange("description", e.target.value)}
                  rows="2"
                  className="w-full px-3 md:px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Questions ({form.quiz.questions.length})</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlus className="text-xs" /> Add Question
                  </button>
                </div>
                
                {form.quiz.questions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <FaQuestionCircle className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No questions added yet</p>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Click here to add your first question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.quiz.questions.map((q, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">Question {idx + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 self-start"
                          >
                            <FaTrash className="text-xs" /> Remove
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Question"
                          value={q.question}
                          onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                          className="w-full px-3 md:px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                        />
                        
                        <div className="space-y-2 mb-3">
                          {q.options.map((opt, optIdx) => (
                            <input
                              key={optIdx}
                              type="text"
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                              className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                            />
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(idx, "correctAnswer", parseInt(e.target.value))}
                            className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                          >
                            {q.options.map((_, optIdx) => (
                              <option key={optIdx} value={optIdx}>
                                Correct Answer: Option {optIdx + 1}
                              </option>
                            ))}
                          </select>
                          
                          <input
                            type="text"
                            placeholder="Explanation (optional)"
                            value={q.explanation}
                            onChange={(e) => updateQuestion(idx, "explanation", e.target.value)}
                            className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Preview</h2>
          <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="mb-4">
              {form.featuredImage.url && (
                <img 
                  src={form.featuredImage.url} 
                  alt={form.title}
                  className="w-full h-40 md:h-48 object-cover rounded-lg mb-4"
                />
              )}
              <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full mb-2">
                {form.category}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">{form.title || "Title Preview"}</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{form.excerpt || "Excerpt preview..."}</p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sticky bottom-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 sm:static sm:bg-transparent sm:shadow-none sm:p-0 sm:border-0">
          <button
            type="button"
            onClick={() => navigate("/admin/blog")}
            className="px-6 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Add custom styles for Quill editor dark mode */}
      <style jsx global>{`
        .dark .ql-toolbar {
          background-color: rgb(31, 41, 55);
          border-color: rgb(55, 65, 81);
        }
        .dark .ql-container {
          background-color: rgb(17, 24, 39);
          border-color: rgb(55, 65, 81);
        }
        .dark .ql-editor {
          color: rgb(243, 244, 246);
        }
        .dark .ql-editor.ql-blank::before {
          color: rgb(107, 114, 128);
        }
        .dark .ql-picker-label {
          color: rgb(156, 163, 175);
        }
        .dark .ql-stroke {
          stroke: rgb(156, 163, 175);
        }
        .dark .ql-fill {
          fill: rgb(156, 163, 175);
        }
        .dark .ql-picker-options {
          background-color: rgb(31, 41, 55);
          border-color: rgb(55, 65, 81);
        }
      `}</style>
    </div>
  );
};

export default AdminBlogEdit;