import { useMutation } from "@tanstack/react-query";
import {
    sendPasswordResetLinkService,
    resetPasswordService,
    changePasswordService
} from '../services/authService';
import {toast} from "react-toastify";


export const useSendPasswordResetLink = () => {
    return useMutation({
        mutationFn: sendPasswordResetLinkService,
        mutationKey: ['sendPasswordResetLink'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password reset link sent successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to send password reset link.");
        }
    });
};

export const useResetPassword = () => {
    return useMutation({
        // The mutationFn receives an object with 'token' and password fields
        mutationFn: ({ token, newPassword, confirmPassword }) => resetPasswordService({ newPassword, confirmPassword }, token),
        mutationKey: ['resetPassword'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password reset successfully!");
        },
        onError: (err) => {
            // More robust error message extraction
            toast.error(err.response?.data?.message || err.message || "Failed to reset password.");
        }
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePasswordService,
        mutationKey: ['changePassword'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password changed successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to change password.");
        }
    });
};
