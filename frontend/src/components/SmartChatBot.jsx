import React, { useState, useEffect, useRef } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser, FaSmile, FaSpinner } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://alveoly-platform-sunu.onrender.com";
const SmartChatBot = ({ userId, userName = "Guest" }) => {
  const [isOpen, setIsOpen] = useState(false);
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
      setMessages([{ id: Date.now(), sender: "bot", text: "👋 Hello! Welcome to Alveoly! How can I help you today?", timestamp: new Date(), isAuto: true }]);
    });
    socketRef.current.on("bot:reply", (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), sender: "bot", text: data.text, timestamp: new Date(data.timestamp), isAuto: data.isAuto }]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    });
    socketRef.current.on("bot:typing", (data) => setIsTyping(data.isTyping));
    socketRef.current.on("bot:admin-reply", (data) => {
      setMessages(prev => [...prev, { id: Date.now(), sender: "bot", text: `📢 **Support:**\n\n${data.text}`, timestamp: new Date(data.timestamp), isAdmin: true }]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    });
    socketRef.current.on("disconnect", () => setIsConnected(false));
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { socketRef.current?.disconnect(); document.removeEventListener("mousedown", handleClickOutside); };
  }, [userId, userName, isOpen]);

  useEffect(() => { if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) setUnreadCount(0); }, [isOpen]);

  const sendMessage = () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    const messageText = inputText.trim();
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: messageText, timestamp: new Date() }]);
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

  const suggestedQuestions = ["How do I apply?", "What courses do you offer?", "How much are fees?", "Contact support?"];

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="group fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center">
        <FaComments className="text-2xl" />
        {unreadCount > 0 && !isOpen && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">{unreadCount > 9 ? "9+" : unreadCount}</span>}
        {!unreadCount && !isOpen && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 right-0 z-50 w-full md:w-[420px] md:bottom-6 md:right-6 md:rounded-2xl h-[100vh] md:h-[650px] bg-white dark:bg-gray-900 flex flex-col shadow-2xl md:border">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><FaRobot className="text-white text-xl" /></div><div><h3 className="text-white font-semibold">Alveoly Assistant</h3><p className="text-blue-100 text-xs">{isConnected ? "🟢 Online" : "🔴 Connecting..."}</p></div></div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"><FaTimes className="text-xl" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800/30">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user" ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}>
                      {msg.sender === "user" ? <FaUser className="text-white text-sm" /> : <FaRobot className="text-white text-sm" />}
                    </div>
                    <div>
                      <div className={`px-4 py-2.5 rounded-2xl ${msg.sender === "user" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-bl-sm border"}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.isAdmin && <span className="ml-1 text-blue-500">✓ Admin</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"><FaRobot className="text-white text-sm" /></div><div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm"><div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span></div></div></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && messages[0].sender === "bot" && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/30 border-t">
                <p className="text-xs text-gray-500 mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-2">{suggestedQuestions.map((q, idx) => (<button key={idx} onClick={() => { setInputText(q); setTimeout(() => sendMessage(), 100); }} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200">{q}</button>))}</div>
              </div>
            )}

            <div className="border-t p-4 bg-white dark:bg-gray-900">
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type your question..." disabled={!isConnected} className="w-full px-4 py-2.5 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                  <button ref={emojiButtonRef} onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FaSmile className="text-lg" /></button>
                </div>
                <button onClick={sendMessage} disabled={!inputText.trim() || !isConnected || isSending} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2.5 rounded-xl hover:scale-105 disabled:opacity-50">{isSending ? <FaSpinner className="text-lg animate-spin" /> : <FaPaperPlane className="text-lg" />}</button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Powered by Alveoly • 24/7 Support</p>
            </div>

            {showEmojiPicker && (<div ref={emojiPickerRef} className="absolute bottom-20 right-4 z-50"><EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} theme="light" width="350px" height="400px" /></div>)}
          </div>
        </>
      )}
      <style>{`@keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } } .animate-bounce { animation: bounce 1.4s ease-in-out infinite; }`}</style>
    </>
  );
};

export default SmartChatBot;