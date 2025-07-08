import React from "react";
import { Link } from "react-router-dom"; // Using react-router-dom Link
import Navbar from "../layouts/navbar.jsx"; // Assuming your Navbar component path

// Import icons from lucide-react
import { Mail, Phone, MapPin, Clock, MessageCircle, Headphones, FileText } from "lucide-react";

export default function ContactPage() {
    const contactMethods = [
        {
            icon: Mail,
            title: "Email Us",
            description: "Send us an email and we'll respond within 24 hours",
            contact: "dreamdwell.support@example.com", // Your desired email in the 'To' section
            action: "Send Email",
            type: "email",
        },
        {
            icon: Phone,
            title: "Call Us",
            description: "Speak directly with our support team",
            contact: "+97798XXXXXXXX", // Nepal's country code, replace X's with actual number
            action: "Call Now",
            type: "phone",
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with us in real-time for immediate assistance",
            contact: "Available 24/7",
            action: "Start Chat",
            type: "chat",
        },
    ];

    const supportTopics = [
        {
            icon: FileText,
            title: "General Inquiry",
            description: "Questions about our services or platform",
        },
        {
            icon: Headphones,
            title: "Technical Support",
            description: "Help with website issues or account problems",
        },
        {
            icon: MapPin,
            title: "Property Listing",
            description: "Questions about listing your property",
        },
        {
            icon: MessageCircle,
            title: "Rental Support",
            description: "Help with finding or renting a property",
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

    // Helper for Input styling
    const CustomInput = ({ placeholder, type = "text", ...props }) => (
        <input
            type={type}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366]"
            {...props}
        />
    );

    // Helper for Textarea styling
    const CustomTextarea = ({ placeholder, rows = 3, ...props }) => (
        <textarea
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366]"
            {...props}
        ></textarea>
    );

    const handleContactAction = (type, contactInfo) => {
        if (type === "email") {
            // ⭐ UPDATED: Use the specific Gmail compose URL as in PropertyDetail ⭐
            const encodedEmail = encodeURIComponent(contactInfo);
            window.open(`https://mail.google.com/mail/u/0/#inbox?compose=new&to=${encodedEmail}`, '_blank');
        } else if (type === "phone") {
            // Remove any non-digit characters from the phone number for WhatsApp
            const cleanedNumber = contactInfo.replace(/\D/g, '');
            window.open(`https://web.whatsapp.com/send?phone=${cleanedNumber}`, '_blank');
        } else if (type === "chat") {
            // Placeholder for live chat - you would integrate a chat widget here
            alert("Live chat feature coming soon!");
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Add form submission logic here (e.g., send data to an API)
        alert("Message sent! (This is a placeholder action)");
        // You might clear the form or show a success message
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="py-16 bg-gray-50 mt-[65px]"> {/* Added mt-[65px] to account for fixed Navbar */}
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions? We're here to help. Reach out to our friendly support team.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {contactMethods.map((method, index) => (
                            <CustomCard key={index} className="text-center hover:shadow-lg transition-shadow">
                                <method.icon className="h-12 w-12 text-[#003366] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                                <p className="text-gray-600 mb-4">{method.description}</p>
                                <p className="text-lg font-semibold text-[#003366] mb-4">{method.contact}</p>
                                <button
                                    className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-2 rounded-md transition-colors"
                                    onClick={() => handleContactAction(method.type, method.contact)}
                                >
                                    {method.action}
                                </button>
                            </CustomCard>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <CustomCard>
                            <div className="p-6"> {/* Manually replicate CardHeader/CardTitle */}
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                            </div>
                            <div className="p-6 pt-0"> {/* Manually replicate CardContent */}
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                            <CustomInput id="firstName" placeholder="John" />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <CustomInput id="lastName" placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <CustomInput id="email" type="email" placeholder="john@example.com" />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                                        <CustomInput id="phone" type="tel" placeholder="(555) 123-4567" />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        <select
                                            id="subject"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366]"
                                        >
                                            <option>General Inquiry</option>
                                            <option>Technical Support</option>
                                            <option>Property Listing</option>
                                            <option>Rental Support</option>
                                            <option>Partnership</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <CustomTextarea id="message" placeholder="Tell us how we can help you..." rows={5} />
                                    </div>
                                    <button type="submit" className="w-full bg-[#003366] hover:bg-[#002244] text-white px-6 py-2 rounded-md transition-colors">
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </CustomCard>

                        {/* Support Topics & Office Info */}
                        <div className="space-y-8">
                            {/* Support Topics */}
                            <CustomCard>
                                <div className="p-6"> {/* Manually replicate CardHeader/CardTitle */}
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">How can we help?</h2>
                                </div>
                                <div className="p-6 pt-0"> {/* Manually replicate CardContent */}
                                    <div className="space-y-4">
                                        {supportTopics.map((topic, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                                            >
                                                <topic.icon className="h-6 w-6 text-[#003366] mt-1" />
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                                                    <p className="text-sm text-gray-600">{topic.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CustomCard>

                            {/* Office Information */}
                            <CustomCard>
                                <div className="p-6"> {/* Manually replicate CardHeader/CardTitle */}
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Office Information</h2>
                                </div>
                                <div className="p-6 pt-0 space-y-4"> {/* Manually replicate CardContent */}
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="h-5 w-5 text-[#003366] mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Address</h4>
                                            <p className="text-gray-600">
                                                Dillibazar, Kathmandu
                                                <br />
                                                Bagmati Province, Nepal
                                                <br />
                                                Post Box: 44600
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Clock className="h-5 w-5 text-[#003366] mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Business Hours</h4>
                                            <p className="text-gray-600">
                                                Sunday - Friday: 9:00 AM - 6:00 PM (NST)
                                                <br />
                                                Saturday: Closed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Headphones className="h-5 w-5 text-[#003366] mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Support Hours</h4>
                                            <p className="text-gray-600">
                                                24/7 Live Chat Support
                                                <br />
                                                Phone: Sunday - Friday, 9:00 AM - 6:00 PM (NST)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CustomCard>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-600 text-lg">Quick answers to common questions</p>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {[
                            {
                                question: "How do I list my property on DreamDwell?",
                                answer:
                                    "Simply click 'List Your Property' in the header, fill out the property details form, upload photos, and submit for review. Our team will verify and publish your listing within 24 hours.",
                            },
                            {
                                question: "Is there a fee to use DreamDwell?",
                                answer:
                                    "Browse and searching properties is completely free for renters. Property owners pay a small commission only when they successfully rent their property through our platform.",
                            },
                            {
                                question: "How are properties verified?",
                                answer:
                                    "We verify all property listings through document checks, photo verification, and landlord background checks to ensure authenticity and quality.",
                            },
                            {
                                question: "Can I schedule property viewings through the platform?",
                                answer:
                                    "Yes! You can request viewings directly through property listings, and landlords will respond with available times. We also offer virtual tours for many properties.",
                            },
                        ].map((faq, index) => (
                            <CustomCard key={index}>
                                <div className="p-6"> {/* Manually replicate CardContent */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                    <p className="text-gray-600">{faq.answer}</p>
                                </div>
                            </CustomCard>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}