import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Video, Calendar, Clock, Plus, Loader2, X } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import api from "../lib/api";
import type { Meeting } from "../types";
import CreateMeetingModal from "../components/CreateMeetingModal";

export default function MeetingsList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = () => {
    setLoading(true);
    api.get("/meetings")
      .then((res) => setMeetings(res.data.meetings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    setShowJoinModal(false);
    navigate(`/meeting?room=${joinRoomId.trim()}`);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " - " + d.toLocaleDateString();
  };

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title="Meetings"
            subtitle="View your past and upcoming meetings."
            icon={Video}
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setJoinRoomId("");
                setShowJoinModal(true);
              }}
              className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Video className="w-5 h-5" />
              Join Meeting
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Meeting
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings by title..."
            className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:ring-sky-500 outline-none text-sm text-gray-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:ring-sky-500 outline-none text-sm text-gray-900 dark:text-white w-full sm:w-44"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="card-elevated rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                All Meetings
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {meetings.filter((m) => {
                const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === "all" || m.status === statusFilter;
                return matchesSearch && matchesStatus;
              }).length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No matching meetings found.</p>
                </div>
              ) : (
                meetings.filter((m) => {
                  const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesStatus = statusFilter === "all" || m.status === statusFilter;
                  return matchesSearch && matchesStatus;
                }).map((m) => (
                  <div
                    key={m._id}
                    className="p-6 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{m.title}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTime(m.scheduledAt)} · Room ID: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{m.roomId}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${m.status === 'completed'
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                        }`}>
                        {m.status === 'completed' ? 'Completed' : m.type}
                      </span>
                      <Link
                        to={`/meeting?room=${m.roomId}`}
                        className={`px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${m.status === 'completed'
                            ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                            : 'btn-primary'
                          }`}
                      >
                        Join
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reusable Create Meeting Modal */}
        <CreateMeetingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={loadMeetings}
        />

        {/* Join Meeting Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">Join Meeting</h3>
                <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleJoinMeeting} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Room ID</label>
                  <input
                    autoFocus
                    required
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    placeholder="Enter the 8-character room ID"
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"
                  >
                    Join Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
