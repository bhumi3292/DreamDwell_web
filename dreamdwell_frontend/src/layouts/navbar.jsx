// src/components/Navbar.jsx
import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaShoppingCart, FaCaretDown } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { AuthContext } from "../auth/authProvider";
import { toast } from "react-toastify";
import { getCartService } from "../services/cartService";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const { isAuthenticated, user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }

        const fetchCartCount = async () => {
            try {
                const cartData = await getCartService();
                console.log("Cart data from backend:", cartData);

                if (cartData && Array.isArray(cartData.items)) {
                    setCartCount(cartData.items.length);
                } else if (cartData && cartData.items && typeof cartData.items === 'object') {
                    // This case handles if items might be an object (e.g., {itemId: quantity})
                    setCartCount(Object.keys(cartData.items).length);
                } else {
                    setCartCount(0);
                }
            } catch (error) {
                console.error("Failed to fetch cart items:", error);
                setCartCount(0);
            }
        };

        fetchCartCount();
    }, [isAuthenticated, user]);


    if (loading) return null; // Or show a loading spinner/skeleton if desired

    const handleLogout = () => {
        logout();
        toast.info("You've been logged out successfully!");
        setMenuOpen(false); // Close mobile menu
        setProfileMenuOpen(false); // Close profile dropdown
        navigate("/login");
    };

    const handlePropertyClick = (e) => {
        e.preventDefault(); // Prevent default link behavior
        setMenuOpen(false); // Close mobile menu
        if (user) {
            navigate("/property");
        } else {
            toast.info("Please log in to view all properties");
            navigate("/login");
        }
    };

    const handleCartClick = () => {
        setMenuOpen(false); // Close mobile menu
        navigate("/cart");
    };

    const toggleProfileMenu = () => {
        setProfileMenuOpen(!profileMenuOpen);
    };

    const handleProfileMenuItemClick = (path) => {
        setProfileMenuOpen(false); // Close profile dropdown
        setMenuOpen(false); // Close mobile menu
        navigate(path);
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#002B5B] text-white shadow-md z-50 h-[70px] px-6 md:px-12 flex items-center justify-between">
            {/* Logo & Mobile Toggle */}
            <div className="flex items-center gap-4">
                <Link to="/" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }}>
                    <img src={logo} alt="logo" className="h-10 object-contain" />
                </Link>
                <button
                    className="text-white text-3xl md:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle mobile menu"
                >
                    ☰
                </button>
            </div>

            {/* Navigation Links */}
            <div
                className={`${
                    menuOpen ? "flex" : "hidden"
                } md:flex flex-col md:flex-row gap-4 md:gap-10 absolute md:static top-[70px] left-0 w-full md:w-auto bg-[#002B5B] md:bg-transparent px-6 md:px-0 py-4 md:py-0 text-center`}
            >
                <Link to="/" className="text-lg font-medium hover:text-blue-300" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }}>
                    Home
                </Link>

                {/* Using <a> tag with onClick for conditional navigation based on login */}
                <a
                    href="/property" // Keep href for accessibility/SEO, but handle click with JS
                    onClick={handlePropertyClick}
                    className="text-lg font-medium hover:text-blue-300"
                >
                    Property
                </a>

                {isAuthenticated && user?.role === "Landlord" && (
                    <Link to="/add-property" className="text-lg font-medium hover:text-blue-300" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }}>
                        Add Property
                    </Link>
                )}

                <Link to="/about" className="text-lg font-medium hover:text-blue-300" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }}>
                    About Us
                </Link>
                {/* REMOVED: Blog Link */}
                {/*
                <Link to="/blog" className="text-lg font-medium hover:text-blue-300" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }}>
                    Blog
                </Link>
                */}
                <Link to="/contact" className="text-lg font-medium hover:text-blue-300" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }}>
                    Contact Us
                </Link>
            </div>

            {/* Cart, Profile, Auth Buttons */}
            <div className="hidden md:flex items-center gap-6">
                {/* Cart icon with count */}
                <div
                    className="relative cursor-pointer"
                    onClick={handleCartClick}
                    aria-label="Go to cart"
                >
                    <FaShoppingCart className="text-2xl text-white" />
                    {cartCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                            {cartCount}
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                    <button
                        className="flex items-center gap-1 text-center focus:outline-none"
                        onClick={toggleProfileMenu}
                        aria-label="Profile menu"
                    >
                        <CgProfile className="text-2xl text-white" />
                        {isAuthenticated ? (
                            <span className="text-sm font-medium">{user?.fullName}</span>
                        ) : (
                            <span className="text-sm font-medium">Profile</span>
                        )}
                        <FaCaretDown className={`ml-1 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    {isAuthenticated && profileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-[#002B5B] rounded-md shadow-lg py-1 z-10">
                            <button
                                onClick={() => handleProfileMenuItemClick("/profile")}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                My Profile
                            </button>
                            {/* Corrected path for Bookings */}
                            <button
                                onClick={() => handleProfileMenuItemClick("/booking_details")}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                Bookings
                            </button>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Auth Buttons (conditionally rendered for unauthenticated users) */}
                {!isAuthenticated && (
                    <div className="flex gap-4">
                        <Link
                            to="/signup"
                            className="bg-transparent text-white border border-white px-3 py-1 rounded-full text-base font-medium hover:bg-white hover:text-[#002B5B] transition-colors"
                        >
                            Signup
                        </Link>
                        <Link
                            to="/login"
                            className="bg-transparent text-white border border-white px-3 py-1 rounded-full text-base font-medium hover:bg-white hover:text-[#002B5B] transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}