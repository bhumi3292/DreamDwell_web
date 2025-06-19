import { useMutation } from "@tanstack/react-query";
import {
    // --- CORRECTED IMPORTS FOR LINK-BASED PASSWORD RESET ---
    sendPasswordResetLinkService, // This is the new name from authService.js
    resetPasswordService          // This is the new name from authService.js
} from "../services/authService"; // Ensure this path is correct

// This hook is for requesting the password reset LINK
export const useSendPasswordResetLink = () => { // Hook name updated
    return useMutation({
        mutationFn: sendPasswordResetLinkService, // Using the new service function
        mutationKey: ['send-password-reset-link'],
        onSuccess: (data) => {
            console.log("Success data:", data);
        },
        onError: (err) => {
            console.error("useSendPasswordResetLink error:", err);
            // Error message handled in the component
        }
    });
};

// This hook is for resetting the password using the token from the link
export const useResetPassword = () => { // Hook name updated
    return useMutation({
        // The mutationFn now expects an object containing 'token' and password fields
        mutationFn: ({ token, newPassword, confirmPassword }) => resetPasswordService(token, { newPassword, confirmPassword }),
        mutationKey: ['reset-password'],
        onSuccess: (data) => {
            console.log("Success data:", data); // Now 'data' is used
            // Success message handled in the component
        },
        onError: (err) => {
            console.error("useResetPassword error:", err);
            // Error message handled in the component
        }
    });
};