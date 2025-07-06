const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/auth"); // Assuming this path is correct

// ⭐ NEW IMPORTS FOR FILE UPLOAD ⭐
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); // Import your User model here

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // The 'uploads/' directory should be at the root of your project
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize Multer upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Optional: 5MB file size limit
    fileFilter: (req, file, cb) => {
        // Optional: Filter file types
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports JPEG, JPG, PNG, and GIF images.'));
    }
}); // .single('profilePicture') is called directly in the route handler

// ===============================================
// --- Existing Authentication Routes ---
router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);
router.post("/find-user-id", authController.findUserIdByCredentials);

// Password Reset Routes
router.post("/request-reset/send-link", authController.sendPasswordResetLink);
router.post("/reset-password/:token", authController.resetPassword);

// Get Current User Route (Protected)
router.get("/me", authenticateUser, authController.getMe);

// ===============================================
// ⭐ NEW: Profile Picture Upload Route ⭐
// Apply the 'upload' middleware here, expecting a single file with field name 'profilePicture'
router.post('/uploadImage', authenticateUser, upload.single('profilePicture'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided for upload.' });
    }

    // File uploaded successfully, now update the user's profilePicture in the database
    try {
        // `req.user` is populated by the `authenticateUser` middleware
        const userId = req.user._id; // Get user ID from the authenticated request
        const imageUrl = `/uploads/${req.file.filename}`; // Construct the public URL

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: imageUrl },
            { new: true, runValidators: true } // Return the updated document, run schema validators
        ).select('-password'); // Exclude password from the returned user object

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Authenticated user not found in database.' });
        }

        // Success response (this is the JSON format your Flutter app expects)
        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            imageUrl: imageUrl, // Send back the relative URL or full URL if you build it
            user: updatedUser // Optionally return the updated user object
        });

    } catch (error) {
        console.error('Database update error after file upload:', error); // Use console.error for errors
        res.status(500).json({ success: false, message: 'Internal server error while updating profile picture.' });
    }
}); // Corrected: Added missing closing parenthesis and curly brace

module.exports = router;