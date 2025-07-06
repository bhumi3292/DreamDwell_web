// const mongoose = require("mongoose");
//
// const bookingSchema = new mongoose.Schema({
//     property: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Property",
//         required: true,
//     },
//     tenant: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//     },
//     startDate: {
//         type: Date,
//         required: true,
//     },
//     endDate: {
//         type: Date,
//         required: true,
//     },
// }, { timestamps: true });
//
// module.exports = mongoose.model("Booking", bookingSchema);

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
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
    timeSlot: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
        default: 'pending',
        required: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});


BookingSchema.index({ property: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);