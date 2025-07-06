// src/components/LoginForm.jsx (or wherever your LoginForm is located)

import React, { useContext } from 'react'; // <--- ADD useContext
import { useLoginUser } from '../hooks/useLoginUser.js';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify'; // <--- ADD toast if you want to use it
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/authProvider'; // <--- IMPORTANT: Ensure this path is correct!


export default function LoginForm() {
    const { mutate, isLoading } = useLoginUser();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // <--- GET THE LOGIN FUNCTION FROM AUTHCONTEXT

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().min(8, "Minimum 8 characters").required("Password is required"),
        stakeholder: Yup.string().oneOf(["Landlord", "Tenant"], "Select a valid role").required("Stakeholder is required"),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            stakeholder: '',
        },
        validationSchema,
        onSubmit: (values) => {
            mutate(values, {
                // The 'data' argument here will contain the successful response from your backend.
                // Assuming your backend returns { user: { fullName: "...", role: "...", ... }, token: "..." }
                onSuccess: (data) => { // <--- RECEIVE THE DATA HERE
                    console.log("LoginForm: Login successful. Calling AuthContext login with user:", data.user); // <--- DEBUG LOG
                    login(data.user, data.token); // <--- PASS THE USER AND TOKEN TO AUTHCONTEXT'S LOGIN
                    toast.success("Login successful!"); // <--- Optional: show success toast
                    setTimeout(() => {
                        navigate("/");
                    }, 300);
                },
                onError: (error) => {
                    console.error("Login failed:", error);
                    // Use optional chaining for error.response.data.message for more specific errors
                    const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
                    toast.error(errorMessage); // Show error to user
                },
            });
        },
    });

    // ... (rest of your LoginForm component JSX remains the same)
    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-50 items-center justify-center px-5 gap-8">
            {/* Left Side */}
            <div className="bg-[#002B5B] text-white p-8 rounded-xl w-[410px] max-w-md h-[520px] flex flex-col items-center justify-center text-center">
                <img src={logo} alt="DreamDwell Logo" className="w-28 animate-bounce mb-4" />
                <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
                <p className="text-lg">Access your DreamDwell account</p>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md h-[520px] flex flex-col justify-center border border-gray-100">
                <h2 className="text-2xl font-bold text-[#002B5B] mb-1">Login to DreamDwell</h2>
                <p className="text-gray-500 mb-6">Enter your credentials below</p>

                <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="email" className="block font-medium text-left">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            className="w-full p-3 border border-gray-300 rounded bg-gray-100"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block font-medium text-left">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            className="w-full p-3 border border-gray-300 rounded bg-gray-100"
                        />
                        {formik.touched.password && formik.errors.password && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="stakeholder" className="block font-medium text-left">Stakeholder</label>
                        <select
                            id="stakeholder"
                            name="stakeholder"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.stakeholder}
                            className="w-full p-3 border border-gray-300 rounded bg-gray-100"
                        >
                            <option value="" disabled>Select Stakeholder</option>
                            <option value="Landlord">Landlord</option>
                            <option value="Tenant">Tenant</option>
                        </select>
                        {formik.touched.stakeholder && formik.errors.stakeholder && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.stakeholder}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#002B5B] text-white py-3 rounded font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    <a href="/forgot-password" className="text-blue-600 font-medium text-sm hover:underline text-center mt-2">
                        Forgot Password?
                    </a>

                    <p className="text-sm text-gray-600 text-center mt-4">
                        Don't have an account?
                        <a href="/signup" className="text-blue-600 font-semibold ml-1 hover:underline">Sign up</a>
                    </p>
                </form>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}