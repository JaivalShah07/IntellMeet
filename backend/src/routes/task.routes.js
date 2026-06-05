const express = require("express");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("assignee", "name email");
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, description, status, dueDate } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Title required" });
    }
    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      status: status || "todo",
      createdBy: req.user._id,
      assignee: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
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
});

module.exports = router;
