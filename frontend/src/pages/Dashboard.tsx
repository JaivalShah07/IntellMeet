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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import type { Meeting, DashboardStats } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    Promise.all([api.get("/meetings"), api.get("/meetings/stats")])
      .then(([mRes, sRes]) => {
        setMeetings(mRes.data.meetings);
        setStats(sRes.data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const statCards = stats
    ? [
        { label: "Total Meetings", value: String(stats.totalMeetings), icon: Video },
        { label: "AI Insights", value: String(stats.aiInsights), icon: Activity },
        { label: "Hours Collaborated", value: String(stats.hoursCollaborated), icon: Clock },
        { label: "Active Projects", value: String(stats.activeProjects), icon: Users },
      ]
    : [];

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="rounded-2xl overflow-hidden relative animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />
          <div className="relative px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
            <div>
              <p className="text-sky-100 text-sm font-semibold flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-amber-300" />
                Enterprise workspace · JWT secured
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                {greeting}, {firstName}! Today looks promising.
              </h1>
              <p className="text-white/85 mt-2 max-w-lg">
                {loading
                  ? "Loading your meetings..."
                  : `${meetings.length} upcoming meetings on your calendar.`}
              </p>
            </div>
            <Link
              to="/meetings"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:bg-sky-50 shrink-0"
            >
              <Plus className="w-5 h-5" />
              Join meeting room
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="card-elevated rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 inline" /> Live
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-extrabold">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 card-elevated rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    Upcoming meetings
                  </h3>
                  <span className="text-sm text-emerald-600 font-semibold">From MongoDB</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {meetings.length === 0 ? (
                    <p className="p-8 text-center text-gray-500">No meetings yet. Run backend seed.</p>
                  ) : (
                    meetings.map((m) => (
                      <div
                        key={m._id}
                        className="p-6 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-semibold mb-1">{m.title}</h4>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatTime(m.scheduledAt)} · Room {m.roomId}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                            {m.type}
                          </span>
                          <Link
                            to={`/meeting?room=${m.roomId}`}
                            className="px-4 py-2 btn-primary rounded-xl text-sm font-semibold"
                          >
                            Join
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card-elevated rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  AI highlights
                </h3>
                <div className="space-y-4">
                  {meetings.filter((m) => m.summary).length > 0 ? (
                    meetings
                      .filter((m) => m.summary)
                      .slice(0, 2)
                      .map((m) => (
                        <div
                          key={m._id}
                          className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
                        >
                          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                            {m.title}
                          </h4>
                          <p className="text-sm text-indigo-800/90 dark:text-indigo-100/90 line-clamp-3">
                            {m.summary}
                          </p>
                          {m.sentimentScore && (
                            <p className="text-xs mt-2 text-emerald-600 font-semibold">
                              Sentiment: {m.sentimentScore}% positive
                            </p>
                          )}
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      Run AI analysis from the Insights page after a meeting.
                    </p>
                  )}
                  <Link
                    to="/insights"
                    className="block w-full py-3 text-center rounded-xl border-2 border-sky-200 text-sm font-bold text-sky-700 hover:bg-sky-50"
                  >
                    Explore AI insights
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
