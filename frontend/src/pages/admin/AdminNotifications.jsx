// src/pages/admin/AdminNotifications.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  UserPlus,
  CreditCard,
  Video,
  Calendar,
  MessageSquare,
  Award,
  Zap,
  ExternalLink,
  MoreVertical,
  Download,
  MailOpen,
  Mail,
  Clock,
  Users,
  BookOpen,
  HelpCircle,
  DollarSign,
  Settings,
  Shield,
  TrendingUp,
  FileText,
  Eye,
  X,
  ChevronDown,
  Loader2,
  Inbox,
  Archive,
  Star,
  StarOff,
  FilterX,
  SlidersHorizontal
} from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday, subDays } from "date-fns";
import toast from "react-hot-toast";

const AdminNotifications = () => {
  const navigate = useNavigate();
  
  // State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("newest");
  const [dateRange, setDateRange] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [expandedNotification, setExpandedNotification] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    byType: {}
  });

  // ================= FETCH NOTIFICATIONS =================
  const fetchNotifications = useCallback(async (page = 1, showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(filterRead !== "all" && { unreadOnly: filterRead === "unread" ? "true" : "false" }),
        ...(filterType !== "all" && { type: filterType }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateRange !== "all" && { dateRange }),
        sort: sortOrder
      });

      const res = await axios.get(`/notifications?${params.toString()}`);
      
      let notificationsData = [];
      let unread = 0;
      let total = 0;

      if (res.data && res.data.success) {
        notificationsData = res.data.notifications || [];
        unread = res.data.unreadCount || 0;
        total = res.data.pagination?.total || notificationsData.length;
        setTotalPages(res.data.pagination?.pages || 1);
      } else if (Array.isArray(res.data)) {
        notificationsData = res.data;
        unread = res.data.filter(n => !n.read).length;
        total = res.data.length;
      }

      const formatted = notificationsData.map(formatNotification);
      setNotifications(formatted);
      setUnreadCount(unread);
      setTotalCount(total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [itemsPerPage, filterRead, filterType, searchQuery, dateRange, sortOrder]);

  // ================= FETCH STATS =================
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get("/notifications/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      // Stats might fail for non-admin, ignore
      console.log("Stats fetch skipped");
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotifications(1);
    fetchStats();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchNotifications(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [filterType, filterRead, searchQuery, dateRange, sortOrder, itemsPerPage]);

  // ================= FORMAT NOTIFICATION =================
  const formatNotification = (notif) => {
    return {
      id: notif._id || notif.id,
      type: notif.type || "info",
      title: notif.title || "Notification",
      message: notif.message || "",
      link: notif.link,
      metadata: notif.metadata || {},
      read: notif.read || false,
      createdAt: notif.createdAt || notif.timestamp,
      time: formatDistanceToNow(new Date(notif.createdAt || notif.timestamp || Date.now()), { addSuffix: true }),
      formattedDate: formatNotificationDate(notif.createdAt || notif.timestamp),
      icon: getIconForType(notif.type),
      color: getColorForType(notif.type),
      bgColor: getBgColorForType(notif.type),
      borderColor: getBorderColorForType(notif.type),
      label: getLabelForType(notif.type)
    };
  };

  // ================= DATE HELPERS =================
  const formatNotificationDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, "h:mm a")}`;
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const groupNotificationsByDate = (notifs) => {
    const groups = {};
    notifs.forEach(notif => {
      const date = new Date(notif.createdAt);
      let key;
      if (isToday(date)) key = "Today";
      else if (isYesterday(date)) key = "Yesterday";
      else if (date > subDays(new Date(), 7)) key = "This Week";
      else if (date > subDays(new Date(), 30)) key = "This Month";
      else key = "Older";
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(notif);
    });
    return groups;
  };

  // ================= TYPE HELPERS =================
  const getIconForType = (type) => {
    const icons = {
      success: CheckCircle,
      warning: AlertCircle,
      error: XCircle,
      info: Info,
      live_class: Video,
      class_created: Calendar,
      class_updated: MessageSquare,
      new_user: UserPlus,
      payment: CreditCard,
      enrollment: BookOpen,
      achievement: Award,
      system: Zap,
      question: HelpCircle,
      revenue: DollarSign,
      security: Shield,
      performance: TrendingUp,
      content: FileText,
      testimonial: Star,
      default: Bell
    };
    return icons[type] || icons.default;
  };

  const getColorForType = (type) => {
    const colors = {
      success: "text-green-500",
      warning: "text-yellow-500",
      error: "text-red-500",
      info: "text-blue-500",
      live_class: "text-red-500",
      class_created: "text-purple-500",
      class_updated: "text-blue-500",
      new_user: "text-cyan-500",
      payment: "text-emerald-500",
      enrollment: "text-teal-500",
      achievement: "text-amber-500",
      system: "text-indigo-500",
      question: "text-orange-500",
      revenue: "text-green-600",
      security: "text-slate-500",
      performance: "text-violet-500",
      content: "text-emerald-600",
      testimonial: "text-pink-500",
      default: "text-gray-500"
    };
    return colors[type] || colors.default;
  };

  const getBgColorForType = (type) => {
    const colors = {
      success: "bg-green-50 dark:bg-green-950/30",
      warning: "bg-yellow-50 dark:bg-yellow-950/30",
      error: "bg-red-50 dark:bg-red-950/30",
      info: "bg-blue-50 dark:bg-blue-950/30",
      live_class: "bg-red-50 dark:bg-red-950/30",
      class_created: "bg-purple-50 dark:bg-purple-950/30",
      class_updated: "bg-blue-50 dark:bg-blue-950/30",
      new_user: "bg-cyan-50 dark:bg-cyan-950/30",
      payment: "bg-emerald-50 dark:bg-emerald-950/30",
      enrollment: "bg-teal-50 dark:bg-teal-950/30",
      achievement: "bg-amber-50 dark:bg-amber-950/30",
      system: "bg-indigo-50 dark:bg-indigo-950/30",
      question: "bg-orange-50 dark:bg-orange-950/30",
      revenue: "bg-green-50 dark:bg-green-950/30",
      security: "bg-slate-50 dark:bg-slate-950/30",
      performance: "bg-violet-50 dark:bg-violet-950/30",
      content: "bg-emerald-50 dark:bg-emerald-950/30",
      testimonial: "bg-pink-50 dark:bg-pink-950/30",
      default: "bg-gray-50 dark:bg-gray-800/50"
    };
    return colors[type] || colors.default;
  };

  const getBorderColorForType = (type) => {
    const colors = {
      success: "border-l-green-500",
      warning: "border-l-yellow-500",
      error: "border-l-red-500",
      info: "border-l-blue-500",
      live_class: "border-l-red-500",
      class_created: "border-l-purple-500",
      class_updated: "border-l-blue-500",
      new_user: "border-l-cyan-500",
      payment: "border-l-emerald-500",
      default: "border-l-gray-300"
    };
    return colors[type] || colors.default;
  };

  const getLabelForType = (type) => {
    const labels = {
      success: "Success",
      warning: "Warning",
      error: "Error",
      info: "Info",
      live_class: "Live Class",
      class_created: "Class Created",
      class_updated: "Class Updated",
      new_user: "New User",
      payment: "Payment",
      enrollment: "Enrollment",
      achievement: "Achievement",
      system: "System",
      question: "Question",
      revenue: "Revenue",
      security: "Security",
      performance: "Performance",
      content: "Content",
      testimonial: "Testimonial",
      default: "Notification"
    };
    return labels[type] || labels.default;
  };

  // ================= ACTIONS =================
  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking as read:", err);
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotalCount(prev => prev - 1);
      setNotificationToDelete(null);
      setShowDeleteConfirm(false);
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("Failed to delete notification");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    try {
      await Promise.all(
        selectedNotifications.map(id => axios.delete(`/notifications/${id}`))
      );
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setTotalCount(prev => prev - selectedNotifications.length);
      setSelectedNotifications([]);
      setSelectAll(false);
      toast.success(`${selectedNotifications.length} notifications deleted`);
    } catch (err) {
      console.error("Error bulk deleting:", err);
      toast.error("Failed to delete some notifications");
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedNotifications.length === 0) return;
    try {
      await Promise.all(
        selectedNotifications.map(id => axios.patch(`/notifications/${id}/read`))
      );
      setNotifications(prev =>
        prev.map(n => selectedNotifications.includes(n.id) ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - selectedNotifications.length));
      setSelectedNotifications([]);
      setSelectAll(false);
      toast.success(`${selectedNotifications.length} notifications marked as read`);
    } catch (err) {
      console.error("Error bulk marking read:", err);
      toast.error("Failed to mark some notifications as read");
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on type/metadata
    if (notification.type === "live_class" && notification.metadata?.classId) {
      navigate(`/admin/live-class/${notification.metadata.classId}`);
      return;
    }

    if (notification.link) {
      navigate(notification.link);
      return;
    }

    if (notification.metadata) {
      const { action, classId, userId, paymentId } = notification.metadata;
      switch (action) {
        case "live_class_created":
        case "live_class_updated":
          navigate(`/admin/live-classes/${classId}/edit`);
          break;
        case "live_class_started":
          navigate(`/admin/live-class/${classId}`);
          break;
        case "new_user":
          navigate(`/admin/users?userId=${userId}`);
          break;
        case "payment_received":
          navigate(`/admin/payments?paymentId=${paymentId}`);
          break;
        default:
          setExpandedNotification(
            expandedNotification === notification.id ? null : notification.id
          );
      }
    } else {
      setExpandedNotification(
        expandedNotification === notification.id ? null : notification.id
      );
    }
  };

  // ================= SELECTION =================
  const toggleSelect = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
    setSelectAll(!selectAll);
  };

  // ================= EXPORT =================
  const handleExport = () => {
    const dataToExport = notifications.map(n => ({
      Title: n.title,
      Message: n.message,
      Type: n.type,
      Read: n.read ? "Yes" : "No",
      Date: format(new Date(n.createdAt), "yyyy-MM-dd HH:mm:ss")
    }));

    const csv = [
      Object.keys(dataToExport[0] || {}).join(","),
      ...dataToExport.map(row => 
        Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notifications-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Notifications exported");
  };

  // ================= DERIVED =================
  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications]
  );

  const filterTabs = [
    { id: "all", label: "All", icon: Bell, count: totalCount },
    { id: "unread", label: "Unread", icon: Mail, count: unreadCount },
    { id: "live_class", label: "Live Classes", icon: Video },
    { id: "payment", label: "Payments", icon: CreditCard },
    { id: "new_user", label: "New Users", icon: UserPlus },
    { id: "system", label: "System", icon: Zap }
  ];

  const hasActiveFilters = filterType !== "all" || filterRead !== "all" || searchQuery || dateRange !== "all";

  const clearFilters = () => {
    setFilterType("all");
    setFilterRead("all");
    setSearchQuery("");
    setDateRange("all");
    setSortOrder("newest");
  };

  // ================= RENDER =================
  return (
    <div className="space-y-6 pb-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            All Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and view all your platform notifications
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={notifications.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => fetchNotifications(currentPage, true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Inbox className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.total || totalCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
              <Mail className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Unread</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
              <MailOpen className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Read</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.read || (totalCount - unreadCount)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <Video className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live Classes</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stats.byType?.live_class || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEARCH & FILTERS ===== */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-4">
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications by title or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                showFilters || hasActiveFilters
                  ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <FilterX className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {/* Read Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Read Status
              </label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread only</option>
                <option value="read">Read only</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Sort By
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        )}

        {/* Type Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                    isActive ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== BULK ACTIONS BAR ===== */}
      {selectedNotifications.length > 0 && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedNotifications.length} selected
            </span>
            <button
              onClick={() => {
                setSelectedNotifications([]);
                setSelectAll(false);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark read
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ===== NOTIFICATIONS LIST ===== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {hasActiveFilters ? "No matching notifications" : "No notifications yet"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              {hasActiveFilters
                ? "Try adjusting your filters or search query to find what you're looking for."
                : "When important events occur on your platform, they'll appear here."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <FilterX className="h-4 w-4" />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Select All Header */}
          <div className="flex items-center gap-3 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Select all on this page
              </span>
            </label>
          </div>

          {/* Grouped Notifications */}
          {Object.entries(groupedNotifications).map(([dateGroup, notifs]) => (
            <div key={dateGroup}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {dateGroup}
                </h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {notifs.length} {notifs.length === 1 ? "notification" : "notifications"}
                </span>
              </div>

              <div className="space-y-2">
                {notifs.map((notification) => {
                  const Icon = notification.icon;
                  const isSelected = selectedNotifications.includes(notification.id);
                  const isExpanded = expandedNotification === notification.id;

                  return (
                    <div
                      key={notification.id}
                      className={`group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 border-l-4 ${notification.borderColor} transition-all hover:shadow-md ${
                        !notification.read ? "ring-1 ring-blue-100 dark:ring-blue-900/30" : ""
                      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                    >
                      <div className="flex items-start gap-3 p-4">
                        {/* Checkbox */}
                        <div className="flex items-center pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(notification.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                        </div>

                        {/* Icon */}
                        <div className={`flex-shrink-0 p-2.5 rounded-lg ${notification.bgColor}`}>
                          <Icon className={`h-5 w-5 ${notification.color}`} />
                        </div>

                        {/* Content */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`text-sm font-semibold text-gray-900 dark:text-gray-100 ${
                                  !notification.read ? "" : "opacity-80"
                                }`}>
                                  {notification.title}
                                </h4>
                                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${notification.bgColor} ${notification.color}`}>
                                  {notification.label}
                                </span>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {notification.time}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                                  {notification.formattedDate}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  title="Mark as read"
                                >
                                  <MailOpen className="h-4 w-4 text-gray-500" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotificationToDelete(notification);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="View details"
                              >
                                <ExternalLink className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded View */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <span className="text-gray-400 dark:text-gray-500">Type:</span>
                                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
                                    {notification.label}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400 dark:text-gray-500">Status:</span>
                                  <span className={`ml-2 font-medium ${
                                    notification.read ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                                  }`}>
                                    {notification.read ? "Read" : "Unread"}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-400 dark:text-gray-500">Full date:</span>
                                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                                    {notification.formattedDate}
                                  </span>
                                </div>
                                {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                                  <div className="col-span-2">
                                    <span className="text-gray-400 dark:text-gray-500">Metadata:</span>
                                    <pre className="mt-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-[10px] overflow-x-auto">
                                      {JSON.stringify(notification.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ===== PAGINATION ===== */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchNotifications(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchNotifications(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => fetchNotifications(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteConfirm && notificationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteConfirm(false);
              setNotificationToDelete(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-950/30">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Delete Notification?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Are you sure you want to delete "<span className="font-medium">{notificationToDelete.title}</span>"?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setNotificationToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(notificationToDelete.id)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/25"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;