const jwt = require("jsonwebtoken");

// Middleware to authenticate users using JWT
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Access token missing" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token and attach user info to request object
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please login again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token. Please login again." });
        }
        return res.status(401).json({ success: false, message: "Authentication failed." });
    }
};

// Role-based access middleware generator
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.stakeholder === role) {
            next();
        } else {
            return res.status(403).json({ success: false, message: `Access denied: ${role} only` });
        }
    };
};

module.exports = {
    protect: authenticateUser,
    requireRole,
};
