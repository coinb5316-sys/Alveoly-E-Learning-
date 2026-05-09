import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { io } from "socket.io-client";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaComments, FaEye, FaThumbsUp, FaSpinner } from "react-icons/fa";

const SOCKET_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://alveoly-platform.onrender.com";

const AdminSmartBot = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "general" });
  const [submitting, setSubmitting] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchFAQs();
    const newSocket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    setSocket(newSocket);
    newSocket.on("connect", () => {
      newSocket.emit("bot:identify", { userId: "admin", userName: "Admin", role: "admin" });
      newSocket.emit("bot:get-pending");
    });
    newSocket.on("admin:unanswered", (q) => setPendingQuestions(prev => [q, ...prev]));
    newSocket.on("bot:pending-questions", (q) => setPendingQuestions(q));
    return () => newSocket.disconnect();
  }, []);

  const fetchFAQs = async () => {
    try { setLoading(true); const res = await API.get("/faqs"); if (res.data.success) setFaqs(res.data.data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) return alert("Fill both fields");
    setSubmitting(true);
    try {
      if (editingFaq) await API.put(`/faqs/${editingFaq._id}`, formData);
      else await API.post("/faqs", formData);
      await fetchFAQs();
      setShowModal(false);
      setEditingFaq(null);
      setFormData({ question: "", answer: "", category: "general" });
      alert(`FAQ ${editingFaq ? "updated" : "added"}!`);
    } catch (err) { alert(err.response?.data?.message || "Failed"); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    try { await API.delete(`/faqs/${id}`); await fetchFAQs(); alert("Deleted"); } catch (err) { alert("Failed"); }
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    socket?.emit("bot:admin-reply", { toSocketId: selectedQuestion.socketId, answer: replyText, questionId: selectedQuestion.id });
    setSelectedQuestion(null);
    setReplyText("");
    setShowChat(false);
    alert("Reply sent!");
  };

  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.answer.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-semibold">FAQ & Bot Management</h1><p className="text-sm text-gray-500">Manage FAQs and respond to students</p></div>
        <div className="flex gap-3"><button onClick={() => setShowChat(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><FaComments /> Live Chat ({pendingQuestions.length})</button><button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><FaPlus /> Add FAQ</button></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-blue-50 rounded-xl p-4"><p className="text-2xl font-bold text-blue-600">{faqs.length}</p><p className="text-sm">Total FAQs</p></div>
        <div className="bg-green-50 rounded-xl p-4"><p className="text-2xl font-bold text-green-600">{faqs.reduce((s, f) => s + (f.views || 0), 0)}</p><p className="text-sm">Total Views</p></div>
        <div className="bg-yellow-50 rounded-xl p-4"><p className="text-2xl font-bold text-yellow-600">{faqs.reduce((s, f) => s + (f.helpful?.yes || 0), 0)}</p><p className="text-sm">Helpful</p></div>
        <div className="bg-purple-50 rounded-xl p-4"><p className="text-2xl font-bold text-purple-600">{pendingQuestions.length}</p><p className="text-sm">Pending</p></div>
      </div>

      <div className="relative max-w-md"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search FAQs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>

      {loading ? <div className="flex justify-center py-12"><FaSpinner className="h-8 w-8 text-blue-500 animate-spin" /></div> : filteredFaqs.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-500">No FAQs found</p></div> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left">Question</th><th className="px-6 py-3 text-left">Answer</th><th className="px-6 py-3 text-left">Views</th><th className="px-6 py-3 text-center">Actions</th></tr></thead>
            <tbody className="divide-y">{filteredFaqs.map(faq => (<tr key={faq._id} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium max-w-xs truncate">{faq.question}</td><td className="px-6 py-4 text-gray-600 max-w-md truncate">{faq.answer}</td><td className="px-6 py-4"><div className="flex items-center gap-2"><FaEye className="text-gray-400" />{faq.views || 0}<FaThumbsUp className="ml-2 text-green-500" /> {faq.helpful?.yes || 0}</div></td><td className="px-6 py-4 text-center"><div className="flex justify-center gap-2"><button onClick={() => { setEditingFaq(faq); setFormData({ question: faq.question, answer: faq.answer, category: faq.category || "general" }); setShowModal(true); }} className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600"><FaEdit /></button><button onClick={() => handleDelete(faq._id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600"><FaTrash /></button></div></td></tr>))}</tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">{editingFaq ? "Edit FAQ" : "Add FAQ"}</h2><button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><FaTimes /></button></div>
          <div className="space-y-4"><div><label className="block text-sm font-medium mb-1">Question *</label><input type="text" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium mb-1">Answer *</label><textarea value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} rows="5" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" /></div><div><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg"><option value="general">General</option><option value="admissions">Admissions</option><option value="courses">Courses</option><option value="fees">Fees</option></select></div><div className="flex gap-3 pt-4"><button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{submitting ? <FaSpinner className="animate-spin mx-auto" /> : (editingFaq ? "Update" : "Create")}</button></div></div></div></div>
      )}

      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Live Questions</h2><button onClick={() => { setShowChat(false); setSelectedQuestion(null); }} className="p-2 rounded-lg hover:bg-gray-100"><FaTimes /></button></div>
          {selectedQuestion ? (<div className="space-y-4"><div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">From: {selectedQuestion.userName}</p><p className="text-gray-900 mt-2">{selectedQuestion.text}</p></div><textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows="4" className="w-full px-4 py-2 border rounded-lg" placeholder="Type reply..." /><div className="flex gap-3"><button onClick={() => setSelectedQuestion(null)} className="flex-1 px-4 py-2 border rounded-lg">Back</button><button onClick={handleReply} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Send Reply</button></div></div>) : pendingQuestions.length === 0 ? <div className="text-center py-12"><p className="text-gray-500">No pending questions</p></div> : (<div className="space-y-3 max-h-96 overflow-y-auto">{pendingQuestions.map((q) => (<div key={q.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedQuestion(q)}><p className="text-sm text-gray-500">{q.userName} • {new Date(q.timestamp).toLocaleTimeString()}</p><p className="text-gray-900 mt-1">{q.text}</p><span className="inline-block mt-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Pending</span></div>))}</div>)}</div></div>
      )}
    </div>
  );
};

export default AdminSmartBot;