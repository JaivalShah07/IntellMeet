const { z } = require("zod");
const Task = require("../models/task.model");

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  meetingId: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
});

exports.getTasks = async (req, res, next) => {
  try {
    const query = { createdBy: req.user._id };
    if (req.query.meetingId) {
      query.meeting = req.query.meetingId;
    }
    const tasks = await Task.find(query)
      .sort({ updatedAt: -1 })
      .populate("assignee", "name email");
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const { title, description, status, priority, dueDate, meetingId } = parsed.data;

    const task = await Task.create({
      title,
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      createdBy: req.user._id,
      assignee: req.user._id,
      meeting: meetingId || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: parsed.data },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};
