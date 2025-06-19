import axios from "./api"; // Ensure this path correctly points to your axios instance

export const registerUserApi = (data) => {
    console.log(data);
    return axios.post('/auth/register', data);
};

export const loginUserApi = (data) => {
    return axios.post("/auth/login", data);
};


export const sendPasswordResetLinkApi = (data) => {
    return axios.post('/auth/forgot-password/send-link', data);
};

export const resetPasswordApi = (token, data) => {
    return axios.post(`/auth/reset-password/${token}`, data);
};