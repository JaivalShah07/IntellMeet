import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-gray-100">

        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="p-6 overflow-auto">
          <Outlet />
        </div>

      </div>

    </div>
  );
}