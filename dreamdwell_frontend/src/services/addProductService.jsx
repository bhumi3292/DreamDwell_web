import axiosInstance from "../utils/axiosInstance.js";

export const fetchProperties = (query = "") => axiosInstance.get(`/properties${query}`);

export const fetchPropertyById = (id) => axiosInstance.get(`/properties/${id}`);

export const createProperty = (formData) =>
    axiosInstance.post("/properties", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const updateProperty = (id, formData) =>
    axiosInstance.put(`/properties/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const deleteProperty = (id) => axiosInstance.delete(`/properties/${id}`);
