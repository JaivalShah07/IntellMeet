const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/user.model");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

exports.register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const { name, email, password } = parsed.data;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account with this email. Sign up first.",
      });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Wrong password. Try again." });
    }

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      token,
      refreshToken,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Credential missing" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ success: false, message: "Invalid Google token" });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        authProvider: "google",
        googleId: payload.sub,
        role: "member", // Default
      });
    } else {
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.authProvider = "google";
        await user.save();
      }
    }

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      token,
      refreshToken,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token is required" });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";
    
    try {
      const decoded = jwt.verify(refreshToken, secret);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid refresh token" });
      }

      const newToken = generateAccessToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      res.json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getMe = (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
};

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  email: z.string().trim().email("Invalid email").optional(),
  avatar: z.string().url("Invalid avatar URL").or(z.string().length(0)).optional(),
});

exports.updateProfile = async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    
    const { name, email, avatar } = parsed.data;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }
    
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    
    await user.save();
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

exports.changePassword = async (req, res, next) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    
    const { currentPassword, newPassword } = parsed.data;
    const user = await User.findById(req.user._id).select("+password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
