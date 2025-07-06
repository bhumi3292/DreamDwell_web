const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
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
        type: Date,
        required: true,

        set: function(val) {
            const d = new Date(val);
            d.setUTCHours(0, 0, 0, 0);
            return d;
        },
        get: function(val) {
            return val;
        }
    },
    timeSlots: [{
        type: String,
        required: true,
        trim: true
    }],
    isBooked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

AvailabilitySchema.index({ landlord: 1, property: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);