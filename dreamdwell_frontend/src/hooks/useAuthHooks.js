import { useMutation } from "@tanstack/react-query";
// Import sendPasswordResetLinkService and ensure requestResetPasswordService is removed or correctly aliased if used elsewhere
import { sendPasswordResetLinkService, resetPasswordService } from '../services/authService';
import {toast} from "react-toastify";


export const useSendPasswordResetLink = () => {
    return useMutation({
        mutationFn: sendPasswordResetLinkService,
        mutationKey: ['sendPasswordResetLink'], // Corrected mutationKey
        onSuccess: (data) => {
            toast.success(data?.message || "Password reset link sent successfully!");
        },
        onError: (err) => {
            toast.error(err?.message || "Failed to send password reset link.");
        }
    });
};

// This hook is for resetting the password using the token from the link
export const useResetPassword = () => {
    return useMutation({
        // The mutationFn now expects an object containing 'token' and password fields
        mutationFn: ({ token, newPassword, confirmPassword }) => resetPasswordService({ newPassword, confirmPassword }, token),
        mutationKey: ['resetPassword'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password reset successfully!");
        },
        onError: (err) => {
            toast.error(err?.message || "Failed to reset password.");
        }
    });
};


// export const userResetPassword = () => { // This seems to be for sending the link, but is misnamed and uses wrong service
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     return useMutation(
//         {
//             mutationFn:requestResetPasswordService, // This service was incorrect for sending link
//             mutationKey: ['reset-password'],
//             onSuccess:(data)=>{
//                 toast.success(data?.message|| "Email Sent");
//             },
//             onError:(err)=>{
//                 toast.error(err?.message || "Email Sent Failed");
//             }
//         })
// }

// The following useResetPassword was okay but the one above is more explicit with args
// export const useResetPassword = () => {
//     return useMutation(
//         {
//             mutationFn: ({data, token}) => resetPasswordService(data, token),
//             mutationKey: ['resetPassword'],
//             onSuccess:(data)=>{
//                 toast.success(data?.message|| "Reset Successful");
//             },
//             onError:(err)=>{
//                 toast.error(err?.message || "Password reset Failed");
//             }
//         }
//     )
// }