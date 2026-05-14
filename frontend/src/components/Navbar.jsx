import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <Link
        to="/"
        className="text-2xl font-bold text-blue-600"
      >
        IntellMeet
      </Link>

      <div className="flex gap-4 items-center">
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}