// AdminContent.jsx - FIXED with proper courseId extraction
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
  Building
} from "lucide-react";

// Quiz Editor Component (same as before - keep it)
const StandaloneQuizEditor = ({ content, onClose, onSave, refreshContents }) => {
  // ... (keep the existing QuizEditor code - it's working fine)
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
          {/* Quiz Settings */}
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

          {/* Question Form */}
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

          {/* Questions List */}
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

// Main AdminContent Component - FIXED
const AdminContent = () => {
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [contents, setContents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
    programId: "",
    courseId: "",
    subjectId: "",
    isPaid: false,
    price: "",
    thumbnail: null,
  });

  // Fetch programs, courses, and subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, coursesRes, subjectsRes] = await Promise.all([
          axios.get("/programs"),
          axios.get("/courses"),
          axios.get("/subjects"),
        ]);
        setPrograms(programsRes.data);
        setCourses(coursesRes.data);
        setSubjects(subjectsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to fetch courses and subjects");
      }
    };
    fetchData();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await axios.get("/content");
      setContents(res.data);
    } catch (err) {
      console.error("Error fetching contents:", err);
      toast.error("Failed to fetch contents");
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  // Handle program change - fetch courses for selected program
  const handleProgramChange = async (programId) => {
    setForm(prev => ({ ...prev, programId, courseId: "", subjectId: "" }));
    if (programId) {
      try {
        const res = await axios.get(`/courses/program/${programId}`);
        setFilteredCourses(res.data || []);
      } catch (err) {
        console.error("Error fetching courses by program:", err);
        setFilteredCourses([]);
      }
    } else {
      setFilteredCourses([]);
    }
  };

  // Helper function to extract ID from object or string
  const extractId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return value._id;
    return value;
  };

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
      formData.append("subjectId", extractId(form.subjectId));
      const selectedSubject = subjects.find(s => s._id === form.subjectId);
      if (selectedSubject && selectedSubject.courseId) {
        // Extract the actual ID string, not the object
        const courseIdValue = extractId(selectedSubject.courseId);
        formData.append("courseId", courseIdValue);
        console.log("Adding courseId:", courseIdValue);
      } else {
        toast.error("Selected subject is not associated with a course");
        setLoading(false);
        return;
      }
    } else {
      // Extract the actual ID string for course
      const courseIdValue = extractId(form.courseId);
      formData.append("courseId", courseIdValue);
      console.log("Adding courseId from course:", courseIdValue);
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
        setContents((prev) => prev.map((c) => (c._id === editingId ? res.data : c)));
        toast.success("Content updated");
      } else {
        res = await axios.post("/content/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setContents((prev) => [res.data, ...prev]);
        toast.success("Uploaded successfully");
      }

      if (form.type === "quiz" && res.data) {
        setSelectedLesson(res.data);
        setShowQuizEditor(true);
      } else {
        resetForm();
      }
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
      programId: "",
      courseId: "",
      subjectId: "",
      isPaid: false,
      price: "",
      thumbnail: null,
    });
    setFile(null);
    setEditingId(null);
    setShowForm(false);
    setFilteredCourses([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) return;
    try {
      await axios.delete(`/content/${id}`);
      setContents((prev) => prev.filter((c) => c._id !== id));
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
      programId: content.courseId?.programId?._id || content.courseId?.programId || "",
      courseId: content.courseId?._id || content.courseId || "",
      subjectId: content.subjectId?._id || content.subjectId || "",
      isPaid: content.isPaid,
      price: content.price,
      thumbnail: null,
    });
    // Load filtered courses for the program
    if (content.courseId?.programId) {
      const programId = content.courseId.programId._id || content.courseId.programId;
      handleProgramChange(programId);
    }
    setFile(null);
    setShowForm(true);
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

  const getTypeColor = (type) => {
    switch(type) {
      case "video": return "from-blue-500 to-cyan-600";
      case "pdf": return "from-red-500 to-rose-600";
      case "image": return "from-green-500 to-emerald-600";
      case "quiz": return "from-purple-500 to-indigo-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Content Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload and manage learning materials, videos, PDFs, and quizzes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Upload Content"}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                placeholder="Enter content title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="video">🎥 Video</option>
                <option value="image">🖼 Image</option>
                <option value="pdf">📄 PDF</option>
                <option value="quiz">📝 Quiz</option>
              </select>

              <select
                value={form.linkType}
                onChange={(e) => setForm({ ...form, linkType: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="subject">Attach to Subject</option>
                <option value="course">Attach to Course</option>
              </select>
            </div>

            {/* Program Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={form.programId}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Program</option>
                    {programs.filter(p => p.isActive !== false).map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.code ? `(${p.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    disabled={!form.programId}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Course</option>
                    {filteredCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {form.linkType === "subject" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Subject</option>
                    {subjects
                      .filter(s => !form.courseId || s.courseId === form.courseId || s.courseId?._id === form.courseId)
                      .map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            ) : null}

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
                    Content File
                  </label>
                  <input
                    type="file"
                    accept="video/*,image/*,application/pdf"
                    onChange={(e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile) {
                        const maxSize = form.type === 'video' ? 100 * 1024 * 1024 : 
                                       form.type === 'pdf' ? 50 * 1024 * 1024 : 
                                       10 * 1024 * 1024;
                        if (selectedFile.size > maxSize) {
                          toast.error(`${form.type.toUpperCase()} file too large! Maximum ${maxSize / (1024 * 1024)}MB`);
                          e.target.value = null;
                          return;
                        }
                        setFile(selectedFile);
                      }
                    }}
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
                    onChange={(e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
                        toast.error("Thumbnail too large! Maximum size is 5MB");
                        e.target.value = null;
                        return;
                      }
                      setForm({ ...form, thumbnail: selectedFile });
                    }}
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
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
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                Upload Content
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <div
                key={content._id}
                onClick={() => openViewer(content)}
                className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className={`relative h-44 w-full bg-gradient-to-br ${getTypeColor(content.type)}`}>
                  {content.type === "quiz" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <HelpCircle className="text-white/80 text-5xl mb-2" />
                      <span className="text-white font-medium text-sm">Quiz Content</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={content.thumbnailUrl || "/api/placeholder/400/200"}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        alt={content.title}
                        onError={(e) => { e.target.src = "/api/placeholder/400/200"; }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-12 w-12 text-white" />
                      </div>
                    </>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 rounded-lg text-white text-xs flex items-center gap-1">
                    {getTypeIcon(content.type)}
                    <span className="capitalize">{content.type}</span>
                  </div>

                  {/* Price Badge */}
                  {content.isPaid && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ₵{content.price}
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {content.title}
                  </h3>
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="capitalize">{content.type}</span>
                    <span>•</span>
                    <span>{content.subjectId?.name || content.courseId?.name || "Unlinked"}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(content);
                      }}
                      className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(content._id);
                      }}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                    {content.type !== "quiz" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLesson(content);
                          setShowQuizEditor(true);
                        }}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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