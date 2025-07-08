// src/api/userApi.js
import axios from "./api";

export const getUserProfileApi = () => {
    return axios.get("/api/users/profile"); // Adjust the route based on your backend
};

