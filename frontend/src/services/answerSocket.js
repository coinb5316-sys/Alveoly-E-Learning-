import { io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_SOCKET_URL || "https://alveoly-platform.onrender.com";

// Create main socket connection
const socket = io(WS_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  withCredentials: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Identify user (student or admin)
export function identifyUser(userId, userName = "Anonymous", role = "student") {
  socket.emit("identify_user", { userId, userName, role });
}

// Listen for unanswered questions (admin)
export function onUnansweredQuestion(cb) {
  socket.on("unanswered_question", cb);
}

// Listen for QA library updates (admin)
export function onQaUpdated(cb) {
  socket.on("qa_updated", cb);
}

// Admin sends answer to a student
export function sendAdminAnswer({ toSocketId, answer }) {
  socket.emit("admin_answer", { toSocketId, answer });
}

// Refresh cache (admin)
export function refreshAnswerBotCache() {
  socket.emit("refresh_cache");
}

export default socket;