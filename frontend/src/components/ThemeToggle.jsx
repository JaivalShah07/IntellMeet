import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <FiSun
          className={`absolute text-amber-500 transition-all duration-500 ease-in-out transform ${
            theme === "dark" 
              ? "translate-y-8 opacity-0 rotate-90" 
              : "translate-y-0 opacity-100 rotate-0"
          } w-5 h-5`}
        />
        <FiMoon
          className={`absolute text-indigo-400 transition-all duration-500 ease-in-out transform ${
            theme === "dark" 
              ? "translate-y-0 opacity-100 rotate-0" 
              : "-translate-y-8 opacity-0 -rotate-90"
          } w-5 h-5`}
        />
      </div>
    </button>
  );
}