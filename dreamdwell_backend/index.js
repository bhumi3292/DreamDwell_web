// dreamdwell_backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const ApiError = require("./utils/api_error"); // Ensure this path is correct

const app = express();

// ========== Middleware ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== Connect DB ==========
connectDB()
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
        process.exit(1);
    });

// ========== Import & Use API Routes ==========
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoute");
const paymentRoutes = require('./routes/paymentRoute');
const calendarRoutes = require('./routes/calendarRoutes');
const chatbotRoutes = require('../dreamdwell_backend/routes/chatbotRoute');

// Use API routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check route
app.get("/", (req, res) => {
    res.send("DreamDwell backend running...");
});

// ========== Global Error Handler ==========
app.use((err, req, res, next) => { // 'next' is important even if not directly used, for Express to recognize it as error middleware
    console.error("Unhandled Error Caught by Global Handler:");
    console.error(err);

    // Handle custom ApiError instances
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data
        });
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors,
            data: null
        });
    }

    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    const errors = process.env.NODE_ENV === 'development' ? [err.stack] : [];

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
        data: null
    });
});

// ========== Start Server ==========
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}