// src/services/authService.jsx
import {
    registerUserApi,
    loginUserApi,
    sendPasswordResetLinkApi,
    resetPasswordApi,
    changePasswordApi
} from "../api/authApi";

// ⭐ CRITICAL FIX: IMPORT 'api' HERE ⭐
import api from '../api/api'; // <--- ADD THIS LINE. Adjust path if your 'api' instance is in a different location.

export const registerUserService = async (formData) => {
    try {
        console.log(formData);
        const response = await registerUserApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Registration Failed" };
    }
};

export const loginUserService = async (formData) => {
    try {
        const response = await loginUserApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Login Failed" };
    }
};

// --- UPDATED SERVICE FUNCTION FOR SENDING PASSWORD RESET LINK ---
export const sendPasswordResetLinkService = async (formData) => {
    try {
        // formData is expected to contain { email: "user@example.com" }
        const response = await sendPasswordResetLinkApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to send password reset link. Please try again later." };
    }
};

export const resetPasswordService = async (formData, token) => {
    try {
        const response = await resetPasswordApi(formData, token);
        return response.data
    } catch (err) {
        throw err.response?.data || { message: "Reset Password Failed" };
    }
}

export const changePasswordService = async (formData) => {
    try {
        const response = await changePasswordApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to change password." };
    }
};

// ⭐ MODIFIED: `uploadProfilePictureService` for correct POST method and `api` import ⭐
export const uploadProfilePictureService = async (file) => {
    const formData = new FormData();
    // The key 'profilePicture' MUST match what Multer expects on the backend (.single('profilePicture'))
    formData.append('profilePicture', file);

    try {
        // ⭐ CRITICAL FIX: Ensure `api.post` is used here ⭐
        const response = await api.post(
            '/api/auth/uploadImage', // This URL matches your backend route
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // This header is ESSENTIAL for FormData
                },
                // If you manage token via Axios interceptors, you might not need to pass it here.
                // Your current setup with `axios from "./api"` likely handles the Authorization header automatically.
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in uploadProfilePictureService:", error);
        // It's good practice to re-throw the error so the useMutation hook can catch it
        throw error.response?.data || { message: "Failed to upload image. Please try again." };
    }
};