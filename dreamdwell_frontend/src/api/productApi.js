import axios from "axios";

// API CALLS

export const getAllProductApi = async (params) => {
    return await axios.get("/api/products", { params });
};

export const createPropertyApi = async (data) => {
    return await axios.post("/api/property/create", data);
};

export const getOneProductApi = async (id) => {
    return await axios.get(`/api/products/${id}`);
};

export const updateOneProductApi = async (id, data) => {
    return await axios.put(`/api/products/${id}`, data);
};
