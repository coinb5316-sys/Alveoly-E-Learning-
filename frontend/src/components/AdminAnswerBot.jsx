import React, { useEffect, useState } from "react";
// ✅ IMPORT your configured API instance (NOT plain axios)
import API from "../api/axios";
import socket, {
  onUnansweredQuestion,
  onQaUpdated,
  sendAdminAnswer,
  refreshAnswerBotCache,
} from "../services/answerSocket";

export default function AdminAnswerBot() {
  const [open, setOpen] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [qText, setQText] = useState("");
  const [aText, setAText] = useState("");
  const [tab, setTab] = useState("incoming");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Identify as admin
    socket.emit("identify_user", { role: "admin" });

    fetchList();
    onUnansweredQuestion((q) => setIncoming((prev) => [q, ...prev]));
    onQaUpdated(fetchList);

    return () => {
      socket.off("unanswered_question");
      socket.off("qa_updated");
    };
  }, []);

  async function fetchList() {
    try {
      const res = await API.get("/api/admin/qa/list");
      if (res.data?.ok) setQaList(res.data.list);
    } catch (err) {
      console.error("Fetch list error:", err);
      if (err.response?.status === 401) {
        console.log("Authentication required - please log in again");
      }
    }
  }

  async function saveQa() {
    if (!qText.trim() || !aText.trim()) return alert("Please fill both fields");
    setLoading(true);
    try {
      if (editId) {
        await API.put(`/api/admin/qa/update/${editId}`, { question: qText, answer: aText });
        setEditId(null);
      } else {
        await API.post("/api/admin/qa/add", { question: qText, answer: aText });
      }
      setQText("");
      setAText("");
      await fetchList();
      refreshAnswerBotCache();
      alert(`Q&A ${editId ? "updated" : "added"} successfully`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save Q&A");
    } finally {
      setLoading(false);
    }
  }

  async function deleteQa(id) {
    if (!window.confirm("Are you sure you want to delete this Q&A?")) return;
    try {
      await API.delete(`/api/admin/qa/delete/${id}`);
      await fetchList();
      refreshAnswerBotCache();
      alert("Q&A deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete Q&A");
    }
  }

  function replyTo(socketId, text) {
    if (!text || !socketId) return;
    sendAdminAnswer({ toSocketId: socketId, answer: text });
    setIncoming((prev) => prev.filter((x) => x.socketId !== socketId));
  }

  function editQa(qa) {
    setQText(qa.question);
    setAText(qa.answer);
    setEditId(qa._id);
    setTab("add");
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl"
      >
        ⚙️
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🤖</span>
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Answer Control
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ✖
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 gap-2">
              {[
                { id: "incoming", label: "Incoming", icon: "📥", badge: incoming.length },
                { id: "add", label: "Add Q&A", icon: "➕" },
                { id: "library", label: "Library", icon: "📚", badge: qaList.length }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`px-4 py-3 font-medium text-sm transition-all duration-200 relative flex items-center gap-2 ${
                    tab === item.id
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {/* Incoming Tab */}
              {tab === "incoming" && (
                <div className="space-y-4">
                  {incoming.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎉</div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No new questions</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">All caught up!</p>
                    </div>
                  ) : (
                    incoming.map((inc, i) => (
                      <div
                        key={i}
                        className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 animate-in slide-in-from-right-4"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                              {inc.userName?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">
                                {inc.userName || "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(inc.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const answer = window.prompt("Write your answer:", "");
                                if (answer) replyTo(inc.socketId, answer);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                            >
                              💬 Reply
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 pl-10">{inc.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Add/Edit Tab */}
              {tab === "add" && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter question here..."
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Answer
                    </label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="5"
                      placeholder="Enter answer here..."
                      value={aText}
                      onChange={(e) => setAText(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveQa}
                      disabled={loading}
                      className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {loading ? "Saving..." : (editId ? "✏️ Update Q&A" : "➕ Add Q&A")}
                    </button>
                    {editId && (
                      <button
                        onClick={() => {
                          setEditId(null);
                          setQText("");
                          setAText("");
                        }}
                        className="px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Library Tab */}
              {tab === "library" && (
                <div className="space-y-4">
                  {qaList.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No Q&A in library</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">Start adding some!</p>
                    </div>
                  ) : (
                    qaList.map((q, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="mb-3">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">Q:</span>
                            <p className="text-gray-800 dark:text-gray-200 font-medium flex-1">{q.question}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 font-bold text-lg">A:</span>
                            <p className="text-gray-600 dark:text-gray-400 flex-1">{q.answer}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => editQa(q)}
                            className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteQa(q._id)}
                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-in-from-right-4 {
          from {
            transform: translateX(1rem);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fade-in;
        }
        
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }
        
        .slide-in-from-right-4 {
          animation-name: slide-in-from-right-4;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  );
}