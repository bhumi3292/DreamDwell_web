// dreamdwell_backend/routes/calendarRoutes.js

const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticateUser, requireRole } = require('../middlewares/auth'); // Your consolidated auth & role middleware

const { isOwnerOrRelatedResource } = require('../middlewares/resourceAuthMiddleware'); // Your new resource auth middleware


const Availability = require('../models/calendar');
const Booking = require('../models/Booking');


router.use(authenticateUser); // Apply authenticateUser to all routes within this router

// --- Landlord Calendar Routes ---


router.post('/availabilities',
    requireRole('landlord'), // Ensures only users with 'landlord' role can access
    calendarController.createAvailability
);

/**
 * @route   GET /api/calendar/landlord/availabilities
 * @desc    Landlord gets all their availability entries.
 * @access  Private (Landlord only)
 */
router.get('/landlord/availabilities',
    requireRole('landlord'),
    calendarController.getLandlordAvailabilities
);

/**
 * @route   PUT /api/calendar/availabilities/:id
 * @desc    Landlord updates time slots for an existing availability entry.
 * @access  Private (Landlord only, and only for their own availability entry)
 */
router.put('/availabilities/:id',
    requireRole('landlord'),
    // Ensures the authenticated landlord is the owner of this specific availability resource
    isOwnerOrRelatedResource(Availability, 'id'),
    calendarController.updateAvailability
);

/**
 * @route   DELETE /api/calendar/availabilities/:id
 * @desc    Landlord deletes an entire availability entry.
 * @access  Private (Landlord only, and only for their own availability entry)
 */
router.delete('/availabilities/:id',
    requireRole('landlord'),
    // Ensures the authenticated landlord is the owner of this specific availability resource
    isOwnerOrRelatedResource(Availability, 'id'),
    calendarController.deleteAvailability
);

// --- Tenant Calendar Routes ---

router.get('/properties/:propertyId/available-slots',
    requireRole('tenant'), // Ensures only users with 'tenant' role can access
    calendarController.getAvailableSlotsForProperty
);

router.post('/book-visit',
    requireRole('tenant'),
    calendarController.bookVisit
);

router.get('/tenant/bookings',
    requireRole('tenant'),
    calendarController.getTenantBookings
);


// --- General Booking Management Routes (Accessible by Landlords primarily) ---

router.get('/landlord/bookings',
    requireRole('landlord'),
    calendarController.getLandlordBookings
);

router.put('/bookings/:id/status',
    requireRole('landlord'),
    // Ensures the authenticated landlord is the owner of the property associated with this booking
    isOwnerOrRelatedResource(Booking, 'id'),
    calendarController.updateBookingStatus
);


router.delete('/bookings/:id',
    isOwnerOrRelatedResource(Booking, 'id'),
    calendarController.deleteBooking
);

module.exports = router;