// dreamdwell_backend/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: true
    },
    tenant: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // ⭐ NEW: Add landlord field to easily query landlord's bookings ⭐
    landlord: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // ⭐ NEW: Use 'date' and 'timeSlot' for single-slot visits ⭐
    date: {
        type: String, // Storing as 'YYYY-MM-DD' string for consistency with Availability
        required: true
    },
    timeSlot: {
        type: String, // e.g., "10:00 AM", "14:30"
        required: true
    },
    // ⭐ NEW: Add status field ⭐
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add a compound unique index to prevent duplicate bookings for the exact same slot
BookingSchema.index({ property: 1, date: 1, timeSlot: 1, tenant: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } });

module.exports = mongoose.model('Booking', BookingSchema);