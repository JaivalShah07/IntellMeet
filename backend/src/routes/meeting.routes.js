const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Meeting = require("../models/Meeting");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { participants: req.user._id }],
    })
      .sort({ scheduledAt: 1 })
      .populate("host", "name email")
      .limit(50);
    res.json({ success: true, meetings });
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const total = await Meeting.countDocuments({
      $or: [{ host: userId }, { participants: userId }],
    });
    const completed = await Meeting.countDocuments({
      $or: [{ host: userId }, { participants: userId }],
      status: "completed",
    });
    const withSummary = await Meeting.countDocuments({
      $or: [{ host: userId }, { participants: userId }],
      summary: { $ne: "" },
    });
    res.json({
      success: true,
      stats: {
        totalMeetings: total,
        completedMeetings: completed,
        aiInsights: withSummary,
        hoursCollaborated: Math.max(completed * 1, 8),
        activeProjects: Math.min(Math.ceil(total / 3), 6) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, scheduledAt, type, durationMinutes } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Title required" });
    }
    const meeting = await Meeting.create({
      title: title.trim(),
      host: req.user._id,
      roomId: uuidv4().slice(0, 8),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      type: type || "Video",
      participants: [req.user._id],
    });
    res.status(201).json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate("host", "name email");
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
