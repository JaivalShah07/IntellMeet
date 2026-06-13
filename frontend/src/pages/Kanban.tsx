import { useEffect, useState } from "react";
import { Kanban as KanbanIcon, Plus, PartyPopper, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
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
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropCol(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (colKey: Task["status"]) => {
    setActiveDropCol(colKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
      return;
    }
    setActiveDropCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setActiveDropCol(null);
    setDraggedTaskId(null);

    if (!taskId) return;

    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    await moveTask(taskId, targetStatus);
  };

  const load = () => {
    api
      .get("/tasks")
      .then((res) => setTasks(res.data.tasks || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load tasks");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    const title = newTitle.trim();
    setNewTitle("");

    const tempId = `temp-${Date.now()}`;
    const tempTask: Task = { _id: tempId, title, status: "todo" };
    setTasks((prev) => [...prev, tempTask]);

    setAdding(true);
    try {
      const { data } = await api.post("/tasks", { title });
      setTasks((prev) => prev.map(t => t._id === tempId ? data.task || { ...tempTask, _id: data._id || tempId } : t));
      toast.success("Task added successfully!");
    } catch (err: any) {
      setTasks((prev) => prev.filter(t => t._id !== tempId));
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const moveTask = async (id: string, status: Task["status"]) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
    try {
      await api.patch(`/tasks/${id}`, { status });
    } catch (err) {
      setTasks(previousTasks);
      console.error(err);
    }
  };

  const changePriority = async (id: string, priority: Task["priority"]) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, priority } : t)));
    try {
      await api.patch(`/tasks/${id}`, { priority });
      toast.success("Task priority updated!");
    } catch (err: any) {
      setTasks(previousTasks);
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update priority");
    }
  };

  const deleteTask = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted successfully!");
    } catch (err: any) {
      setTasks(previousTasks);
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Task Board"
          subtitle="Organize your team's action items seamlessly."
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

        {doneCount > 0 && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-sm font-medium">
            <PartyPopper className="w-5 h-5 shrink-0" />
            {doneCount} task{doneCount !== 1 ? "s" : ""} completed
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);

              if (col.key === "in_progress") {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                colTasks.sort((a, b) => {
                  const wA = priorityWeight[a.priority || "medium"];
                  const wB = priorityWeight[b.priority || "medium"];
                  return wB - wA;
                });
              }

              return (
                <div
                  key={col.key}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(col.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.key)}
                  className={`card-elevated rounded-2xl p-5 border-t-4 ${col.accent} transition-all duration-300 min-h-[400px] flex flex-col ${
                    activeDropCol === col.key ? "bg-sky-500/5 dark:bg-sky-500/10 border-2 border-dashed border-sky-400/40 scale-[1.01] shadow-lg" : ""
                  }`}
                >
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <h2 className="font-bold text-lg">{col.title}</h2>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.badge}`}>
                        {colTasks.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{col.subtitle}</p>
                  </div>
                  <div className="space-y-3 flex-1 min-h-[200px]">
                    {colTasks.map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        onDragEnd={handleDragEnd}
                        className={`p-4 rounded-xl border bg-white dark:bg-gray-900/50 group cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
                          task.status === "todo"
                            ? "border-red-200 dark:border-red-500/30"
                            : task.status === "in_progress"
                            ? "border-amber-200 dark:border-amber-500/30"
                            : "border-emerald-200 dark:border-emerald-500/30"
                        } ${draggedTaskId === task._id ? "opacity-30 border-dashed scale-95" : ""}`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <p className="text-sm font-semibold text-gray-950 dark:text-gray-50 flex-1 leading-snug text-left">{task.title}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task._id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-55/10 dark:hover:bg-red-500/10 shrink-0"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {task.status === "in_progress" && (
                          <div className="mb-3 text-left">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              task.priority === "high"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/10"
                                : task.priority === "low"
                                ? "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/10"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                            }`}>
                              {task.priority || "medium"}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-gray-400 w-12 text-left uppercase">Status</span>
                            <select
                              value={task.status}
                              onChange={(e) => moveTask(task._id, e.target.value as Task["status"])}
                              className="text-xs flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 cursor-pointer"
                            >
                              <option value="todo">To do</option>
                              <option value="in_progress">In progress</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                          {task.status === "in_progress" && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-gray-400 w-12 text-left uppercase">Priority</span>
                              <select
                                value={task.priority || "medium"}
                                onChange={(e) => changePriority(task._id, e.target.value as Task["priority"])}
                                className="text-xs flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 cursor-pointer font-semibold"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                          )}
                        </div>
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
