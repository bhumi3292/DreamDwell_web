// dream dwell_backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables from .env file

const connectDB = require("./config/db");

const app = express(); // Initialize the express app FIRST

// ========== Middleware ==========
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies (good practice)

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== Connect DB ==========
connectDB()
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
        process.exit(1); // Exit process with failure if DB connection fails
    });

// ========== Import & Use API Routes ==========
// Import routes AFTER `app` is defined
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoute");
const paymentRoutes = require('./routes/paymentRoute');
const calendarRoutes = require('./routes/calendarRoutes');

// Use API routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/calendar', calendarRoutes); // <--- ADD THIS LINE: Mount calendar routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/", (req, res) => {
    res.send("DreamDwell backend running...");
});

// ========== Global Error Handler ==========
app.use((err, req, res, _next) => {
    console.error("Unhandled Error:", err.stack); // Log the full stack trace for debugging
    res.status(err.status || 500).json({ // Use custom status if available, else 500
        success: false,
        message: err.message || "Something went wrong", // Send specific error message
        error: process.env.NODE_ENV === 'development' ? err.stack : {}, // Only send stack in dev
    });
});

// ========== Start Server ==========
// This block ensures the server only starts when the script is run directly (not imported)
if (require.main === module) {
    const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}