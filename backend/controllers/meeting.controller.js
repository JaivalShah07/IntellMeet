const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const Meeting = require("../models/meeting.model");
const Team = require("../models/team.model");

const createMeetingSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  scheduledAt: z.string().optional().or(z.date().optional()),
  type: z.enum(["Video", "Presentation", "External", "Standup"]).optional(),
  durationMinutes: z.number().min(1).max(480).optional(),
  participants: z.array(z.string()).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["scheduled", "live", "completed"]).optional(),
  hasRecording: z.boolean().optional(),
});

exports.getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { participants: req.user._id }],
    })
      .sort({ scheduledAt: 1 })
      .populate("host", "name email")
      .populate("participants", "name email avatar")
      .limit(50);
    res.json({ success: true, meetings });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
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

    const activeProjects = await Team.countDocuments({
      $or: [{ owner: userId }, { members: userId }],
    });

    const completedMeetings = await Meeting.find({
      $or: [{ host: userId }, { participants: userId }],
      status: "completed",
    });
    const totalMinutes = completedMeetings.reduce((acc, m) => acc + (m.durationMinutes || 60), 0);
    const hoursCollaborated = Number((totalMinutes / 60).toFixed(1));

    res.json({
      success: true,
      stats: {
        totalMeetings: total,
        completedMeetings: completed,
        aiInsights: withSummary,
        hoursCollaborated,
        activeProjects,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createMeeting = async (req, res, next) => {
  try {
    const parsed = createMeetingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const { title, description, scheduledAt, type, durationMinutes, participants } = parsed.data;

    const participantIds = [req.user._id];
    if (participants && Array.isArray(participants)) {
      participants.forEach((id) => {
        if (id && !participantIds.includes(id)) {
          participantIds.push(id);
        }
      });
    }

    const meeting = await Meeting.create({
      title,
      description: description || "",
      host: req.user._id,
      roomId: uuidv4().slice(0, 8),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      type: type || "Video",
      durationMinutes: durationMinutes || 60,
      participants: participantIds,
    });
    res.status(201).json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};

exports.getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate("host", "name email");
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};

exports.updateMeetingStatus = async (req, res, next) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const updateFields = {};
    if (parsed.data.status) updateFields.status = parsed.data.status;
    if (parsed.data.hasRecording !== undefined) updateFields.hasRecording = parsed.data.hasRecording;

    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};

exports.getMeetingByRoomId = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ roomId: req.params.roomId }).populate("host", "name email");
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};
