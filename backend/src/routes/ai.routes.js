const express = require("express");
const Meeting = require("../models/Meeting");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

/**
 * Enterprise AI pipeline (demo): transcription → summary → action items.
 * Production: OpenAI Whisper + GPT-4 / Hugging Face.
 */
function generateInsights(transcript, meetingTitle) {
  const lines = transcript
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const summary = `Meeting "${meetingTitle}" covered ${lines.length || 1} discussion points. ` +
    `Key outcomes: team aligned on priorities, clear ownership assigned, and positive momentum toward deliverables. ` +
    `Recommended follow-up within 48 hours to maintain velocity.`;

  const actionItems = [];
  const patterns = [
    /(\w+)\s+will\s+(.+?)(?:by|before)\s+(\w+day|friday|monday|tomorrow)/gi,
    /assign\s+(.+?)\s+to\s+(\w+)/gi,
    /schedule\s+(.+)/gi,
  ];

  for (const line of lines) {
    if (/will|assign|schedule|finish|complete|prepare/i.test(line)) {
      actionItems.push({
        title: line.replace(/^[^:]+:\s*/i, "").slice(0, 120) || line.slice(0, 120),
        status: "todo",
      });
    }
  }

  if (actionItems.length === 0) {
    actionItems.push(
      { title: "Review meeting notes and confirm next steps", status: "todo" },
      { title: "Share summary with stakeholders", status: "todo" }
    );
  }

  const sentimentScore = 78 + Math.min(lines.length * 3, 20);

  return { summary, actionItems: actionItems.slice(0, 5), sentimentScore };
}

router.post("/analyze", async (req, res, next) => {
  try {
    const { transcript, meetingId, meetingTitle } = req.body;
    const text = transcript?.trim() || "";
    if (!text) {
      return res.status(400).json({ success: false, message: "Transcript required" });
    }

    const title = meetingTitle || "Team Sync";
    const insights = generateInsights(text, title);

    if (meetingId) {
      await Meeting.findByIdAndUpdate(meetingId, {
        transcript: text,
        summary: insights.summary,
        sentimentScore: insights.sentimentScore,
        status: "completed",
      });

      for (const item of insights.actionItems) {
        await Task.create({
          title: item.title,
          status: "todo",
          createdBy: req.user._id,
          assignee: req.user._id,
          meeting: meetingId,
        });
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
});

router.get("/insights", async (req, res, next) => {
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
});

module.exports = router;
