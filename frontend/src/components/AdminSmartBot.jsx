// components/AdminSmartBot.jsx - FLOATING BUTTON WITH MODAL POPUP
import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { io } from "socket.io-client";
import { 
  FaPlus,
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes, 
  FaComments, 
  FaEye,
  FaThumbsUp, 
  FaSpinner,
  FaRobot,
  FaQuestionCircle,
  FaChartLine,
  FaReply,
  FaUserFriends,
  FaClock,
  FaCheckCircle,
  FaCrown,
  FaHeadset
} from "react-icons/fa";
import { MdLiveHelp } from "react-icons/md";
import { IoSend } from "react-icons/io5";

const SOCKET_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://alveoly-platform-sunu.onrender.com";

const AdminSmartBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "general" });
  const [submitting, setSubmitting] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState("faqs");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchFAQs();
    const newSocket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    setSocket(newSocket);
    newSocket.on("connect", () => {
      newSocket.emit("bot:identify", { userId: "admin", userName: "Admin", role: "admin" });
      newSocket.emit("bot:get-pending");
    });
    newSocket.on("admin:unanswered", (q) => {
      setPendingQuestions(prev => [q, ...prev]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    });
    newSocket.on("bot:pending-questions", (q) => setPendingQuestions(q));
    return () => newSocket.disconnect();
  }, []);

  const fetchFAQs = async () => {
    try { 
      setLoading(true); 
      const res = await API.get("/faqs"); 
      if (res.data.success) setFaqs(res.data.data); 
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) return alert("Please fill in both fields");
    setSubmitting(true);
    try {
      if (editingFaq) await API.put(`/faqs/${editingFaq._id}`, formData);
      else await API.post("/faqs", formData);
      await fetchFAQs();
      setShowAddModal(false);
      setEditingFaq(null);
      setFormData({ question: "", answer: "", category: "general" });
    } catch (err) { 
      alert(err.response?.data?.message || "Operation failed"); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try { 
      await API.delete(`/faqs/${id}`); 
      await fetchFAQs(); 
    } catch (err) { 
      alert("Delete failed"); 
    }
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    socket?.emit("bot:admin-reply", { 
      toSocketId: selectedQuestion.socketId, 
      answer: replyText, 
      questionId: selectedQuestion.id 
    });
    setPendingQuestions(prev => prev.filter(q => q.id !== selectedQuestion.id));
    setSelectedQuestion(null);
    setReplyText("");
    setShowChat(false);
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryColors = {
    general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    admissions: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    courses: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    fees: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
  };

  const statsCards = [
    { title: "Total FAQs", value: faqs.length, icon: FaQuestionCircle, color: "blue" },
    { title: "Total Views", value: faqs.reduce((s, f) => s + (f.views || 0), 0), icon: FaEye, color: "green" },
    { title: "Helpful", value: faqs.reduce((s, f) => s + (f.helpful?.yes || 0), 0), icon: FaThumbsUp, color: "yellow" },
    { title: "Pending", value: pendingQuestions.length, icon: FaComments, color: "purple" }
  ];

  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
    purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
  };

  return (
    <>
      {/* Floating Bot Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
      >
        <FaRobot className="text-2xl" />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {pendingQuestions.length > 0 && !isOpen && (
          <span className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {pendingQuestions.length}
          </span>
        )}
      </button>

      {/* Main Modal Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
          
          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaRobot className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">AI Assistant Manager</h2>
                  <p className="text-blue-100 text-sm">Manage FAQs and respond to student inquiries</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowChat(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all text-sm"
                >
                  <MdLiveHelp className="text-lg" />
                  <span className="hidden sm:inline">Live Chat</span>
                  {pendingQuestions.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {pendingQuestions.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline">Add FAQ</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaTimes className="text-white text-xl" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 px-6">
              <button
                onClick={() => setActiveTab("faqs")}
                className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "faqs"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FaQuestionCircle className="text-sm" />
                FAQ Library
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "stats"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FaChartLine className="text-sm" />
                Analytics
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "faqs" ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    {statsCards.map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl border p-4 transition-all hover:shadow-md ${colorMap[card.color]}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium opacity-70">{card.title}</p>
                              <p className="text-2xl font-bold mt-1">{card.value}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-white/20 dark:bg-black/20">
                              <Icon className="text-lg" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search FAQs by question or answer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* FAQs Table */}
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FaSpinner className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">Loading FAQs...</p>
                    </div>
                  ) : filteredFaqs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                      <FaQuestionCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No FAQs found</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Create your first FAQ →
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Question</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Answer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Views</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {filteredFaqs.map(faq => (
                            <tr key={faq._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                                {faq.question}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-md truncate">
                                {faq.answer}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${categoryColors[faq.category] || categoryColors.general}`}>
                                  {faq.category || "general"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <FaEye className="text-gray-400 text-xs" />
                                  <span className="text-gray-700 dark:text-gray-300">{faq.views || 0}</span>
                                  <FaThumbsUp className="ml-2 text-green-500 text-xs" />
                                  <span className="text-gray-700 dark:text-gray-300">{faq.helpful?.yes || 0}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingFaq(faq);
                                      setFormData({
                                        question: faq.question,
                                        answer: faq.answer,
                                        category: faq.category || "general"
                                      });
                                      setShowAddModal(true);
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950/30 text-yellow-600 transition-colors"
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(faq._id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                /* Analytics Tab */
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                      <FaEye className="text-2xl opacity-80 mb-2" />
                      <p className="text-2xl font-bold">{faqs.reduce((s, f) => s + (f.views || 0), 0)}</p>
                      <p className="text-sm opacity-90">Total Views</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                      <FaThumbsUp className="text-2xl opacity-80 mb-2" />
                      <p className="text-2xl font-bold">{faqs.reduce((s, f) => s + (f.helpful?.yes || 0), 0)}</p>
                      <p className="text-sm opacity-90">Helpful Ratings</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                      <FaComments className="text-2xl opacity-80 mb-2" />
                      <p className="text-2xl font-bold">{pendingQuestions.length}</p>
                      <p className="text-sm opacity-90">Pending Questions</p>
                    </div>
                  </div>

                  {/* Most Viewed FAQs */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <FaCrown className="text-yellow-500" />
                      Most Viewed FAQs
                    </h3>
                    <div className="space-y-2">
                      {[...faqs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((faq) => (
                        <div key={faq._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{faq.question}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-blue-600 dark:text-blue-400">{faq.views || 0} views</span>
                            <span className="text-xs text-green-600 dark:text-green-400">{faq.helpful?.yes || 0} helpful</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Distribution */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">FAQs by Category</h3>
                    <div className="grid gap-3">
                      {["general", "admissions", "courses", "fees"].map(cat => {
                        const count = faqs.filter(f => (f.category || "general") === cat).length;
                        const percentage = faqs.length ? (count / faqs.length) * 100 : 0;
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize text-gray-700 dark:text-gray-300">{cat}</span>
                              <span className="text-gray-500 dark:text-gray-400">{count} FAQs</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                AI Assistant helps you manage FAQs and respond to student inquiries in real-time
              </p>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingFaq ? "Edit FAQ" : "Add New FAQ"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingFaq ? "Update your FAQ content" : "Create a new frequently asked question"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingFaq(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the frequently asked question..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Answer *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows="5"
                  placeholder="Provide a helpful answer..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="general">General</option>
                  <option value="admissions">Admissions</option>
                  <option value="courses">Courses</option>
                  <option value="fees">Fees / Pricing</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingFaq(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : (editingFaq ? <FaEdit /> : <FaPlus />)}
                {submitting ? "Saving..." : (editingFaq ? "Update FAQ" : "Create FAQ")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FaHeadset className="text-purple-500" />
                  Live Student Questions
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {pendingQuestions.length} pending questions waiting for reply
                </p>
              </div>
              <button
                onClick={() => {
                  setShowChat(false);
                  setSelectedQuestion(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedQuestion ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <FaUserFriends className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedQuestion.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedQuestion.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">{selectedQuestion.text}</p>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="4"
                    placeholder="Type your reply here..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedQuestion(null)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleReply}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <IoSend className="text-sm" />
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : pendingQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <FaComments className="text-2xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No pending questions</p>
                  <p className="text-sm text-gray-400 mt-1">All caught up! Great job!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all"
                      onClick={() => setSelectedQuestion(q)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <FaUserFriends className="text-white text-[10px]" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {q.userName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(q.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{q.text}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-950/30 px-2 py-0.5 rounded-full">
                          <FaClock className="text-[10px]" /> Pending
                        </span>
                        <span className="text-xs text-blue-600 hover:text-blue-700">Click to reply →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSmartBot;