import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  Kanban,
  Video,
  LogOut,
  Users,
} from "lucide-react";
import { type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import { cn } from "../lib/utils";

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/15">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate">{name}</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Ready to collaborate
        </p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
    <div className="min-h-screen mesh-bg flex">
      <aside className="hidden lg:flex w-72 flex-col border-r border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <Logo to="/dashboard" size="md" />
          {user && <UserAvatar name={user.name} />}
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Workspace
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  isActive
                    ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25"
                    : "text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-300"
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
          <Logo to="/dashboard" size="sm" />
          <nav className="flex gap-1">
            {navItems.slice(0, 4).map(({ to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "p-2.5 rounded-xl transition-all",
                    isActive
                      ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
                      : "text-gray-500"
                  )
                }
              >
                <Icon className="w-5 h-5" />
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
