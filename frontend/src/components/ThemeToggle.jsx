import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {

  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:scale-105 transition-all duration-300"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}