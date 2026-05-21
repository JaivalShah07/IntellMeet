import { useEffect, useState } from "react";
import { Kanban as KanbanIcon, Plus, PartyPopper, Loader2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import api from "../lib/api";
import type { Task } from "../types";

const columns = [
  { key: "todo" as const, title: "Up next", subtitle: "Ready when you are", accent: "border-sky-400", badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { key: "in_progress" as const, title: "In progress", subtitle: "Great momentum", accent: "border-amber-400", badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { key: "done" as const, title: "Done", subtitle: "Celebrate these wins", accent: "border-emerald-400", badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
];

export default function Kanban() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => {
    api
      .get("/tasks")
      .then((res) => setTasks(res.data.tasks))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await api.post("/tasks", { title: newTitle.trim() });
      setNewTitle("");
      load();
    } finally {
      setAdding(false);
    }
  };

  const moveTask = async (id: string, status: Task["status"]) => {
    await api.patch(`/tasks/${id}`, { status });
    load();
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Task Board"
          subtitle="MongoDB-backed Kanban — tasks from meetings and manual entries."
          icon={KanbanIcon}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task title..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button
            onClick={addTask}
            disabled={adding}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold disabled:opacity-70"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add task
          </button>
        </div>

        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-sm font-medium">
          <PartyPopper className="w-5 h-5 shrink-0" />
          {doneCount} task{doneCount !== 1 ? "s" : ""} completed — persisted in database.
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className={`card-elevated rounded-2xl p-5 border-t-4 ${col.accent}`}>
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <h2 className="font-bold text-lg">{col.title}</h2>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.badge}`}>
                        {colTasks.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{col.subtitle}</p>
                  </div>
                  <div className="space-y-3">
                    {colTasks.map((task) => (
                      <div
                        key={task._id}
                        className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 group"
                      >
                        <p className="text-sm font-medium mb-2">{task.title}</p>
                        <select
                          value={task.status}
                          onChange={(e) => moveTask(task._id, e.target.value as Task["status"])}
                          className="text-xs w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1"
                        >
                          <option value="todo">To do</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
