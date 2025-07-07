// dream dwell_backend/routes/authRoutes.js
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
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports JPEG, JPG, PNG, and GIF images.'));
    }
});

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

// ⭐ ADD THIS NEW ROUTE FOR CHANGE PASSWORD (Protected) ⭐
router.post('/change-password', authenticateUser, authController.changePassword);

// ⭐ ADD THIS NEW ROUTE FOR UPDATE PROFILE (Protected) ⭐
router.put('/update-profile', authenticateUser, authController.updateProfile);


// ===============================================
// ⭐ Profile Picture Upload Route ⭐
router.post('/uploadImage', authenticateUser, upload.single('profilePicture'), async (req, res) => {
    console.log(req.file)

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided for upload.' });
    }

    try {
        const userId = req.user._id; // Get user ID from the authenticated request
        const imageUrl = `/uploads/${req.file.filename}`; // Construct the public URL

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: imageUrl },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Authenticated user not found in database.' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            imageUrl: imageUrl,
            user: updatedUser
        });

    } catch (error) {
        console.error('Database update error after file upload:', error);
        res.status(500).json({ success: false, message: 'Internal server error while updating profile picture.' });
    }
});

module.exports = router;