const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        unique: true,
    },
    types: {
        type: [String],
        default: [],
    }
});

module.exports = mongoose.model("Category", CategorySchema);
