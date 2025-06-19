import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUploadCloud } from 'react-icons/fi'; // For the upload icon

function Add_property() {
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);

    const formik = useFormik({
        initialValues: {
            title: '',
            location: '',
            price: '',
            type: '',
            guests: '',
            bedrooms: '',
            bathrooms: '',
            description: '', // New description field
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            location: Yup.string().required('Location is required'),
            price: Yup.number()
                .positive('Price must be positive')
                .required('Price is required'),
            type: Yup.string().required('Property type is required'),
            guests: Yup.number()
                .positive('Guests count must be positive')
                .required('Guests count is required'),
            bedrooms: Yup.number()
                .min(1, 'At least 1 bedroom is required')
                .required('Bedroom count is required'),
            bathrooms: Yup.number()
                .min(1, 'At least 1 bathroom is required')
                .required('Bathroom count is required'),
            description: Yup.string()
                .max(250, 'Description must be 250 characters or less')
                .required('Description is required'),
        }),
        onSubmit: (values) => {
            console.log("Form Data:", values);
            console.log("Uploaded Images:", images);
            console.log("Uploaded Videos:", videos);
            toast.success("Property added successfully!");

        },
    });

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files).filter(file =>
            file.type.startsWith("image/")
        );
        setImages(prev => [...prev, ...selectedFiles]);
    };

    const handleVideoChange = (e) => {
        const selectedFiles = Array.from(e.target.files).filter(file =>
            file.type.startsWith("video/")
        );
        setVideos(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (type, index) => {
        if (type === "image") {
            setImages(images.filter((_, i) => i !== index));
        } else {
            setVideos(videos.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-6 flex items-center justify-center">
            <div className="bg-white w-full max-w-5xl p-10 rounded-2xl shadow-xl">
                <h2 className="text-4xl font-bold text-[#002B5B] mb-8 text-left">Add New Property</h2>

                <form onSubmit={formik.handleSubmit} className="space-y-8 text-left">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold mb-2">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Property title"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.title}
                            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-semibold mb-2">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            placeholder="Property location"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.location}
                            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formik.touched.location && formik.errors.location && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.location}</p>
                        )}
                    </div>

                    {/* Price and Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-semibold mb-2">Price Per Month</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                placeholder="Price"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.price}
                                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {formik.touched.price && formik.errors.price && (
                                <p className="text-red-600 text-sm mt-1">{formik.errors.price}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-semibold mb-2">Type</label>
                            <select
                                id="type"
                                name="type"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.type}
                                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Type</option>
                                <option value="apartment">Flat</option>
                                <option value="room">room</option>
                                <option value="Paying Guest">Paying Guest</option>
                                <option value="House">House</option>

                            </select>
                            {formik.touched.type && formik.errors.type && (
                                <p className="text-red-600 text-sm mt-1">{formik.errors.type}</p>
                            )}
                        </div>
                    </div>

                    {/* Guests, Bedrooms, Bathrooms */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="guests" className="block text-sm font-semibold mb-2">Guests</label>
                            <input
                                type="number"
                                id="guests"
                                name="guests"
                                placeholder="Guests"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.guests}
                                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {formik.touched.guests && formik.errors.guests && (
                                <p className="text-red-600 text-sm mt-1">{formik.errors.guests}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="bedrooms" className="block text-sm font-semibold mb-2">Bedrooms</label>
                            <input
                                type="number"
                                id="bedrooms"
                                name="bedrooms"
                                placeholder="Bedrooms"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.bedrooms}
                                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {formik.touched.bedrooms && formik.errors.bedrooms && (
                                <p className="text-red-600 text-sm mt-1">{formik.errors.bedrooms}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="bathrooms" className="block text-sm font-semibold mb-2">Bathrooms</label>
                            <input
                                type="number"
                                id="bathrooms"
                                name="bathrooms"
                                placeholder="Bathrooms"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.bathrooms}
                                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {formik.touched.bathrooms && formik.errors.bathrooms && (
                                <p className="text-red-600 text-sm mt-1">{formik.errors.bathrooms}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold mb-2">Description (Max 250 characters)</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe your property..."
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            rows="5"
                            maxLength={250}
                            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        ></textarea>
                        {formik.touched.description && formik.errors.description && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.description}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1 text-right">
                            {formik.values.description.length} / 250 characters
                        </p>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Upload Images</label>
                        <div
                            className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400 transition"
                            onClick={() => imageInputRef.current.click()}
                        >
                            <FiUploadCloud className="text-4xl mx-auto text-gray-500 mb-2" />
                            <p className="text-gray-600">Click to upload or drag & drop images</p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={imageInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((file, index) => (
                                    <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${index}`}
                                            className="w-full h-32 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile("image", index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Video Upload */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Upload Videos</label>
                        <div
                            className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400 transition"
                            onClick={() => videoInputRef.current.click()}
                        >
                            <FiUploadCloud className="text-4xl mx-auto text-gray-500 mb-2" />
                            <p className="text-gray-600">Click to upload or drag & drop videos</p>
                            <input
                                type="file"
                                multiple
                                accept="video/*"
                                ref={videoInputRef}
                                onChange={handleVideoChange}
                                className="hidden"
                            />
                        </div>

                        {videos.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {videos.map((file, index) => (
                                    <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm">
                                        <video
                                            src={URL.createObjectURL(file)}
                                            controls
                                            className="w-full h-40 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile("video", index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove video"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full bg-[#002B5B] text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Add Property
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default Add_property;