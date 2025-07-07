import React from "react";
import { Link } from "react-router-dom"; // Use Link from react-router-dom
import Navbar from "../layouts/navbar.jsx"; // Assuming your Navbar is here
import Footer from "../layouts/footer.jsx"; // Assuming your Footer is here

// Import icons from lucide-react
import { Users, Target, Award, Shield, Heart, Globe, TrendingUp, CheckCircle } from "lucide-react";

import bhumiSinghImage from "../assets/a.png"; // Changed to a.png for Bhumi Singh
import aboutMissionImage from "../assets/c.png"; // Changed to c.png for Mission Section


export default function AboutUs() {
    const stats = [
        { label: "Properties Listed", value: "50,000+", icon: TrendingUp },
        { label: "Happy Customers", value: "25,000+", icon: Users },
        { label: "Cities Covered", value: "100+", icon: Globe },
        { label: "Years of Experience", value: "8+", icon: Award },
    ];

    const team = [
        {
            name: "Bhumi Singh Subedi",
            role: "Developer",
            image: bhumiSinghImage,
            bio: "Former real estate executive with years of experience in property management.",
        },
    ];

    const values = [
        {
            icon: Shield,
            title: "Trust & Security",
            description: "We verify every property and landlord to ensure safe, secure transactions.",
        },
        {
            icon: Heart,
            title: "Customer First",
            description: "Your satisfaction is our priority. We're here to help every step of the way.",
        },
        {
            icon: CheckCircle,
            title: "Quality Assurance",
            description: "Only the best properties make it to our platform through rigorous screening.",
        },
        {
            icon: Globe,
            title: "Accessibility",
            description: "Making quality housing accessible to everyone, everywhere.",
        },
    ];

    // Helper component for Card structure
    const CustomCard = ({ children, className = "" }) => (
        <div className={`bg-white rounded-lg shadow-md ${className}`}>
            <div className="p-6">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar /> {/* Use your existing Navbar component */}

            {/* Hero Section */}
            <section className="py-16 bg-gray-50 mt-[65px]"> {/* Added mt-[65px] to account for fixed Navbar */}
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About DreamDwell</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        We're on a mission to make finding and renting the perfect home as simple and stress-free as possible. Since
                        2016, we've been connecting renters with their dream properties.
                    </p>
                    <Link to="/property"> {/* Changed to /property as per your Home.jsx */}
                        <button className="bg-[#003366] hover:bg-[#002244] text-white px-8 py-3 text-lg rounded-md transition-colors">
                            Explore Properties
                        </button>
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <CustomCard key={index} className="text-center">
                                <stat.icon className="h-12 w-12 text-[#003366] mx-auto mb-4" />
                                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </CustomCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-gray-700 text-lg mb-6">
                                At DreamDwell, we believe everyone deserves a place they can call home. We're transforming the rental
                                experience by leveraging technology to create transparency, build trust, and eliminate the traditional
                                pain points of property rental.
                            </p>
                            <p className="text-gray-700 text-lg mb-6">
                                Our platform connects verified property owners with quality tenants, ensuring a smooth, secure, and
                                satisfying experience for both parties.
                            </p>
                            <div className="flex items-center space-x-4">
                                <Target className="h-8 w-8 text-[#003366]" />
                                <span className="text-lg font-semibold text-gray-900">Making rental dreams come true</span>
                            </div>
                        </div>
                        <div className="relative h-96 rounded-lg overflow-hidden">
                            {/* ⭐ Using the imported c.png here ⭐ */}
                            <img src={aboutMissionImage} alt="Our mission" className="object-cover w-full h-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section (re-using the structure from Home.jsx) */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                        <p className="text-gray-600 text-lg">The principles that guide everything we do</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <CustomCard key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                                <value.icon className="h-12 w-12 text-[#003366] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </CustomCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                        <p className="text-gray-600 text-lg">The passionate people behind DreamDwell</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <CustomCard key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                                    {/* ⭐ Using member.image which now holds the imported a.png ⭐ */}
                                    <img src={member.image} alt={member.name} className="object-cover w-full h-full" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                                {/* Custom Badge styling */}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800 mb-3">
                  {member.role}
                </span>
                                <p className="text-gray-600">{member.bio}</p>
                            </CustomCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#003366] text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of satisfied customers who found their perfect rental through DreamDwell
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/property">
                            <button className="bg-white text-[#003366] hover:bg-gray-100 px-8 py-3 text-lg rounded-md transition-colors">
                                Browse Properties
                            </button>
                        </Link>
                        <Link to="/add-property">
                            <button
                                className="border border-white text-white hover:bg-white hover:text-[#003366] px-8 py-3 text-lg rounded-md transition-colors"
                            >
                                List Your Property
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}