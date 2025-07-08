const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema( // Renamed schema
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
            required: false
        },
        lastMessage: {
            type: String,
            default: ""
        },
        lastMessageAt: {
            type: Date,
            default: Date.now
        },
    },
    {
        timestamps: true
    }
);

chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);