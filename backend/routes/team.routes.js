const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");
const teamController = require("../controllers/team.controller");

const router = express.Router();

router.use(protect);

router.get("/", teamController.getTeams);
router.post("/", authorizeRoles("admin"), teamController.createTeam); // Only admins can create teams
router.post("/invite", authorizeRoles("admin"), teamController.createInvitation); // Only admins can invite
router.post("/accept", teamController.acceptInvitation);

module.exports = router;
