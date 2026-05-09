import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative
      bg-gradient-to-r from-indigo-600 to-purple-700
      dark:from-gray-900 dark:to-black
      transition-colors duration-300
    ">
      
      {/* Theme Toggle (top-right) */}
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="text-center text-white dark:text-white px-4">

        <h1 className="text-6xl font-bold mb-4 tracking-tight">
          IntellMeet
        </h1>

        <p className="text-lg opacity-80 mb-8">
          AI-powered smart meetings platform
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">

          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-white text-black font-semibold hover:scale-105 transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-black transition"
          >
            Signup
          </Link>

        </div>

      </div>

      {/* Subtle glow effect */}
      <div className="absolute w-72 h-72 bg-purple-500 blur-3xl opacity-30 rounded-full top-20 left-20"></div>
      <div className="absolute w-72 h-72 bg-indigo-500 blur-3xl opacity-30 rounded-full bottom-20 right-20"></div>

    </div>
  );
}