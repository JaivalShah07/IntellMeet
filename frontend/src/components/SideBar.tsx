import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">

      <h1 className="text-2xl font-bold mb-8">
        IntellMeet
      </h1>

      <div className="flex flex-col gap-4">

        <Link to="/dashboard" className="hover:text-gray-300">
          Dashboard
        </Link>

        <Link to="/meeting" className="hover:text-gray-300">
          Meetings
        </Link>

        <Link to="/ai" className="hover:text-gray-300">
          AI Insights
        </Link>

        <Link to="/kanban" className="hover:text-gray-300">
          Tasks (Kanban)
        </Link>

        <Link to="/analytics" className="hover:text-gray-300">
          Analytics
        </Link>

      </div>

    </div>
  );
}