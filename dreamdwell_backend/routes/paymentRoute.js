const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    verifyKhaltiPayment,
    verifyEsewaPayment
} = require('../../dreamdwell_backend/controllers/payment/paymentController');

router.post('/initiate', initiatePayment);


router.post('/verify/khalti', verifyKhaltiPayment);


router.post('/verify/esewa', verifyEsewaPayment);

module.exports = router;