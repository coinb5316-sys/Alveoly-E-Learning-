// src/pages/AdminBlogEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FaSpinner, FaArrowLeft, FaPlus, FaTrash, FaSave } from "react-icons/fa";
import ImageUploader from "../components/ImageUploader";

const AdminBlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  // Fetch blog data on mount
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
        <FaSpinner className="text-5xl text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading blog post...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/blog")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter blog title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief summary of the article (max 200 characters)"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{form.excerpt.length}/200 characters</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="nursing, healthcare, study-tips"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <ImageUploader
              onUploadComplete={handleImageUpload}
              onRemove={handleImageRemove}
              existingImage={form.featuredImage.url ? form.featuredImage : null}
              label="Featured Image"
            />
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={form.status === "published"}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-700">Published</span>
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
                <span className="text-sm text-gray-700">Draft</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="archived"
                  checked={form.status === "archived"}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-600"
                />
                <span className="text-sm text-gray-700">Archived</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Content *</h2>
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
            className="h-96 mb-12"
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
          />
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quiz (Optional)</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="hasQuiz"
                checked={form.hasQuiz}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Enable Quiz</span>
            </label>
          </div>
          
          {form.hasQuiz && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={form.quiz.title}
                    onChange={(e) => handleQuizChange("title", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    value={form.quiz.passingScore}
                    onChange={(e) => handleQuizChange("passingScore", parseInt(e.target.value))}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Description</label>
                <textarea
                  value={form.quiz.description}
                  onChange={(e) => handleQuizChange("description", e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Questions ({form.quiz.questions.length})</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaPlus className="text-xs" /> Add Question
                  </button>
                </div>
                
                {form.quiz.questions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No questions added yet</p>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Click here to add your first question
                    </button>
                  </div>
                ) : (
                  form.quiz.questions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between mb-3">
                        <h4 className="font-medium">Question {idx + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <FaTrash className="text-xs" /> Remove
                        </button>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Question"
                        value={q.question}
                        onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                      />
                      
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, optIdx) => (
                          <input
                            key={optIdx}
                            type="text"
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ))}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(idx, "correctAnswer", parseInt(e.target.value))}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
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
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              {form.featuredImage.url && (
                <img 
                  src={form.featuredImage.url} 
                  alt={form.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">
                {form.category}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{form.title || "Title Preview"}</h3>
              <p className="text-gray-600">{form.excerpt || "Excerpt preview..."}</p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/admin/blog")}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogEdit;