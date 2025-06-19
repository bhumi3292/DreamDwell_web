import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUploadCloud } from 'react-icons/fi';

export default function AddPropertyForm() {
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
            description: '', // Added description field
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            location: Yup.string().required('Location is required'),
            price: Yup.number().positive('Price must be positive').required('Price is required'),
            type: Yup.string().required('Property type is required'),
            guests: Yup.number().positive('Guests count must be positive').required('Guests count is required'),
            bedrooms: Yup.number().min(1, 'At least 1 bedroom is required').required('Bedroom count is required'),
            bathrooms: Yup.number().min(1, 'At least 1 bathroom is required').required('Bathroom count is required'),
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
        const selected = Array.from(e.target.files).filter(file =>
            file.type.startsWith("image/")
        );
        // Concatenate new images with existing ones
        setImages(prev => [...prev, ...selected]);
    };

    const handleVideoChange = (e) => {
        const selected = Array.from(e.target.files).filter(file =>
            file.type.startsWith("video/")
        );
        // Concatenate new videos with existing ones
        setVideos(prev => [...prev, ...selected]);
    };

    const removeFile = (type, index) => {
        if (type === "image") {
            setImages(images.filter((_, i) => i !== index));
        } else {
            setVideos(videos.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-xl rounded-2xl mt-8 mb-12">
            <h2 className="text-2xl font-bold text-[#002B5B] mb-6">Add New Property</h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["title", "location", "price"].map((field) => (
                        <div key={field} className="flex flex-col">
                            <label htmlFor={field} className="block font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                            <input
                                type={field === "price" ? "number" : "text"}
                                id={field}
                                name={field}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values[field]}
                                className="w-full p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            {formik.touched[field] && formik.errors[field] && (
                                <p className="text-red-600 text-sm mt-1">{formik.errors[field]}</p>
                            )}
                        </div>
                    ))}

                    <div className="flex flex-col">
                        <label htmlFor="type" className="block font-medium">Property Type</label>
                        <select
                            id="type"
                            name="type"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.type}
                            className="w-full p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Select Type</option>
                            <option value="villa">Villa</option>
                            <option value="apartment">Apartment</option>
                            <option value="cabin">Cabin</option>
                        </select>
                        {formik.touched.type && formik.errors.type && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.type}</p>
                        )}
                    </div>

                    {["guests", "bedrooms", "bathrooms"].map((field) => (
                        <div key={field} className="flex flex-col">
                            <label htmlFor={field} className="block font-medium capitalize">{field}</label>
                            <input
                                type="number"
                                id={field}
                                name={field}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values[field]}
                                className="w-full p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            {formik.touched[field] && formik.errors[field] && (
                                <p className="text-red-600 text-sm mt-1">{formik.errors[field]}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Description */}
                <div className="flex flex-col">
                    <label htmlFor="description" className="block font-medium mb-1">Description (Max 250 words)</label>
                    <textarea
                        id="description"
                        name="description"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.description}
                        rows="4"
                        className="w-full p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                        maxLength={250} // Limit character input
                    ></textarea>
                    {formik.touched.description && formik.errors.description && (
                        <p className="text-red-600 text-sm mt-1">{formik.errors.description}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1 text-right">
                        {formik.values.description.length} / 250 characters
                    </p>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block font-medium mb-1">Upload Images</label>
                    <div
                        className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400 transition"
                        onClick={() => imageInputRef.current.click()}
                    >
                        <FiUploadCloud className="text-4xl mx-auto text-gray-500" />
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
                                <div key={index} className="relative group">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`preview-${index}`}
                                        className="rounded-xl w-full h-32 object-cover"
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
                    <label className="block font-medium mb-1">Upload Videos</label>
                    <div
                        className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400 transition"
                        onClick={() => videoInputRef.current.click()}
                    >
                        <FiUploadCloud className="text-4xl mx-auto text-gray-500" />
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
                                <div key={index} className="relative group">
                                    <video
                                        src={URL.createObjectURL(file)}
                                        controls
                                        className="rounded-xl w-full h-40 object-cover"
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
                <button
                    type="submit"
                    className="bg-[#002B5B] text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                    Add Property
                </button>
            </form>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}