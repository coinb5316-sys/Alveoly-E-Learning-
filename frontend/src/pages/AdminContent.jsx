// AdminContent.jsx - Admin sees ALL content with same card layout as Lecturer
import { useEffect, useState } from "react";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  PlayCircle,
  FileText,
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  Video,
  Image,
  File,
  X,
  Upload,
  BookOpen,
  GraduationCap,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Zap,
  Eye,
  Copy,
  Save,
  CircleHelp,
  Search,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

// Quiz Editor Component (same as before)
const StandaloneQuizEditor = ({ content, onClose, onSave, refreshContents }) => {
  // ... (keep your existing StandaloneQuizEditor component exactly as is)
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(content?.quizTimerMinutes || 0);
  const [passMark, setPassMark] = useState(content?.quizPassMark || 70);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    rationale: "",
    points: 1,
  });

  useEffect(() => {
    if (content?._id) {
      fetchExistingQuestions();
    }
  }, [content]);

  const fetchExistingQuestions = async () => {
    try {
      const res = await axios.get(`/lesson-quiz/lesson/${content._id}`);
      if (res.data && res.data.length) {
        setQuestions(res.data);
        if (res.data[0]?.timerMinutes) {
          setTimerMinutes(res.data[0].timerMinutes);
        }
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to fetch existing questions");
    }
  };

  const resetForm = () => {
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      rationale: "",
      points: 1,
    });
    setEditingIndex(null);
  };

  const handleEditQuestion = (index) => {
    const questionToEdit = questions[index];
    setCurrentQuestion({
      question: questionToEdit.question,
      options: [...questionToEdit.options],
      correctAnswer: questionToEdit.correctAnswer,
      rationale: questionToEdit.rationale || "",
      points: questionToEdit.points || 1,
    });
    setEditingIndex(index);
    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const addOrUpdateQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast.error("Please fill all options");
      return;
    }
    if (!currentQuestion.correctAnswer) {
      toast.error("Please select correct answer");
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = {
        ...updatedQuestions[editingIndex],
        question: currentQuestion.question,
        options: [...currentQuestion.options],
        correctAnswer: currentQuestion.correctAnswer,
        rationale: currentQuestion.rationale,
        points: currentQuestion.points,
      };
      setQuestions(updatedQuestions);
      toast.success("Question updated successfully!");
    } else {
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
      toast.success("Question added successfully!");
    }
    
    resetForm();
  };

  const removeQuestion = (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((_, i) => i !== index));
      if (editingIndex === index) {
        resetForm();
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
      toast.success("Question deleted");
    }
  };

  const saveQuiz = async () => {
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setLoading(true);
    try {
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale || "",
        points: q.points || 1,
      }));

      await axios.put(`/content/${content._id}`, {
        title: content.title,
        quizTimerMinutes: timerMinutes,
        quizPassMark: passMark,
      });

      await axios.post("/lesson-quiz/save", {
        lessonId: content._id,
        questions: formattedQuestions,
        timerMinutes: timerMinutes,
      });

      toast.success(`✅ Saved ${questions.length} questions for "${content.title}"!`);
      onSave?.();
      if (refreshContents) refreshContents();
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quiz Editor: {content?.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {questions.length} question(s) | Total Points: {totalPoints}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Quiz Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timer (minutes)
                </label>
                <select
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="0">No timer</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pass Mark (%)
                </label>
                <input
                  type="number"
                  value={passMark}
                  onChange={(e) => setPassMark(Math.min(100, Math.max(0, parseInt(e.target.value) || 70)))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          <div id="question-form" className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              {editingIndex !== null ? <Edit className="h-5 w-5 text-yellow-500" /> : <Plus className="h-5 w-5 text-blue-500" />}
              {editingIndex !== null ? "Edit Question" : "Add New Question"}
            </h3>
            
            <textarea
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              placeholder="Enter your question here..."
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none mb-3"
            />

            <div className="space-y-2 mb-3">
              {currentQuestion.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="flex-shrink-0 w-10 h-11 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold text-gray-600 dark:text-gray-400">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...currentQuestion.options];
                      newOpts[idx] = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, options: newOpts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <select
                value={currentQuestion.correctAnswer}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Correct Answer</option>
                {currentQuestion.options.map((_, idx) => (
                  <option key={idx} value={String.fromCharCode(65 + idx)}>
                    {String.fromCharCode(65 + idx)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                placeholder="Points"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                min="1"
              />
            </div>

            <textarea
              value={currentQuestion.rationale}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, rationale: e.target.value })}
              placeholder="Rationale (explanation for correct answer)"
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none mb-3"
            />

            <div className="flex gap-3">
              <button
                onClick={addOrUpdateQuestion}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  editingIndex !== null 
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700" 
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                } text-white shadow-lg`}
              >
                {editingIndex !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingIndex !== null ? "Update Question" : "Add Question"}
              </button>
              
              {editingIndex !== null && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Questions List</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Points: {totalPoints}</span>
            </div>
            
            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No questions added yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first question above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{idx + 1}.</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{q.question}</span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                            {q.points || 1} pt{(q.points || 1) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {q.options.map((opt, i) => (
                            <p key={i} className={`text-sm ${String.fromCharCode(65 + i) === q.correctAnswer ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-600 dark:text-gray-400"}`}>
                              {String.fromCharCode(65 + i)}. {opt}
                              {String.fromCharCode(65 + i) === q.correctAnswer && " ✓"}
                            </p>
                          ))}
                        </div>
                        {q.rationale && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-6 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                            💡 {q.rationale}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditQuestion(idx)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeQuestion(idx)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all">
            Cancel
          </button>
          <button
            onClick={saveQuiz}
            disabled={loading || questions.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Saving..." : `Save Quiz (${questions.length} questions)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main AdminContent Component - Same UI as Lecturer but fetches ALL content
const AdminContent = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [contents, setContents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ type: "", search: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
  });

  const [form, setForm] = useState({
    title: "",
    type: "video",
    linkType: "subject",
    courseId: "",
    subjectId: "",
    isPaid: false,
    price: "",
    thumbnail: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, s] = await Promise.all([
          axios.get("/courses"),
          axios.get("/subjects"),
        ]);
        setCourses(c.data);
        setSubjects(s.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to fetch courses and subjects");
      }
    };
    fetchData();
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append("type", filter.type);
      if (filter.search) params.append("search", filter.search);
      
      const res = await axios.get(`/content?${params.toString()}`);
      setContents(res.data);
    } catch (err) {
      console.error("Error fetching contents:", err);
      toast.error("Failed to fetch contents");
    }
  };

  useEffect(() => {
    fetchContents();
  }, [filter]);

  const handleUpload = async () => {
    if (!form.title) {
      toast.error("Please enter a title");
      return;
    }

    if (form.linkType === "subject" && !form.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    
    if (form.linkType === "course" && !form.courseId) {
      toast.error("Please select a course");
      return;
    }

    if (form.type !== "quiz" && !file && !editingId) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    
    if (file && form.type !== "quiz") {
      formData.append("file", file);
    }
    
    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

    if (form.linkType === "subject") {
      formData.append("subjectId", form.subjectId);
      const selectedSubject = subjects.find(s => s._id === form.subjectId);
      if (selectedSubject && selectedSubject.courseId) {
        formData.append("courseId", selectedSubject.courseId);
      } else {
        toast.error("Selected subject is not associated with a course");
        setLoading(false);
        return;
      }
    } else {
      formData.append("courseId", form.courseId);
    }

    formData.append("isPaid", form.isPaid);
    formData.append("price", form.price);

    if (form.type === "quiz") {
      formData.append("quizTimerMinutes", "0");
      formData.append("quizPassMark", "70");
    }

    try {
      let res;
      if (editingId) {
        res = await axios.put(`/content/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Content updated");
      } else {
        res = await axios.post("/content/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Uploaded successfully");
      }

      fetchContents();

      if (form.type === "quiz" && res.data) {
        setSelectedLesson(res.data);
        setShowQuizEditor(true);
      }

      resetForm();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      type: "video",
      linkType: "subject",
      courseId: "",
      subjectId: "",
      isPaid: false,
      price: "",
      thumbnail: null,
    });
    setFile(null);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/content/${id}`);
      fetchContents();
      setShowDeleteModal(null);
      toast.success("Content deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleEdit = (content) => {
    setEditingId(content._id);
    setForm({
      title: content.title,
      type: content.type,
      linkType: content.subjectId ? "subject" : "course",
      courseId: content.courseId || "",
      subjectId: content.subjectId || "",
      isPaid: content.isPaid,
      price: content.price,
      thumbnail: null,
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openViewer = (c) => {
    if (c.type === "quiz") {
      setSelectedLesson(c);
      setShowQuizEditor(true);
      return;
    }
    setViewer({
      open: true,
      type: c.type,
      url: c.fileUrl,
      title: c.title,
    });
  };

  const closeViewer = () => {
    setViewer({ open: false, type: "", url: "", title: "" });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "video": return <Video className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      case "image": return <Image className="h-4 w-4" />;
      case "quiz": return <HelpCircle className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      video: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      pdf: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      image: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      quiz: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
    };
    return badges[type] || "bg-gray-100 dark:bg-gray-800 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Content Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all learning materials, videos, PDFs, and quizzes
          </p>
        </div>
        <button
          onClick={() => document.getElementById('upload-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Upload Content
        </button>
      </div>

      {/* Filters - Same as Lecturer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Types</option>
            <option value="video">Videos</option>
            <option value="image">Images</option>
            <option value="pdf">PDFs</option>
            <option value="quiz">Quizzes</option>
          </select>
        </div>
        <button
          onClick={() => setFilter({ type: "", search: "" })}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Upload Form - Same as what Lecturer Content Form should have */}
      <div id="upload-form" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {editingId ? "Edit Content" : "Upload New Content"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {editingId ? "Update your existing content" : "Add new learning materials to the platform"}
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                placeholder="Enter content title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Type *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["video", "image", "pdf", "quiz"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      form.type === type
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={form.linkType}
              onChange={(e) => setForm({ ...form, linkType: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="subject">Attach to Subject</option>
              <option value="course">Attach to Course</option>
            </select>

            {form.linkType === "subject" ? (
              <select
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            ) : (
              <select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.isPaid}
                onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Premium Content
            </label>
            {form.isPaid && (
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="pl-10 pr-4 py-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            )}
          </div>

          {form.type !== "quiz" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content File *
                </label>
                <input
                  type="file"
                  accept="video/*,image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thumbnail (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}

          {form.type === "quiz" && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                    Quiz Content Created
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-0.5">
                    After creating the quiz, you'll be able to add questions, set timer, and configure pass mark.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {loading ? "Processing..." : (editingId ? "Update Content" : "Upload Content")}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Content List - Same UI but fetches ALL content */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Library</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{contents.length} items</span>
        </div>

        {contents.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <File className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Content Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Upload your first learning material to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {contents.map((content) => (
              <div
                key={content._id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex-shrink-0 overflow-hidden">
                      {content.thumbnailUrl ? (
                        <img
                          src={content.thumbnailUrl}
                          className="w-full h-full object-cover"
                          alt={content.title}
                          onError={(e) => { e.target.src = "/api/placeholder/400/200"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getTypeIcon(content.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {content.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadge(content.type)} capitalize`}>
                          {content.type}
                        </span>
                        {content.isPaid && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700">
                            ₵{content.price}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(content.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {content.subjectId?.name || content.courseId?.name || "Unlinked"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* After the subject info, add lecturer info */}
<div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
  <GraduationCap className="h-3 w-3" />
  <span>By: {content.lecturerName || "Admin"}</span>
</div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openViewer(content)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleEdit(content)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(content)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete Content
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{showDeleteModal.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Viewer */}
      {viewer.open && viewer.type !== "quiz" && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 text-white bg-black/50 flex-shrink-0">
            <h3 className="text-lg font-semibold">{viewer.title}</h3>
            <button onClick={closeViewer} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            {viewer.type === "video" && (
              <video src={viewer.url} controls autoPlay className="max-w-full max-h-full rounded-lg" />
            )}
            {viewer.type === "image" && (
              <img src={viewer.url} alt={viewer.title} className="max-w-full max-h-full rounded-lg" />
            )}
            {viewer.type === "pdf" && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(viewer.url)}&embedded=true`}
                title={viewer.title}
                className="w-full h-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}

      {/* Quiz Editor Modal */}
      {showQuizEditor && selectedLesson && (
        <StandaloneQuizEditor
          content={selectedLesson}
          onClose={() => {
            setShowQuizEditor(false);
            setSelectedLesson(null);
          }}
          onSave={() => {
            fetchContents();
          }}
          refreshContents={fetchContents}
        />
      )}
    </div>
  );
};

export default AdminContent;