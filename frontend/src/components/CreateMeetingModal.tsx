// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Calendar, Users, Clock, Video, Loader2, Sparkles, Check } from "lucide-react";
import api from "../lib/api";
import type { User } from "../types";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateMeetingModal({ isOpen, onClose, onSuccess }: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Video");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [joinImmediately, setJoinImmediately] = useState(true);

  // Users data
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setType("Video");
      // Default scheduled date to today and time to next hour
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);

      const hours = String((now.getHours() + 1) % 24).padStart(2, "0");
      setTime(`${hours}:00`);
      
      setDuration(60);
      setSelectedParticipants([]);
      setJoinImmediately(true);
      setError(null);

      // Load users
      setLoadingUsers(true);
      api
        .get("/auth/users")
        .then((res) => {
          setUsers(res.data.users || []);
        })
        .catch((err) => {
          console.error("Failed to fetch users:", err);
          setError("Failed to load team members.");
        })
        .finally(() => setLoadingUsers(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setError(null);

    try {
      // Calculate scheduledAt ISO string
      const scheduledDateTime = new Date(`${date}T${time}`);
      
      const payload = {
        title,
        description,
        type,
        scheduledAt: scheduledDateTime.toISOString(),
        durationMinutes: Number(duration),
        participants: selectedParticipants,
      };

      const { data } = await api.post("/meetings", payload);

      onClose();
      if (onSuccess) {
        onSuccess();
      }

      if (joinImmediately) {
        navigate(`/meeting?room=${data.meeting.roomId}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create meeting.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-sky-500/5 to-indigo-500/5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                Schedule Meeting <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse-slow" />
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configure room details and invite team members</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left side: Basic Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Meeting Title <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Sync or Standup"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Meeting Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none text-sm transition-all"
                >
                  <option value="Video">Video Call</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Standup">Standup</option>
                  <option value="External">External Meeting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Right side: Description & Participants */}
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Description / Agenda
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this meeting about?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 outline-none text-sm transition-all resize-none"
                />
              </div>

              <div className="flex-1 flex flex-col min-h-[160px]">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                  <Users className="w-4 h-4 text-indigo-500" /> Invite Participants
                </label>
                <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5 overflow-y-auto max-h-[160px] space-y-1">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : users.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No other members registered.</p>
                  ) : (
                    users.map((u) => {
                      const isSelected = selectedParticipants.includes(u.id);
                      return (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => handleToggleParticipant(u.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-sm transition-all ${
                            isSelected
                              ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                              : "hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shadow-sm" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 text-white flex items-center justify-center text-[10px] font-bold">
                                {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="truncate">
                              <p className="font-semibold leading-tight text-xs">{u.name}</p>
                              <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="p-0.5 rounded-full bg-indigo-600 text-white shadow-sm shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Flags */}
          <div className="pt-2 flex items-center border-t border-gray-150 dark:border-gray-800">
            <label className="relative flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={joinImmediately}
                onChange={(e) => setJoinImmediately(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
              />
              <div className="text-left">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Join room immediately</span>
                <p className="text-xs text-gray-400 leading-tight">Redirects you to the video stream room once created</p>
              </div>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !title.trim()}
              className="btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {joinImmediately ? "Create & Join" : "Schedule Meeting"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
