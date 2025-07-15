// src/api/paymentApi.js

import axios from './axiosInstance';

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