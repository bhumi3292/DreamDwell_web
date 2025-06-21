// useProperty.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchPropertiesService,
    updatePropertyService,
    deletePropertyService,
} from "../../services/addProductService.jsx";
import { toast } from "react-toastify";

export const useFetchProperties = () =>
    useQuery({
        queryKey: ["admin_property_list"],
        queryFn: fetchPropertiesService,
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to load properties");
        },
    });

export const useUpdateProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updatePropertyService(id, data),
        onSuccess: () => {
            toast.success("Property updated successfully");
            queryClient.invalidateQueries(["admin_property_list"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update property");
        },
    });
};

export const useDeleteProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePropertyService,
        onSuccess: () => {
            toast.success("Property deleted successfully");
            queryClient.invalidateQueries(["admin_property_list"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete property");
        },
    });
};
