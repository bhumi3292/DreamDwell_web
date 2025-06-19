const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to DB
connectDB()
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
        process.exit(1);
    });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("DreamDwell backend running...");
});

// Global error handler
app.use((err, req, res, _next) => {
    console.error("Error:", err.stack);
    res.status(500).json({
        message: "Something went wrong",
        error: err.message || "Unknown error",
    });
});

// ✅ Only start server if this file is run directly (not when imported in tests)
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// ✅ Export app for Supertest
module.exports = app;
