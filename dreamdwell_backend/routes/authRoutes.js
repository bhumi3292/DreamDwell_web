const express = require("express");
const router = express.Router();

<<<<<<< HEAD
// Import the correct controller
const authController = require("../controllers/authController");

// Authentication Routes
=======
const authController = require("../controllers/authController");

//  Auth
>>>>>>> sprint2
router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);
router.post("/find-user-id", authController.findUserIdByCredentials);

<<<<<<< HEAD
// Password Reset Routes (Link-based)
router.post("/request-reset/send-link", authController.sendPasswordResetLink);
router.post("/reset-password/:token", authController.resetPassword); // ✅ Fixed here
=======
// Password Reset
router.post("/request-reset/send-link", authController.sendPasswordResetLink);
router.post("/reset-password/:token", authController.resetPassword);
>>>>>>> sprint2

module.exports = router;
