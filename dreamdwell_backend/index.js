const express = require("express");
const cors = require("cors");
require("dotenv").config();
// <<<--- CORRECTED PATH: Relative path to config/db.js
const connectDB = require("./config/db");

// <<<--- CORRECTED PATHS: Relative paths to routes
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
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


// Health check endpoint
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

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});