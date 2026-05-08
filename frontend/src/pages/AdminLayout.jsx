// AdminLayout.jsx - Fixed to fetch and display actual logged-in user
import { useState, useEffect } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  Users,
  DollarSign,
  Bot,
  Menu,
  X,
  Layers,
  UserCircle,
  MessageSquare,
  BarChart3,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Settings,
  LifeBuoy,
  FileText,
  Shield,
  Zap,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationPanel from "../components/NotificationPanel";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationBadge, setNotificationBadge] = useState(3);
  const { logout, user } = useAuth(); // ✅ Get user from auth context
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize and handle dark mode with system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        setDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleNotificationClick = (notification) => {
    console.log("Notification clicked:", notification);
    setNotificationBadge(prev => Math.max(0, prev - 1));
  };

  const menuItems = [
    { section: "Core", items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
      { to: "/admin/performance", label: "Analytics", icon: BarChart3, color: "text-purple-500" },
      { to: "/admin/questions", label: "Question Bank", icon: HelpCircle, color: "text-green-500" },
      { to: "/admin/subjects", label: "Subjects", icon: BookOpen, color: "text-orange-500" },
      { to: "/admin/users", label: "Users", icon: Users, color: "text-cyan-500" },
      { to: "/admin/payments", label: "Revenue", icon: DollarSign, color: "text-yellow-500" },
    ]},
    { section: "Content", items: [
      { to: "/admin/lecturers", label: "Lecturers", icon: GraduationCap, color: "text-pink-500" },
      { to: "/admin/content-payment", label: "Content Payment", icon: DollarSign, color: "text-indigo-500" },
      { to: "/admin/plans", label: "Plans", icon: Zap, color: "text-red-500" },
      { to: "/admin/courses", label: "Courses", icon: Layers, color: "text-teal-500" },
      { to: "/admin/content", label: "Content Library", icon: FileText, color: "text-emerald-500" },
    ]},
    { section: "Engagement", items: [
      { to: "/admin/results", label: "Student Results", icon: TrendingUp, color: "text-violet-500" },
      { to: "/admin/testimonials", label: "Testimonials", icon: Award, color: "text-amber-500" },
      { to: "/admin/in-box", label: "Feedback", icon: MessageSquare, color: "text-rose-500" },
    ]},
    { section: "System", items: [
      { to: "/admin/settings", label: "Settings", icon: Settings, color: "text-gray-500" },
      { to: "/admin/security", label: "Security", icon: Shield, color: "text-gray-500" },
      { to: "/admin/help", label: "Help & Support", icon: LifeBuoy, color: "text-gray-500" },
    ]},
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "A";
    return user.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-out md:relative md:translate-x-0 flex flex-col h-full ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="flex-shrink-0 flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Alveoly
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - scrollable */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          {menuItems.map((section) => (
            <div key={section.section} className="mb-6">
              <div className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.section}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                        }`
                      }
                    >
                      <Icon className={`h-4 w-4 ${isActive ? item.color : ""}`} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="h-3 w-3" />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User profile - Now displaying actual logged-in user */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {getUserInitials()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || "admin@alveoly.com"}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header
          className={`flex-shrink-0 sticky top-0 z-30 transition-all duration-200 ${
            scrolled
              ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm"
              : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Welcome text with actual user name */}
              <div className="hidden md:block">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back,
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user?.name?.split(" ")[0] || "Admin"} 👋
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              <button 
                onClick={() => setNotificationsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              >
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                {notificationBadge > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                )}
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

              <button 
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg shadow-red-500/25"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content - scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
};

export default AdminLayout;