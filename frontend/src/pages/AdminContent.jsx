// AdminContent.jsx - Complete updated with topic-based organization
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
  Building,
  List,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  FolderTree,
  Layers,
  Hash,
  Tag,
  ArrowLeft,
  Home
} from "lucide-react";

// ================= QUIZ EDITOR COMPONENT =================
const StandaloneQuizEditor = ({ content, onClose, onSave, refreshContents }) => {
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

// ================= CONTENT CARD COMPONENT (moved outside) =================
const ContentCard = ({ 
  content, 
  onView, 
  onEdit, 
  onDelete, 
  getTypeIcon, 
  getTypeColor, 
  getTopicName,
  onAddQuiz 
}) => {
  const subjectId = content.subjectId?._id || content.subjectId;
  
  return (
    <div
      onClick={() => onView(content)}
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
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
          <span className="capitalize">{content.type}</span>
          <span>•</span>
          <span>{content.subjectId?.name || "Unlinked"}</span>
          {content.topicId && (
            <>
              <span>•</span>
              <span className="text-purple-600 dark:text-purple-400">
                {getTopicName(subjectId, content.topicId)}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(content);
            }}
            className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(content._id);
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
                onAddQuiz(content);
              }}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ================= MAIN ADMIN CONTENT COMPONENT =================
const AdminContent = () => {
  // Data state
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [file, setFile] = useState(null);
  
  // Navigation state - hierarchical browsing
  const [navigation, setNavigation] = useState({
    view: 'subjects', // 'subjects' | 'topics' | 'content'
    programId: null,
    courseId: null,
    subjectId: null,
    topicId: null,
  });
  
  // Expanded state for UI
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  // Form state
  const [form, setForm] = useState({
    title: "",
    type: "video",
    programId: "",
    courseId: "",
    subjectId: "",
    topicId: "",
    isPaid: false,
    price: "",
    thumbnail: null,
  });

  // Viewer state
  const [viewer, setViewer] = useState({
    open: false,
    type: "",
    url: "",
    title: "",
  });

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, coursesRes, subjectsRes] = await Promise.all([
          axios.get("/programs"),
          axios.get("/courses"),
          axios.get("/subjects"),
        ]);
        setPrograms(programsRes.data || []);
        setCourses(coursesRes.data || []);
        setSubjects(subjectsRes.data || []);
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
      const res = await axios.get("/content");
      console.log("📚 Fetched contents:", res.data);
      setContents(res.data || []);
    } catch (err) {
      console.error("Error fetching contents:", err);
      toast.error("Failed to fetch contents");
    }
  };

  // ================= NAVIGATION HELPERS =================
  const getProgramName = (id) => {
    const program = programs.find(p => p._id === id);
    return program?.name || "Unknown Program";
  };

  const getCourseName = (id) => {
    const course = courses.find(c => c._id === id);
    return course?.name || "Unknown Course";
  };

  const getSubjectName = (id) => {
    const subject = subjects.find(s => s._id === id);
    return subject?.name || "Unknown Subject";
  };

  const getTopicName = (subjectId, topicId) => {
    const subject = subjects.find(s => s._id === subjectId);
    const topic = subject?.topics?.find(t => t._id === topicId);
    return topic?.name || "Unknown Topic";
  };

  const getSubjectTopics = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.topics || [];
  };

  const getContentsForTopic = (subjectId, topicId) => {
    return contents.filter(c => {
      const contentSubjectId = c.subjectId?._id || c.subjectId;
      return contentSubjectId === subjectId && c.topicId === topicId;
    });
  };

  const getContentsForSubject = (subjectId) => {
    return contents.filter(c => {
      const contentSubjectId = c.subjectId?._id || c.subjectId;
      return contentSubjectId === subjectId;
    });
  };

  // ================= NAVIGATION ACTIONS =================
  const navigateToSubjects = () => {
    setNavigation({
      view: 'subjects',
      programId: null,
      courseId: null,
      subjectId: null,
      topicId: null,
    });
  };

  const navigateToTopics = (subjectId) => {
    setNavigation({
      view: 'topics',
      programId: navigation.programId,
      courseId: navigation.courseId,
      subjectId: subjectId,
      topicId: null,
    });
  };

  const navigateToContent = (subjectId, topicId = null) => {
    setNavigation({
      view: 'content',
      programId: navigation.programId,
      courseId: navigation.courseId,
      subjectId: subjectId,
      topicId: topicId,
    });
  };

  // ================= FORM HANDLING =================
  const handleProgramChange = async (programId) => {
    setForm(prev => ({ ...prev, programId, courseId: "", subjectId: "", topicId: "" }));
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

  const extractId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return value._id;
    return value;
  };

  const toggleSubjectExpanded = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const toggleTopicExpanded = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  // ================= CONTENT CRUD =================
  const handleUpload = async () => {
    if (!form.title) {
      toast.error("Please enter a title");
      return;
    }

    if (!form.subjectId) {
      toast.error("Please select a subject");
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

    // Add subject and topic
    formData.append("subjectId", extractId(form.subjectId));
    if (form.topicId) {
      formData.append("topicId", extractId(form.topicId));
      console.log("📌 Adding topicId to upload:", form.topicId);
    }

    // Get course from subject
    const selectedSubject = subjects.find(s => s._id === form.subjectId);
    if (selectedSubject && selectedSubject.courseId) {
      const courseIdValue = extractId(selectedSubject.courseId);
      formData.append("courseId", courseIdValue);
    } else {
      toast.error("Selected subject is not associated with a course");
      setLoading(false);
      return;
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
        console.log("✅ Upload response:", res.data);
        setContents((prev) => [res.data, ...prev]);
        toast.success("Uploaded successfully");
      }

      if (form.type === "quiz" && res.data) {
        setSelectedLesson(res.data);
        setShowQuizEditor(true);
      } else {
        resetForm();
        fetchContents();
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
      programId: "",
      courseId: "",
      subjectId: "",
      topicId: "",
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
      fetchContents();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleEdit = (content) => {
    setEditingId(content._id);
    const subjectId = content.subjectId?._id || content.subjectId;
    const subject = subjects.find(s => s._id === subjectId);
    
    setForm({
      title: content.title,
      type: content.type,
      programId: subject?.programId?._id || subject?.programId || "",
      courseId: content.courseId?._id || content.courseId || "",
      subjectId: subjectId || "",
      topicId: content.topicId || "",
      isPaid: content.isPaid,
      price: content.price,
      thumbnail: null,
    });
    
    if (subject?.programId) {
      const programId = subject.programId._id || subject.programId;
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

  // ================= UI HELPERS =================
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

  // ================= RENDER FUNCTIONS =================
  
  // Render subjects view
  const renderSubjectsView = () => {
    // Get unique subjects that have content
    const subjectsWithContent = subjects.filter(s => {
      return contents.some(c => {
        const contentSubjectId = c.subjectId?._id || c.subjectId;
        return contentSubjectId === s._id;
      });
    });

    if (subjectsWithContent.length === 0) {
      return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex flex-col items-center">
            <FolderOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Content Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Upload your first learning material to get started. Content will be organized by subject and topic.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              Upload Content
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjectsWithContent.map((subject) => {
          const subjectContents = getContentsForSubject(subject._id);
          const topics = subject.topics || [];
          const topicCount = topics.length;
          const contentCount = subjectContents.length;

          return (
            <div
              key={subject._id}
              onClick={() => navigateToTopics(subject._id)}
              className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                      {subject.name}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{contentCount} content items</span>
                    </div>
                    {topicCount > 0 && (
                      <div className="flex items-center gap-2">
                        <List className="h-3.5 w-3.5" />
                        <span>{topicCount} topics</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render topics view
  const renderTopicsView = () => {
    const subject = subjects.find(s => s._id === navigation.subjectId);
    if (!subject) {
      return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Subject not found</p>
        </div>
      );
    }

    const topics = subject.topics || [];
    const uncategorizedContent = getContentsForSubject(subject._id).filter(c => !c.topicId);

    return (
      <div className="space-y-4">
        {/* Subject header */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {subject.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {topics.length} topics • {getContentsForSubject(subject._id).length} content items
              </p>
            </div>
            <button
              onClick={() => navigateToContent(subject._id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              View All Content
            </button>
          </div>
        </div>

        {/* Topics grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const topicContents = getContentsForTopic(subject._id, topic._id);
            const isExpanded = expandedTopics[topic._id];

            return (
              <div
                key={topic._id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleTopicExpanded(topic._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-purple-500" />
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {topic.name}
                        </h3>
                      </div>
                      {topic.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{topicContents.length} content items</span>
                      </div>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Topic content list */}
                {isExpanded && topicContents.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/30">
                    <div className="space-y-2">
                      {topicContents.map((content) => (
                        <ContentCard
                          key={content._id}
                          content={content}
                          onView={openViewer}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          getTypeIcon={getTypeIcon}
                          getTypeColor={getTypeColor}
                          getTopicName={getTopicName}
                          onAddQuiz={setSelectedLesson}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && topicContents.length === 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/30">
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                      No content in this topic yet
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm({
                          ...form,
                          subjectId: subject._id,
                          topicId: topic._id,
                          programId: subject.programId?._id || subject.programId || "",
                          courseId: subject.courseId?._id || subject.courseId || "",
                        });
                        setShowForm(true);
                      }}
                      className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Content to this Topic
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Uncategorized content */}
        {uncategorizedContent.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-yellow-500" />
              Uncategorized Content
            </h3>
            <div className="space-y-2">
              {uncategorizedContent.map((content) => (
                <ContentCard
                  key={content._id}
                  content={content}
                  onView={openViewer}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getTypeIcon={getTypeIcon}
                  getTypeColor={getTypeColor}
                  getTopicName={getTopicName}
                  onAddQuiz={setSelectedLesson}
                />
              ))}
            </div>
          </div>
        )}

        {topics.length === 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
            <div className="flex flex-col items-center">
              <List className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Topics Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                This subject doesn't have any topics. Add topics in the Subject Management section.
              </p>
              <button
                onClick={() => window.location.href = "/admin/subjects"}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
              >
                Manage Subjects
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render content list view
  const renderContentView = () => {
    const subject = subjects.find(s => s._id === navigation.subjectId);
    const topicName = navigation.topicId ? getTopicName(navigation.subjectId, navigation.topicId) : null;
    
    let filteredContents = getContentsForSubject(navigation.subjectId);
    if (navigation.topicId) {
      filteredContents = filteredContents.filter(c => c.topicId === navigation.topicId);
    }

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {subject?.name || "Unknown Subject"}
              </h2>
              {topicName && (
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Topic: {topicName}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredContents.length} content items
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigateToTopics(navigation.subjectId)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Topics
              </button>
              <button
                onClick={() => {
                  setForm({
                    ...form,
                    subjectId: navigation.subjectId,
                    topicId: navigation.topicId || "",
                    programId: subject?.programId?._id || subject?.programId || "",
                    courseId: subject?.courseId?._id || subject?.courseId || "",
                  });
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Content
              </button>
            </div>
          </div>
        </div>

        {/* Content grid */}
        {filteredContents.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
            <div className="flex flex-col items-center">
              <File className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Content Here
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {topicName 
                  ? `No content in "${topicName}" yet. Upload your first learning material.`
                  : "No content in this subject yet. Upload your first learning material."}
              </p>
              <button
                onClick={() => {
                  setForm({
                    ...form,
                    subjectId: navigation.subjectId,
                    topicId: navigation.topicId || "",
                    programId: subject?.programId?._id || subject?.programId || "",
                    courseId: subject?.courseId?._id || subject?.courseId || "",
                  });
                  setShowForm(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Upload Content
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredContents.map((content) => (
              <ContentCard
                key={content._id}
                content={content}
                onView={openViewer}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                getTopicName={getTopicName}
                onAddQuiz={setSelectedLesson}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ================= MAIN RENDER =================
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
            Organize learning materials by subject and topic for easy access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={navigateToSubjects}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            All Subjects
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "Upload Content"}
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button onClick={navigateToSubjects} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Subjects
        </button>
        {navigation.subjectId && (
          <>
            <ChevronRight className="h-3 w-3" />
            <button 
              onClick={() => navigateToTopics(navigation.subjectId)} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {getSubjectName(navigation.subjectId)}
            </button>
          </>
        )}
        {navigation.topicId && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-purple-600 dark:text-purple-400">
              {getTopicName(navigation.subjectId, navigation.topicId)}
            </span>
          </>
        )}
        {navigation.view === 'content' && !navigation.topicId && navigation.subjectId && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>All Content</span>
          </>
        )}
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
                Title <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter content title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content Type <span className="text-red-500">*</span>
                </label>
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
              </div>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={form.subjectId}
                  onChange={(e) => {
                    const subjectId = e.target.value;
                    const subject = subjects.find(s => s._id === subjectId);
                    setForm({
                      ...form,
                      subjectId,
                      topicId: "",
                      programId: subject?.programId?._id || subject?.programId || "",
                      courseId: subject?.courseId?._id || subject?.courseId || "",
                    });
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => {
                    const topicCount = s.topics?.length || 0;
                    return (
                      <option key={s._id} value={s._id}>
                        {s.name} {topicCount > 0 ? `(${topicCount} topics)` : '(No topics)'}
                      </option>
                    );
                  })}
                </select>
              </div>
              {form.subjectId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Course: {getCourseName(form.courseId)} • Program: {getProgramName(form.programId)}
                </p>
              )}
            </div>

            {/* Topic Selection */}
            {form.subjectId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic (Optional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={form.topicId}
                    onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">No specific topic (uncategorized)</option>
                    {getSubjectTopics(form.subjectId).map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {topic.name} {topic.description ? `- ${topic.description}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Tip: Assigning content to a topic makes it easier for students to find
                </p>
              </div>
            )}

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
                    Content File <span className="text-red-500">*</span>
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

      {/* Content Display based on navigation */}
      {navigation.view === 'subjects' && renderSubjectsView()}
      {navigation.view === 'topics' && renderTopicsView()}
      {navigation.view === 'content' && renderContentView()}

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