const { z } = require("zod");
const crypto = require("crypto");
const Team = require("../models/team.model");
const Invitation = require("../models/invitation.model");

const createTeamSchema = z.object({
  name: z.string().trim().min(1, "Team name is required"),
});

exports.createTeam = async (req, res, next) => {
  try {
    const parsed = createTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const team = await Team.create({
      name: parsed.data.name,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ success: true, team });
  } catch (err) {
    next(err);
  }
};

exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ members: req.user._id }).populate("members", "name email avatar");
    res.json({ success: true, teams });
  } catch (err) {
    next(err);
  }
};

exports.createInvitation = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ success: false, message: "Team not found" });
    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only team owner or admin can invite" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    const invitation = await Invitation.create({
      team: teamId,
      invitedBy: req.user._id,
      token,
      expiresAt,
    });

    res.status(201).json({ success: true, invitationToken: token });
  } catch (err) {
    next(err);
  }
};

exports.acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.body;
    const invitation = await Invitation.findOne({ token, expiresAt: { $gt: new Date() } });

    if (!invitation) {
      return res.status(400).json({ success: false, message: "Invalid or expired invitation link" });
    }

    const team = await Team.findById(invitation.team);
    if (!team) return res.status(404).json({ success: false, message: "Team no longer exists" });

    if (team.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "You are already a member of this team" });
    }

    team.members.push(req.user._id);
    await team.save();

    res.json({ success: true, message: "Successfully joined the team", team });
  } catch (err) {
    next(err);
  }
};
