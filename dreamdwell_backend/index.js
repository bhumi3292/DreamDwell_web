// dreamdwell_backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables from .env file
const mongoose = require("mongoose");
const multer = require("multer"); // ⭐ Already imported and used in error handling ⭐

const connectDB = require("./config/db"); // Assuming you have a config/db.js file for DB connection

const ApiError = require("./utils/api_error"); // Assuming you have this utility

const http = require("http");
const { Server } = require("socket.io");

// ⭐ CRITICAL FIXES FOR MODEL IMPORTS ⭐
// Ensure these paths are correct relative to index.js
const Chat = require("./models/chat");
const User = require("./models/User");
const Property = require("./models/Property"); // Ensure this is imported if used elsewhere

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // IMPORTANT: In production, change "*" to your actual frontend URL (e.g., "https://yourfrontend.com")
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] // Allow all necessary methods for CORS
    },
});

// ========== Middleware ==========
app.use(cors({
    origin: process.env.FRONTEND_URL || "*", // Match Socket.IO CORS origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow all methods
    credentials: true, // If you're sending cookies/auth headers
}));
app.use(express.json()); // To parse JSON request bodies (for application/json)
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies (for application/x-www-form-urlencoded)

// Serve static files from the 'uploads' directory
// This allows frontend to access images/videos via /uploads/filename.ext
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== Connect DB ==========
connectDB()
    .then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
        process.exit(1); // Exit process with failure code if DB connection fails
    });

// ========== Import & Use API Routes ==========
// Ensure these paths correctly point to your route files and are mounted with correct base paths

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoute"); // Ensure cartRoute.js exists and is correctly structured
const paymentRoutes = require('./routes/paymentRoute');
const calendarRoutes = require('./routes/calendarRoutes');
const chatbotRoutes = require('./routes/chatbotRoute');
const chatRoutes = require('./routes/chatRoute');

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes); // Handles /api/properties for create, get all, and :id for get one, update, delete
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes); // This is where /api/cart GET/POST/etc. routes should be mounted
app.use('/api/payments', paymentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chats', chatRoutes);

// Health check route for the root URL
app.get("/", (req, res) => {
    res.status(200).send("DreamDwell backend running successfully!");
});

// ========== Socket.IO Connection Handling ==========
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinChat", (chatId) => {
        if (!chatId) {
            console.warn(`User ${socket.id} attempted to join chat with invalid ID: ${chatId}`);
            return;
        }
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat room ${chatId}`);
    });

    socket.on("leaveChat", (chatId) => {
        if (!chatId) {
            console.warn(`User ${socket.id} attempted to leave chat with invalid ID: ${chatId}`);
            return;
        }
        socket.leave(chatId);
        console.log(`User ${socket.id} left chat room ${chatId}`);
    });

    socket.on("sendMessage", async ({ chatId, senderId, text }) => {
        if (!chatId || !senderId || !text || text.trim() === '') {
            socket.emit('messageError', { message: 'Missing chat ID, sender ID, or message text.' });
            return;
        }

        try {
            if (!mongoose.Types.ObjectId.isValid(senderId)) {
                return socket.emit('messageError', { message: 'Invalid sender ID format.' });
            }
            if (!mongoose.Types.ObjectId.isValid(chatId)) {
                return socket.emit('messageError', { message: 'Invalid chat ID format.' });
            }

            const messageData = {
                sender: new mongoose.Types.ObjectId(senderId),
                text: text.trim(),
                createdAt: new Date()
            };

            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $push: { messages: messageData },
                    lastMessage: text.trim(),
                    lastMessageAt: messageData.createdAt
                },
                { new: true, runValidators: true }
            );

            if (!updatedChat) {
                console.error(`Chat with ID ${chatId} not found for message saving.`);
                return socket.emit('messageError', { message: 'Chat not found to save message.' });
            }

            let populatedSender = await User.findById(senderId).select('fullName profilePicture');
            if (!populatedSender) {
                console.error("Sender not found for message population (ID:", senderId, "). This should not happen if user is authenticated.");
                // Fallback for populatedSender if not found (optional, but good for robustness)
                populatedSender = { _id: senderId, fullName: 'Unknown User', profilePicture: null };
            }

            const broadcastMessage = {
                _id: messageData._id || new mongoose.Types.ObjectId().toString(), // Use actual _id if available after save, or generate temp
                sender: {
                    _id: populatedSender._id.toString(),
                    fullName: populatedSender.fullName,
                    profilePicture: populatedSender.profilePicture,
                },
                text: messageData.text,
                createdAt: messageData.createdAt.toISOString(),
                chat: chatId // Include chat ID for frontend filtering
            };

            io.to(chatId).emit("newMessage", broadcastMessage);

        } catch (error) {
            console.error("Error handling message:", error);
            socket.emit('messageError', { message: "Could not send message due to server error." });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ========== Global Error Handler ==========
app.use((err, req, res, next) => {
    console.error("Unhandled Error Caught by Global Handler:");
    console.error(err);

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

    // ⭐ This block correctly handles Multer errors because 'multer' is now imported ⭐
    if (err instanceof multer.MulterError) {
        let message = "File upload error.";
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File is too large.";
        } else if (err.code === "LIMIT_FILE_COUNT") {
            message = "Too many files uploaded.";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            // This is the error you were getting if the field name was wrong (e.g., 'video' instead of 'videos')
            message = `Unexpected file field: ${err.field}. Please check field names for file uploads (e.g., use 'images' and 'videos').`;
        }
        return res.status(400).json({ success: false, message: message });
    }
    // Handles custom error message from Multer's fileFilter
    if (err.message === "Unsupported file type!") {
        // This specific check might be redundant if the MulterError handles it properly
        // but it doesn't hurt.
        return res.status(400).json({ success: false, message: err.message });
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
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}