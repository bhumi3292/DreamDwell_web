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

// Routes
router.post("/create", protect, requireTenant, createBooking);
router.get("/tenant", protect, requireTenant, getMyBookings);


module.exports = router;
