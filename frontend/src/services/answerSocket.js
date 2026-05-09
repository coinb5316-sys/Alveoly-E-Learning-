// src/services/answerSocket.js
import { io } from "socket.io-client";

// CHANGE THIS LINE - Remove the old URL
// const WS_URL = import.meta.env.VITE_ANSWERBOT_WS_URL || "http://localhost:5000";

// REPLACE WITH THIS:
const WS_URL = import.meta.env.VITE_SOCKET_URL || "https://alveoly-platform.onrender.com";

// Create socket without the /answerbot namespace since your server handles it differently
const socket = io(WS_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  withCredentials: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Rest of your code remains the same...
export function identifyUser(userId, userName = "Anonymous", role = "student") {
  socket.emit("identify_user", { userId, userName, role });
}

export function onUnansweredQuestion(cb) {
  socket.on("unanswered_question", cb);
}

export function onQaUpdated(cb) {
  socket.on("qa_updated", cb);
}

export function sendAdminAnswer({ toSocketId, answer }) {
  socket.emit("admin_answer", { toSocketId, answer });
}

export function refreshAnswerBotCache() {
  socket.emit("refresh_cache");
}

export default socket;