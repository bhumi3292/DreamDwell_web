const express = require("express");
const router = express.Router();

// Import the correct controller
const authController = require("../controllers/authController");

// Authentication Routes
router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);
router.post("/find-user-id", authController.findUserIdByCredentials);

// Password Reset Routes (Link-based)
router.post("/request-reset/send-link", authController.sendPasswordResetLink);
router.post("/reset-password/:token", authController.resetPassword); // ✅ Fixed here

module.exports = router;
