const express = require("express");
const Meeting = require("../models/meeting.model");
const Task = require("../models/task.model");
const Team = require("../models/team.model");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const totalMeetings = await Meeting.countDocuments({
      $or: [{ host: userId }, { participants: userId }],
    });
    const completedTasks = await Task.countDocuments({
      createdBy: userId,
      status: "done",
    });
    const allTasks = await Task.countDocuments({ createdBy: userId });

    const avgEngagementAgg = await Meeting.aggregate([
      {
        $match: {
          $or: [{ host: userId }, { participants: userId }],
          sentimentScore: { $ne: null },
        },
      },
      { $group: { _id: null, avg: { $avg: "$sentimentScore" } } },
    ]);
    const avgEngagement = avgEngagementAgg.length > 0 ? Math.round(avgEngagementAgg[0].avg) : 0;

    // Real Weekly Meeting Frequency Chart Data (Past 7 Weeks)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      
      const count = await Meeting.countDocuments({
        $or: [{ host: userId }, { participants: userId }],
        scheduledAt: { $gte: start, $lt: end },
      });
      chartData.push(count);
    }
    
    const maxVal = Math.max(...chartData);
    const scaledChartData = chartData.map((val) => {
      if (maxVal === 0) return 15;
      return Math.round((val / maxVal) * 85) + 15; // Scale height between 15% and 100%
    });

    // Compute Peak Meeting Day
    const meetings = await Meeting.find({
      $or: [{ host: userId }, { participants: userId }],
    });
    
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    meetings.forEach((m) => {
      const day = new Date(m.scheduledAt).getDay();
      dayCounts[day]++;
    });
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let peakDayIdx = 0;
    let maxDayCount = 0;
    for (let i = 0; i < 7; i++) {
      if (dayCounts[i] > maxDayCount) {
        maxDayCount = dayCounts[i];
        peakDayIdx = i;
      }
    }
    
    const peakDay = maxDayCount > 0 ? dayNames[peakDayIdx] : "mid-week";
    const peakDayInsight = maxDayCount > 0 
      ? `Peak meeting day is ${peakDay} with ${maxDayCount} sync sessions.`
      : "Mid-week syncs (Tuesday/Wednesday) show optimal focus rates.";

    const sentimentInsight = avgEngagement > 0
      ? `Focus score averaging ${avgEngagement}% across your AI-transcribed meetings.`
      : "Automate notes with transcripts to populate engagement dashboards.";

    const completedMeetingsCount = await Meeting.countDocuments({
      $or: [{ host: userId }, { participants: userId }],
      status: "completed",
    });
    const timeSavedMinutes = completedMeetingsCount * 10;
    const timeSavedInsight = timeSavedMinutes > 0
      ? `AI summary models have saved team members ~${timeSavedMinutes} minutes of manual minutes logging.`
      : "Automated AI action tracking optimizes task turnaround.";

    const tasksCompletionRate = allTasks ? Math.round((completedTasks / allTasks) * 100) : 0;
    const taskInsight = allTasks > 0
      ? `Task board completion rate at ${tasksCompletionRate}% (${completedTasks}/${allTasks} closed).`
      : "Add meeting action items to track board completion velocity.";

    const insights = [
      peakDayInsight,
      sentimentInsight,
      taskInsight,
      timeSavedInsight,
    ];

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
        totalMeetings,
        avgEngagement: avgEngagement > 0 ? `${avgEngagement}%` : "N/A",
        tasksCompleted: completedTasks,
        hoursCollaborated,
        activeProjects,
      },
      chartData: scaledChartData,
      insights,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
