// components/SmartChatBot.jsx - COMPLETELY FIXED POSITIONING
import React, { useState, useEffect, useRef } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser, FaSmile, FaSpinner, FaHeadset, FaClock, FaCheckCircle, FaMinus } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://alveoly-platform-sunu.onrender.com";

const SmartChatBot = ({ userId, userName = "Guest" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current.emit("bot:identify", { userId, userName, role: "user" });
    });
    socketRef.current.on("bot:ready", () => {
      setMessages([{ 
        id: Date.now(), 
        sender: "bot", 
        text: "👋 Hello! Welcome to Alveoly! I'm your AI assistant. How can I help you today?", 
        timestamp: new Date(), 
        isAuto: true 
      }]);
    });
    socketRef.current.on("bot:reply", (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: "bot", 
        text: data.text, 
        timestamp: new Date(data.timestamp), 
        isAuto: data.isAuto 
      }]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    });
    socketRef.current.on("bot:typing", (data) => setIsTyping(data.isTyping));
    socketRef.current.on("bot:admin-reply", (data) => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: "bot", 
        text: `📢 **Support Team:**\n\n${data.text}`, 
        timestamp: new Date(data.timestamp), 
        isAdmin: true 
      }]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    });
    socketRef.current.on("disconnect", () => setIsConnected(false));
    
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && 
          emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { 
      socketRef.current?.disconnect(); 
      document.removeEventListener("mousedown", handleClickOutside); 
    };
  }, [userId, userName, isOpen]);

  useEffect(() => { 
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, isTyping]);
  
  useEffect(() => { 
    if (isOpen) setUnreadCount(0); 
  }, [isOpen]);

  const sendMessage = () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    const messageText = inputText.trim();
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      sender: "user", 
      text: messageText, 
      timestamp: new Date() 
    }]);
    socketRef.current.emit("bot:question", { text: messageText, userId, userName });
    setInputText("");
    setIsTyping(true);
    setShowEmojiPicker(false);
    setTimeout(() => setIsSending(false), 500);
  };

  const onEmojiClick = (emojiObject) => {
    setInputText(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const suggestedQuestions = [
    "How do I apply for a course?",
    "What programs do you offer?",
    "How much are tuition fees?",
    "Contact student support"
  ];

  return (
    <>
      {/* Floating Chat Button - Fixed bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="group fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
      >
        <FaComments className="text-2xl" />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {!unreadCount && !isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Chat Window - Centered on desktop, full screen on mobile */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
          
          {/* Chat Container - Centered on desktop */}
          <div className={`fixed z-50 transition-all duration-300 ${
            isMinimized 
              ? "bottom-6 right-6 w-80 h-14 rounded-2xl" 
              : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[450px] h-[85vh] sm:h-[600px] rounded-2xl"
          } bg-white dark:bg-gray-900 flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 flex justify-between items-center rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaRobot className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Alveoly Assistant</h3>
                  <p className="text-blue-100 text-xs flex items-center gap-1">
                    {isConnected ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Online • AI Powered
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                        Connecting...
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isMinimized && (
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                    title="Minimize"
                  >
                    <FaMinus className="text-sm" />
                  </button>
                )}
                {isMinimized && (
                  <button
                    onClick={() => setIsMinimized(false)}
                    className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                    title="Expand"
                  >
                    <FaComments className="text-sm" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                  title="Close"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800/30">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                        <FaRobot className="text-white text-3xl" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Ask me anything about courses, admissions, fees, or support!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.sender === "user" 
                              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                              : "bg-gradient-to-r from-blue-500 to-purple-500"
                          }`}>
                            {msg.sender === "user" ? <FaUser className="text-white text-sm" /> : <FaRobot className="text-white text-sm" />}
                          </div>
                          <div>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                              msg.sender === "user" 
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm" 
                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-bl-sm border border-gray-100 dark:border-gray-700"
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                              <span className="text-[10px] text-gray-400">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {msg.isAdmin && (
                                <span className="text-[10px] text-purple-500 flex items-center gap-0.5">
                                  <FaCheckCircle className="text-[8px]" /> Admin
                                </span>
                              )}
                              {msg.isNursing && (
  <span className="text-[10px] text-green-500 flex items-center gap-0.5 ml-1">
    <FaRobot className="text-[8px]" /> Nursing AI
  </span>
)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <FaRobot className="text-white text-sm" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 1 && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                      <HiSparkles className="text-yellow-500" />
                      Suggested questions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputText(q);
                            setTimeout(() => sendMessage(), 100);
                          }}
                          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 flex-shrink-0">
                  <div className="flex gap-2 relative">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder={isConnected ? "Type your question..." : "Connecting..."}
                        disabled={!isConnected}
                        className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <button
                        ref={emojiButtonRef}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <FaSmile className="text-lg" />
                      </button>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!inputText.trim() || !isConnected || isSending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2.5 rounded-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                    >
                      {isSending ? (
                        <FaSpinner className="text-lg animate-spin" />
                      ) : (
                        <IoSend className="text-lg" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">Powered by Alveoly AI</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FaHeadset className="text-xs" />
                      24/7 Support
                    </p>
                  </div>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-24 right-4 z-50">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
                      width="350px"
                      height="400px"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .animate-bounce {
          animation: bounce 1.4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default SmartChatBot;