const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

// Register User
exports.registerUser = async (req, res) => {
    const { fullName, email, phoneNumber, stakeholder, password, confirmPassword } = req.body;

    if (!fullName || !email || !phoneNumber || !stakeholder || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (!["Landlord", "Tenant"].includes(stakeholder)) {
        return res.status(400).json({ success: false, message: "Stakeholder must be 'Landlord' or 'Tenant'" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            role: stakeholder,
            password
        });

        await newUser.save();

        return res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (err) {
        console.error("Registration Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const passwordMatch = await user.comparePassword(password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const payload = {
            _id: user._id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        const { password: _, ...userWithoutPassword } = user.toObject();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Find User ID by Credentials
exports.findUserIdByCredentials = async (req, res) => {
    const { email, password, stakeholder } = req.body;

    if (!email || !password || !stakeholder) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email, role: stakeholder });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with provided credentials" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        return res.status(200).json({ success: true, userId: user._id });
    } catch (err) {
        console.error("User ID Fetch Error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ⭐ NEW: Get Current Authenticated User (for /api/auth/me) ⭐
exports.getMe = async (req, res) => {
    // The `authenticateUser` middleware (from authMiddleware.js)
    // will have already verified the JWT and fetched the user from the database,
    // attaching the user object (without password) to `req.user`.
    if (!req.user) {
        // This case should ideally not be reached if authenticateUser passed,
        // but it's a good safeguard.
        return res.status(401).json({ success: false, message: "User data not available after authentication." });
    }

    // Send the user data that was attached to the request by the middleware
    return res.status(200).json({
        success: true,
        user: req.user, // req.user already contains the user details from the DB
    });
};


// Send Password Reset Link
exports.sendPasswordResetLink = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const subject = 'DreamDwell Password Reset Request';
        const text = `You requested a password reset. Use this link to reset your password: ${resetUrl}`;
        const html = `
            <p>Hello ${user.fullName},</p>
            <p>You recently requested to reset your password for your DreamDwell account.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="${resetUrl}" style="background-color: #002B5B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
            <p>This link is valid for <b>1 hour</b>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you,<br/>The DreamDwell Team</p>
        `;

        await sendEmail(user.email, subject, text, html);

        return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Error in sendPasswordResetLink:', error);
        return res.status(500).json({ success: false, message: 'Failed to send password reset link. Please try again later.' });
    }
};

// Reset Password Handler
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Both password fields are required.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or token is invalid.' });
        }

        user.password = newPassword; // Pre-save hook will hash it
        await user.save();

        return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ success: false, message: 'Reset link expired. Please request a new one.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ success: false, message: 'Invalid reset token. Please request a new one.' });
        }

        console.error('Error in resetPassword:', error);
        return res.status(500).json({ success: false, message: 'Failed to reset password. Please try again later.' });
    }
};