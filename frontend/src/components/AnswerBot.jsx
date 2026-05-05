// AnswerBot.jsx
import React, { useEffect, useState, useRef } from "react";
import socket, { identifyUser } from "../services/answerSocket";
import EmojiPicker from "emoji-picker-react";
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaRobot, 
  FaUser, 
  FaSpinner,
  FaArrowDown,
  FaSmile,
  FaMicrophone
} from "react-icons/fa";

export default function AnswerBot({ userId, userName = "Student" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const listRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Socket setup
  useEffect(() => {
    if (userId) {
      identifyUser(userId, userName, "student");
      setIsConnecting(false);
    } else {
      // Guest user
      const guestId = `guest_${Date.now()}`;
      identifyUser(guestId, userName, "guest");
      setIsConnecting(false);
    }

    socket.on("bot_reply", (payload) => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: "bot", text: payload.text, timestamp: new Date() }]);
      if (!open) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("bot_typing", () => {
      setIsTyping(true);
    });

    socket.on("connect_error", (err) => {
      console.error("AnswerBot socket connect_error:", err);
      setIsConnecting(false);
    });

    // Close emoji picker when clicking outside
    const handleClickOutside = (event) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      socket.off("bot_reply");
      socket.off("bot_typing");
      socket.off("connect_error");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userId, userName, open]);

  // Auto scroll
  useEffect(() => {
    if (listRef.current && open) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping, open]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text, timestamp: new Date() }]);
    socket.emit("user_question", { text, userName });
    setText("");
    setIsTyping(true);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const onEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const suggestedQuestions = [
    "How do I apply?",
    "What courses are available?",
    "Tell me about admissions",
    "Contact support"
  ];

  return (
    <>
      {/* Chat Button - Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="group fixed bottom-6 right-6 z-[100] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 cursor-pointer"
        aria-label="Open chat"
      >
        <FaComments className="text-2xl group-hover:rotate-12 transition-transform duration-300" />
        {unreadCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {!unreadCount && !open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Chat Window Overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[100] md:hidden"
            onClick={() => setOpen(false)}
          />
          
          {/* Chat Window */}
          <div className="fixed bottom-0 right-0 z-[101] w-full md:w-[400px] md:bottom-6 md:right-6 md:rounded-2xl h-[100vh] md:h-[600px] bg-white flex flex-col overflow-hidden shadow-2xl md:animate-slideUp border-t md:border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FaRobot className="text-white text-xl" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Alveoly Assistant</h3>
                  <p className="text-blue-100 text-xs">
                    {isConnecting ? "Connecting..." : "Online • Ready to help"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-all p-2 rounded-full hover:bg-white/10 cursor-pointer"
                aria-label="Close chat"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Messages Area */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-gray-100 custom-scrollbar"
            >
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <FaRobot className="text-4xl text-white" />
                  </div>
                  <h4 className="text-gray-800 font-bold text-xl mb-2">Hello! 👋</h4>
                  <p className="text-gray-500 text-sm mb-6 max-w-[250px]">
                    I'm your virtual assistant. Ask me anything about courses, admissions, or programs!
                  </p>
                  <div className="w-full space-y-2">
                    <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
                    {suggestedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setText(question);
                          setTimeout(() => send(), 100);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-slideIn`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                      msg.sender === "user" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}>
                      {msg.sender === "user" ? (
                        <FaUser className="text-white text-sm" />
                      ) : (
                        <FaRobot className="text-white text-sm" />
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div>
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm shadow-md"
                          : "bg-white text-gray-800 shadow-md rounded-bl-sm border border-gray-100"
                      }`}>
                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                      </div>
                      {msg.timestamp && (
                        <p className={`text-xs text-gray-400 mt-1 px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                      <FaRobot className="text-white text-sm" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-100">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white shadow-lg">
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                  />
                  <button
                    ref={emojiButtonRef}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    type="button"
                  >
                    <FaSmile className="text-lg" />
                  </button>
                </div>
                <button
                  onClick={send}
                  disabled={!text.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md cursor-pointer"
                >
                  <FaPaperPlane className="text-lg" />
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Powered by AI • Fast responses
              </p>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-24 left-0 md:left-auto md:right-0 z-[102]">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  autoFocusSearch={false}
                  theme="light"
                  width="100%"
                  height="400px"
                />
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-6px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 1.4s ease-in-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
        }
      `}</style>
    </>
  );
}