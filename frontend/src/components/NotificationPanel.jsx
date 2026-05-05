// components/NotificationPanel.jsx - Updated with navigation support for admin
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle,
  UserPlus,
  CreditCard,
  HelpCircle,
  Zap,
  MessageSquare,
  Award,
  ExternalLink
} from "lucide-react";
import axios from "../api/axios";
import { formatDistanceToNow } from "date-fns";

const NotificationPanel = ({ isOpen, onClose, onNotificationClick }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for real-time admin notifications
    if (window.socket) {
      window.socket.on("new_admin_notification", (notification) => {
        const formattedNotif = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          metadata: notification.metadata || {},
          time: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
          read: false,
          icon: getIconForType(notification.type),
          color: getColorForType(notification.type),
          bgColor: getBgColorForType(notification.type)
        };
        setNotifications(prev => [formattedNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    
    return () => {
      if (window.socket) {
        window.socket.off("new_admin_notification");
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
          link: notif.link,
          metadata: notif.metadata || {},
          time: formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }),
          read: notif.read,
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
      case "success": return CheckCircle;
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

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Handle navigation based on notification link or metadata
    if (notification.link) {
      // If there's a direct link, navigate to it
      navigate(notification.link);
      onClose();
    } else if (notification.metadata) {
      // Handle different notification types with metadata
      const { action, userId, paymentId, examId, quizId, testimonialId } = notification.metadata;
      
      switch (action) {
        case "new_user":
          navigate(`/admin/users?userId=${userId}`);
          break;
        case "payment_received":
          navigate(`/admin/payments?paymentId=${paymentId}`);
          break;
        case "exam_completed":
          navigate(`/admin/results?examId=${examId}`);
          break;
        case "quiz_completed":
          navigate(`/admin/performance?quizId=${quizId}`);
          break;
        case "testimonial_submitted":
          navigate(`/admin/testimonials?testimonialId=${testimonialId}`);
          break;
        default:
          // If onNotificationClick is provided, call it
          if (onNotificationClick) {
            onNotificationClick(notification);
          }
      }
    } else {
      // Default action - call onNotificationClick if provided
      if (onNotificationClick) {
        onNotificationClick(notification);
      }
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
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Admin Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto h-[calc(100%-4rem)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                When important events occur, they'll appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group ${
                      !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${notification.bgColor}`}>
                        <Icon className={`h-4 w-4 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {notification.time}
                          </span>
                          {notification.link && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              View details
                              <ExternalLink className="h-3 w-3" />
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

        {/* Footer with quick stats */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} unread • {notifications.length} total
              </span>
              <button
                onClick={() => {
                  onClose();
                  navigate("/admin/notifications");
                }}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                View All
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;