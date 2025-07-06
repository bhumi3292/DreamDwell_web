const Payment = require('../../models/payment');
const Property = require('../../models/Property');
const axios = require('axios');


const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;


// @desc    Create a new Payment record and verify with Khalti
// @route   POST /api/payments
// @access  Private (Requires authentication via authenticateUser middleware)
exports.createPayment = async (req, res) => {

    const { propertyId, source, source_payment_id, amount } = req.body;

    const userId = req.user._id;

    if (!userId || !propertyId || !source || !source_payment_id || amount === undefined || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Missing or invalid required payment fields (userId, propertyId, source, source_payment_id, amount).',
        });
    }

    try {

        const khaltiVerificationResponse = await axios.post(
            'https://khalti.com/api/v2/payment/verify/',
            {
                token: source_payment_id,
                amount: amount * 100,
            },
            {
                headers: {
                    Authorization: `Key ${KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (khaltiVerificationResponse.data.idx !== source_payment_id || khaltiVerificationResponse.data.amount !== (amount * 100)) {
            console.error("Khalti verification mismatch:", {
                expectedIdx: source_payment_id,
                receivedIdx: khaltiVerificationResponse.data.idx,
                expectedAmount: amount * 100,
                receivedAmount: khaltiVerificationResponse.data.amount
            });
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed: Mismatched transaction details with Khalti.',
            });
        }

        // 6. (Optional but Recommended) Check if the property actually exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found for this payment.' });
        }

        const payment = new Payment({
            user: userId,
            property: propertyId,
            source: source,
            source_payment_id: source_payment_id,
            amount: amount,
            status: 'completed',
        });

        const createdPayment = await payment.save();


        res.status(201).json({
            success: true,
            message: "Payment successfully verified and recorded.",
            data: createdPayment,
        });

    } catch (err) {
        console.error("Error in createPayment:", err.response?.data || err.message);

        if (err.response && err.response.status === 400) {
            return res.status(400).json({
                success: false,
                message: err.response.data?.detail || 'Khalti payment verification failed.',
                error: err.response.data,
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Server error: Could not process payment.',
            error: err.message,
        });
    }
};