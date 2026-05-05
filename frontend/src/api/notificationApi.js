// frontend/src/api/notificationApi.js
import API from "./axios";

export const notificationApi = {
  getNotifications: (page = 1, limit = 20, unreadOnly = false) =>
    API.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`),
  
  getUnreadCount: () => API.get("/notifications/count"),
  
  markAsRead: (id) => API.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () => API.post("/notifications/mark-all-read"),
  
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
  
  deleteAllNotifications: () => API.delete("/notifications")
};