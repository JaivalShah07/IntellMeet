import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Clock, CheckCircle2, Sparkles, Loader2, Download, Users } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import api from "../lib/api";

export default function Analytics() {
  const [stats, setStats] = useState<Record<string, string | number> | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics")
      .then((res) => {
        setStats(res.data.stats);
        setChartData(res.data.chartData);
        setInsights(res.data.insights);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExportReport = () => {
    if (!stats) return;
    
    const headers = "Metric,Value\n";
    const rows = [
      `Total Meetings,${stats.totalMeetings}`,
      `Avg Engagement,${stats.avgEngagement}`,
      `Tasks Completed,${stats.tasksCompleted}`,
      `Hours Collaborated,${stats.hoursCollaborated}`,
      `Active Projects,${stats.activeProjects}`,
    ].join("\n");
    
    const csvContent = headers + rows;
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Workspace_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-full mesh-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Meetings", value: stats.totalMeetings, icon: BarChart3 },
        { label: "Avg Engagement", value: stats.avgEngagement, icon: TrendingUp },
        { label: "Tasks Completed", value: stats.tasksCompleted, icon: CheckCircle2 },
        { label: "Hours Collaborated", value: `${stats.hoursCollaborated}h`, icon: Clock },
        { label: "Active Projects", value: stats.activeProjects, icon: Users },
      ]
    : [];

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Analytics"
          subtitle="Real metrics from your MongoDB workspace — built for managers and admins."
          icon={BarChart3}
          action={
            <button
              onClick={handleExportReport}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:brightness-110"
            >
              <Download className="w-4 h-4" />
              Export CSV Report
            </button>
          }
        />

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Data synced from meetings and tasks — supports enterprise reporting
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card-elevated rounded-2xl p-6">
                <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600 w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-extrabold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-indigo-500" />
            Meeting momentum
          </h2>
          <div className="h-52 flex items-end gap-2 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            {chartData.map((height, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-sky-600 to-indigo-400 shadow-sm transition-all duration-500 hover:brightness-110"
                  style={{ height: `${height}%` }}
                  title={`Week ${i + 1} Activity`}
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI-generated insights
          </h2>
          <ul className="space-y-3">
            {insights.map((insight) => (
              <li
                key={insight}
                className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
              >
                <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
