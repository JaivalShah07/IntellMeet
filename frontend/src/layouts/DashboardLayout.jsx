import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

import { LayoutDashboard, BarChart3, Brain, LogOut } from "lucide-react";

export default function DashboardLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r p-4 flex flex-col gap-2">
          
          <Link
            to="/dashboard"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            to="/analytics"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <BarChart3 size={18} />
            Analytics
          </Link>

          <Link
            to="/insights"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <Brain size={18} />
            AI Insights
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg bg-red-500 text-white mt-auto"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}