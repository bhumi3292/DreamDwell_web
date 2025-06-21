import axios from "./api"; // Ensure this path correctly points to your axios instance

export const registerUserApi = (data) => {
    console.log(data);
    return axios.post('/auth/register', data);
};

export const loginUserApi = (data) => {
    return axios.post("/auth/login", data);
};

export const sendPasswordResetLinkApi = (data) => {
    return axios.post('/auth/request-reset/send-link', data);
};

export const resetPasswordApi = async (data, token) => // Corrected token concatenation
    axios.post(`/auth/reset-password/${token}`, data);