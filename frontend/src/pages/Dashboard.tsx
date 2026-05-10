import DashboardLayout from "../layouts/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to IntellMeet 🚀</h1>
        <p className="text-gray-500 mt-1">
          Manage meetings, insights and AI summaries in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Total Meetings</h2>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">AI Summaries</h2>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Active Users</h2>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="flex gap-4 flex-wrap">
          <button className="px-5 py-3 bg-black text-white rounded-xl hover:opacity-80">
            + Create Meeting
          </button>

          <button className="px-5 py-3 bg-gray-200 rounded-xl hover:bg-gray-300">
            View Analytics
          </button>

          <button className="px-5 py-3 bg-gray-200 rounded-xl hover:bg-gray-300">
            AI Insights
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}