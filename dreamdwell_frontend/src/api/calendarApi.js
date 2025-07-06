// src/api/calendarApi.js
import api from './api'; // IMPORTANT: Ensure this path correctly points to your centralized axios instance (src/api/api.js)

/**
 * Fetches available time slots for a specific property on a given date.
 * @param {string} propertyId The ID of the property.
 * @param {string} date The date in YYYY-MM-DD format (e.g., '2025-07-10').
 * @returns {Promise<Array<string>>} A promise that resolves to an array of available time slots.
 */
export const getAvailableSlotsForPropertyApi = async (propertyId, date) => {
    try {
        const response = await api.get(`/api/calendar/properties/${propertyId}/available-slots`, {
            params: { date }
        });
        return response.data.availableSlots;
    } catch (error) {
        console.error('Error fetching available slots:', error);
        // Throw the backend's message or a generic one
        throw error.response?.data?.message || 'Failed to fetch available slots.';
    }
};

/**
 * Books a visit for a property.
 * @param {object} bookingDetails - Details for the booking.
 * @param {string} bookingDetails.propertyId - The ID of the property.
 * @param {string} bookingDetails.date - The date of the visit (YYYY-MM-DD).
 * @param {string} bookingDetails.timeSlot - The selected time slot.
 * @returns {Promise<object>} A promise that resolves to the booking confirmation.
 */
export const bookVisitApi = async ({ propertyId, date, timeSlot }) => {
    try {
        const response = await api.post('/api/calendar/book-visit', {
            propertyId,
            date,
            timeSlot,
        });
        return response.data; // Should return { success: true, message: '...', booking: {...} }
    } catch (error) {
        console.error('Error booking visit:', error);
        throw error.response?.data?.message || 'Failed to book visit.';
    }
};

// --- Other calendar-related API functions (already provided, included for completeness) ---

/**
 * Fetches all bookings for the current authenticated tenant.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of tenant bookings.
 */
export const getTenantBookingsApi = async () => {
    try {
        const response = await api.get('/api/calendar/tenant/bookings');
        return response.data.bookings;
    } catch (error) {
        console.error('Error fetching tenant bookings:', error);
        throw error.response?.data?.message || 'Failed to fetch tenant bookings.';
    }
};

/**
 * Cancels a booking. Note: This changes status to 'cancelled', not deletes the record.
 * @param {string} bookingId The ID of the booking to cancel.
 * @returns {Promise<object>} A promise that resolves to the cancellation confirmation.
 */
export const cancelBookingApi = async (bookingId) => {
    try {
        const response = await api.delete(`/api/calendar/bookings/${bookingId}`); // Backend uses DELETE for cancellation
        return response.data; // Should return { success: true, message: '...' }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error.response?.data?.message || 'Failed to cancel booking.';
    }
};

/**
 * Fetches all availabilities created by the current authenticated landlord.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of landlord availabilities.
 */
export const getLandlordAvailabilitiesApi = async () => {
    try {
        const response = await api.get('/api/calendar/landlord/availabilities');
        return response.data.availabilities;
    } catch (error) {
        console.error('Error fetching landlord availabilities:', error);
        throw error.response?.data?.message || 'Failed to fetch landlord availabilities.';
    }
};

/**
 * Creates or updates a landlord's availability for a property on a specific date.
 * @param {object} availabilityDetails - Details for the availability.
 * @param {string} availabilityDetails.propertyId - The ID of the property.
 * @param {string} availabilityDetails.date - The date in YYYY-MM-DD format.
 * @param {Array<string>} availabilityDetails.timeSlots - An array of time slots.
 * @param {string} [availabilityId] - Optional. If provided, updates an existing availability.
 * @returns {Promise<object>} A promise that resolves to the created/updated availability.
 */
export const upsertAvailabilityApi = async ({ propertyId, date, timeSlots }, availabilityId = null) => {
    try {
        let response;
        if (availabilityId) {
            response = await api.put(`/api/calendar/availabilities/${availabilityId}`, { timeSlots });
        } else {
            response = await api.post('/api/calendar/availabilities', { propertyId, date, timeSlots });
        }
        return response.data;
    } catch (error) {
        console.error('Error upserting availability:', error);
        throw error.response?.data?.message || 'Failed to manage availability.';
    }
};

/**
 * Deletes a landlord's availability entry.
 * @param {string} availabilityId The ID of the availability entry to delete.
 * @returns {Promise<object>} A promise that resolves to the deletion confirmation.
 */
export const deleteAvailabilityApi = async (availabilityId) => {
    try {
        const response = await api.delete(`/api/calendar/availabilities/${availabilityId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting availability:', error);
        throw error.response?.data?.message || 'Failed to delete availability.';
    }
};

/**
 * Fetches all bookings for the current authenticated landlord's properties.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of landlord's property bookings.
 */
export const getLandlordBookingsApi = async () => {
    try {
        const response = await api.get('/api/calendar/landlord/bookings');
        return response.data.bookings;
    } catch (error) {
        console.error('Error fetching landlord bookings:', error);
        throw error.response?.data?.message || 'Failed to fetch landlord bookings.';
    }
};

/**
 * Updates the status of a booking (e.g., 'confirmed', 'cancelled').
 * @param {string} bookingId The ID of the booking to update.
 * @param {string} status The new status ('confirmed', 'cancelled', 'completed', 'rescheduled').
 * @returns {Promise<object>} A promise that resolves to the updated booking.
 */
export const updateBookingStatusApi = async (bookingId, status) => {
    try {
        const response = await api.put(`/api/calendar/bookings/${bookingId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error.response?.data?.message || 'Failed to update booking status.';
    }
};