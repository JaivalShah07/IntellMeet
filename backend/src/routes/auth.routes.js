const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password min 6 characters" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const user = await User.create({ name: name.trim(), email, password });
    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "No account with this email. Sign up first, or use demo@intellmeet.com after starting MongoDB.",
      });
    }
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Wrong password. Try again or use Sign up." });
    }
    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

module.exports = router;
