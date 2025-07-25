const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            property: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Property',
                required: true
            },
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
