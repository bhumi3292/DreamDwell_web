import React, { useEffect, useState, useContext } from "react";
import Navbar from "../layouts/navbar.jsx";
import Footer from "../layouts/footer.jsx";
import Newsletter from "./Newsletter.jsx";
import bkg from "../assets/2Q.png";
import { Link, useNavigate } from "react-router-dom";
import { fetchPropertiesService } from "../services/addPropertyService.jsx";
import PropertyCard from "../properties/PropertyCard.jsx";
import { AuthContext } from "../auth/AuthProvider";
import { toast } from "react-toastify";

export default function Home() {
    const [properties, setProperties] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const data = await fetchPropertiesService();
                setProperties(data.slice(0, 3)); // Take first 3 for featured
            } catch (error) {
                toast.error("Failed to load properties");
                console.error("Error loading properties:", error);
            }
        };
        loadProperties();
    }, []);

    const handleSeeAll = () => {
        if (user) {
            navigate("/property");
        } else {
            toast.info("Please log in to view all properties");
            navigate("/login");
        }
    };

    return (
        <div className="w-full overflow-x-hidden flex flex-col min-h-screen">
            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            <section
                className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-[65px] bg-fixed bg-cover bg-center"
                style={{ backgroundImage: `url(${bkg})` }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-20">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
                        Find Your Perfect{" "}
                        {/* ⭐ MODIFIED: Added text-glow-subtle animation ⭐ */}
                        <span className="block text-[#002B5B] animate-text-glow-subtle">
                            Dream Dwelling
                        </span>
                    </h1>
                    {/* ⭐ MODIFIED: Ensure delay classes use the full animation name ⭐ */}
                    <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up-delay-200">
                        Discover unique places to stay around the world. From cozy cabins to luxury villas, your next adventure awaits.
                    </p>
                    <Link
                        to={user ? "/property" : "/login"}
                        onClick={() => !user && toast.info("Please log in to view all properties")}
                        className="inline-block bg-[#002B5B] hover:bg-[#5599cc] text-white text-xl md:text-2xl font-bold px-10 py-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up-delay-400"
                    >
                        Explore Properties
                    </Link>

                    {/* ⭐ MODIFIED: Ensure delay classes use the full animation name ⭐ */}
                    <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto animate-fade-in-up-delay-600">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">1M+</div>
                            <div className="text-white/80 text-sm">Properties</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">195</div>
                            <div className="text-white/80 text-sm">Countries</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">5M+</div>
                            <div className="text-white/80 text-sm">Happy Guests</div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce-slow">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
                    </div>
                </div>
            </section>

            <div className="px-4 md:px-20 mt-12 mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Featured Properties</h2>
                    <button
                        onClick={handleSeeAll}
                        className="text-[#002B5B] hover:text-[#5599cc] font-semibold text-lg flex items-center group"
                    >
                        See All
                        <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.length > 0 ? (
                        properties.map((property) =>
                            property ? (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    currentUserId={user?._id}
                                />
                            ) : (
                                <div key={Math.random()} className="text-red-500">Invalid Property</div>
                            )
                        )
                    ) : (
                        <div className="text-gray-500 col-span-full text-center py-10">
                            No featured properties available at the moment.
                        </div>
                    )}
                </div>
            </div>

            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-4">How It Works</h2>
                    <p className="text-lg text-gray-600 mb-12">Simple steps to find your dream rental</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-md hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 rounded-full bg-blue-50 grid place-items-center relative">
                                    <svg className="w-12 h-12 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-[#002B5B] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">01</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Search & Browse</h3>
                            <p className="text-gray-600 text-center">Browse through thousands of verified properties using our advanced filters</p>
                        </div>

                        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-md hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 rounded-full bg-blue-50 grid place-items-center relative">
                                    <svg className="w-12 h-12 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h-5m-5 0h10v-2a2 2 0 00-2-2h-6a2 2 0 00-2 2v2zM9 13V9a2 2 0 012-2h2a2 2 0 012 2v4m-4 0a2 2 0 100-4 2 2 0 000 4zm0 0H9"></path></svg>
                                </div>
                                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-[#002B5B] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">02</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Book & Connect</h3>
                            <p className="text-gray-600 text-center">Add properties to cart, book viewings, and connect with property owners</p>
                        </div>

                        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-md hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 rounded-full bg-blue-50 grid place-items-center relative">
                                    <svg className="w-12 h-12 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2V9a2 2 0 012-2h5zM12 17l.01 0"></path></svg>
                                </div>
                                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-[#002B5B] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">03</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Move In</h3>
                            <p className="text-gray-600 text-center">Complete secure booking and move into your perfect space hassle-free</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-100">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Our Values</h2>
                    <p className="text-lg text-gray-600 mb-12">The principles that guide everything we do</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                            <div className="w-20 h-20 rounded-full bg-blue-50 grid place-items-center mb-4">
                                <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.304A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.752M4 12V20a2 2 0 002 2h12a2 2 0 002-2v-8m-12 4h.01M9 16h.01"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Trust & Security</h3>
                            <p className="text-gray-600 text-center text-sm">We verify every property and landlord to ensure safe, secure transactions.</p>
                        </div>

                        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                            <div className="w-20 h-20 rounded-full bg-blue-50 grid place-items-center mb-4">
                                <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Customer First</h3>
                            <p className="text-gray-600 text-center text-sm">Your satisfaction is our priority. We're here to help every step of the way.</p>
                        </div>

                        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                            <div className="w-20 h-20 rounded-full bg-blue-50 grid place-items-center mb-4">
                                <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 17h.01"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quality Assurance</h3>
                            <p className="text-gray-600 text-center text-sm">Only the best properties make it to our platform through rigorous screening.</p>
                        </div>

                        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                            <div className="w-20 h-20 rounded-full bg-blue-50 grid place-items-center mb-4">
                                <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Accessibility</h3>
                            <p className="text-gray-600 text-center text-sm">Making quality housing accessible to everyone, everywhere.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Newsletter />
        </div>
    );
}