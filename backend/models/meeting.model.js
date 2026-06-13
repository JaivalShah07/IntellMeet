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
    recordingUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    actualStartAt: { type: Date },
    actualEndAt: { type: Date },
    actualDurationMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

meetingSchema.pre("save", function () {
  if (this.isModified("status")) {
    if (this.status === "live" && !this.actualStartAt) {
      this.actualStartAt = new Date();
    } else if (this.status === "completed") {
      if (!this.actualEndAt) {
        this.actualEndAt = new Date();
      }
      const start = this.actualStartAt || this.createdAt || new Date();
      const end = this.actualEndAt;
      const diffMs = end - start;
      this.actualDurationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    }
  }
});

module.exports = mongoose.model("Meeting", meetingSchema);
