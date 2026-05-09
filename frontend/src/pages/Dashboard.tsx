import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Welcome to IntellMeet 🚀
        </h2>

        <Link
          to="/meeting"
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Start Meeting
        </Link>

      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Link to="/meeting" className="p-4 bg-white shadow rounded">
          🎥 Meetings
        </Link>

        <Link to="/ai" className="p-4 bg-white shadow rounded">
          🤖 AI Insights
        </Link>

        <Link to="/kanban" className="p-4 bg-white shadow rounded">
          📌 Tasks
        </Link>

        <Link to="/analytics" className="p-4 bg-white shadow rounded">
          📊 Analytics
        </Link>

      </div>

    </div>
  );
}