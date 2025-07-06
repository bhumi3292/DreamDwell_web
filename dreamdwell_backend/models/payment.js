const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
        },
        source: {
            type: String,
            required: true,
            enum: ['khalti'],
            default: 'Khalti',
        },
        source_payment_id: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Payment', paymentSchema);