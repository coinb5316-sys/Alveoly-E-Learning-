import React, { useState } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import { 
  Plus, Trash2, Upload, Image, X, 
  ChevronDown, ChevronUp, Edit2, Save,
  Zap, Clock, Target, Award, FileQuestion
} from 'lucide-react';

const NursingGameForm = ({ game, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: game?.title || '',
    description: game?.description || '',
    category: game?.category || 'medication',
    difficulty: game?.difficulty || 'intermediate',
    timeLimit: game?.timeLimit || 300,
    points: game?.points || 100,
    passingScore: game?.passingScore || 70,
    attemptsAllowed: game?.attemptsAllowed || 3,
    badgeReward: game?.badgeReward || '',
    tags: game?.tags || [],
    questions: game?.questions || [
      {
        questionText: '',
        questionType: 'multiple-choice',
        diagramUrl: null,
        diagramCaption: '',
        options: [
          { text: '', isCorrect: false, explanation: '' },
          { text: '', isCorrect: false, explanation: '' },
          { text: '', isCorrect: false, explanation: '' },
          { text: '', isCorrect: false, explanation: '' }
        ],
        explanation: '',
        nursingConcept: '',
        clinicalTip: '',
        points: 10
      }
    ]
  });

  const [expandedQuestions, setExpandedQuestions] = useState([0]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: 'medication', label: '💊 Medication Administration', color: 'purple' },
    { value: 'assessment', label: '🩺 Patient Assessment', color: 'blue' },
    { value: 'emergency', label: '🚨 Emergency Care', color: 'red' },
    { value: 'procedures', label: '🔧 Clinical Procedures', color: 'green' },
    { value: 'diagnosis', label: '🔍 Diagnosis & Planning', color: 'yellow' },
    { value: 'communication', label: '💬 Therapeutic Communication', color: 'pink' },
    { value: 'ethics', label: '⚖️ Nursing Ethics', color: 'indigo' },
    { value: 'leadership', label: '👥 Leadership & Management', color: 'orange' }
  ];

  const difficulties = [
    { value: 'beginner', label: '🌱 Beginner', color: 'green' },
    { value: 'intermediate', label: '📘 Intermediate', color: 'blue' },
    { value: 'advanced', label: '🎓 Advanced', color: 'orange' },
    { value: 'expert', label: '🏆 Expert', color: 'red' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (qIndex, optIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[optIndex][field] = value;
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSetCorrectOption = (qIndex, optIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optIndex
    }));
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    const newQuestion = {
      questionText: '',
      questionType: 'multiple-choice',
      diagramUrl: null,
      diagramCaption: '',
      options: [
        { text: '', isCorrect: false, explanation: '' },
        { text: '', isCorrect: false, explanation: '' },
        { text: '', isCorrect: false, explanation: '' },
        { text: '', isCorrect: false, explanation: '' }
      ],
      explanation: '',
      nursingConcept: '',
      clinicalTip: '',
      points: 10
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setExpandedQuestions(prev => [...prev, formData.questions.length]);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length === 1) {
      toast.error('You need at least one question');
      return;
    }
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    setExpandedQuestions(prev => prev.filter(i => i !== index));
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options.push({
      text: '',
      isCorrect: false,
      explanation: ''
    });
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const removeOption = (qIndex, optIndex) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[qIndex].options.length <= 2) {
      toast.error('You need at least 2 options');
      return;
    }
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== optIndex);
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleDiagramUpload = async (qIndex, file) => {
    if (!file) return;
    
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    
    try {
      const res = await axios.post('/nursing-games/upload-diagram', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        handleQuestionChange(qIndex, 'diagramUrl', res.data.url);
        toast.success('Diagram uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload diagram');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error('Please enter a game title');
      setSaving(false);
      return;
    }
    
    if (formData.questions.some(q => !q.questionText.trim())) {
      toast.error('Please fill in all question texts');
      setSaving(false);
      return;
    }
    
    if (formData.questions.some(q => !q.options.some(opt => opt.isCorrect))) {
      toast.error('Each question must have a correct answer selected');
      setSaving(false);
      return;
    }
    
    try {
      const url = game ? `/nursing-games/games/${game._id}` : '/nursing-games/games';
      const method = game ? 'put' : 'post';
      
      const response = await axios[method](url, formData);
      
      if (response.data.success) {
        toast.success(game ? 'Game updated successfully!' : 'Game created successfully!');
        if (onSave) onSave(response.data.game);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save game');
    } finally {
      setSaving(false);
    }
  };

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">
          {game ? 'Edit Nursing Game' : 'Create New Nursing Game Challenge'}
        </h2>
        <p className="text-blue-100 mt-1">
          Create engaging nursing challenges with diagrams to test students' clinical knowledge
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Game Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Emergency Room Challenge: Cardiac Arrest"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty *
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time Limit (seconds)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min="30"
                max="3600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Award className="h-4 w-4" />
                Passing Score (%)
              </label>
              <input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Badge Reward (Optional)
            </label>
            <input
              type="text"
              name="badgeReward"
              value={formData.badgeReward}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Cardiac Care Expert"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Game Points
            </label>
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Attempts Allowed
            </label>
            <input
              type="number"
              name="attemptsAllowed"
              value={formData.attemptsAllowed}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="1"
              max="10"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe the nursing challenge, clinical scenario, and learning objectives..."
            required
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (Press Enter to add)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                {tag}
                <button type="button" onClick={() => handleTagRemove(tag)} className="hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            onKeyDown={handleTagAdd}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Type a tag and press Enter..."
          />
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-green-500" />
            Questions ({formData.questions.length})
          </h3>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>
        
        <div className="space-y-4">
          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleQuestionExpand(qIndex)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Question {qIndex + 1}
                  </span>
                  {question.questionText && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                      {question.questionText.substring(0, 60)}...
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                    {question.points} pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {expandedQuestions.includes(qIndex) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeQuestion(qIndex); }}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </button>
              
              {expandedQuestions.includes(qIndex) && (
                <div className="p-4 space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Question Text *
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter the nursing question..."
                    />
                  </div>
                  
                  {/* Question Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Question Type
                      </label>
                      <select
                        value={question.questionType}
                        onChange={(e) => handleQuestionChange(qIndex, 'questionType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="scenario">Clinical Scenario</option>
                        <option value="image-based">Image-Based</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>
                  
                  {/* Diagram Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diagram/Image (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      {question.diagramUrl ? (
                        <div className="relative">
                          <img 
                            src={question.diagramUrl} 
                            alt="Question diagram" 
                            className="h-32 w-auto rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuestionChange(qIndex, 'diagramUrl', null)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <p className="text-xs text-gray-500">Upload</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleDiagramUpload(qIndex, e.target.files[0])}
                            disabled={uploading}
                          />
                        </label>
                      )}
                      {question.diagramUrl && (
                        <input
                          type="text"
                          value={question.diagramCaption || ''}
                          onChange={(e) => handleQuestionChange(qIndex, 'diagramCaption', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Diagram caption (e.g., Figure 1: Cardiac Anatomy)"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Answer Options *
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetCorrectOption(qIndex, optIndex)}
                            className={`mt-2 px-2 py-1 text-xs rounded ${option.isCorrect 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
                          >
                            {option.isCorrect ? '✓ Correct' : 'Set Correct'}
                          </button>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(qIndex, optIndex, 'text', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            />
                            {option.isCorrect && (
                              <input
                                type="text"
                                value={option.explanation}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, 'explanation', e.target.value)}
                                className="w-full mt-1 px-3 py-1 text-sm border border-green-200 dark:border-green-800 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Explanation for why this is correct (optional)"
                              />
                            )}
                          </div>
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, optIndex)}
                              className="mt-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Option
                    </button>
                  </div>
                  
                  {/* Nursing Concepts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nursing Concept *
                      </label>
                      <input
                        type="text"
                        value={question.nursingConcept}
                        onChange={(e) => handleQuestionChange(qIndex, 'nursingConcept', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Cardiac Output, Fluid Balance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Clinical Tip (Optional)
                      </label>
                      <input
                        type="text"
                        value={question.clinicalTip || ''}
                        onChange={(e) => handleQuestionChange(qIndex, 'clinicalTip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Remember to check for allergies before..."
                      />
                    </div>
                  </div>
                  
                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Detailed Explanation *
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Provide detailed explanation for the correct answer..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'Saving...' : (game ? 'Update Game' : 'Create Game')}
          {!saving && <Save className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
};

export default NursingGameForm;