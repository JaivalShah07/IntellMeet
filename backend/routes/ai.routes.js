const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const aiController = require("../controllers/ai.controller");

const router = express.Router();

router.use(protect);

router.post("/analyze", aiController.analyzeMeeting);
router.get("/insights", aiController.getInsights);

module.exports = router;
