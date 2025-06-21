import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider.jsx";

import HomePage from "../pages/home.jsx";
import RegisterPage from "../pages/signup.jsx";
import LoginPage from "../pages/login.jsx";
import ForgetPasswordPage from "../pages/RequestPassword.jsx"
import ResetPasswordWithTokenPage from "../pages/ResetPassword.jsx";
import AgreementPage from "../pages/agreement.jsx";
import PropertyPage from "../pages/property.jsx";
import AddPropertyPage from "../pages/add_property.jsx";
// import LocationSearchMap from "./LocationSearchMap"; // Uncomment if needed as route

const DashboardPage = () => <div>Welcome to the Dashboard! This is a protected page.</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return <p>Loading application...</p>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />

            <Route path="/forgot-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordWithTokenPage />} />


            <Route path="/agreement" element={<AgreementPage />} />
            <Route path="/property" element={<PropertyPage />} />

            {/* Protect add-property page */}
            <Route path="/add-property" element={
                <PrivateRoute>
                    <AddPropertyPage />
                </PrivateRoute>
            } />

            <Route path="/dashboard" element={
                <PrivateRoute>
                    <DashboardPage />
                </PrivateRoute>
            } />

            {/* Optional: Location Search route */}
            {/* <Route path="/location-search" element={<LocationSearchMap />} /> */}

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
