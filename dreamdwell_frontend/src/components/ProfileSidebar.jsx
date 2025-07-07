// src/components/ProfileSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle, FaStar, FaCamera, FaEnvelope } from "react-icons/fa";
import { useUserProfile } from "../hooks/useUserProfile";

export default function ProfileSidebar() {
    const location = useLocation();
    const { data: user, isLoading, error } = useUserProfile();

    const isActive = (path) => location.pathname === path;

    if (isLoading) return <div className="p-4">Loading profile...</div>;
    if (error) return <div className="p-4 text-red-500">Error loading profile</div>;

    return (
        <aside className="w-[300px] bg-white shadow-lg p-6 min-h-screen">
            <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4">
/                   <img
                        src={user?.profileImage || "/placeholder-avatar.png"}
                        alt="Profile"
                        className="object-cover w-full h-full"
                    />
                    <button className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full">
                        <FaCamera size={12} />
                    </button>
                </div>

                <h2 className="text-lg font-semibold">{user?.fullName}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>

                {user?.isVerified && (
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                        <FaCheckCircle className="mr-1" /> Verified
                    </div>
                )}
                <div className="text-yellow-500 mt-1 text-sm">
                    <FaStar className="inline mr-1" />
                    {user?.rating || 4.8} ({user?.reviewCount || 12} reviews)
                </div>

                <div className="mt-6 w-full text-left text-sm text-gray-700">
                    <p>
                        <strong>Member since:</strong>{" "}
                        {new Date(user?.createdAt).toLocaleDateString() || "N/A"}
                    </p>
                    <p>
                        <strong>Saved properties:</strong> {user?.savedProperties?.length || 0}
                    </p>
                    <p>
                        <strong>Applications:</strong> {user?.applicationsCount || 0}
                    </p>
                </div>

                <div className="mt-6 w-full">
                    <nav className="space-y-2">
                        <Link
                            to="/profile"
                            className={`block px-4 py-2 rounded ${
                                isActive("/profile")
                                    ? "bg-blue-100 text-blue-700 font-medium"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            Overview
                        </Link>
                        <Link
                            to="/profile/personal"
                            className={`block px-4 py-2 rounded ${
                                isActive("/profile/personal")
                                    ? "bg-blue-100 text-blue-700 font-medium"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            Personal Info
                        </Link>
                        <Link
                            to="/profile/saved"
                            className={`block px-4 py-2 rounded ${
                                isActive("/profile/saved")
                                    ? "bg-blue-100 text-blue-700 font-medium"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            Saved Properties
                        </Link>
                        <Link
                            to="/profile/messages"
                            className={`block px-4 py-2 rounded flex items-center gap-2 ${
                                isActive("/profile/messages")
                                    ? "bg-blue-100 text-blue-700 font-medium"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <FaEnvelope /> Messages
                        </Link>
                    </nav>
                </div>
            </div>
        </aside>
    );
}
