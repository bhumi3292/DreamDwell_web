// dreamdwell_backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables from .env file
const mongoose = require("mongoose");
const multer = require("multer"); // Keep multer imported for error handling

const connectDB = require("./config/db");
const ApiError = require("./utils/api_error");



const app = express(); // Initialize Express app



// ========== Middleware ==========
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== Import & Use API Routes ==========

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoute");

// --- IMPORTANT: Corrected Payment Route Import ---
const paymentRoutes = require('../dreamdwell_backend/routes/paymentRoute');

const calendarRoutes = require('./routes/calendarRoutes');
const chatbotRoutes = require('./routes/chatbotRoute');
const chatRoutes = require('./routes/chatRoute');

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);

// --- IMPORTANT: Corrected Payment Route Usage ---
app.use('/api/payments', paymentRoutes);


app.use('/api/calendar', calendarRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chats', chatRoutes);

app.get("/", (req, res) => {
    res.status(200).send("DreamDwell backend running successfully!");
});

// ========== Global Error Handler ==========
// ... (rest of your error handler code, no changes needed here)
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

    if (err instanceof multer.MulterError) {
        let message = "File upload error.";
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File is too large.";
        } else if (err.code === "LIMIT_FILE_COUNT") {
            message = "Too many files uploaded.";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = `Unexpected file field: ${err.field}. Please check field names for file uploads (e.g., use 'images' and 'videos').`;
        }
        return res.status(400).json({ success: false, message: message });
    }
    if (err.message === "Unsupported file type!") {
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

module.exports = app;

// ========== Conditional Server Start & Socket.IO Setup ==========
if (require.main === module) {
    const http = require("http");
    const { Server } = require("socket.io");
    const Chat = require("./models/chat");
    const User = require("./models/User");

    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
        },
    });

    // ========== Connect DB (for actual server run) ==========
    connectDB()
        .then(() => console.log("MongoDB connected successfully!"))
        .catch((err) => {
            console.error("Failed to connect to DB:", err);
            process.exit(1);
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
                    populatedSender = { _id: senderId, fullName: 'Unknown User', profilePicture: null };
                }

                const broadcastMessage = {
                    _id: messageData._id || new mongoose.Types.ObjectId().toString(),
                    sender: {
                        _id: populatedSender._id.toString(),
                        fullName: populatedSender.fullName,
                        profilePicture: populatedSender.profilePicture,
                    },
                    text: messageData.text,
                    createdAt: messageData.createdAt.toISOString(),
                    chat: chatId
                };

                io.to(chatId).emit("newMessage", broadcastMessage);

            } catch (error) {
                console.error("Error handling message:", error);
                socket.emit('messageError', { message: "Could not send message due to server error." });
            }
        });

        // Typing indicator event
        socket.on("typing", ({ chatId, senderId }) => {
            if (!chatId || !senderId) return;
            socket.to(chatId).emit("typing", { chatId, senderId });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    const PORT = process.env.PORT || 3001;
    server. listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}