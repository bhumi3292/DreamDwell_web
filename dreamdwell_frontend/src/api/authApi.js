import axios from "./api";

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
    return axios.post(`/api/auth/reset-password/${token}`, data);
};

export const changePasswordApi = (data) => {
    return axios.post('/api/users/change-password', data);
};
