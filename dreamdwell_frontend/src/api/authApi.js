// src/api/authApi.js
import axios from "./api"; // Ensure this path to your configured axios instance is correct

export const registerUserApi = (data) => {
    console.log(data);
    return axios.post('/api/auth/register', data);
};

export const loginUserApi = (data) => {
    return axios.post('/api/auth/login', data);
};

export const sendPasswordResetLinkApi = (data) => {
    return axios.post('/api/auth/request-reset/send-link', data);
};

export const resetPasswordApi = (data, token) => {
    // Note: If your backend expects a PUT request for reset password, change .post to .put here.
    // Based on common REST practices, reset password with token is often PUT.
    return axios.post(`/api/auth/reset-password/${token}`, data);
};

export const changePasswordApi = (data) => {
    // Note: Your backend route is '/api/users/change-password'. Ensure this is correct.
    return axios.post('/api/users/change-password', data);
};

// ⭐⭐⭐ ADD THIS NEW EXPORT ⭐⭐⭐
export const updateProfileApi = (profileData) => {
    // This is typically a PUT request for updating user data.
    // Make sure your backend has a corresponding PUT route (e.g., /api/auth/update-profile)
    return axios.put('/api/auth/update-profile', profileData);
};
// ⭐⭐⭐ END OF ADDITION ⭐⭐⭐