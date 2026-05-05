// AdminInbox.jsx - Fixed with correct API import
import { useEffect, useState } from "react";
import API from "../api/axios"; // ✅ Changed from "../api/api" to "../api/axios"
import emailjs from "@emailjs/browser";
import toast, { Toaster } from "react-hot-toast";
import {
  Mail,
  Reply,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  Clock,
  User,
  Send,
  Loader2,
  Inbox,
  MessageSquare,
  Calendar
} from "lucide-react";

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeMsg, setActiveMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sending, setSending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get("/messages");
      console.log("API Response:", res.data); // Debug log
      
      // Handle different response structures
      let messagesData = [];
      if (Array.isArray(res.data)) {
        messagesData = res.data;
      } else if (res.data && Array.isArray(res.data.messages)) {
        messagesData = res.data.messages;
      } else if (res.data && Array.isArray(res.data.data)) {
        messagesData = res.data.data;
      } else if (res.data && typeof res.data === 'object') {
        // If it's an object with _id, it might be a single message
        if (res.data._id) {
          messagesData = [res.data];
        } else {
          messagesData = Object.values(res.data).filter(item => item && typeof item === 'object' && item._id);
        }
      } else {
        messagesData = [];
      }
      
      console.log("Processed messages:", messagesData); // Debug log
      setMessages(messagesData);
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sendReply = async () => {
    if (!replyText.trim() || !activeMsg) {
      toast.error("Please enter a reply message");
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_REPLY_TEMPLATE_ID,
        {
          to_email: activeMsg.email,
          message: replyText,
          name: activeMsg.name,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      await API.patch(`/messages/${activeMsg._id}/replied`);

      setReplyText("");
      toast.success(`Reply sent to ${activeMsg.name}`);
      fetchMessages(); // Refresh the list
      
      // Optionally close the active message after sending
      // setActiveMsg(null);
    } catch (err) {
      console.error("Error sending reply:", err);
      toast.error("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Filter messages based on search and status
  const filteredMessages = messages.filter(msg => {
    if (!msg) return false;
    const matchesSearch = 
      (msg.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (msg.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (msg.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: messages.length,
    pending: messages.filter(m => m?.status === "pending").length,
    replied: messages.filter(m => m?.status === "replied").length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };

  const getStatusConfig = (status) => {
    if (status === "replied") {
      return { icon: CheckCircle, text: "Replied", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-950/30" };
    }
    return { icon: Clock, text: "Pending", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-950/30" };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Toaster position="top-right" />
      
      <div className="h-screen flex flex-col md:flex-row">
        
        {/* ================= SIDEBAR ================= */}
        <div
          className={`w-full md:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden 
          ${activeMsg ? "hidden md:flex" : "flex"}`}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Inbox className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Inbox</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customer Messages</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.replied}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Replied</p>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filter by status</span>
            </button>
            
            {showFilters && (
              <div className="mt-3 flex gap-2">
                {["all", "pending", "replied"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === status
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No messages found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search</p>
              </div>
            )}

            {filteredMessages.map((msg) => {
              const StatusIcon = getStatusConfig(msg.status).icon;
              const statusConfig = getStatusConfig(msg.status);
              
              return (
                <div
                  key={msg._id}
                  onClick={() => setActiveMsg(msg)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    activeMsg?._id === msg._id
                      ? "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {msg.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {msg.email || "No email"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} ml-2 flex-shrink-0`}>
                      <StatusIcon className="h-3 w-3" />
                      {msg.status === "replied" ? "Replied" : "Pending"}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate mb-1">
                    {msg.subject || "No subject"}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Mail className="h-3 w-3" />
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= MESSAGE VIEW ================= */}
        <div className={`flex-1 flex flex-col overflow-hidden ${activeMsg ? "flex" : "hidden md:flex"}`}>
          {!activeMsg ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <Inbox className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-base">Select a message to view</p>
              <p className="text-sm">Choose a message from the list to read and reply</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-5 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveMsg(null)}
                    className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {activeMsg.subject || "No Subject"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        From: {activeMsg.name || "Unknown"} ({activeMsg.email || "No email"})
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activeMsg.createdAt ? new Date(activeMsg.createdAt).toLocaleString() : "Unknown date"}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    activeMsg.status === "replied"
                      ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                      : "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                  }`}>
                    {activeMsg.status === "replied" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    {activeMsg.status === "replied" ? "Replied" : "Pending"}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/30">
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{activeMsg.name || "Unknown"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activeMsg.email || "No email"}</p>
                      </div>
                    </div>
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {activeMsg.message || "No message content"}
                      </p>
                    </div>
                    
                    {activeMsg.repliedAt && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Replied on {new Date(activeMsg.repliedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Box */}
              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-5">
                <div className="max-w-3xl mx-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reply to {activeMsg.name || "User"}
                  </label>
                  <textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;