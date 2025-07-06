import axios from "./api";

export const getCartApi = () => {
    return axios.get("/api/cart");
};

export const addToCartApi = (propertyId) => {
    return axios.post("/api/cart/add", { propertyId });
};

export const removeFromCartApi = (propertyId) => {
    return axios.delete(`/api/cart/remove/${propertyId}`);
};

export const clearCartApi = () => {
    return axios.delete("/api/cart/clear");
};
