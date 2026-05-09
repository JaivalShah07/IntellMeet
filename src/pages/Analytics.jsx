export default function Analytics() {
  return (
    <div className="p-6 min-h-screen bg-gray-100">

      <h1 className="text-2xl font-bold mb-6">
        Analytics & Insights 📊
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-sm text-gray-500">Total Meetings</h2>
          <p className="text-3xl font-bold">24</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-sm text-gray-500">Avg Engagement</h2>
          <p className="text-3xl font-bold">78%</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-sm text-gray-500">Tasks Completed</h2>
          <p className="text-3xl font-bold">42</p>
        </div>

      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="font-bold mb-3">Meeting Activity</h2>

        <div className="h-40 flex items-end gap-2">

          <div className="w-6 bg-indigo-400 h-10"></div>
          <div className="w-6 bg-indigo-400 h-20"></div>
          <div className="w-6 bg-indigo-400 h-14"></div>
          <div className="w-6 bg-indigo-400 h-28"></div>
          <div className="w-6 bg-indigo-400 h-16"></div>

        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded shadow">

        <h2 className="font-bold mb-3">AI Insights</h2>

        <ul className="list-disc ml-5 text-gray-600 space-y-1">
          <li>Meetings are most productive on weekdays</li>
          <li>Average meeting duration: 32 mins</li>
          <li>Action item completion rate improved by 18%</li>
        </ul>

      </div>

    </div>
  );
}