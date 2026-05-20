import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
import { 
  FaRobot, 
  FaUser, 
  FaTrash, 
  FaPaperPlane, 
  FaClock, 
  FaLock, 
  FaPlus,
  FaComments,
  FaSpinner,
  FaStar,
  FaCrown
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AIChat = () => {
  const [socket, setSocket] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [fromDB, setFromDB] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // ================= SOCKET =================
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || "https://alveoly-e-learning-755w.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    console.log("🟢 Connected:", newSocket.id);
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // ================= FETCH QA =================
  useEffect(() => {
    const fetchQA = async () => {
      try {
        const res = await axios.get("/ai/all-admin");
        setQaList(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load knowledge base");
      }
    };
    fetchQA();
  }, []);

  // ================= PAYMENT VERIFICATION =================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (reference) {
      axios
        .get(`/ai-subscriptions/verify?reference=${reference}`)
        .then((res) => {
          toast.success("🎉 Subscription activated!");
          if (res.data.active) {
            setSubscription(res.data.subscription);
            const remaining =
              new Date(res.data.subscription.expiryDate) - new Date();
            setTimeLeft(Math.max(remaining, 0));
          }
        })
        .catch(() => toast.error("❌ Payment verification failed"));

      window.history.replaceState({}, document.title, "/student/ai");
    }
  }, []);

  // ================= SOCKET EVENTS =================
  useEffect(() => {
    if (!socket) return;

    const handleNewQA = (qa) => {
      setQaList((prev) => [qa, ...prev]);
      toast.success("New QA added to knowledge base");
    };
    
    const handleUpdateQA = (qa) => {
      setQaList((prev) => prev.map((item) => (item.id === qa.id ? qa : item)));
      toast.success("QA updated");
    };
    
    const handleDeleteQA = (id) => {
      setQaList((prev) => prev.filter((item) => item.id !== id));
      toast.success("QA deleted");
    };

    socket.on("newQA", handleNewQA);
    socket.on("updateQA", handleUpdateQA);
    socket.on("deleteQA", handleDeleteQA);

    return () => {
      socket.off("newQA", handleNewQA);
      socket.off("updateQA", handleUpdateQA);
      socket.off("deleteQA", handleDeleteQA);
    };
  }, [socket]);

  // ================= FETCH PLANS & SUBSCRIPTION =================
  useEffect(() => {
    const fetchPlansAndSub = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          axios.get("/ai-plans"),
          axios.get("/ai-subscriptions").catch(() => ({ data: { active: false } }))
        ]);
        
        setPlans(plansRes.data || []);
        
        if (subRes.data.active && subRes.data.subscription) {
          setSubscription(subRes.data.subscription);
          const remaining = new Date(subRes.data.subscription.expiryDate) - new Date();
          setTimeLeft(Math.max(remaining, 0));
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        toast.error("Failed to load subscription plans");
      }
    };
    fetchPlansAndSub();
  }, []);

  // ================= TIMER =================
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setSubscription(null);
          clearInterval(timer);
          toast.info("Your subscription has expired");
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ================= FETCH CHATS =================
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("/ai/student-history");
        const chatData = res.data || [];
        setChats(chatData);
        if (chatData.length > 0) {
          setActiveChatId(chatData[0]._id);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        toast.error("Failed to load chat history");
      }
    };
    fetchChats();
  }, []);

  // ================= SCROLL TO BOTTOM =================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatId, loading]);

  const activeChat = chats?.find((c) => c._id === activeChatId);

  const handleAsk = async () => {
    if (!question?.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    if (!subscription) {
      toast.error("You must have an active AI subscription!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/ai/student-ask", {
        question: question.trim(),
        chatId: activeChatId,
      });

      const { answer: aiAnswer, fromDB: isFromDB, chatId } = response.data;
      
      setAnswer(aiAnswer);
      setFromDB(isFromDB || false);

      let updatedChats;
      if (activeChatId) {
        updatedChats = chats.map((chat) =>
          chat._id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...(chat.messages || []),
                  { role: "user", content: question.trim() },
                  { role: "ai", content: aiAnswer },
                ],
              }
            : chat
        );
      } else {
        const newChat = {
          _id: chatId,
          messages: [
            { role: "user", content: question.trim() },
            { role: "ai", content: aiAnswer },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedChats = [newChat, ...(chats || [])];
        setActiveChatId(newChat._id);
      }

      setChats(updatedChats);
      setQuestion("");
      toast.success("Response received!");
    } catch (err) {
      console.error("Ask error:", err);
      const errorMessage = err.response?.data?.message || "Failed to get AI response";
      setAnswer(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!chatId) return;
    
    try {
      await axios.delete(`/ai/student-history/${chatId}`);
      const updatedChats = chats.filter((c) => c._id !== chatId);
      setChats(updatedChats);
      
      if (activeChatId === chatId) {
        setActiveChatId(updatedChats.length > 0 ? updatedChats[0]._id : null);
      }
      
      toast.success("Chat deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete chat");
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setQuestion("");
    setAnswer("");
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    toast.success("New conversation started");
  };

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "Expired";
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const handleSubscribe = async (planId) => {
    if (!planId) return;
    
    try {
      const response = await axios.post("/ai-subscriptions", { planId });
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        toast.error("Invalid subscription response");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error(err.response?.data?.message || "Subscription failed. Try again.");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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

      {/* HEADER */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">
                AI Nursing Tutor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Advanced AI</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {subscription ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
              <FaClock className="w-3 h-3" />
              <span className="text-xs font-medium">{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
              <FaLock className="w-3 h-3" />
              <span className="text-xs font-medium">Inactive</span>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden max-w-7xl w-full mx-auto">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:flex w-80 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaComments className="text-purple-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Chat History</span>
              </div>
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all"
              >
                <FaPlus className="w-3 h-3" />
                New Chat
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chats.length === 0 && (
              <div className="text-center py-12">
                <FaComments className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No chats yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start a new conversation</p>
              </div>
            )}
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setActiveChatId(chat._id)}
                className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeChatId === chat._id
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 line-clamp-2">
                    {chat.messages?.[0]?.content?.slice(0, 50) || "New Chat"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                    aria-label="Delete chat"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : "New"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE SIDEBAR */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 z-50 w-80 h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaComments className="text-purple-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Chat History</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleNewChat}
                    className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    aria-label="New chat"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-500" aria-label="Close menu">
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setActiveChatId(chat._id);
                      setSidebarOpen(false);
                    }}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {chat.messages?.[0]?.content?.slice(0, 40) || "New Chat"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
            {!subscription && (
              <div className="max-w-md mx-auto mt-10">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FaCrown className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Unlock AI Access
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Get personalized AI tutoring and instant answers to your nursing questions
                  </p>
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <button
                        key={plan._id}
                        onClick={() => handleSubscribe(plan._id)}
                        className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      >
                        <span className="font-semibold">{plan.name}</span>
                        <span className="text-lg font-bold">${plan.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!activeChat && subscription && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg animate-pulse">
                  <FaRobot className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Welcome to AI Nursing Tutor
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Ask me anything about nursing, healthcare, or medical topics. I'm here to help you learn!
                </p>
                <div className="mt-6 flex gap-2 flex-wrap justify-center">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">💊 Pharmacology</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">🫀 Anatomy</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">📋 NCLEX Prep</span>
                </div>
              </div>
            )}

            {activeChat?.messages?.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                    <FaRobot className="text-white text-sm" />
                  </div>
                )}

                <div
                  className={`px-4 py-3 text-sm leading-relaxed rounded-2xl max-w-[85%] md:max-w-xl break-words whitespace-pre-wrap shadow-md ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {msg.content}
                  {msg.role === "ai" && fromDB && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs opacity-70">
                      <FaStar className="w-2 h-2" />
                      from knowledge base
                    </span>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
                    <FaUser className="text-white text-sm" />
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <FaRobot className="text-white text-sm" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 md:px-6 py-4">
            <div className="flex items-center gap-3 max-w-5xl mx-auto">
              <input
                className="flex-1 h-12 px-5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
                placeholder="Ask a nursing question..."
                disabled={!subscription || loading}
              />
              <button
                onClick={handleAsk}
                disabled={!subscription || loading || !question.trim()}
                className="flex-shrink-0 h-12 px-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            {!subscription && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                Subscribe to unlock unlimited AI tutoring
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;