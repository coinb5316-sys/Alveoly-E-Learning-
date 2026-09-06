// StudentLayout.jsx - Fully Scrollable with Professional Design
import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Wallet,
  Bot,
  Tags,
  CheckCircle,
  Menu,
  X,
  LogOut,
  Bell,
  Moon,
  Sun,
  User,
  GraduationCap,
  Zap,
  Star,
  ChevronRight,
  DollarSign,
  Video,
  Award,
  Lock,
  Trophy,
  ChevronDown,
  Crown,
  Shield,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import StudentNotificationPanel from "../components/StudentNotificationPanel";
import { FaRobot } from "react-icons/fa";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationBadge, setNotificationBadge] = useState(3);
  const [isExamMode, setIsExamMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const examCheckInterval = useRef(null);

  // Check if currently on exam page
  useEffect(() => {
    const checkExamMode = () => {
      const isExam = location.pathname.includes('/student/exam/') && 
                     !location.pathname.includes('/exam-results');
      setIsExamMode(isExam);
      
      if (isExam) {
        document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
          if (!el.closest('#exam-container')) {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
          }
        });
      } else {
        document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
          el.style.pointerEvents = '';
          el.style.opacity = '';
        });
      }
    };

    checkExamMode();
    examCheckInterval.current = setInterval(checkExamMode, 1000);

    return () => {
      if (examCheckInterval.current) {
        clearInterval(examCheckInterval.current);
      }
      document.querySelectorAll('a, button, .nav-link, .menu-item, .sidebar-link, .header-link, [role="button"]').forEach(el => {
        el.style.pointerEvents = '';
        el.style.opacity = '';
      });
    };
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const toggleSection = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleNotificationClick = (notification) => {
    console.log("Notification clicked:", notification);
    if (notification.link) {
      window.location.href = notification.link;
    }
    setNotificationBadge(prev => Math.max(0, prev - 1));
  };

  const handleNavigation = (to) => {
    if (isExamMode) {
      const isOnExam = location.pathname.includes('/student/exam/') && 
                       !location.pathname.includes('/exam-results');
      if (isOnExam) {
        alert("⚠️ You cannot navigate away from the exam page. Please complete your exam first.");
        return;
      }
    }
    navigate(to);
  };

  const menuSections = [
    {
      section: "Main",
      items: [
        { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
        { to: "/student/courses", label: "My Courses", icon: BookOpen, color: "text-green-500" },
        { to: "/student/nursing-games", label: "Nursing Games", icon: Award, color: "text-yellow-500" },
        { to: "/student/subjects", label: "Subjects", icon: ClipboardList, color: "text-purple-500" },
      ]
    },
    {
      section: "Progress",
      items: [
        { to: "/student/exam-results", label: "Exam Results", icon: Trophy, color: "text-amber-500" },
        { to: "/student/progress", label: "Progress", icon: TrendingUp, color: "text-orange-500" },
      ]
    },
    {
      section: "Subscriptions",
      items: [
        { to: "/student/plans", label: "Plans", icon: Tags, color: "text-pink-500" },
        { to: "/student/payments", label: "Payments", icon: Wallet, color: "text-yellow-500" },
        { to: "/student/content-payment", label: "Content Payment", icon: DollarSign, color: "text-indigo-500" },
      ]
    },
    {
      section: "Community",
      items: [
        { to: "/student/testimonials", label: "Testimonials", icon: Star, color: "text-amber-500" },
        { to: "/student/live-classes", label: "Live Classes", icon: Video, color: "text-red-500" },
        { to: "/student/ai", label: "AI Assistant", icon: FaRobot, color: "text-pink-500" },
      ]
    },
  ];

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return "S";
    return user.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check plan status for badge
  const hasActivePlan = user?.isPlanActive && !user?.planDeactivatedByAdmin;

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fully Scrollable */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-out md:relative md:translate-x-0 flex flex-col h-full ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area - Fixed */}
        <div className="flex-shrink-0 flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Alveoly
            </span>
            {isExamMode && (
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                🔒 Exam
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {menuSections.map((section) => {
            const isCollapsed = collapsedSections[section.section] || false;
            
            return (
              <div key={section.section} className="mb-4">
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full flex items-center justify-between px-3 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <span>{section.section}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
                <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    const isDisabled = isExamMode && location.pathname.includes('/student/exam/');
                    return (
                      <button
                        key={item.to}
                        onClick={() => handleNavigation(item.to)}
                        disabled={isDisabled}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? item.color : ""}`} />
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        {isActive && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
                        {isDisabled && <Lock className="h-3 w-3 text-red-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User profile - Fixed */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-sm font-semibold">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || "Student"}
                </p>
                {hasActivePlan && (
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500" title="Active Plan" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || "student@alveoly.com"}
              </p>
            </div>
            <button
              onClick={logout}
              disabled={isExamMode}
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                isExamMode 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Fixed */}
        <header
          className={`flex-shrink-0 sticky top-0 z-30 transition-all duration-200 ${
            scrolled
              ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm"
              : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 flex-shrink-0"
                disabled={isExamMode}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Welcome text */}
              <div className="hidden md:block min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Welcome back,
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                  {user?.name?.split(" ")[0] || "Student"} 👋
                  {hasActivePlan && (
                    <span className="text-xs font-normal bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Active Plan
                    </span>
                  )}
                </p>
              </div>

              {/* Page title */}
              <div className="hidden lg:block ml-4">
                <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 capitalize">
                  {location.pathname.split("/").pop() || "Dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
                disabled={isExamMode}
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
                disabled={isExamMode}
              >
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                {notificationBadge > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                )}
              </button>

              {isExamMode && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg shadow-lg shadow-red-500/25 animate-pulse">
                  <Lock className="h-3 w-3" />
                  Exam Mode
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 max-w-7xl">
            <Outlet />
          </div>
          <div className="h-4" />
        </main>
      </div>

      {/* Student Notification Panel */}
      <StudentNotificationPanel 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
};

export default StudentLayout;