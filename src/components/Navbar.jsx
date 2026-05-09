import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <div className="h-16 flex items-center justify-between px-6 bg-white shadow">

      <div className="flex gap-4 text-sm">

        <Link to="/dashboard">Home</Link>
        <Link to="/meeting">Meeting</Link>
        <Link to="/ai">AI</Link>

      </div>

      <ThemeToggle />

    </div>
  );
}