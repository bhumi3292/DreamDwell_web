import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getOnePropertyApi } from '../api/propertyApi';
import { addToCartApi, removeFromCartApi, getCartApi } from '../api/cartApi';
import { FaHeart } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { AuthContext } from '../auth/AuthProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CryptoJS from 'crypto-js';
import {v4 as uuidv4} from 'uuid';

import { MapPin, Maximize2, Phone, Mail, Home, DollarSign, User, ChevronLeft, ChevronRight, CreditCard, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

import { useBookingModal } from '../hooks/useBookingHook.js';
import { useKhaltiPayment } from '../hooks/payment/useKhaltiPayment.js';
import BookingModal from '../components/bookingComponents.jsx';
import LandlordManageAvailabilityModal from '../components/LandlordManageAvailabilityModal.jsx';

import { getFullMediaUrl } from '../utils/mediaUrlHelper.js';
import PaymentSelectionModal from "../components/payment/PaymentSelectionModal.jsx"; // Import the new media URL helper
import { createOrGetChat } from '../api/chatApi';


const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text).then(() => toast.success(message)).catch(() => toast.error('Failed to copy.'));
};

export default function PropertyDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentModel,setPaymentModel] = useState(false);

    const { isAuthenticated, user, loading: isLoadingAuth } = useContext(AuthContext);

    const [property, setProperty] = useState(location.state?.property || null);
    const [loading, setLoading] = useState(!property);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);

    // Use the Khalti payment hook
    const { initiateKhaltiPayment, isProcessingPayment, paymentSuccess, paymentError } = useKhaltiPayment(
        property?._id,
        property?.title,
        property?.price
    );

    const [showManageAvailabilityModal, setShowManageAvailabilityModal] = useState(false);

    // Integrate the useBookingModal hook for tenant booking
    const {
        showBookingModal,
        handleOpenBookingModal,
        handleCloseBookingModal,
        selectedDate,
        handleDateChange,
        currentDaySlots,
        selectedTime,
        handleSlotSelect,
        handleConfirmBooking,
        loadingAvailability,
        isBookingLoading,
        bookingSuccess,
        availableSlots
    } = useBookingModal(id, property?.landlord?._id, isAuthenticated);

    const [currentMediaIndex, setCurrentMediaIndex] = useState(location.state?.initialMediaIndex || 0);

    // Use the getFullMediaUrl helper for media paths
    const allMedia = useMemo(() => {
        if (!property) return [];
        return [
            ...(property.images || []).map(img => getFullMediaUrl(img)),
            ...(property.videos || []).map(vid => getFullMediaUrl(vid))
        ];
    }, [property]);

    // Fetch property details if not already passed via location state
    useEffect(() => {
        if (!property && id) {
            getOnePropertyApi(id).then(res => {
                setProperty(res.data.data);
                setLoading(false);
                setCurrentMediaIndex(0); // Reset media index on new property load
            }).catch(() => {
                setError('Failed to load property.');
                setLoading(false);
            });
        }
    }, [id, property]);

    // Check if property is liked by the current user
    useEffect(() => {
        if (isAuthenticated && property?._id) {
            getCartApi().then(res => {
                const likedIds = res.data.data?.items?.map(i => i.property?._id);
                setLiked(likedIds?.includes(property._id));
            }).catch(err => {
                console.error("Failed to fetch cart for like check:", err);
                setLiked(false);
            });
        } else {
            setLiked(false);
        }
    }, [property, isAuthenticated]);

    // Toggle property like status (add/remove from cart)
    const handleToggleLike = () => {
        if (!isAuthenticated) return toast.warn('Login to save properties.');
        if (!property?._id) return toast.error('Invalid property ID.');

        const action = liked ? removeFromCartApi : addToCartApi;
        action(property._id).then(() => {
            setLiked(!liked);
            toast.success(liked ? 'Removed from cart.' : 'Added to cart.');
        }).catch(err => toast.error(err.response?.data?.message || 'Action failed.'));
    };

    // Open Gmail compose window
    const openGmailCompose = (email) => {
        if (email) {
            const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
            window.open(gmailComposeUrl, '_blank');
        } else {
            toast.error('No email address available to compose.');
        }
    };

    const handleEsewaPayment = () => {
        // setIsProcessing(true)

        const transaction_uuid = uuidv4(); // or use uuid v4 if required
        console.log(transaction_uuid)
        const product_code = "EPAYTEST"
        const total_amount = property?.price.toFixed(2) // You must match this exactly as in the string
        const signed_field_names = "total_amount,transaction_uuid,product_code"

        const signingString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`
        const secret = "8gBm/:&EnhH.1/q" // ← UAT secret key from eSewa. DO NOT USE IN PRODUCTION FRONTEND.

        const signature = CryptoJS.HmacSHA256(signingString, secret).toString(CryptoJS.enc.Base64)

        const fields = {
            amount: property?.price.toFixed(2),
            tax_amount: "0",
            total_amount: total_amount,
            transaction_uuid: transaction_uuid,
            product_code: product_code,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: "https://developer.esewa.com.np/success",
            failure_url: "https://developer.esewa.com.np/failure",
            signed_field_names: signed_field_names,
            signature: signature,
        }

        const form = document.createElement("form")
        form.setAttribute("method", "POST")
        form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form")

        Object.entries(fields).forEach(([key, value]) => {
            const input = document.createElement("input")
            input.setAttribute("type", "hidden")
            input.setAttribute("name", key)
            input.setAttribute("value", value)
            form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
    }

    // Handle payment
    const handlePayment = () => {
        setPaymentModel(true);

    };

    const handleChatLandlord = async () => {
        if (!isAuthenticated) {
            toast.warn('Please log in to chat with the landlord.');
            return;
        }
        if (!property?.landlord?._id) {
            toast.error('Landlord information is missing. Cannot start chat.');
            return;
        }
        try {
            const chat = await createOrGetChat(property.landlord._id, property._id);
            navigate('/chat', { state: { preselectChatId: chat._id } });
        } catch (err) {
            toast.error(err.message || 'Failed to start chat.');
        }
    };

    // New handler for WhatsApp chat
    const handleWhatsAppChat = (phoneNumber) => {
        if (!phoneNumber) {
            toast.error('Landlord phone number not available for WhatsApp chat.');
            return;
        }
        // Format the phone number for WhatsApp (remove non-digits, ensure country code if needed)
        // For example, if numbers are stored as "9813895837", you might need to prepend "977" for Nepal.
        // Assuming your database number is ready for direct use or a default country code is implied.
        const cleanedPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digit characters
        const whatsappUrl = `https://web.whatsapp.com/send?phone=${cleanedPhoneNumber}`;
        window.open(whatsappUrl, '_blank');
    };

    // Check if a URL points to a video file
    const isVideo = url => /\.(mp4|webm|ogg|mov)$/i.test(url);

    // Navigation for media gallery
    const nextMedia = () => {
        setCurrentMediaIndex(prevIndex => Math.min(prevIndex + 1, allMedia.length - 1));
    };

    const prevMedia = () => {
        setCurrentMediaIndex(prevIndex => Math.max(prevIndex - 1, 0));
    };

    const mainMedia = allMedia[currentMediaIndex] || null;

    if (loading || isLoadingAuth) return <div className="flex justify-center items-center h-screen bg-gray-50">Loading...</div>;
    if (error) return <div className="text-red-500 text-xl p-4">{error}</div>;
    if (!property) return <div className="text-yellow-600">No property found.</div>;

    const isOwner = isAuthenticated && user?.role === 'Landlord' && user?._id === property.landlord?._id;

    const handleOpenManageAvailabilityModal = () => {
        if (!isAuthenticated) {
            toast.warn('Please log in to manage availability.');
            return;
        }
        if (user?.role !== 'Landlord') {
            toast.error('Access denied. Landlord role required to manage availability.');
            return;
        }
        if (user?._id !== property.landlord?._id) {
            toast.error('You do not own this property to manage its availability.');
            return;
        }
        setShowManageAvailabilityModal(true);
    };

    const handleCloseManageAvailabilityModal = () => {
        setShowManageAvailabilityModal(false);
    };

    return (
        <div className="min-h-screen bg-[#e6f0ff] py-10 px-4">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Property Title and Like Button */}
                <div className="p-8 border-b border-gray-200 flex justify-between items-center">
                    <h1 className="text-4xl font-extrabold text-[#003366]">{property.title}</h1>
                    <button onClick={handleToggleLike} className="p-3 rounded-full bg-gray-100 hover:bg-red-100">
                        {liked ? <FaHeart className="text-red-500 text-3xl" /> : <FiHeart className="text-gray-400 text-3xl" />}
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Media Viewer */}
                    <div className="lg:col-span-2 bg-gray-100 rounded-2xl flex justify-center items-center aspect-video relative">
                        {mainMedia && (isVideo(mainMedia) ? <video src={mainMedia} controls className="w-full h-full object-cover rounded-2xl" /> : <img src={mainMedia} alt={property.title} className="w-full h-full object-cover rounded-2xl" />)}
                        {!mainMedia && <div className="text-gray-400">No media available</div>}

                        {allMedia.length > 1 && (
                            <>
                                <button onClick={prevMedia} disabled={currentMediaIndex === 0} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeft size={32} />
                                </button>
                                <button onClick={nextMedia} disabled={currentMediaIndex === allMedia.length - 1} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}
                        {allMedia.length > 0 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-sm py-1 px-3 rounded-full">
                                {currentMediaIndex + 1} / {allMedia.length}
                            </div>
                        )}
                    </div>
                    {/* Media Thumbnails */}
                    <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                        {allMedia.length > 0 ? (
                            allMedia.map((mediaUrl, i) => (
                                <div key={i} onClick={() => setCurrentMediaIndex(i)} className={`relative cursor-pointer rounded-xl border-2 overflow-hidden aspect-video transition-all ${currentMediaIndex === i ? 'border-[#003366] ring-2 ring-[#003366]' : 'border-gray-200 hover:border-gray-400'}`}>
                                    {isVideo(mediaUrl) ? (
                                        <video src={mediaUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={mediaUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-gray-500">No images or videos available.</div>
                        )}
                    </div>
                </div>

                {/* Property Overview and Description */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 border-t border-gray-200">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold text-[#003366] mb-4">Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
                            <div className="flex items-center gap-2 bg-[#e6f0ff] p-3 rounded-lg">
                                <Home size={20} className="text-[#003366]" /> Category: {property.categoryId?.category_name || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 bg-[#e6f0ff] p-3 rounded-lg">
                                <MapPin size={20} className="text-[#003366]" /> Location: {property.location}
                            </div>
                            <div className="flex items-center gap-2 bg-[#e6f0ff] p-3 rounded-lg">
                                <DollarSign size={20} className="text-[#003366]" /> Rs. {property.price.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 bg-[#e6f0ff] p-3 rounded-lg">
                                <Maximize2 size={20} className="text-[#003366]" /> Bedrooms: {property.bedrooms || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 bg-[#e6f0ff] p-3 rounded-lg">
                                <Maximize2 size={20} className="text-[#003366]" /> Bathrooms: {property.bathrooms || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 bg-[#e6f0ff] p-3 rounded-lg">
                                <CalendarIcon size={20} className="text-[#003366]" /> Listed On: {new Date(property.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">Description</h2>
                        <p className="text-gray-700">{property.description || 'No description provided.'}</p>
                    </div>

                    {/* Contact Landlord and Action Buttons */}
                    <div className="bg-[#e6f0ff] p-6 rounded-xl text-center">
                        <h2 className="text-xl font-bold text-[#003366] mb-4">Contact Landlord</h2>
                        <User size={40} className="text-[#003366] mb-3" />
                        <p className="font-semibold text-[#003366]">{property.landlord?.fullName || 'N/A'}</p>

                        <div className="mt-4 space-y-3">
                            <button
                                onClick={() => openGmailCompose(property.landlord?.email)}
                                className="w-full border border-[#6699cc] text-[#003366] py-2 rounded hover:bg-[#cce0ff]"
                            >
                                <Mail size={20} className="inline-block mr-2" /> {property.landlord?.email || 'N/A'}
                            </button>
                            {property.landlord?.phoneNumber ? (
                                <button
                                    onClick={() => handleWhatsAppChat(property.landlord.phoneNumber)} // Changed onClick handler
                                    className="w-full border border-[#6699cc] text-[#003366] py-2 rounded hover:bg-[#cce0ff] flex items-center justify-center font-bold"
                                >
                                    <Phone size={20} className="inline-block mr-2" /> WhatsApp: {property.landlord.phoneNumber} {/* Changed button text */}
                                </button>
                            ) : (
                                <p className="text-gray-500 text-sm italic">Contact number not available.</p>
                            )}
                            {property.landlord?._id && (
                                <button
                                    onClick={handleChatLandlord}
                                    className="w-full border border-[#6699cc] text-[#003366] py-2 rounded hover:bg-[#cce0ff] flex items-center justify-center font-bold"
                                >
                                    <MessageSquare size={20} className="mr-2" /> Chat with Landlord
                                </button>
                            )}
                        </div>

                        {/* Payment Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessingPayment} // Disable button while payment is processing
                            className={`mt-6 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center font-bold shadow-md transform hover:scale-105 transition-all duration-200 ${isProcessingPayment ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <CreditCard size={24} className="mr-3" />
                            { 'Make Payment'}
                        </button>

                        {/* Conditional Calendar Button: opens appropriate modal based on user role */}
                        {isOwner ? (
                            // Landlord owns this property - opens Manage Availability Modal
                            <button
                                onClick={handleOpenManageAvailabilityModal}
                                className="mt-4 w-full py-3 bg-[#003366] text-white rounded-lg hover:bg-[#002244] flex items-center justify-center font-bold shadow-md transform hover:scale-105 transition-all duration-200"
                            >
                                <CalendarIcon size={24} className="mr-3" /> <span>Manage Availability</span>
                            </button>
                        ) : (
                            // Tenant or other user - opens Book a Visit Modal
                            <button
                                onClick={handleOpenBookingModal}
                                className="mt-4 w-full py-3 bg-[#003366] text-white rounded-lg hover:bg-[#002244] flex items-center justify-center font-bold shadow-md transform hover:scale-105 transition-all duration-200"
                            >
                                <CalendarIcon size={24} className="mr-3" /> <span>Book a Visit</span>
                            </button>
                        )}
                    </div>
                </div>

                <footer className="bg-[#003366] text-white text-center py-4 rounded-b-3xl">
                    <p>&copy; {new Date().getFullYear()} DreamDwell. All rights reserved.</p>
                </footer>
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />

            {/* Booking Modal Component (for tenants) */}
            {property && (
                <BookingModal
                    show={showBookingModal}
                    onClose={handleCloseBookingModal}
                    propertyTitle={property.title}
                    propertyId={property._id}
                    landlordId={property.landlord?._id}
                    isAuthenticated={isAuthenticated}
                    selectedDate={selectedDate}
                    handleDateChange={handleDateChange}
                    currentDaySlots={currentDaySlots}
                    selectedTime={selectedTime}
                    handleSlotSelect={handleSlotSelect}
                    handleConfirmBooking={handleConfirmBooking}
                    loadingAvailability={loadingAvailability}
                    isBookingLoading={isBookingLoading}
                    bookingSuccess={bookingSuccess}
                    availableSlots={availableSlots}
                />
            )}

            {property && (
                <LandlordManageAvailabilityModal
                    show={showManageAvailabilityModal}
                    onClose={handleCloseManageAvailabilityModal}
                    propertyId={property._id}
                />
            )}
            {paymentModel && (
                <PaymentSelectionModal
                    show={paymentModel}
                    onClose={() => setPaymentModel(false)}
                    onSelectPaymentMethod={(method) => {
                        if (method === 'khalti') {

                            initiateKhaltiPayment(); // Start Khalti payment
                        } else if(method === 'esewa') {
                            handleEsewaPayment()
                        }
                    }}
                />
            )}

        </div>
    );
}