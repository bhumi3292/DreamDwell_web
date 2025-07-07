// src/hooks/useAuthHooks.js
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "../api/api"; // Your configured Axios instance

// --- API Service Imports ---
import {
    sendPasswordResetLinkApi,
    resetPasswordApi,
    changePasswordApi,
    updateProfileApi
} from '../api/authApi';

// --- Internal Service Functions for Hooks ---
const uploadProfilePictureService = async (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    const response = await axios.post("/api/auth/uploadImage", formData);
    return response.data;
};

const updateProfileService = async (profileData) => {
    const response = await updateProfileApi(profileData);
    return response.data;
};

// --- React Query Hooks ---

/**
 * Hook for sending a password reset link.
 * Uses `sendPasswordResetLinkApi` from `authApi.js`.
 */
// ⭐⭐⭐ ENSURE THIS LINE IS EXACTLY AS SHOWN BELOW ⭐⭐⭐
export const useSendPasswordResetLink = () => {
    return useMutation({
        mutationFn: sendPasswordResetLinkApi,
        mutationKey: ['sendPasswordResetLink'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password reset link sent successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to send password reset link.");
        }
    });
};
// ⭐⭐⭐ END OF CRITICAL LINE CHECK ⭐⭐⭐

/**
 * Hook for resetting a password using a token.
 */
export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ token, newPassword, confirmPassword }) => resetPasswordApi({ newPassword, confirmPassword }, token),
        mutationKey: ['resetPassword'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password reset successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to reset password.");
        }
    });
};

/**
 * Hook for changing a user's password while logged in.
 */
export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePasswordApi,
        mutationKey: ['changePassword'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password changed successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to change password.");
        }
    });
};

/**
 * Hook for uploading a user's profile picture.
 */
export const useUploadProfilePicture = () => {
    return useMutation({
        mutationFn: uploadProfilePictureService,
        mutationKey: ['uploadProfilePicture'],
        onSuccess: (data) => {
            toast.success(data.message || "Profile picture uploaded successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || error.message || "Failed to upload profile picture.");
        },
    });
};

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: updateProfileService,
        mutationKey: ['updateProfile'],
        onSuccess: (data) => {
            toast.success(data.message || "Profile updated successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to update profile.");
        }
    });
};