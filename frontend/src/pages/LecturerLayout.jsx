// LecturerLayout.jsx - FULLY UPDATED
import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Menu,
  X,
  GraduationCap,
  Bell,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  TrendingUp,
  Award,
  Settings,
  HelpCircle,
  ClipboardList,
  Star,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  FileQuestion,
  Video
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LecturerNotificationPanel from "../components/LecturerNotificationPanel";
import axios from "../api/axios";

const LecturerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingTasks, setPendingTasks] = useState({ submissions: 0, grading: 0 });
  const { logout, user } = useAuth();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get("/lecturer/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Fetch pending tasks (submissions needing grading)
  const fetchPendingTasks = async () => {
    try {
      const res = await axios.get("/lecturer/attempts/pending-count");
      if (res.data.success) {
        setPendingTasks({
          submissions: res.data.submissions || 0,
          grading: res.data.grading || 0
        });
      }
    } catch (err) {
      console.error("Error fetching pending tasks:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchPendingTasks();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchPendingTasks();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    
    // Close user menu when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFormattedDate = () => {
    return currentTime.toLocaleDateString("en-US", { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const menuItems = [
    { 
      section: "Main", 
      icon: Sparkles,
      items: [
        { to: "/lecturer", label: "Dashboard", icon: LayoutDashboard, badge: null },
        { to: "/lecturer/content", label: "My Content", icon: BookOpen, badge: null },
        { to: "/lecturer/content/create", label: "Create Content", icon: FileText, badge: null },
      ]
    },
    { 
      section: "Assessment", 
      icon: ClipboardList,
      items: [
        { to: "/lecturer/attempts", label: "Student Submissions", icon: ClipboardList, badge: pendingTasks.submissions > 0 ? pendingTasks.submissions : null },
        { to: "/lecturer/grading", label: "Grade Assignments", icon: Star, badge: pendingTasks.grading > 0 ? pendingTasks.grading : null },
        { to: "/lecturer/results", label: "Results & Analytics", icon: BarChart3, badge: null },
      ]
    },
    { 
      section: "Students", 
      icon: Users,
      items: [
        { to: "/lecturer/students", label: "My Students", icon: Users, badge: null },
        { to: "/lecturer/progress", label: "Student Progress", icon: TrendingUp, badge: null },
        { to: "/lecturer/achievements", label: "Achievements", icon: Award, badge: null },
        { to: "/lecturer/exams", label: "Create Exams", icon: FileQuestion, badge: null },
      ]
    },
    { 
      section: "System", 
      icon: Settings,
      items: [
        { to: "/lecturer/profile", label: "My Profile", icon: GraduationCap, badge: null },
        { to: "/lecturer/settings", label: "Settings", icon: Settings, badge: null },
        { to: "/lecturer/help", label: "Help & Support", icon: HelpCircle, badge: null },
      ]
    },
    { 
  section: "Teaching", 
  icon: Video,
  items: [
    { to: "/lecturer/live-classes", label: "Live Classes", icon: Video, badge: null },
    { to: "/lecturer/nursing-games", label: "Nursing Games", icon: Award, badge: null }, // Add this
  ]
},

  ];

  const getUserInitials = () => {
    if (!user?.name) return "L";
    return user.name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
  };

  const getFullName = () => {
    if (!user?.name) return "Lecturer";
    return user.name;
  };

  const getLecturerTitle = () => {
    return user?.lecturerInfo?.title || "Lecturer";
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-out md:relative md:translate-x-0 flex flex-col h-full shadow-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Area */}
        <div className="flex-shrink-0 flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse-slow">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Alveoly
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 block -mt-1">Lecturer Portal</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          {menuItems.map((section) => (
            <div key={section.section} className="mb-6">
              <div className="px-3 mb-2 flex items-center gap-2">
                <section.icon className="h-3 w-3 text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {section.section}
                </span>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || 
                    (item.to !== "/lecturer" && location.pathname.startsWith(item.to));
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                          isActive
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-700 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                        }`
                      }
                    >
                      <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? "text-blue-600" : ""}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="h-3 w-3 text-blue-500" />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-800/30">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white text-sm font-semibold">{getUserInitials()}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {getFullName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {getLecturerTitle()}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                <NavLink
                  to="/lecturer/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <GraduationCap className="h-4 w-4" />
                  My Profile
                </NavLink>
                <NavLink
                  to="/lecturer/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </NavLink>
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header 
          className={`flex-shrink-0 sticky top-0 z-30 transition-all duration-300 ${
            scrolled 
              ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-lg" 
              : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getGreeting()},</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {getFullName().split(" ")[0]} 
                      <span className="text-xs text-gray-500 ml-1">({getLecturerTitle()})</span>
                    </p>
                  </div>
                  <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Center Section - Date */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{getFormattedDate()}</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
                aria-label="Toggle dark mode"
              >
                {darkMode ? 
                  <Sun className="h-4 w-4 text-yellow-500" /> : 
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                }
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </button>

              {/* Quick Stats */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {pendingTasks.grading} pending
                </span>
              </div>

              {/* Notifications */}
              <button 
                onClick={() => setNotificationsOpen(true)} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
              >
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                )}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "No new notifications"}
                </span>
              </button>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Bar (Mobile) */}
          {pendingTasks.grading > 0 && (
            <div className="md:hidden px-4 py-2 bg-yellow-50 dark:bg-yellow-950/20 border-t border-yellow-100 dark:border-yellow-900/30">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-700 dark:text-yellow-400">
                    You have {pendingTasks.grading} pending {pendingTasks.grading === 1 ? 'submission' : 'submissions'} to grade
                  </span>
                </div>
                <NavLink to="/lecturer/grading" className="text-yellow-600 font-medium text-xs">
                  Grade Now →
                </NavLink>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 py-4 px-6 bg-white/50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Alveoly. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="/lecturer/help" className="hover:text-blue-600 transition-colors">Help Center</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Notification Panel */}
      <LecturerNotificationPanel 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNotificationClick={(notification) => {
          console.log("Notification clicked:", notification);
          setUnreadCount(prev => Math.max(0, prev - 1));
        }}
      />
    </div>
  );
};

export default LecturerLayout;