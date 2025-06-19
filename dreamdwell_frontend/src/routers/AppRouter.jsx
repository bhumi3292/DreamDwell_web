import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider.jsx";

// Pages - Adjust paths as per your project structure
import HomePage from "../pages/home.jsx";
import RegisterPage from "../pages/signup.jsx";
import LoginPage from "../pages/login.jsx";
import ForgetPasswordPage from "../pages/ForgetPassword.jsx";
import ResetPasswordWithTokenPage from "../pages/ResetPasswordWithToken.jsx";
import AgreementPage from "../pages/agreement.jsx";
import PropertyPage from "../pages/property.jsx";
import AddPropertyPage from "../pages/add_property.jsx";



// Placeholder for protected content (replace with your actual components)
const DashboardPage = () => <div>Welcome to the Dashboard! This is a protected page.</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;

// PrivateRoute component for protected routes
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return <p>Loading application...</p>; // Or a spinner/loading component
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />

            {/* Public routes for password reset flow */}
            <Route path="/forgot-password" element={<ForgetPasswordPage />} /> {/* <<<-- Crucial: Path */}
            <Route path="/reset-password/:token" element={<ResetPasswordWithTokenPage />} />

            {/* Other public routes */}
            <Route path="/agreement" element={<AgreementPage />} />
            <Route path="/property" element={<PropertyPage />} />
            <Route path="/add-property" element={<AddPropertyPage />} />

            {/* Example Protected Route */}
            <Route path="/dashboard" element={
                <PrivateRoute>
                    <DashboardPage />
                </PrivateRoute>
            } />

            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}