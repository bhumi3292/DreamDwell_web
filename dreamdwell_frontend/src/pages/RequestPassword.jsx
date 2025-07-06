import React from "react";
import Navbar from "../layouts/Navbar";
import logo from "../assets/logo.png";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSendPasswordResetLink } from '../hooks/useAuthHooks';

function ForgetPassword() {
    const { mutate: sendLinkMutation, isLoading: isSendingLink } = useSendPasswordResetLink();

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Email is required"),
        }),
        onSubmit: (values) => {
            console.log("Requesting password reset link for email:", values.email);
            sendLinkMutation(values, {
                onSuccess: (data) => {
                    toast.success(data.message || "Password reset link sent to your email!");
                    formik.resetForm();
                },
                onError: (error) => {
                    console.error("Failed to send password reset link:", error);
                    const errorMessage = error.response?.data?.message || "Failed to send password reset link. Please try again.";
                    toast.error(errorMessage);
                },
            });
        },
    });

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
                    {/* Left Branding Section */}
                    <div className="w-full lg:w-2/5 bg-[#002B5B] text-white p-8 sm:p-10 flex flex-col items-center justify-center text-center rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
                        <img src={logo} alt="DreamDwell Logo" className="w-24 h-24 mb-4 animate-bounce" />
                        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2">Password Reset</h2>
                        <p className="text-gray-200 text-base sm:text-lg max-w-xs">
                            Enter your email, and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Right Form Section */}
                    <div className="w-full lg:w-3/5 p-8 sm:p-10 flex flex-col justify-center">
                        <h1 className="text-3xl font-bold text-[#002B5B] mb-6 text-center">Request Password Reset</h1>
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.email}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition duration-150"
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <p className="mt-2 text-sm text-red-600 text-left">{formik.errors.email}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSendingLink || !formik.isValid || !formik.dirty}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-[#002B5B] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSendingLink ? "Sending Link..." : "Send Reset Link"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                Remember your password? Go back to Login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default ForgetPassword;
