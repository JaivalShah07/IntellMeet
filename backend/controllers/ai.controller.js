const { z } = require("zod");
const Meeting = require("../models/meeting.model");
const Task = require("../models/task.model");
const aiService = require("../services/ai.service");

const analyzeSchema = z.object({
  transcript: z.string().trim().min(1, "Transcript required"),
  meetingId: z.string().optional(),
  roomId: z.string().optional(),
  meetingTitle: z.string().optional(),
});

exports.analyzeMeeting = async (req, res, next) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const { transcript, meetingId, roomId, meetingTitle } = parsed.data;

    const title = meetingTitle || "Team Sync";
    const insights = await aiService.generateInsights(transcript, title);

    if (meetingId || roomId) {
      let query = meetingId ? { _id: meetingId } : { roomId };
      const meeting = await Meeting.findOne(query);

      if (meeting) {
        await Meeting.findByIdAndUpdate(meeting._id, {
          transcript,
          summary: insights.summary,
          sentimentScore: insights.sentimentScore,
          status: "completed",
        });

        for (const item of insights.actionItems) {
          await Task.create({
            title: item.title,
            status: item.status || "todo",
            createdBy: req.user._id,
            assignee: req.user._id,
            meeting: meeting._id,
          });
        }
      }
    }

    res.json({
      success: true,
      ...insights,
      message: "AI analysis complete — summary and tasks generated",
    });
  } catch (err) {
    next(err);
  }
};

exports.getInsights = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { participants: req.user._id }],
      summary: { $ne: "" },
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title summary sentimentScore transcript updatedAt");

    res.json({ success: true, insights: meetings });
  } catch (err) {
    next(err);
  }
};
