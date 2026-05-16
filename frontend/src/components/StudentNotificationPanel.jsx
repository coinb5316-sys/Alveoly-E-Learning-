// components/StudentNotificationPanel.jsx - Updated with live class notifications
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
  Zap,
  Video,
  Users,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const StudentNotificationPanel = ({ isOpen, onClose, onNotificationClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for real-time notifications via socket
    if (window.socket) {
      window.socket.on("new_notification", (notification) => {
        const formattedNotif = formatNotification(notification);
        setNotifications(prev => [formattedNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for live class notifications
        if (notification.type === "live_class") {
          toast.success(`🔴 ${notification.title}`, { duration: 5000 });
        } else if (notification.type === "warning" || notification.type === "success") {
          toast[notification.type === "success" ? "success" : "error"](
            notification.title,
            { duration: 4000 }
          );
        }
      });
    }
    
    return () => {
      if (window.socket) {
        window.socket.off("new_notification");
      }
    };
  }, []);

  const formatNotification = (notif) => {
    return {
      id: notif._id || notif.id,
      type: notif.type || "info",
      title: notif.title,
      message: notif.message,
      link: notif.link,
      metadata: notif.metadata || {},
      time: formatDistanceToNow(new Date(notif.createdAt || notif.timestamp || Date.now()), { addSuffix: true }),
      read: notif.read || false,
      icon: getIconForType(notif.type),
      color: getColorForType(notif.type),
      bgColor: getBgColorForType(notif.type)
    };
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/notifications?limit=50");
      
      let notificationsData = [];
      let unread = 0;
      
      if (res.data && Array.isArray(res.data)) {
        notificationsData = res.data;
        unread = res.data.filter(n => !n.read).length;
      } else if (res.data && res.data.notifications && Array.isArray(res.data.notifications)) {
        notificationsData = res.data.notifications;
        unread = res.data.unreadCount || res.data.notifications.filter(n => !n.read).length;
      } else if (res.data && res.data.success && res.data.notifications) {
        notificationsData = res.data.notifications;
        unread = res.data.unreadCount || 0;
      }
      
      const formattedNotifications = notificationsData.map(notif => formatNotification(notif));
      setNotifications(formattedNotifications);
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "success": return Award;
      case "warning": return AlertCircle;
      case "error": return XCircle;
      case "live_class": return Video;
      case "class_update": return Calendar;
      case "class_reminder": return Clock;
      default: return Info;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case "success": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "error": return "text-red-500";
      case "live_class": return "text-red-500";
      case "class_update": return "text-purple-500";
      case "class_reminder": return "text-orange-500";
      default: return "text-blue-500";
    }
  };

  const getBgColorForType = (type) => {
    switch (type) {
      case "success": return "bg-green-50 dark:bg-green-950/30";
      case "warning": return "bg-yellow-50 dark:bg-yellow-950/30";
      case "error": return "bg-red-50 dark:bg-red-950/30";
      case "live_class": return "bg-red-50 dark:bg-red-950/30";
      case "class_update": return "bg-purple-50 dark:bg-purple-950/30";
      case "class_reminder": return "bg-orange-50 dark:bg-orange-950/30";
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
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    
    // Handle live class navigation
    if (notification.type === "live_class" && notification.metadata?.classId) {
      window.location.href = `/student/live-class/${notification.metadata.classId}`;
      onClose();
      return;
    }
    
    if (notification.link) {
      window.location.href = notification.link;
      onClose();
    } else if (notification.metadata?.action) {
      const { action, classId, contentId, examId } = notification.metadata;
      switch (action) {
        case "live_class_started":
        case "live_class_scheduled":
          window.location.href = `/student/live-class/${classId}`;
          break;
        case "content_added":
          window.location.href = `/student/content/${contentId}`;
          break;
        case "exam_available":
          window.location.href = `/student/exams/${examId}`;
          break;
        default:
          if (onNotificationClick) onNotificationClick(notification);
      }
      onClose();
    } else if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const getFilteredCount = (type) => {
    if (type === "all") return notifications.length;
    if (type === "unread") return notifications.filter(n => !n.read).length;
    return notifications.filter(n => n.type === type).length;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    return notif.type === filter;
  });

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
              <button
                onClick={fetchNotifications}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-500" />
              </button>
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

        {/* Filter Tabs */}
        <div className="flex gap-1 p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          {[
            { id: "all", label: "All", icon: Bell },
            { id: "unread", label: "Unread", icon: Info },
            { id: "live_class", label: "Live Classes", icon: Video },
            { id: "success", label: "Success", icon: Award },
            { id: "warning", label: "Warnings", icon: AlertCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const count = getFilteredCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{tab.label}</span>
                {count > 0 && filter !== tab.id && (
                  <span className="ml-1 text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto h-[calc(100%-170px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
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
              {filteredNotifications.map((notification) => {
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
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} unread • {notifications.length} total
              </span>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/student/notifications";
                }}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                View All
              </button>
            </div>
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/student/live-classes";
                }}
                className="text-center text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Video className="h-4 w-4 mx-auto mb-1" />
                Live Classes
              </button>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/student/courses";
                }}
                className="text-center text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <BookOpen className="h-4 w-4 mx-auto mb-1" />
                Courses
              </button>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/student/results";
                }}
                className="text-center text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Award className="h-4 w-4 mx-auto mb-1" />
                Results
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentNotificationPanel;