export default function AIInsights() {
  return (
    <div className="p-6 min-h-screen bg-gray-100">

      <h1 className="text-2xl font-bold mb-6">
        AI Meeting Insights 🤖
      </h1>

      {/* Transcript */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-semibold mb-2">Live Transcript</h2>
        <p className="text-gray-600">
          [AI will generate real-time transcription here...]
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-semibold mb-2">Summary</h2>
        <p className="text-gray-600">
          [AI-generated meeting summary will appear here...]
        </p>
      </div>

      {/* Action Items */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Action Items</h2>

        <ul className="list-disc ml-5 text-gray-600">
          <li>Assign UI design to team member</li>
          <li>Prepare backend API structure</li>
          <li>Schedule next meeting</li>
        </ul>

      </div>

    </div>
  );
}