import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { 
  FaEdit, 
  FaTrash, 
  FaRobot, 
  FaSave, 
  FaPlus, 
  FaUpload,
  FaFileAlt,
  FaDatabase,
  FaBrain,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaFilter
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const AIAdmin = () => {
  const [socket, setSocket] = useState(null);
  const [question, setQuestion] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewText, setPreviewText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef(null);

  // ================= DARK MODE =================
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ================= SOCKET =================
  useEffect(() => {
    const newSocket = io("https://alveoly-apexprep-eqmi.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("🟢 Admin Connected:", newSocket.id);
      toast.success("Connected to real-time updates");
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    const fetchQA = async () => {
      try {
        const res = await axios.get("/ai/all-admin");
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load knowledge base");
      }
    };
    fetchQA();
  }, []);

  // ================= SOCKET EVENTS =================
  useEffect(() => {
    if (!socket) return;

    socket.on("newQA", (qa) => {
      setHistory((prev) => [qa, ...prev]);
      toast.success("New QA added");
    });

    socket.on("updateQA", (qa) => {
      setHistory((prev) =>
        prev.map((item) => (item.id === qa.id ? qa : item))
      );
      toast.success("QA updated");
    });

    socket.on("deleteQA", (id) => {
      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success("QA deleted");
    });

    return () => {
      socket.off("newQA");
      socket.off("updateQA");
      socket.off("deleteQA");
    };
  }, [socket]);

  // ================= SAVE =================
  const handleSave = async () => {
    if (!question.trim() || !manualAnswer.trim()) {
      toast.error("Please fill in both question and answer");
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`/ai/update/${editingId}`, {
          question,
          answer: manualAnswer,
        });
        setEditingId(null);
        toast.success("QA updated successfully!");
      } else {
        await axios.post("/ai/admin-ask", {
          question,
          manualAnswer,
        });
        toast.success("QA added to knowledge base!");
      }

      setQuestion("");
      setManualAnswer("");
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to save QA");
    }

    setLoading(false);
  };

  // ================= EDIT =================
  const handleEdit = (qa) => {
    setQuestion(qa.question);
    setManualAnswer(qa.answer);
    setEditingId(qa.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Editing mode activated");
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this QA?")) return;
    try {
      await axios.delete(`/ai/delete/${id}`);
      toast.success("QA deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete QA");
    }
  };

  // ================= CANCEL EDIT =================
  const handleCancelEdit = () => {
    setEditingId(null);
    setQuestion("");
    setManualAnswer("");
    toast.success("Edit cancelled");
  };

  // ================= FILE UPLOAD =================
  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      toast.loading("Uploading and processing file...", { id: "upload" });

      const res = await axios.post("/ai/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPreviewText(res.data.extractedText || "No text returned");

      const updated = await axios.get("/ai/all-admin");
      setHistory(updated.data);

      toast.success(res.data.message || "Upload successful", { id: "upload" });

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      setPreviewText("❌ Failed to extract text");
      toast.error(err.response?.data?.message || "Upload failed", { id: "upload" });
    }

    setUploading(false);
  };

  // Filter history based on search
  const filteredHistory = history.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            borderRadius: "16px",
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm">
            <FaBrain className="text-indigo-600 dark:text-indigo-400 text-sm" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            AI Knowledge Base
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
            Train and manage the AI assistant with custom Q&A pairs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT: Training Panel */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {editingId ? <FaEdit className="text-white text-lg" /> : <FaRobot className="text-white text-lg" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingId ? "Edit QA" : "Train AI Assistant"}
                    </h2>
                    <p className="text-white/70 text-sm">
                      {editingId ? "Modify existing knowledge" : "Add new Q&A to knowledge base"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Question Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Question
                  </label>
                  <textarea
                    placeholder="Enter a question students might ask..."
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>

                {/* Answer Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Answer
                  </label>
                  <textarea
                    placeholder="Provide a comprehensive answer..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    value={manualAnswer}
                    onChange={(e) => setManualAnswer(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin w-4 h-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {editingId ? <FaSave className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
                        {editingId ? "Update QA" : "Add to Knowledge Base"}
                      </>
                    )}
                  </button>
                  
                  {editingId && (
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* File Upload Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <FaUpload className="text-emerald-500" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">Batch Upload</h3>
                    <span className="text-xs text-slate-400">(PDF, CSV, Images)</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block w-full">
                        <div className="relative cursor-pointer">
                          <div className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-center bg-slate-50 dark:bg-slate-800/50">
                            <FaFileAlt className="mx-auto text-2xl text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {file ? file.name : "Click to select file"}
                            </span>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.csv,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files[0])}
                          />
                        </div>
                      </label>
                    </div>
                    <button
                      onClick={handleFileUpload}
                      disabled={uploading || !file}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <FaSpinner className="animate-spin w-4 h-4" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload className="w-4 h-4" />
                          Process File
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Preview Text */}
                {previewText && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheckCircle className="text-emerald-500 text-sm" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Extracted Text Preview</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
                      {previewText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Knowledge Base */}
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Knowledge Base</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {filteredHistory.length} Q&A {filteredHistory.length !== 1 ? 'pairs' : 'pair'} in database
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search Q&A..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all w-64"
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center mx-auto mb-4">
                  <FaDatabase className="w-10 h-10 text-indigo-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">No training data yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add Q&A pairs to train the AI</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Q</span>
                          </span>
                          <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                            {item.question}
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2 ml-8">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">A</span>
                          </span>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all text-sm"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all text-sm"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46a2 100%);
        }
      `}</style>
    </div>
  );
};

export default AIAdmin;