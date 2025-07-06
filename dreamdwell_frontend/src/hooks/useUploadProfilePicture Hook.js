import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { uploadProfilePictureService } from "../services/authService.jsx"; // Import the service from userService.js

/**
 * Custom React Query hook for uploading a user's profile picture.
 * Manages the mutation state (loading, error, data) and provides toast notifications.
 */
export const useUploadProfilePicture = () => {
    return useMutation({
        // mutationFn is the function that performs the asynchronous operation.
        // It receives the variable passed to mutate() (in this case, the file).
        mutationFn: (file) => uploadProfilePictureService(file),
        mutationKey: ['uploadProfilePicture'], // A unique key for this mutation hook

        // onSuccess callback fires when the mutation is successful.
        // 'data' here will be the response from uploadProfilePictureService.
        onSuccess: (data) => {
            toast.success(data.message || "Profile picture uploaded successfully!");
            // You might want to invalidate queries related to user data here
            // queryClient.invalidateQueries(['userProfile']);
        },

        // onError callback fires if the mutation fails.
        // 'error' here will be the error thrown by uploadProfilePictureService.
        onError: (error) => {
            // Display a more specific error message if available, otherwise a generic one.
            toast.error(error.message || "Failed to upload profile picture.");
        },
    });
};

// Example of how you might use this hook in a component:
/*
import React, { useContext } from 'react';
import { useUploadProfilePicture } from './path/to/useUploadProfilePicture'; // Adjust path
import { AuthContext } from './path/to/AuthContext'; // Adjust path

function ProfilePictureUploader() {
    const { mutate, isLoading, isError, isSuccess, data, error } = useUploadProfilePicture();
    const { setUser } = useContext(AuthContext); // To update the user context after successful upload

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Perform client-side validation before mutating
            if (!file.type.startsWith('image/')) {
                toast.error("Only image files are allowed.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Image size cannot exceed 5MB.");
                return;
            }
            mutate(file, {
                onSuccess: (response) => {
                    // Update the AuthContext user state directly if the upload was successful
                    if (response.success && response.user) {
                        setUser(response.user);
                    }
                }
            });
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} disabled={isLoading} />
            {isLoading && <p>Uploading...</p>}
            {isError && <p>Error: {error.message}</p>}
            {isSuccess && <p>Upload successful!</p>}
        </div>
    );
}
*/
