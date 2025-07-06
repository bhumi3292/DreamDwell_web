const Cart = require('../models/cart');

// Get cart for logged-in user
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.property');
        if (!cart) {
            return res.json({ success: true, data: { items: [] } });
        }
        res.json({ success: true, data: cart });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching cart', error: err.message });
    }
};

// Add property to cart (no duplicate entries)
exports.addToCart = async (req, res) => {
    const { propertyId } = req.body;

    if (!propertyId) {
        return res.status(400).json({ success: false, message: 'propertyId is required' });
    }

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [{ property: propertyId }]
            });
        } else {
            const exists = cart.items.some(item => item.property.toString() === propertyId);
            if (exists) {
                return res.status(400).json({ success: false, message: 'Property already in cart' });
            }
            cart.items.push({ property: propertyId });
        }

        await cart.save();
        res.json({ success: true, message: 'Property added to cart', data: cart });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error adding to cart', error: err.message });
    }
};

// Remove a property from cart
exports.removeFromCart = async (req, res) => {
    const { propertyId } = req.params;

    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.property.toString() !== propertyId);
        await cart.save();

        res.json({ success: true, message: 'Property removed from cart', data: cart });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error removing from cart', error: err.message });
    }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = [];
        await cart.save();

        res.json({ success: true, message: 'Cart cleared', data: cart });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error clearing cart', error: err.message });
    }
};
