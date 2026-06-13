// @ts-nocheck
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Activity,
  Video,
  Plus,
  BarChart3,
  Clock,
  Sparkles,
  TrendingUp,
  Flame,
  Loader2,
  FileText,
  ThumbsUp,
  CheckCircle,
  Play,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import type { Meeting, DashboardStats } from "../types";
import CreateMeetingModal from "../components/CreateMeetingModal";

// Skeletons for Loading States
function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="w-12 h-5 rounded bg-gray-205 dark:bg-gray-800" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="w-16 h-8 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function MeetingItemSkeleton() {
  return (
    <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-900 animate-pulse">
      <div className="space-y-2.5">
        <div className="w-48 h-5 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="w-36 h-4 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-16 h-6 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="w-20 h-9 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function HighlightSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 animate-pulse">
      <div className="w-36 h-4 rounded bg-gray-205 dark:bg-gray-800" />
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="w-5/6 h-3 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="w-24 h-4 rounded bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([api.get("/meetings"), api.get("/meetings/stats")])
      .then(([mRes, sRes]) => {
        setMeetings(mRes.data.meetings || []);
        setStats(sRes.data.stats || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Filter meetings into Upcoming (scheduled, live) and Completed (history)
  const upcomingMeetings = meetings.filter(
    (m) => m.status === "scheduled" || m.status === "live"
  );
  
  const completedMeetings = meetings
    .filter((m) => m.status === "completed")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()); // Latest first

  const statCards = stats
    ? [
        { 
          label: "Total Sessions", 
          value: String(stats.totalMeetings), 
          icon: Video, 
          gradient: "from-sky-550/10 to-sky-600/10 dark:from-sky-500/10 dark:to-sky-600/10 text-sky-600 dark:text-sky-400" 
        },
        { 
          label: "AI Insights Log", 
          value: String(stats.aiInsights), 
          icon: Activity, 
          gradient: "from-indigo-500/10 to-indigo-600/10 dark:from-indigo-500/10 dark:to-indigo-600/10 text-indigo-600 dark:text-indigo-400" 
        },
        { 
          label: "Collaborated Hours", 
          value: `${stats.hoursCollaborated}h`, 
          icon: Clock, 
          gradient: "from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/10 dark:to-emerald-600/10 text-emerald-600 dark:text-emerald-400" 
        },
        { 
          label: "Active Spaces", 
          value: String(stats.activeProjects), 
          icon: Users, 
          gradient: "from-rose-500/10 to-rose-600/10 dark:from-rose-500/10 dark:to-rose-600/10 text-rose-600 dark:text-rose-400" 
        },
      ]
    : [];

  return (
    <div className="min-h-full p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner Card */}
        <div className="rounded-3xl overflow-hidden relative shadow-xl shadow-indigo-500/5 animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-indigo-500 to-indigo-700 dark:from-sky-550 dark:via-indigo-650 dark:to-indigo-850" />
          <div className="absolute -inset-10 bg-radial-gradient from-white/10 to-transparent blur-2xl opacity-60" />
          <div className="relative px-6 py-10 md:px-12 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
            <div className="space-y-2">
              <p className="text-sky-100 text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                Workspace Connected
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {greeting}, {firstName}!
              </h1>
              <p className="text-white/85 text-sm md:text-base font-medium max-w-lg">
                {loading
                  ? "Retrieving your workspace details..."
                  : `You have ${upcomingMeetings.length} upcoming meetings scheduled for today.`}
              </p>
            </div>
            
            {/* Quick CTA Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-indigo-700 hover:bg-sky-50 rounded-2xl font-bold shadow-lg text-sm transition-all hover:scale-103"
              >
                <Plus className="w-4.5 h-4.5" />
                Create Meeting
              </button>
              <Link
                to="/meetings"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold backdrop-blur-md text-sm transition-all hover:scale-103"
              >
                <Video className="w-4.5 h-4.5" />
                Join Room ID
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="card-elevated rounded-2xl p-6 flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                        <TrendingUp className="w-2.5 h-2.5" /> Live
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Double-Column Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Area: Tabbed Meetings Log */}
          <div className="lg:col-span-2 card-elevated rounded-3xl overflow-hidden flex flex-col">
            
            {/* Log Tabs */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-gray-950/20">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded bg-indigo-500" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Meetings Agenda</h3>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl text-xs font-bold border border-gray-200/50 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === "upcoming"
                      ? "bg-white dark:bg-gray-850 text-indigo-650 dark:text-sky-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  Upcoming ({upcomingMeetings.length})
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === "history"
                      ? "bg-white dark:bg-gray-850 text-indigo-650 dark:text-sky-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  History ({completedMeetings.length})
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="divide-y divide-gray-100 dark:divide-gray-900/60 flex-1 max-h-[460px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <MeetingItemSkeleton key={i} />)
              ) : activeTab === "upcoming" ? (
                upcomingMeetings.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
                    <Video className="w-12 h-12 text-gray-300 dark:text-gray-800" />
                    <div>
                      <p className="font-semibold text-gray-550 dark:text-gray-300">No upcoming meetings</p>
                      <p className="text-xs text-gray-400 max-w-xs mt-1">Schedule a session or copy your roommate ID to begin collaborating.</p>
                    </div>
                    <button
                      onClick={() => setCreateModalOpen(true)}
                      className="px-4 py-2 text-xs font-bold text-indigo-650 dark:text-sky-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100/50"
                    >
                      Schedule Now
                    </button>
                  </div>
                ) : (
                  upcomingMeetings.map((m) => (
                    <div
                      key={m._id}
                      className="p-6 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900 dark:text-white hover:text-indigo-650 dark:hover:text-sky-400 transition-colors">
                          {m.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-indigo-650 dark:text-sky-400">{formatDate(m.scheduledAt)}</span>
                          <span>·</span>
                          <span>{formatTime(m.scheduledAt)}</span>
                          <span>·</span>
                          <span className="font-mono bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-[10px]">Room: {m.roomId}</span>
                        </p>
                        {m.description && (
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-1 italic">{m.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/10 rounded-full">
                          {m.type}
                        </span>
                        <Link
                          to={`/meeting?room=${m.roomId}`}
                          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all hover:-translate-y-0.5"
                        >
                          Join
                        </Link>
                      </div>
                    </div>
                  ))
                )
              ) : completedMeetings.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-800" />
                  <div>
                    <p className="font-semibold text-gray-550 dark:text-gray-350">No meeting logs found</p>
                    <p className="text-xs text-gray-400 max-w-xs mt-1">Once meetings are ended and compiled, their logs will populate here.</p>
                  </div>
                </div>
              ) : (
                completedMeetings.map((m) => (
                  <div
                    key={m._id}
                    className="p-6 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all duration-300"
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-850 dark:text-white">
                          {m.title}
                        </h4>
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded-full">
                          {m.durationMinutes || 60}m duration
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Hosted by <span className="font-semibold">{m.host?.name || "Member"}</span> on {formatDate(m.scheduledAt)} at {formatTime(m.scheduledAt)}
                      </p>
                      
                      {m.summary && (
                        <div className="mt-2.5 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100/50 dark:border-gray-900 text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                          <span className="font-bold text-indigo-500 mr-1 flex-inline items-center gap-0.5">Summary:</span>
                          {m.summary}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end gap-2.5 shrink-0 self-center sm:self-start">
                      {m.sentimentScore !== null && m.sentimentScore !== undefined && (
                        <div className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{m.sentimentScore}% Pos</span>
                        </div>
                      )}
                      
                      {m.hasRecording && (
                        <a
                          href={m.recordingUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                          onClick={(e) => {
                            if (!m.recordingUrl) {
                              e.preventDefault();
                              alert("Recording is still processing or unavailable.");
                            }
                          }}
                        >
                          <Play className="w-3.5 h-3.5 fill-indigo-500/20" />
                          <span>Watch Recording</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Area: AI Highlights Column */}
          <div className="card-elevated rounded-3xl p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded bg-indigo-500" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  AI Summaries Log <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                </h3>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <HighlightSkeleton key={i} />)
                ) : meetings.filter((m) => m.summary).length > 0 ? (
                  meetings
                    .filter((m) => m.summary)
                    .slice(0, 3)
                    .map((m) => (
                      <div
                        key={m._id}
                        className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/60 dark:border-indigo-500/15 space-y-2 text-left"
                      >
                        <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                          <span className="truncate mr-2">{m.title}</span>
                          {m.sentimentScore && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">
                              {m.sentimentScore}%
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-indigo-805/85 dark:text-indigo-100/75 leading-relaxed line-clamp-3">
                          {m.summary}
                        </p>
                        <div className="flex justify-between items-center pt-1 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(m.scheduledAt)}
                          </span>
                          <span className="font-semibold text-indigo-650 dark:text-sky-400">View notes</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-16 bg-slate-50/50 dark:bg-gray-900/25 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    No summaries available. Run AI analysis from the Insights tab after ending a live stream.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/insights"
                className="block w-full py-3.5 text-center rounded-2xl border border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-55/10 hover:border-indigo-500/40 transition-all"
              >
                Explore AI Insights Portal
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Reusable Schedule/Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
