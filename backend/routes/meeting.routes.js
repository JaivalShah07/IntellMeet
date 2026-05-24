const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const meetingController = require("../controllers/meeting.controller");

const router = express.Router();

router.use(protect);

router.get("/", meetingController.getMeetings);
router.get("/stats", meetingController.getStats);
router.post("/", meetingController.createMeeting);
router.get("/:id", meetingController.getMeetingById);
router.get("/room/:roomId", meetingController.getMeetingByRoomId);
router.patch("/:id/status", meetingController.updateMeetingStatus);

module.exports = router;
