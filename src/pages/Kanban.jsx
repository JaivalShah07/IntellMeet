export default function Kanban() {
  return (
    <div className="p-6 min-h-screen bg-gray-100">

      <h1 className="text-2xl font-bold mb-6">
        Team Task Board 📌
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* TO DO */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-3 text-red-500">To Do</h2>

          <div className="p-2 bg-gray-100 rounded mb-2">
            Design UI mockups
          </div>

          <div className="p-2 bg-gray-100 rounded">
            Setup API structure
          </div>
        </div>

        {/* DOING */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-3 text-yellow-500">In Progress</h2>

          <div className="p-2 bg-gray-100 rounded">
            Build dashboard UI
          </div>
        </div>

        {/* DONE */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-3 text-green-500">Done</h2>

          <div className="p-2 bg-gray-100 rounded">
            Project setup completed
          </div>

        </div>

      </div>

    </div>
  );
}