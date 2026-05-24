const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: String, required: true, unique: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    type: {
      type: String,
      enum: ["Video", "Presentation", "External", "Standup"],
      default: "Video",
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed"],
      default: "scheduled",
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    transcript: { type: String, default: "" },
    summary: { type: String, default: "" },
    sentimentScore: { type: Number, default: null },
    hasRecording: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
