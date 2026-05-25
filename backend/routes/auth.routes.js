const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.post("/refresh", authController.refreshToken);
router.get("/me", protect, authController.getMe);
router.get("/users", protect, authController.getUsers);

module.exports = router;
