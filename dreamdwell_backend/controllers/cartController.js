// dreamdwell_backend/controllers/cartController.js
const Cart = require('../models/Cart'); // Assuming the model is named Cart.js
const Property = require('../models/Property'); // Needed to validate property existence

// Helper function to handle async errors without repetitive try/catch (if you use it)
// If you don't have asyncHandler, remove it and use try/catch blocks directly.
const { asyncHandler } = require('../utils/asyncHandler'); // Assuming you have this utility

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Protected
exports.getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id; // User ID from authenticated request

    const cart = await Cart.findOne({ user: userId }).populate('items.property');

    if (!cart) {
        // If a user doesn't have a cart yet, return an empty cart
        return res.status(200).json({ success: true, message: "Cart is empty or not yet created.", data: { user: userId, items: [] } });
    }

    res.status(200).json({ success: true, message: "Cart retrieved successfully.", data: cart });
});

// @desc    Add property to cart
// @route   POST /api/cart/add
// @access  Protected
exports.addToCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { propertyId } = req.body;

    if (!propertyId) {
        return res.status(400).json({ success: false, message: "Property ID is required to add to cart." });
    }

    // Validate if the property exists
    const propertyExists = await Property.findById(propertyId);
    if (!propertyExists) {
        return res.status(404).json({ success: false, message: "Property not found." });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // If no cart exists for the user, create a new one
        cart = await Cart.create({
            user: userId,
            items: [{ property: propertyId }]
        });
        return res.status(201).json({ success: true, message: "Cart created and property added.", data: cart });
    }

    // Check if the property is already in the cart
    const itemExists = cart.items.some(item => item.property.toString() === propertyId);

    if (itemExists) {
        return res.status(409).json({ success: false, message: "Property already in cart." });
    } else {
        // Add the new property to the existing cart
        cart.items.push({ property: propertyId });
        await cart.save();
        return res.status(200).json({ success: true, message: "Property added to cart.", data: cart });
    }
});

// @desc    Remove property from cart
// @route   DELETE /api/cart/remove/:propertyId
// @access  Protected
exports.removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { propertyId } = req.params; // Get propertyId from URL params

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found." });
    }

    // Filter out the item to be removed
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(item => item.property.toString() !== propertyId);

    if (cart.items.length === initialItemCount) {
        // If no item was removed, it means the propertyId was not in the cart
        return res.status(404).json({ success: false, message: "Property not found in cart." });
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Property removed from cart.", data: cart });
});

// @desc    Clear all items from cart
// @route   DELETE /api/cart/clear
// @access  Protected
exports.clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Option 1: Remove the entire cart document (cleaner if cart is always created on first add)
    const result = await Cart.deleteOne({ user: userId });

    if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Cart not found to clear." });
    }

    // Option 2: Empty the items array but keep the cart document
    // let cart = await Cart.findOne({ user: userId });
    // if (cart) {
    //     cart.items = [];
    //     await cart.save();
    //     return res.status(200).json({ success: true, message: "Cart cleared.", data: cart });
    // } else {
    //     return res.status(404).json({ success: false, message: "Cart not found to clear." });
    // }

    res.status(200).json({ success: true, message: "Cart cleared successfully." });
});