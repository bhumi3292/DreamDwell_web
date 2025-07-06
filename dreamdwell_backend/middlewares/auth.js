// dreamdwell_backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Make sure this path is correct for your User model

// Middleware to authenticate users using JWT
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication failed: No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify the token. This `decoded` object will contain the payload from your JWT.
        // Your JWT payload should have `_id` (or `userId`) and `role` (e.g., { _id: '...', role: 'Landlord' })
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the full user document from the database.
        // This is important to get the most up-to-date user data, including their current role,
        // and to ensure the user still exists in the database.
        // We select('-password') to exclude the password hash for security.
        const user = await User.findById(decoded._id || decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: "Authentication failed: User not found in database." });
        }

        // Attach the full user object (from the database) to the request.
        // Now, `req.user` will have properties like `_id`, `fullName`, `email`, `role`, etc.
        req.user = user;
        next(); // Proceed to the next middleware or route handler

    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please login again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token. Please login again." });
        }
        // Catch any other errors during verification
        console.error("Authentication Error:", err); // Log the specific error for debugging
        return res.status(401).json({ success: false, message: "Authentication failed: Internal server error." });
    }
};

// Role-based access middleware generator
// Use this as `requireRole('landlord')` or `requireRole('tenant')`
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        // `req.user` is populated by the `authenticateUser` middleware
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please authenticate first." });
        }

        // Perform a case-insensitive comparison of the user's role
        // `req.user.role` will come from the database, which is "Landlord" in your case.
        // `requiredRole` will be "landlord" (lowercase) from the route definition.
        if (req.user.role && req.user.role.toLowerCase() === requiredRole.toLowerCase()) {
            next(); // User has the required role, proceed
        } else {
            // User is authenticated but does not have the required role
            return res.status(403).json({ success: false, message: `Access denied: ${requiredRole} role required.` });
        }
    };
};

module.exports = {
    authenticateUser,
    requireRole,
};