import {
    getAllProductApi,
    createOneProductApi,
    getOneProductApi,
    updateOneProductApi
} from "../api/productApi.js";

// PRODUCT SERVICES

export const getAllProductService = async (params) => {
    try {
        const response = await getAllProductApi(params);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Product fetch failed" };
    }
};

export const createOneProductService = async (data) => {
    try {
        const response = await createOneProductApi(data);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Product creation failed" };
    }
};

export const getOneProductService = async (id) => {
    try {
        const response = await getOneProductApi(id);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to load product" };
    }
};

export const updateOneProductService = async (id, data) => {
    try {
        const response = await updateOneProductApi(id, data);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to update product" };
    }
};
