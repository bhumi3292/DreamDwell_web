import React, { useContext } from 'react';
// Assuming useLoginUser is in useAuthHooks.js or a separate login hook
import { useLoginUser } from '../../hooks/useLoginUser.js'; // Adjust path if needed
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/logo.png'; // Adjust path if necessary
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider.jsx';


export default function LoginForm() {
    const { mutate, isLoading } = useLoginUser();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

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
                onSuccess: (data) => {
                    if (data?.user && data?.token) {
                        login(data.user, data.token);
                        toast.success("Login successful!");
                        setTimeout(() => {
                            navigate("/");
                        }, 300);
                    } else {
                        console.error("LoginForm: Login successful, but response missing user object or token:", data);
                        toast.error("Login failed due to incomplete data from server. Please try again.");
                    }
                },
                onError: (error) => {
                    console.error("LoginForm: Login failed:", error);
                    const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
                    toast.error(errorMessage);
                },
            });
        },
    });

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 items-center justify-center px-6 gap-8">
            <div className="bg-[#002B5B] text-white p-10 rounded-2xl w-full max-w-md h-[520px] flex flex-col items-center justify-center text-left">
                <img src={logo} alt="DreamDwell Logo" className="w-28 animate-bounce mb-4" />
                <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
                <p className="text-lg">Access your DreamDwell account</p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md h-[520px] flex flex-col justify-center border border-gray-100 text-left">
                <h2 className="text-3xl font-bold text-[#002B5B] mb-2">Login to DreamDwell</h2>
                <p className="text-gray-500 mb-6">Enter your credentials below</p>

                <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="email" className="block font-medium mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block font-medium mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                        />
                        {formik.touched.password && formik.errors.password && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="stakeholder" className="block font-medium mb-1">Stakeholder</label>
                        <select
                            id="stakeholder"
                            name="stakeholder"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.stakeholder}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
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
                        className="bg-[#002B5B] text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    {/* This is the link to the Forgot Password page */}
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