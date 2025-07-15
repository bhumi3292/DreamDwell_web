// src/api/paymentApi.js

import axios from './axiosInstance';

/**
 * Initiates an eSewa payment. This API endpoint is designed to be generic,
 * but the backend should interpret the payment context based on the payload.
 *
 * @param {string} propertyId - The ID of the property.
 * @param {number} amount - The amount to be paid.
 * @param {object} [additionalDetails] - Optional object for context-specific data.
 * - For booking: { bookingStartDate: 'YYYY-MM-DD', bookingEndDate: 'YYYY-MM-DD', context: 'booking' }
 * - For listing fee: { productName: 'Premium Listing', context: 'premium_listing' }
 */
export const initiateEsewaPaymentApi = async (propertyId, amount, additionalDetails = {}) => {
    try {
        // The backend endpoint `/api/payments/initiate` will need to be smart enough
        // to handle both booking-related payments and listing-related payments
        // based on the presence of `bookingStartDate`, `bookingEndDate`, or `context`.
        const response = await axios.post('/api/payments/initiate', {
            propertyId,
            amount,
            ...additionalDetails, // Spread additional details like dates or product name
        });
        return response.data;
    } catch (error) {
        console.error('API Error: Failed to initiate eSewa payment:', error.response?.data || error.message);
        throw error;
    }
};

// Keep if still used for general payment record creation (e.g., manual verification)
export const createPaymentApi = async (paymentData) => {
    try {
        const response = await axios.post('/api/payments', paymentData);
        return response.data;
    } catch (error) {
        console.error('API Error: Failed to create/verify payment record:', error.response?.data || error.message);
        throw error;
    }
};