export default function MeetingRoom() {
  return (
    <div className="h-screen flex bg-gray-900 text-white">

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">

        <div className="flex-1 flex items-center justify-center bg-black">
          <h1 className="text-2xl opacity-70">
            🎥 Video Stream Area (WebRTC later)
          </h1>
        </div>

        {/* Bottom Controls */}
        <div className="h-20 flex items-center justify-center gap-4 bg-gray-800">

          <button className="px-4 py-2 bg-red-600 rounded">
            Mute
          </button>

          <button className="px-4 py-2 bg-indigo-600 rounded">
            Camera
          </button>

          <button className="px-4 py-2 bg-green-600 rounded">
            Share Screen
          </button>

        </div>

      </div>

      {/* Right Panel */}
      <div className="w-80 bg-gray-800 p-4 flex flex-col">

        <h2 className="font-bold mb-4">
          Participants
        </h2>

        <div className="flex-1 space-y-2">

          <div className="p-2 bg-gray-700 rounded">
            You
          </div>

          <div className="p-2 bg-gray-700 rounded">
            Team Member 1
          </div>

        </div>

        {/* Chat Box UI */}
        <div className="mt-4">

          <h3 className="font-bold mb-2">
            Chat
          </h3>

          <div className="h-32 bg-gray-700 p-2 rounded mb-2 overflow-auto text-sm">
            <p>User: Hello 👋</p>
          </div>

          <input
            className="w-full p-2 rounded text-black"
            placeholder="Type message..."
          />

        </div>

      </div>

    </div>
  );
}