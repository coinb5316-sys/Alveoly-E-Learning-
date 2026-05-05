// components/StudentNotificationPanel.jsx - Updated with real API data
import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle,
  CreditCard,
  BookOpen,
  Award,
  Clock,
  Calendar,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { formatDistanceToNow } from "date-fns";

const StudentNotificationPanel = ({ isOpen, onClose, onNotificationClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real notifications from API
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for real-time notifications via socket
    if (window.socket) {
      window.socket.on("new_notification", (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    
    return () => {
      if (window.socket) {
        window.socket.off("new_notification");
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/notifications?limit=20");
      
      if (res.data && res.data.notifications) {
        const formattedNotifications = res.data.notifications.map(notif => ({
          id: notif._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          time: formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }),
          read: notif.read,
          link: notif.link,
          icon: getIconForType(notif.type),
          color: getColorForType(notif.type),
          bgColor: getBgColorForType(notif.type)
        }));
        setNotifications(formattedNotifications);
        setUnreadCount(res.data.unreadCount || 0);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "success": return Award;
      case "warning": return AlertCircle;
      case "error": return XCircle;
      default: return Info;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case "success": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "error": return "text-red-500";
      default: return "text-blue-500";
    }
  };

  const getBgColorForType = (type) => {
    switch (type) {
      case "success": return "bg-green-50 dark:bg-green-950/30";
      case "warning": return "bg-yellow-50 dark:bg-yellow-950/30";
      case "error": return "bg-red-50 dark:bg-red-950/30";
      default: return "bg-blue-50 dark:bg-blue-950/30";
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post("/notifications/mark-all-read");
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    if (notification.link && onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Stay updated with your learning journey
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {unreadCount > 0 && (
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto h-[calc(100%-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group ${
                      !notification.read ? "bg-blue-50/30 dark:bg-blue-950/10" : ""
                    }`}
                    onClick={() => handleNotificationAction(notification)}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 p-2.5 rounded-xl transition-all group-hover:scale-105 ${notification.bgColor}`}>
                        <Icon className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {notification.time}
                          </span>
                          {notification.link && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              View details →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
            <button
              onClick={() => window.location.href = "/student/notifications"}
              className="w-full py-2.5 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentNotificationPanel;