// src/api/api.js
import axios from "axios";

// This will correctly pick up VITE_API_BASE_URL from your .env file
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const instance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add an interceptor to automatically add the Authorization header from localStorage.
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData, let Axios handle Content-Type.
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default instance;