import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProperty } from "../../services/addProductService.jsx";
import { toast } from "react-toastify";

export const useCreateProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin_create_property"],
        mutationFn: createProperty,
        onSuccess: () => {
            toast.success("Property created successfully!");
            queryClient.invalidateQueries(["admin_property_list"]); // optional: refetch list
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create property");
        }
    });
};
