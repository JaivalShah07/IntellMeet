export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-black dark:text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Meetings</h2>
          <p className="text-4xl font-bold">12</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
          <p className="text-4xl font-bold">8</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <p className="text-4xl font-bold">4</p>
        </div>
      </div>
    </div>
  );
}