import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Logo to={user ? "/dashboard" : "/"} />

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-3 items-center text-sm font-medium">
            {user ? (
              <>
                <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Hi, {user.name}
                </span>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className={cn("btn-primary px-5 py-2.5 rounded-full text-sm")}
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
