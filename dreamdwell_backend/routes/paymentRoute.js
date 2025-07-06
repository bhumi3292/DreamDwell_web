const express = require('express');
const router = express.Router();
const paymentController = require('../../dreamdwell_backend/controllers/payment/paymentController');
const { authenticateUser } = require('../middlewares/auth'); // Correct path to your auth middleware

router.post('/', authenticateUser, paymentController.createPayment);

module.exports = router;