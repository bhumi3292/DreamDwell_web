// src/api/cartApi.js
import api from './api';

export const getCartApi = async () => {
    // Backend: router.get('/', cartController.getCart);
    // Correct. This matches GET /api/cart
    return await api.get('/api/cart');
};

export const addToCartApi = async (propertyId) => {
    // ⭐ CORRECTION HERE: Change '/api/cart' to '/api/cart/add' ⭐
    // Backend: router.post('/add', cartController.addToCart);
    return await api.post('/api/cart/add', { propertyId });
};

export const removeFromCartApi = async (propertyId) => {
    // Backend: router.delete('/remove/:propertyId', cartController.removeFromCart);
    // Correct. This matches DELETE /api/cart/remove/:propertyId
    return await api.delete(`/api/cart/remove/${propertyId}`); // ⭐ Correction: Added '/remove/' ⭐
};

export const clearCartApi = async () => {
    // Backend: router.delete('/clear', cartController.clearCart);
    // Correct. This matches DELETE /api/cart/clear
    return await api.delete('/api/cart/clear');
};