import React, { useRef, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../../api/api'; // Assuming axios instance
import { toast, ToastContainer } from 'react-toastify'; // ToastContainer might be redundant if App.js has one
import 'react-toastify/dist/ReactToastify.css';
import { FiUploadCloud, FiMapPin } from 'react-icons/fi';
import { useCreateProperty } from '../../hooks/propertyHook/useaddProperty.js'; // Import the hook

export default function AddPropertyForm() {
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [locationPickerVisible, setLocationPickerVisible] = useState(false);
    const [categories, setCategories] = useState([]);
    const { mutate: createProperty, isLoading } = useCreateProperty(); // Instantiate the hook

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/category');
                if (response.data && response.data.success) {
                    setCategories(response.data.data || []);
                } else {
                    console.error("Failed to fetch categories:", response.data.message);
                    setCategories([]);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const formik = useFormik({
        initialValues: {
            title: '',
            location: '',
            price: '',
            type: '',
            description: '',
            bedrooms: '',
            bathrooms: '',
            categoryId: '',
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            location: Yup.string().required('Location is required'),
            price: Yup.number().positive('Price must be positive').required('Price is required'),
            type: Yup.string().required('Property type is required'),
            description: Yup.string()
                .max(250, 'Description must be 250 characters or less')
                .required('Description is required'),
            bedrooms: Yup.number().min(0, 'Must be 0 or more').required('Bedroom count is required'),
            bathrooms: Yup.number().min(0, 'Must be 0 or more').required('Bathroom count is required'),
            categoryId: Yup.string().required('Category is required'),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                formData.append(key, values[key]);
            });
            images.forEach((imageFile) => {
                formData.append('images', imageFile);
            });
            videos.forEach((videoFile) => {
                formData.append('videos', videoFile);
            });

            createProperty(formData, {
                onSuccess: () => {
                    formik.resetForm();
                    setImages([]);
                    setVideos([]);
                    // The hook handles toast success
                },
                onError: (error) => {
                    // The hook handles toast error
                    console.error("Error submitting property from component:", error);
                }
            });
        },
    });

    const handleImageChange = (e) => {
        const selected = Array.from(e.target.files).filter(file =>
            file.type.startsWith("image/")
        );
        setImages(prev => [...prev, ...selected]);
    };

    const handleVideoChange = (e) => {
        const selected = Array.from(e.target.files).filter(file =>
            file.type.startsWith("video/")
        );
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
                {/* Title and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="title" className="font-medium">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.title}
                            className="p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.title}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="price" className="font-medium">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.price}
                            className="p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {formik.touched.price && formik.errors.price && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.price}</p>
                        )}
                    </div>
                </div>

                {/* Location */}
                <div className="relative flex flex-col">
                    <div className="flex items-center relative">
                        <FiMapPin className="absolute left-3 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            id="location"
                            name="location"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.location}
                            className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter property location"
                        />
                        <button
                            type="button"
                            onClick={() => setLocationPickerVisible(!locationPickerVisible)}
                            className="absolute right-2 top-3 text-gray-600 hover:text-blue-600"
                            title="Pick location on map"
                        >
                            <FiMapPin size={22} />
                        </button>
                    </div>
                    {formik.touched.location && formik.errors.location && (
                        <p className="text-red-600 text-sm mt-1">{formik.errors.location}</p>
                    )}
                </div>

                {/* Type */}
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

                {/* Category Dropdown */}
                <div className="flex flex-col">
                    <label htmlFor="categoryId" className="block font-medium">Category</label>
                    <select
                        id="categoryId"
                        name="categoryId"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.categoryId}
                        className="w-full p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.category_name}
                            </option>
                        ))}
                    </select>
                    {formik.touched.categoryId && formik.errors.categoryId && (
                        <p className="text-red-600 text-sm mt-1">{formik.errors.categoryId}</p>
                    )}
                </div>

                {/* Bed and Bathroom Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="bedrooms" className="block font-medium">Bedrooms</label>
                        <input
                            type="number"
                            id="bedrooms"
                            name="bedrooms"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.bedrooms}
                            className="w-full p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {formik.touched.bedrooms && formik.errors.bedrooms && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.bedrooms}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="bathrooms" className="block font-medium">Bathrooms</label>
                        <input
                            type="number"
                            id="bathrooms"
                            name="bathrooms"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.bathrooms}
                            className="w-full p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {formik.touched.bathrooms && formik.errors.bathrooms && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.bathrooms}</p>
                        )}
                    </div>
                </div>

                {/* Map */}
                {locationPickerVisible && (
                    <div className="mt-4 h-64 rounded-lg overflow-hidden border-2 border-blue-400 shadow-lg">
                        <p className="text-center text-gray-600 pt-24">[Map picker goes here]</p>
                    </div>
                )}

                {/* Description */}
                <div className="flex flex-col">
                    <label htmlFor="description" className="font-medium mb-1">Description (Max 250 characters)</label>
                    <textarea
                        id="description"
                        name="description"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.description}
                        rows="4"
                        className="p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                        maxLength={250}
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
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {videos.map((file, index) => (
                                <div key={index} className="relative group">
                                    <video
                                        src={URL.createObjectURL(file)}
                                        controls
                                        className="rounded-xl w-full h-32 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile("video", index)}
                                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#002B5B] text-white font-bold py-3 rounded-lg hover:bg-[#001f40] transition disabled:opacity-50"
                >
                    {isLoading ? 'Submitting...' : 'Add Property'}
                </button>
            </form>

            {/* ToastContainer might be better placed in App.js if not already there */}
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}
