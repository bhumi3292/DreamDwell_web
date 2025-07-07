// src/api/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// ⭐ CHANGE HERE: Export API_URL ⭐
export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const instance = axios.create({
    baseURL: API_URL, // Use the exported API_URL here
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the JWT token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 Unauthorized
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("401 Unauthorized error caught by interceptor:", error.response.data.message);
            toast.error("Your session has expired or is invalid. Please log in again.");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;