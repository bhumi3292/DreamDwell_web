// src/hooks/payment/useEsewaPayment.js
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { initiateEsewaPaymentApi } from '../../api/paymentApi'; // Import the unified API

export const useEsewaPayment = () => {
    const [isProcessingEsewaPayment, setIsProcessingEsewaPayment] = useState(false);
    const [esewaPaymentError, setEsewaPaymentError] = useState(null);

    const initiateEsewaPayment = useCallback(async (paymentContext, paymentDetails) => {
        setIsProcessingEsewaPayment(true);
        setEsewaPaymentError(null);

        const { propertyId, amount } = paymentDetails;
        if (!propertyId || !amount || amount <= 0) {
            const errorMsg = 'Missing essential payment details (property ID or amount).';
            toast.error(errorMsg);
            setEsewaPaymentError(errorMsg);
            setIsProcessingEsewaPayment(false);
            return;
        }

        let additionalDetails = { context: paymentContext }; // Always send context

        if (paymentContext === 'booking') {
            const { bookingStartDate, bookingEndDate } = paymentDetails;
            if (!bookingStartDate || !bookingEndDate) {
                const errorMsg = 'Missing booking dates.';
                toast.error(errorMsg);
                setEsewaPaymentError(errorMsg);
                setIsProcessingEsewaPayment(false);
                return;
            }
            additionalDetails = {
                ...additionalDetails,
                bookingStartDate,
                bookingEndDate,
            };
        } else if (paymentContext === 'listing_fee') {
            const { productName } = paymentDetails;
            if (!productName) {
                const errorMsg = 'Missing product name for listing fee.';
                toast.error(errorMsg);
                setEsewaPaymentError(errorMsg);
                setIsProcessingEsewaPayment(false);
                return;
            }
            additionalDetails = {
                ...additionalDetails,
                productName,
            };
        } else {
            const errorMsg = 'Invalid payment context provided.';
            toast.error(errorMsg);
            setEsewaPaymentError(errorMsg);
            setIsProcessingEsewaPayment(false);
            return;
        }

        try {
            // Step 1: Call your backend API to get the signed eSewa parameters
            // Pass the propertyId, amount, and the dynamically constructed additionalDetails
            const response = await initiateEsewaPaymentApi(propertyId, amount, additionalDetails);

            if (response.success && response.data) {
                const { esewaGatewayUrl, ...esewaParams } = response.data;

                // Step 2: Dynamically create and submit a form to eSewa's gateway
                const form = document.createElement('form');
                form.setAttribute('method', 'POST');
                form.setAttribute('action', esewaGatewayUrl);

                for (const key in esewaParams) {
                    if (Object.prototype.hasOwnProperty.call(esewaParams, key)) {
                        const hiddenField = document.createElement('input');
                        hiddenField.setAttribute('type', 'hidden');
                        hiddenField.setAttribute('name', key);
                        hiddenField.setAttribute('value', esewaParams[key]);
                        form.appendChild(hiddenField);
                    }
                }

                document.body.appendChild(form);
                form.submit();

                toast.info('Redirecting to eSewa for secure payment...');
            } else {
                const errorMessage = response.message || `Failed to initiate eSewa payment for ${paymentContext} via server.`;
                toast.error(errorMessage);
                setEsewaPaymentError(errorMessage);
                setIsProcessingEsewaPayment(false);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || `Network error or server issue during eSewa ${paymentContext} initiation.`;
            console.error(`eSewa ${paymentContext} Initiation Error:`, error);
            toast.error(errorMessage);
            setEsewaPaymentError(errorMessage);
            setIsProcessingEsewaPayment(false);
        }
    }, []);

    return {
        initiateEsewaPayment,
        isProcessingEsewaPayment,
        esewaPaymentError,
    };
};
//
//
// const handleEsewaPayment = () => {
//     setIsProcessing(true)
//
//     const transaction_uuid = uuidv4(); // or use uuid v4 if required
//     console.log(transaction_uuid)
//     const product_code = "EPAYTEST"
//     const total_amount = price.toFixed(2) // You must match this exactly as in the string
//     const signed_field_names = "total_amount,transaction_uuid,product_code"
//
//     const signingString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`
//     const secret = "8gBm/:&EnhH.1/q" // ← UAT secret key from eSewa. DO NOT USE IN PRODUCTION FRONTEND.
//
//     const signature = CryptoJS.HmacSHA256(signingString, secret).toString(CryptoJS.enc.Base64)
//
//     const fields = {
//         amount: price.toFixed(2),
//         tax_amount: "0",
//         total_amount: total_amount,
//         transaction_uuid: transaction_uuid,
//         product_code: product_code,
//         product_service_charge: "0",
//         product_delivery_charge: "0",
//         success_url: "https://developer.esewa.com.np/success",
//         failure_url: "https://developer.esewa.com.np/failure",
//         signed_field_names: signed_field_names,
//         signature: signature,
//     }
//
//     const form = document.createElement("form")
//     form.setAttribute("method", "POST")
//     form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form")
//
//     Object.entries(fields).forEach(([key, value]) => {
//         const input = document.createElement("input")
//         input.setAttribute("type", "hidden")
//         input.setAttribute("name", key)
//         input.setAttribute("value", value)
//         form.appendChild(input)
//     })
//
//     document.body.appendChild(form)
//     form.submit()
// }