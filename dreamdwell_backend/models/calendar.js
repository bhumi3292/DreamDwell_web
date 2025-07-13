// dreamdwell_backend/models/calendar.js
const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({ // <-- First argument: Schema fields
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },
    date: {
        type: Date, // Store as actual Date object
        required: true,
        // Setter to ensure date is stored at UTC midnight for consistency
        set: function(val) {
            const d = new Date(val);
            d.setUTCHours(0, 0, 0, 0);
            return d;
        },
        // Getter (optional, can also convert in controller if needed for consistent format)
        // get: function(val) { return val.toISOString().split('T')[0]; }
    },
    timeSlots: [{
        type: String, // Array of strings, e.g., ["09:00 AM", "10:00 AM"]
        required: true,
        trim: true
    }],
}, { // <-- Second argument: Schema options
    timestamps: true, // ⭐ THIS IS THE CORRECT PLACE FOR `timestamps: true` ⭐
    // You might also add other options here, e.g.,
    // toJSON: { getters: true, virtuals: true },
    // toObject: { getters: true, virtuals: true }
});

// Add a compound unique index to ensure only one availability entry per property per date
AvailabilitySchema.index({ landlord: 1, property: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);