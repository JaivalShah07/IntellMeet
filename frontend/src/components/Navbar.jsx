import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          IntellMeet
        </Link>

        <div className="flex items-center gap-5">
          <div className="hidden md:flex gap-5 items-center text-sm font-medium text-gray-600 dark:text-gray-300">
            <Link 
              to="/login" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden md:block"></div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}