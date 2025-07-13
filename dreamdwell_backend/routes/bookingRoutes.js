const express = require("express");
const router = express.Router();

const {
    createBooking,
    getMyBookings,
    // getBookingsForProperty,
    // cancelBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middlewares/auth");
const roleCheck = require("../middlewares/role");

const requireTenant = roleCheck("Tenant");
// const requireLandlord = roleCheck("Landlord"); // Uncomment when needed

// Routes
router.post("/create", protect, requireTenant, createBooking);
router.get("/tenant", protect, requireTenant, getMyBookings);

// Uncomment when implemented
// router.get("/property/:propertyId", authenticateUser, requireLandlord, getBookingsForProperty);
// router.delete("/:id", authenticateUser, requireTenant, cancelBooking);

module.exports = router;
