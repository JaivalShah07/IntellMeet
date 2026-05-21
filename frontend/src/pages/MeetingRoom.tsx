import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  MessageSquare,
  Users,
  Wifi,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

export default function MeetingRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roomId = searchParams.get("room") || "demo-room";
  const userName = user?.name || "Guest";

  const { messages, connected, sendMessage } = useSocket(roomId, userName);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(chatInput);
    setChatInput("");
  };

  return (
    <div className="h-screen w-full flex bg-[#0f172a] text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-sky-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none" />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 relative ${
          showPanel ? "mr-[320px] md:mr-[380px]" : "mr-0"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Room {roomId}</span>
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Wifi className={`w-3 h-3 ${connected ? "text-emerald-400" : "text-red-400"}`} />
              {connected ? "Socket.io live" : "Connecting..."}
            </span>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-lg">
            WebRTC-ready UI · F-02
          </span>
        </div>

        <div className="flex-1 p-6 pt-24 pb-32 flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-video bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-white/5 flex flex-col items-center justify-center shadow-2xl">
            <Video className="w-16 h-16 text-slate-500 mb-4" />
            <h1 className="text-xl text-slate-300 font-medium text-center px-6">
              Video stream placeholder — WebRTC peer connection phase
            </h1>
            <p className="text-slate-500 text-sm mt-2">Real-time chat is active via Socket.io</p>
            <div className="absolute bottom-4 left-4 bg-slate-900/80 px-3 py-1.5 rounded-lg text-sm border border-white/10">
              {userName} (Host)
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/70 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl z-20">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-xl ${isMuted ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-xl ${isVideoOff ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
          <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 hidden sm:block">
            <MonitorUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-4 rounded-xl bg-red-600 hover:bg-red-700 font-semibold flex items-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            Leave
          </button>
        </div>
      </div>

      <div
        className={`absolute right-0 top-0 bottom-0 w-[320px] md:w-[380px] bg-slate-900/60 backdrop-blur-2xl border-l border-white/10 flex flex-col z-30 transition-transform ${
          showPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-white/10 flex gap-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${
              activeTab === "chat" ? "bg-white/10" : "text-slate-400"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${
              activeTab === "participants" ? "bg-white/10" : "text-slate-400"
            }`}
          >
            <Users className="w-4 h-4" /> People
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === "chat" ? (
            messages.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                Send a message — real-time via Socket.io
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 rounded-xl p-3 border border-white/5 max-w-[90%]"
                >
                  <p className="text-xs text-slate-400 mb-1">
                    {msg.userName} · {new Date(msg.at).toLocaleTimeString()}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))
            )
          ) : (
            <div className="p-3 rounded-xl bg-white/5">
              <p className="font-semibold text-sm">{userName} (You)</p>
              <p className="text-xs text-slate-400">Host · Connected</p>
            </div>
          )}
        </div>

        {activeTab === "chat" && (
          <form onSubmit={handleSend} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message everyone..."
                className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-xl font-semibold text-sm"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>

      <Link
        to="/dashboard"
        className="absolute top-6 left-6 z-20 text-sm text-slate-400 hover:text-white"
      >
        ← Dashboard
      </Link>
    </div>
  );
}
