import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

import Navbar from "../layouts/navbar.jsx";
import logo from "../assets/logo.png";
import hideIcon from "../assets/hide.png";
import showIcon from "../assets/show.png";
import { useRegisterUserTan } from "../hooks/userRegisterUserTan.js";

function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { mutate: registerUser, isPending: isRegistering } = useRegisterUserTan();

    const togglePassword = () => setShowPassword((prev) => !prev);

    // Define validation schema using Yup
    const validationSchema = Yup.object({
        fullName: Yup.string().required("Full Name is required"),
        email: Yup.string().email("Invalid email address").required("Email is required"),
        phoneNumber: Yup.string()
            .matches(/^\d{10}$/, "Phone number must be 10 digits")
            .required("Phone Number is required"),
        stakeholder: Yup.string()
            .oneOf(["Landlord", "Tenant"], "Please select a valid role")
            .required("Stakeholder is required"),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Confirm Password is required"),
    });

    // Initialize Formik
    const formik = useFormik({
        initialValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
            stakeholder: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            // Call your mutation with onSuccess and onError callbacks
            registerUser(
                {
                    fullName: values.fullName,
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    password: values.password,
                    stakeholder: values.stakeholder,
                    confirmPassword: values.confirmPassword,
                },
                {
                    onSuccess: (data) => {
                        toast.success(data?.message || "Registration successful! Redirecting to login...");
                        // Use a timeout for a smoother transition after toast appears
                        setTimeout(() => {
                            navigate("/login");
                        }, 1000); // Redirect after 1 second
                    },
                    onError: (error) => {
                        // Access nested error message from backend if available, otherwise show generic
                        toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
                    },
                }
            );
        },
    });

    return (
        <>
            <Navbar />
            {/* ToastContainer for displaying notifications */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white flex items-center justify-center py-6 sm:py-10">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch w-full h-[calc(100vh-80px)] md:h-[calc(100vh-100px)]"> {/* Adjusted height to account for Navbar and padding */}
                    {/* Left side content */}
                    <div className="bg-gradient-to-br from-[#004080] to-[#00264d] rounded-3xl shadow-lg p-8 md:p-10 flex flex-col justify-center items-center text-center text-white h-full">
                        <img
                            src={logo}
                            alt="DreamDwell Logo"
                            className="w-20 md:w-24 mb-4 md:mb-6 animate-bounce"
                            draggable={false}
                        />
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 leading-snug">
                            Join DreamDwell Today
                        </h2>
                        <p className="text-blue-200 max-w-xs text-sm md:text-base">
                            Create an account and start your journey towards your dream
                            home.
                        </p>
                    </div>

                    {/* Right side form */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 flex flex-col justify-start items-center text-center w-full text-black h-full overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar for subtle scroll if content overflows slightly */}
                        <h1 className="text-2xl font-bold text-[#003366] mb-6 text-center">
                            Create Account
                        </h1>
                        <form
                            onSubmit={formik.handleSubmit}
                            className="space-y-3 w-full max-w-md flex flex-col h-full"
                            noValidate
                        >
                            {/* Full Name */}
                            <div>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.fullName}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00509E]"
                                />
                                {formik.touched.fullName && formik.errors.fullName ? (
                                    <div className="text-red-500 text-xs mt-1 text-left">{formik.errors.fullName}</div>
                                ) : null}
                            </div>

                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.email}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00509E]"
                                />
                                {formik.touched.email && formik.errors.email ? (
                                    <div className="text-red-500 text-xs mt-1 text-left">{formik.errors.email}</div>
                                ) : null}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.phoneNumber}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00509E]"
                                />
                                {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                                    <div className="text-red-500 text-xs mt-1 text-left">{formik.errors.phoneNumber}</div>
                                ) : null}
                            </div>

                            {/* Stakeholder Selection */}
                            <div>
                                <select
                                    name="stakeholder"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.stakeholder}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00509E]"
                                >
                                    <option value="" disabled>
                                        Select Stakeholder
                                    </option>
                                    <option value="Landlord">Landlord</option>
                                    <option value="Tenant">Tenant</option>
                                </select>
                                {formik.touched.stakeholder && formik.errors.stakeholder ? (
                                    <div className="text-red-500 text-xs mt-1 text-left">{formik.errors.stakeholder}</div>
                                ) : null}
                            </div>

                            {/* Password input with toggle */}
                            <div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00509E] pr-14"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePassword}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 focus:outline-none"
                                        aria-label="Toggle password visibility"
                                    >
                                        <img
                                            src={showPassword ? hideIcon : showIcon}
                                            alt="Toggle visibility"
                                            className="w-5 h-5" // Adjusted icon size
                                            draggable={false}
                                        />
                                    </button>
                                </div>
                                {formik.touched.password && formik.errors.password ? (
                                    <div className="text-red-500 text-xs mt-1 text-left">{formik.errors.password}</div>
                                ) : null}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.confirmPassword}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00509E]"
                                />
                                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                                    <div className="text-red-500 text-xs mt-1 text-left">{formik.errors.confirmPassword}</div>
                                ) : null}
                            </div>

                            {/* Terms and conditions */}
                            <label className="flex items-center gap-3 text-gray-600 text-sm select-none py-1">
                                <input
                                    type="checkbox"
                                    required
                                    className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-[#00509E]"
                                />
                                <span>
                                    I agree to the{" "}
                                    <span
                                        onClick={() => navigate("/agreement")}
                                        className="text-blue-600 font-semibold cursor-pointer hover:underline"
                                    >
                                        Terms and Conditions
                                    </span>
                                </span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isRegistering}
                                className={`w-full py-3 rounded-xl text-white font-bold text-lg transition shadow-md ${
                                    isRegistering
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#00509E] to-[#003366] hover:from-[#003366] hover:to-[#001F3F]"
                                }`}
                            >
                                {isRegistering ? "Signing Up..." : "Sign Up"}
                            </button>
                            <div className="text-center mt-3 text-gray-700 text-sm font-medium">
                                Already have an account?{" "}
                                <button
                                    onClick={() => navigate("/login")}
                                    type="button" // Important: set type="button" to prevent form submission
                                    className="text-blue-600 hover:underline font-semibold"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Signup;