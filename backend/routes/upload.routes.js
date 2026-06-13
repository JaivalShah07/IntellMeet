const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth.middleware");
const cloudinaryService = require("../services/cloudinary.service");
const Meeting = require("../models/meeting.model");

const router = express.Router();

// Multer Setup
// Avatars have a 2MB limit; recordings can be larger (e.g. 100MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max limit overall
  },
});

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload profile avatar image to Cloudinary
 * @access  Private
 */
router.post("/avatar", protect, upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Check if image mime type
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Only image files are allowed" });
    }

    // Limit avatar size to 2MB specifically
    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "Avatar image must be smaller than 2MB" });
    }

    const result = await cloudinaryService.uploadAvatar(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      url: result.secure_url,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/upload/recording/:meetingId
 * @desc    Upload meeting video recording to Cloudinary and update meeting status
 * @access  Private
 */
router.post("/recording/:meetingId", protect, upload.single("recording"), async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No recording file uploaded" });
    }

    // Ensure it is a video or audio file
    if (!req.file.mimetype.startsWith("video/") && !req.file.mimetype.startsWith("audio/")) {
      return res.status(400).json({ success: false, message: "Only video or audio files are allowed" });
    }

    const filename = `meeting_${meeting.roomId}_${Date.now()}.webm`;
    const result = await cloudinaryService.uploadRecording(
      req.file.buffer,
      filename,
      req.file.mimetype
    );

    meeting.hasRecording = true;
    meeting.recordingUrl = result.secure_url;
    meeting.status = "completed";
    await meeting.save();

    res.json({
      success: true,
      message: "Meeting recording uploaded and saved successfully",
      meeting,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
