// src/api/propertyApi.js
import axios from "./api"; // This correctly imports the modified 'instance' from api.js

export const getAllPropertiesApi = () => {
    return axios.get("/api/properties");
};

export const createPropertyApi = (data) => {
    // When 'data' is a FormData object, Axios will correctly send it as multipart/form-data
    return axios.post("/api/properties", data);
};

export const getOnePropertyApi = (id) => {
    return axios.get(`/api/properties/${id}`);
};

export const updateOnePropertyApi = (id, data) => {
    // When 'data' is a FormData object, Axios will correctly send it as multipart/form-data
    return axios.put(`/api/properties/${id}`, data);
};

export const deletePropertyApi = (id) => {
    return axios.delete(`/api/properties/${id}`);
};