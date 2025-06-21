import {
    registerUserApi,
    loginUserApi,
    sendPasswordResetLinkApi, // Ensure this is imported
    resetPasswordApi
} from "../api/authApi";

export const registerUserService = async (formData) => {
    try {
        console.log(formData);
        const response = await registerUserApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Registration Failed" };
    }
};

export const loginUserService = async (formData) => {
    try {
        const response = await loginUserApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Login Failed" };
    }
};

// --- UPDATED SERVICE FUNCTION FOR SENDING PASSWORD RESET LINK ---
export const sendPasswordResetLinkService = async (formData) => {
    try {
        // formData is expected to contain { email: "user@example.com" }
        const response = await sendPasswordResetLinkApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to send password reset link. Please try again later." };
    }
};

// //====================PForget PAssword
// export  const  requestResetPasswordService = async (formData) => {
//     try {
//         const  response = await resetPasswordApi(formData); // This was incorrect
//         return response.data;
//     }catch (err){
//         throw err.response?.data|| { message: "Request  Password Failed" };
//     }
// }

export  const  resetPasswordService = async (formData,token) => {
    try {
        const response = await resetPasswordApi(formData, token);
        return response.data
    } catch (err) {
        throw err.response?.data || {message: "Reset Password Failed"};
    }
}