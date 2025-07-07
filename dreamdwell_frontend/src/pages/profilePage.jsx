// src/pages/ProfilePage.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { toast } from "react-toastify";
import {
    User, Camera, Edit, Heart, Calendar, MessageCircle, Settings, Clock, Home as HomeIcon, CreditCard, BellDot, Trash2
} from "lucide-react";

import Header from "../layouts/navbar";
import Footer from "../layouts/footer"; // Assuming you still want the footer

import { useUploadProfilePicture } from "../hooks/useAuthHooks";
import { getCartService, removeFromCartService } from '../services/cartService.js';
import { API_URL } from '../api/api.js';

import UpdatePersonalInfoForm from '../components/profile/UpdatePersonalInfoForm'; // Adjust path if needed
import ChangePasswordForm from '../components/profile/ChangePasswordForm'; // Adjust path if needed

export default function ProfilePage() {
    const { user, loading, setUser } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState("overview");
    const [userData, setUserData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        profileImage: "/placeholder-profile.png",
        joinDate: "N/A",
        role: "User",
    });

    const [savedProperties, setSavedProperties] = useState([]);
    const [loadingSavedProperties, setLoadingSavedProperties] = useState(false);
    const [errorSavedProperties, setErrorSavedProperties] = useState(null);

    const fileInputRef = useRef(null);
    const { mutate: uploadPicture, isLoading: isUploading } = useUploadProfilePicture();

    useEffect(() => {
        if (user) {
            setUserData(prevData => ({
                ...prevData,
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                profileImage: user.profilePicture
                    ? `${API_URL}${user.profilePicture}`
                    : "/placeholder-profile.png",
                joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
                role: user.role || "User",
            }));
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === "saved" && user) {
            fetchSavedProperties();
        }
    }, [activeTab, user]);

    const fetchSavedProperties = async () => {
        setLoadingSavedProperties(true);
        setErrorSavedProperties(null);
        try {
            const res = await getCartService();
            const validItems = res.data?.items?.filter(item => item && item.property) || [];
            setSavedProperties(validItems);
        } catch (err) {
            setErrorSavedProperties("Failed to load saved properties.");
            toast.error("Error fetching saved properties.");
            console.error(err);
        } finally {
            setLoadingSavedProperties(false);
        }
    };

    const handleImageClick = () => {
        if (!user) {
            toast.info("Please log in to update your profile picture.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Only image files are allowed.");
            event.target.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size cannot exceed 5MB.");
            event.target.value = '';
            return;
        }

        uploadPicture(file, {
            onSuccess: (response) => {
                if (response.success && response.user) {
                    setUser(response.user);
                    toast.success(response.message);
                } else {
                    toast.error(response.message || "Profile picture upload successful, but user data not updated.");
                }
            },
            onError: (err) => {
                console.error("Error uploading profile picture:", err);
                toast.error(err.response?.data?.message || err.message || "An error occurred during upload.");
            },
            onSettled: () => {
                event.target.value = '';
            }
        });
    };

    const handleRemoveSavedProperty = async (propertyId) => {
        try {
            await removeFromCartService(propertyId);
            setSavedProperties(prev => prev.filter(item => item.property._id !== propertyId));
            toast.success("Property removed from saved list!");
        } catch (err) {
            toast.error("Failed to remove property from saved list.");
            console.error(err);
        }
    };

    const getSidebarButtonClasses = (tabName) => {
        const baseClasses = "w-full flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200";
        if (activeTab === tabName) {
            return `${baseClasses} bg-[#003366] text-white shadow-md`;
        }
        return `${baseClasses} text-gray-700 hover:bg-blue-100 hover:text-[#003366] hover:shadow-sm`;
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">Loading profile...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
                <p className="text-xl text-gray-700 mb-4">Please log in to view your profile.</p>
                <Link to="/login" className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#002244] transition-colors shadow-md">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />

            <div className="container mx-auto px-4 py-8 flex-grow mt-[70px] md:mt-[90px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-24">
                        {/* Profile Image & Details Section */}
                        <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200 mb-6">
                            <div className="relative group">
                                <img
                                    src={userData.profileImage}
                                    alt={`${userData.fullName}'s Profile`}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-[#003366] shadow-md transition-all duration-300 group-hover:scale-105"
                                />
                                <label
                                    htmlFor="profileUpload"
                                    className="absolute bottom-1 right-1 bg-[#003366] p-2 rounded-full cursor-pointer text-white flex items-center justify-center
                                               opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110"
                                    title="Change profile picture"
                                    onClick={handleImageClick}
                                >
                                    <Camera className="h-5 w-5" />
                                    <input
                                        type="file"
                                        id="profileUpload"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        disabled={isUploading}
                                    />
                                </label>
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                        <span className="animate-spin h-6 w-6 border-4 border-t-transparent border-white rounded-full"></span>
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mt-4 capitalize">
                                {userData.fullName}
                            </h2>
                            <p className="text-base text-gray-600 font-medium">{userData.email}</p>

                            <div className="mt-3 text-sm text-gray-700 space-y-1">
                                <p className="flex items-center justify-center gap-2">
                                    <HomeIcon className="h-4 w-4 text-gray-500" />
                                    <strong>Role:</strong> <span className="capitalize">{userData.role}</span>
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-gray-500" />
                                    <strong>Phone:</strong> {userData.phoneNumber || 'N/A'}
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <strong>Member since:</strong> {userData.joinDate}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats Section */}
                        <div className="space-y-4 mb-6 pt-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Saved properties</span>
                                <span className="text-sm font-medium text-gray-800">{savedProperties.length}</span>
                            </div>
                        </div>

                        {/* Navigation Section */}
                        <nav className="space-y-2">
                            <button
                                type="button"
                                className={getSidebarButtonClasses("overview")}
                                onClick={() => setActiveTab("overview")}
                                aria-current={activeTab === "overview" ? "page" : undefined}
                            >
                                <User className="h-5 w-5 mr-3" />
                                Overview
                            </button>
                            <button
                                type="button"
                                className={getSidebarButtonClasses("personal")}
                                onClick={() => setActiveTab("personal")}
                                aria-current={activeTab === "personal" ? "page" : undefined}
                            >
                                <Edit className="h-5 w-5 mr-3" />
                                Personal Info
                            </button>
                            <button
                                type="button"
                                className={getSidebarButtonClasses("saved")}
                                onClick={() => setActiveTab("saved")}
                                aria-current={activeTab === "saved" ? "page" : undefined}
                            >
                                <Heart className="h-5 w-5 mr-3" />
                                Saved Properties
                            </button>
                            {/* REMOVED: Rental History button */}
                            <button
                                type="button"
                                className={getSidebarButtonClasses("messages")}
                                onClick={() => setActiveTab("messages")}
                                aria-current={activeTab === "messages" ? "page" : undefined}
                            >
                                <MessageCircle className="h-5 w-5 mr-3" />
                                Messages
                            </button>
                            {/* REMOVED: Payments button */}
                            <button
                                type="button"
                                className={getSidebarButtonClasses("notifications")}
                                onClick={() => setActiveTab("notifications")}
                                aria-current={activeTab === "notifications" ? "page" : undefined}
                            >
                                <BellDot className="h-5 w-5 mr-3" />
                                Notifications
                            </button>
                            <button
                                type="button"
                                className={getSidebarButtonClasses("settings")}
                                onClick={() => setActiveTab("settings")}
                                aria-current={activeTab === "settings" ? "page" : undefined}
                            >
                                <Settings className="h-5 w-5 mr-3" />
                                Settings
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3 bg-white rounded-xl shadow-lg p-8">
                        {activeTab === "overview" && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <HomeIcon className="h-16 w-16 text-[#003366] mb-4" />
                                <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
                                    Welcome, <span className="text-[#003366]">{userData.fullName}!</span>
                                </h1>
                                <p className="text-lg text-gray-600 max-w-2xl">
                                    This is your personal dashboard. Use the sidebar on the left to navigate through your profile sections.
                                    Manage your personal information, saved properties, applications, and more.
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setActiveTab("personal")}
                                        className="bg-[#003366] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#002244] transition-colors font-semibold"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("saved")}
                                        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-300 transition-colors font-semibold"
                                    >
                                        View Saved
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ⭐ PERSONAL INFORMATION SECTION - NOW USING SEPARATE COMPONENTS ⭐ */}
                        {activeTab === "personal" && (
                            <div className="space-y-8">
                                <UpdatePersonalInfoForm />
                                <ChangePasswordForm />
                            </div>
                        )}

                        {/* Saved Properties Tab Content */}
                        {activeTab === "saved" && (
                            <>
                                <h1 className="text-3xl font-bold text-gray-800 mb-6">Saved Properties ({savedProperties.length})</h1>
                                {loadingSavedProperties && <div className="text-gray-500">Loading saved properties...</div>}
                                {errorSavedProperties && <div className="text-red-500">{errorSavedProperties}</div>}

                                {!loadingSavedProperties && !errorSavedProperties && savedProperties.length === 0 && (
                                    <div className="text-gray-600 text-center py-10">
                                        You haven't saved any properties yet.
                                    </div>
                                )}

                                {!loadingSavedProperties && !errorSavedProperties && savedProperties.length > 0 && (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {savedProperties.map((item) => (
                                            <div
                                                key={item.property._id}
                                                className="relative bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                                            >
                                                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md mb-3 overflow-hidden">
                                                    {item.property.images && item.property.images.length > 0 ? (
                                                        <img
                                                            src={`${API_URL}/${item.property.images[0]}`}
                                                            alt={item.property.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-2">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                <h2 className="text-xl font-semibold text-gray-900">{item.property.title}</h2>
                                                <p className="text-sm text-gray-500 flex items-center mt-1"><HomeIcon className="h-4 w-4 mr-1" />📍 {item.property.location}</p>
                                                <p className="text-xl text-[#003366] font-bold mt-2">Rs. {item.property.price}</p>
                                                <div className="flex justify-between items-center mt-4">
                                                    <Link
                                                        to={`/property/${item.property._id}`}
                                                        className="bg-[#003366] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#002244] transition-colors shadow-sm"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveSavedProperty(item.property._id);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 transition-colors text-xl"
                                                        title="Remove from saved"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* REMOVED: The content for rental-history and payments placeholders */}
                        {/* activeTab === "rental-history" is now implicitly handled by the lack of a button */}
                        {/* activeTab === "payments" is now implicitly handled by the lack of a button */}

                        {activeTab === "applications" && (
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Applications (Placeholder)</h2>
                        )}
                        {activeTab === "messages" && (
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Messages (Placeholder)</h2>
                        )}
                        {activeTab === "notifications" && (
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications (Placeholder)</h2>
                        )}
                        {activeTab === "settings" && (
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Account Settings (Placeholder)</h2>
                        )}

                    </main>
                </div>
            </div>
            {/* If you want the footer, keep this line */}
            <Footer />
        </div>
    );
}