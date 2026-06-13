// @ts-nocheck
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  Kanban,
  Video,
  LogOut,
  Users,
  Search,
  Bell,
  ChevronDown,
  User,
  Shield,
  Sparkles,
  Settings,
} from "lucide-react";
import { type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { cn } from "../lib/utils";

function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatar) {
    return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-sky-500/30" />;
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md border border-white/10">
      {initials}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Task Assigned",
      message: "Jane Doe assigned 'Design modern dashboard layout' to you.",
      time: "2 hours ago",
      read: false,
      type: "task",
    },
    {
      id: "2",
      title: "Meeting Invitation",
      message: "Demo Admin invited you to 'Weekly Sync — Product Team'.",
      time: "5 hours ago",
      read: false,
      type: "meeting",
    },
    {
      id: "3",
      title: "AI Summary Completed",
      message: "AI insights generated for 'Sprint Planning & Roadmap review'.",
      time: "1 day ago",
      read: true,
      type: "ai",
    },
    {
      id: "4",
      title: "Welcome to IntellMeet",
      message: "Your enterprise collaboration space is ready.",
      time: "3 days ago",
      read: true,
      type: "system",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      const clickedDesktop = desktopDropdownRef.current?.contains(target);
      const clickedMobile = mobileDropdownRef.current?.contains(target);
      if (!clickedDesktop && !clickedMobile) {
        setProfileDropdownOpen(false);
      }

      const clickedNotification = notificationDropdownRef.current?.contains(target);
      if (!clickedNotification) {
        setNotificationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on location changes to avoid interrupting Link navigation
  useEffect(() => {
    setProfileDropdownOpen(false);
    setNotificationDropdownOpen(false);
  }, [location]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard Workspace";
    if (path.startsWith("/meetings")) return "Meetings Room Calendar";
    if (path.startsWith("/insights")) return "AI Performance Insights";
    if (path.startsWith("/kanban")) return "Sprint Kanban Tasks";
    if (path.startsWith("/analytics")) return "Analytics Report";
    if (path.startsWith("/team")) return "Team Administration";
    if (path.startsWith("/meeting")) return "Conference Call Room";
    return "Workspace Portal";
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/meetings", label: "Meetings", icon: Video },
    { to: "/insights", label: "AI Insights", icon: Brain },
    { to: "/kanban", label: "Tasks", icon: Kanban },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ...(user?.role === "admin" ? [{ to: "/team", label: "Team Management", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen mesh-bg flex text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-gray-200/60 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl transition-all duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-900 flex flex-col gap-4">
          <Logo to="/dashboard" size="md" />
          
          {/* User card in sidebar (static view, clicking opens topbar dropdown) */}
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10 border border-sky-500/10 dark:border-sky-500/15">
              <UserAvatar name={user.name} avatar={user.avatar} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate text-gray-800 dark:text-gray-200 leading-tight">{user.name}</p>
                <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5 flex items-center gap-1 uppercase tracking-wide">
                  <Sparkles className="w-2.5 h-2.5" />
                  {user.role} Account
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1.5 mt-2">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Navigation Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-350 transform hover:translate-x-1",
                  isActive
                    ? "bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-900/55 hover:text-indigo-600 dark:hover:text-sky-400"
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform duration-300" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-900">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Bar Navbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-gray-200/50 dark:border-gray-800/80 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl z-30 sticky top-0 transition-colors duration-300">
          
          {/* Breadcrumb Title */}
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-gray-400">Enterprise meeting space</p>
          </div>

          {/* Center Search Input */}
          {location.pathname.startsWith("/meetings") || location.pathname.startsWith("/kanban") ? (
            <div className="relative w-64 max-w-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder={location.pathname.startsWith("/meetings") ? "Search meetings..." : "Search tasks..."}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              />
            </div>
          ) : (
            <div className="w-64 max-w-sm" />
          )}

          {/* Right utilities */}
          <div className="flex items-center gap-4">
            
            {/* Notification Badge & Dropdown */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setNotificationDropdownOpen((prev) => !prev)}
                className={cn(
                  "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 relative transition-all outline-none",
                  notificationDropdownOpen && "bg-gray-100 dark:bg-gray-900 text-indigo-500"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-950 text-[9px] font-black text-white flex items-center justify-center scale-90 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Card */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl p-4 animate-slide-up z-50 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-800 dark:text-gray-200">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-sky-500 hover:text-sky-600 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-900">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.id)}
                          className={cn(
                            "py-3 flex gap-3 cursor-pointer transition-colors px-2 rounded-xl mt-1 hover:bg-sky-500/5 dark:hover:bg-sky-500/10",
                            !notif.read && "bg-sky-500/[0.02] dark:bg-indigo-500/[0.02]"
                          )}
                        >
                          <div className="shrink-0 mt-0.5">
                            {notif.type === "task" && (
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <Kanban className="w-4 h-4" />
                              </div>
                            )}
                            {notif.type === "meeting" && (
                              <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
                                <Video className="w-4 h-4" />
                              </div>
                            )}
                            {notif.type === "ai" && (
                              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <Brain className="w-4 h-4" />
                              </div>
                            )}
                            {notif.type === "system" && (
                              <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start gap-1">
                              <p className={cn("text-xs leading-normal text-gray-800 dark:text-gray-200", !notif.read ? "font-bold" : "font-medium")}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-450 dark:text-gray-400 leading-normal mt-0.5">{notif.message}</p>
                            <p className="text-[9px] text-gray-400 mt-1 font-medium">{notif.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Switcher */}
            <ThemeToggle />

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

            {/* Interactive Profile Dropdown */}
            {user && (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-all outline-none"
                >
                  <UserAvatar name={user.name} avatar={user.avatar} />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight truncate max-w-[100px]">{user.name}</p>
                    <p className="text-[9px] font-semibold text-gray-400 leading-none">Settings</p>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-gray-500 transition-transform duration-300", profileDropdownOpen && "transform rotate-180")} />
                </button>

                {/* Dropdown Card */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl p-4 animate-slide-up z-50 text-left">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-900">
                      <UserAvatar name={user.name} avatar={user.avatar} />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-gray-800 dark:text-white truncate">{user.name}</h4>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1 text-xs">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-2.5 py-2 text-gray-600 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>Profile Details</span>
                      </Link>
                      <div className="flex items-center justify-between px-2.5 py-2 text-gray-600 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-500" />
                          <span>Privilege level</span>
                        </div>
                        <span className="text-[9px] uppercase font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-2.5 py-2 text-gray-600 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <Settings className="w-4 h-4 text-sky-500" />
                        <span>Workspace Settings</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-900">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </header>

        {/* Mobile Header Nav (Responsive layout) */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-gray-250 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md transition-colors duration-300">
          <Logo to="/dashboard" size="sm" />
          
          <nav className="flex items-center gap-1.5">
            {navItems.slice(0, 4).map(({ to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "p-2 rounded-xl transition-all",
                    isActive
                      ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
                      : "text-gray-500 dark:text-gray-400"
                  )
                }
              >
                <Icon className="w-4.5 h-4.5" />
              </NavLink>
            ))}
            
            <ThemeToggle />

            {/* Mobile Dropdown Triggers */}
            {user && (
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full border border-sky-500/20 overflow-hidden ml-1 outline-none"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl p-3.5 animate-slide-up z-50">
                    <div className="pb-2.5 border-b border-gray-100 dark:border-gray-900 text-left">
                      <h4 className="font-extrabold text-xs text-gray-800 dark:text-white truncate">{user.name}</h4>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-2 space-y-0.5 text-xs text-left">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 p-2 hover:bg-gray-55 dark:hover:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-300"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Profile details</span>
                      </Link>
                      <div
                        onClick={handleLogout}
                        className="flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-auto bg-slate-50/20 dark:bg-slate-950/10 transition-colors duration-300">
          {children}
        </main>
      </div>

    </div>
  );
}
