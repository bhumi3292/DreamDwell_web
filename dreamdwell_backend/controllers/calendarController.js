// dreamdwell_backend/controllers/calendarController.js

// --- CORRECTED IMPORT PATH FOR AVAILABILITY ---
const Availability = require('../models/calendar');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');

const normalizeDate = (dateString) => {
    const d = new Date(dateString);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// --- Landlord Specific Controller Functions ---

exports.createAvailability = async (req, res) => {
    const { propertyId, date, timeSlots } = req.body;
    const landlordId = req.user._id;

    if (!propertyId || !date || !Array.isArray(timeSlots) || timeSlots.length === 0) {
        return res.status(400).json({ success: false, message: 'Property ID, date, and at least one time slot are required.' });
    }

    try {
        const normalizedDate = normalizeDate(date);

        const property = await Property.findOne({ _id: propertyId, landlord: landlordId });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found or does not belong to you.' });
        }

        let availability = await Availability.findOne({
            landlord: landlordId,
            property: propertyId,
            date: normalizedDate
        });

        if (availability) {
            const existingSlots = new Set(availability.timeSlots);
            timeSlots.forEach(slot => existingSlots.add(slot));
            availability.timeSlots = Array.from(existingSlots).sort();
            await availability.save();
            return res.status(200).json({ success: true, message: 'Availability updated successfully.', availability });
        } else {
            availability = new Availability({
                landlord: landlordId,
                property: propertyId,
                date: normalizedDate,
                timeSlots: timeSlots.sort()
            });
            await availability.save();
            return res.status(201).json({ success: true, message: 'Availability created successfully.', availability });
        }
    } catch (error) {
        console.error('Error in createAvailability:', error);
        res.status(500).json({ success: false, message: 'Server error creating or updating availability.', error: error.message });
    }
};

exports.getLandlordAvailabilities = async (req, res) => {
    const landlordId = req.user._id;

    try {
        const availabilities = await Availability.find({ landlord: landlordId })
            .populate('property', 'title address images')
            .sort({ date: 1, 'timeSlots.0': 1 });

        res.status(200).json({ success: true, availabilities });
    } catch (error) {
        console.error('Error in getLandlordAvailabilities:', error);
        res.status(500).json({ success: false, message: 'Server error fetching landlord availabilities.', error: error.message });
    }
};

exports.updateAvailability = async (req, res) => {
    const { id } = req.params;
    const { timeSlots } = req.body;
    const landlordId = req.user._id;

    if (!Array.isArray(timeSlots)) {
        return res.status(400).json({ success: false, message: 'Time slots must be an array.' });
    }

    try {
        const availability = await Availability.findById(id);
        if (!availability || availability.landlord.toString() !== landlordId.toString()) {
            return res.status(404).json({ success: false, message: 'Availability not found or does not belong to you.' });
        }

        const removedSlots = availability.timeSlots.filter(slot => !timeSlots.includes(slot));

        if (removedSlots.length > 0) {
            const existingBookings = await Booking.countDocuments({
                property: availability.property,
                date: availability.date,
                timeSlot: { $in: removedSlots },
                status: { $in: ['pending', 'confirmed'] }
            });

            if (existingBookings > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot remove time slot(s) that already have pending or confirmed bookings.'
                });
            }
        }

        availability.timeSlots = timeSlots.sort();
        await availability.save();

        res.status(200).json({ success: true, message: 'Availability updated successfully.', availability });
    } catch (error) {
        console.error('Error in updateAvailability:', error);
        res.status(500).json({ success: false, message: 'Server error updating availability.', error: error.message });
    }
};

exports.deleteAvailability = async (req, res) => {
    const { id } = req.params;
    const landlordId = req.user._id;

    try {
        const availability = await Availability.findById(id);
        if (!availability || availability.landlord.toString() !== landlordId.toString()) {
            return res.status(404).json({ success: false, message: 'Availability not found or does not belong to you.' });
        }

        const existingBookings = await Booking.countDocuments({
            property: availability.property,
            date: availability.date,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBookings > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete availability because there are existing pending or confirmed bookings for this date. Please cancel bookings first.'
            });
        }

        await availability.deleteOne();
        res.status(200).json({ success: true, message: 'Availability deleted successfully.' });
    } catch (error) {
        console.error('Error in deleteAvailability:', error);
        res.status(500).json({ success: false, message: 'Server error deleting availability.', error: error.message });
    }
};

// --- Tenant Specific Controller Functions ---

exports.getAvailableSlotsForProperty = async (req, res) => {
    const { propertyId } = req.params;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required to find available slots.' });
    }

    try {
        const normalizedDate = normalizeDate(date);

        const availability = await Availability.findOne({
            property: propertyId,
            date: normalizedDate
        });

        if (!availability || availability.timeSlots.length === 0) {
            return res.status(200).json({ success: true, availableSlots: [], message: 'No availability found for this date.' });
        }

        const bookedSlots = await Booking.find({
            property: propertyId,
            date: normalizedDate,
            status: { $in: ['pending', 'confirmed'] }
        }).select('timeSlot -_id');

        const bookedTimeSlots = new Set(bookedSlots.map(booking => booking.timeSlot));

        const trulyAvailableSlots = availability.timeSlots.filter(
            slot => !bookedTimeSlots.has(slot)
        );

        res.status(200).json({
            success: true,
            date: availability.date,
            availableSlots: trulyAvailableSlots,
            property: propertyId
        });

    } catch (error) {
        console.error('Error in getAvailableSlotsForProperty:', error);
        res.status(500).json({ success: false, message: 'Server error fetching available slots.', error: error.message });
    }
};

exports.bookVisit = async (req, res) => {
    const { propertyId, date, timeSlot } = req.body;
    const tenantId = req.user._id;

    if (!propertyId || !date || !timeSlot) {
        return res.status(400).json({ success: false, message: 'Property ID, date, and time slot are required.' });
    }

    try {
        const normalizedDate = normalizeDate(date);

        const availability = await Availability.findOne({
            property: propertyId,
            date: normalizedDate,
            timeSlots: timeSlot
        });

        if (!availability) {
            return res.status(400).json({ success: false, message: 'The requested time slot is not available or does not exist on the landlord\'s schedule.' });
        }

        const existingBooking = await Booking.findOne({
            property: propertyId,
            date: normalizedDate,
            timeSlot: timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another.' });
        }

        const newBooking = new Booking({
            tenant: tenantId,
            landlord: availability.landlord,
            property: propertyId,
            date: normalizedDate,
            timeSlot: timeSlot,
            status: 'pending'
        });

        await newBooking.save();

        res.status(201).json({ success: true, message: 'Visit booked successfully. Awaiting landlord confirmation.', booking: newBooking });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another.' });
        }
        console.error('Error in bookVisit:', error);
        res.status(500).json({ success: false, message: 'Server error booking visit.', error: error.message });
    }
};

exports.getTenantBookings = async (req, res) => {
    const tenantId = req.user._id;

    try {
        const bookings = await Booking.find({ tenant: tenantId })
            .populate('property', 'title address images')
            .populate('landlord', 'firstName lastName email phoneNumber')
            .sort({ date: 1, timeSlot: 1 });

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error('Error in getTenantBookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching tenant bookings.', error: error.message });
    }
};

// --- Shared/Landlord Management Controller Functions for Bookings ---

exports.getLandlordBookings = async (req, res) => {
    const landlordId = req.user._id;

    try {
        const bookings = await Booking.find({ landlord: landlordId })
            .populate('tenant', 'firstName lastName email phoneNumber')
            .populate('property', 'title address images')
            .sort({ date: 1, timeSlot: 1 });

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error('Error in getLandlordBookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching landlord bookings.', error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const landlordId = req.user._id;

    const validStatuses = ['confirmed', 'cancelled', 'completed', 'rescheduled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid booking status provided.' });
    }

    try {
        const booking = await Booking.findById(id);
        if (!booking || booking.landlord.toString() !== landlordId.toString()) {
            return res.status(404).json({ success: false, message: 'Booking not found or does not belong to your properties.' });
        }

        if (booking.status !== 'pending' && status === 'pending') {
            return res.status(400).json({ success: false, message: 'Cannot revert a booking to pending status once it has been processed.' });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({ success: true, message: `Booking status updated to ${status}.`, booking });
    } catch (error) {
        console.error('Error in updateBookingStatus:', error);
        res.status(500).json({ success: false, message: 'Server error updating booking status.', error: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (booking.tenant.toString() !== userId.toString() && booking.landlord.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to cancel this booking.' });
        }

        if (booking.status !== 'cancelled' && booking.status !== 'completed') {
            booking.status = 'cancelled';
            await booking.save();
            res.status(200).json({ success: true, message: 'Booking cancelled successfully.' });
        } else {
            return res.status(400).json({ success: false, message: `Booking cannot be cancelled from '${booking.status}' status.` });
        }

    } catch (error) {
        console.error('Error in deleteBooking:', error);
        res.status(500).json({ success: false, message: 'Server error cancelling booking.', error: error.message });
    }
};