// dreamdwell_backend/models/chat.js
const mongoose = require('mongoose');

// Define the schema for individual messages within a chat
const messageSubSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: { // Add createdAt to sub-document for individual message timestamp
        type: Date,
        default: Date.now
    }
});

// Define the main chat schema
const chatSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'Direct Chat'
        },
        participants: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            }
        ],
        property: {
            type: mongoose.Schema.ObjectId,
            ref: 'Property',
            required: false // Not all chats will be tied to a property
        },
        lastMessage: { // This field can store the text of the last message for quick display
            type: String,
            default: ""
        },
        lastMessageAt: { // This field can store the timestamp of the last message for sorting
            type: Date,
            default: Date.now
        },
        messages: [messageSubSchema] // ⭐ CRITICAL: Array of messages as sub-documents ⭐
    },
    {
        timestamps: true // This provides `createdAt` and `updatedAt` for the chat document itself
    }
);

// Index for efficient participant lookup
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);