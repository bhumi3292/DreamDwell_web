// src/components/property/add_PropertyForm.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUploadCloud, FiMapPin, FiPlusCircle } from 'react-icons/fi';
import { useCreateProperty } from '../../hooks/propertyHook/usePropertyActions.js';
import { getCategoriesApi, createCategoryApi } from '../../api/categoryApi.js';

// Modal component for adding a new category
const AddCategoryModal = ({ isVisible, onClose, onCategoryAdded }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Category name cannot be empty');
            return;
        }
        setIsLoading(true);
        try {
            const response = await createCategoryApi({ name: newCategoryName });
            toast.success(response.data.message);
            onCategoryAdded(response.data.data); // Pass the new category object back
            setNewCategoryName('');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add category');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#002B5B]">Add New Category</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100" disabled={isLoading}>Cancel</button>
                    <button onClick={handleAddCategory} className="bg-[#002B5B] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#001f40] disabled:opacity-50" disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Category'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AddPropertyForm() {
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const { mutate: createProperty, isLoading: isSubmitting } = useCreateProperty();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesApi();
                setCategories(response.data.data);
            } catch (error) {
                toast.error('Failed to load categories.');
            }
        };
        fetchCategories();
    }, []);

    const formik = useFormik({
        initialValues: {
            title: '', location: '', price: '', description: '',
            bedrooms: '', bathrooms: '', categoryId: '',
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            location: Yup.string().required('Location is required'),
            price: Yup.number().positive('Price must be positive').required('Price is required'),
            description: Yup.string().max(250, 'Description must be 250 characters or less').required('Description is required'),
            bedrooms: Yup.number().min(0, 'Must be 0 or more').required('Bedroom count is required'),
            bathrooms: Yup.number().min(0, 'Must be 0 or more').required('Bathroom count is required'),
            categoryId: Yup.string().required('Category is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            // Create a FormData object to send files and form data
            const formData = new FormData();
            Object.keys(values).forEach(key => formData.append(key, values[key]));

            // Append all selected image files with the key 'images'
            images.forEach((file) => formData.append('images', file));

            // Append all selected video files with the key 'videos'
            videos.forEach((file) => formData.append('videos', file));

            createProperty(formData, {
                onSuccess: () => {
                    resetForm();
                    setImages([]);
                    setVideos([]);
                    toast.success('Property added successfully!');
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || 'Failed to add property.');
                }
            });
        },
    });

    const handleFileChange = useCallback((e, type) => {
        const selectedFiles = Array.from(e.target.files);
        if (type === "image") {
            setImages(prev => [...prev, ...selectedFiles]);
        } else {
            setVideos(prev => [...prev, ...selectedFiles]);
        }
        e.target.value = null; // Allows re-uploading the same file
    }, []);

    const removeFile = useCallback((type, index) => {
        if (type === "image") setImages(images.filter((_, i) => i !== index));
        else setVideos(videos.filter((_, i) => i !== index));
    }, [images, videos]);

    const handleCategoryAdded = (newCategory) => {
        setCategories(prevCategories => [...prevCategories, newCategory]);
        formik.setFieldValue('categoryId', newCategory._id);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-xl rounded-2xl mt-8 mb-12">
            <h2 className="text-2xl font-bold text-[#002B5B] mb-6">Add New Property</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                {/* ... (Form fields: title, price, location, description, beds, baths) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="title" className="font-medium">Title</label>
                        <input type="text" id="title" name="title" {...formik.getFieldProps('title')} className="p-3 border rounded bg-gray-100" />
                        {formik.touched.title && formik.errors.title && <p className="text-red-600 text-sm mt-1">{formik.errors.title}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="price" className="font-medium">Price</label>
                        <input type="number" id="price" name="price" {...formik.getFieldProps('price')} className="p-3 border rounded bg-gray-100" />
                        {formik.touched.price && formik.errors.price && <p className="text-red-600 text-sm mt-1">{formik.errors.price}</p>}
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="location" className="font-medium">Location</label>
                    <input type="text" id="location" name="location" {...formik.getFieldProps('location')} className="p-3 border rounded bg-gray-100" />
                    {formik.touched.location && formik.errors.location && <p className="text-red-600 text-sm mt-1">{formik.errors.location}</p>}
                </div>
                {/* Category Dropdown */}
                <div className="flex flex-col">
                    <label htmlFor="categoryId" className="block font-medium">Category</label>
                    <div className="flex items-center gap-2">
                        <select id="categoryId" name="categoryId" {...formik.getFieldProps('categoryId')} className="flex-grow p-3 border rounded bg-gray-100">
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>{category.category_name}</option>
                            ))}
                        </select>
                        <button type="button" onClick={() => setIsCategoryModalVisible(true)} className="flex items-center justify-center p-3 bg-[#002B5B] text-white rounded-lg hover:bg-[#001f40] transition" title="Add a new category">
                            <FiPlusCircle size={24} />
                        </button>
                    </div>
                    {formik.touched.categoryId && formik.errors.categoryId && <p className="text-red-600 text-sm mt-1">{formik.errors.categoryId}</p>}
                </div>
                {/* ... (Bedrooms, Bathrooms, Description) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="bedrooms" className="block font-medium">Bedrooms</label>
                        <input type="number" id="bedrooms" name="bedrooms" {...formik.getFieldProps('bedrooms')} className="w-full p-3 border rounded bg-gray-100" />
                        {formik.touched.bedrooms && formik.errors.bedrooms && <p className="text-red-600 text-sm mt-1">{formik.errors.bedrooms}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="bathrooms" className="block font-medium">Bathrooms</label>
                        <input type="number" id="bathrooms" name="bathrooms" {...formik.getFieldProps('bathrooms')} className="w-full p-3 border rounded bg-gray-100" />
                        {formik.touched.bathrooms && formik.errors.bathrooms && <p className="text-red-600 text-sm mt-1">{formik.errors.bathrooms}</p>}
                    </div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="description" className="font-medium mb-1">Description (Max 250 characters)</label>
                    <textarea id="description" name="description" {...formik.getFieldProps('description')} rows="4" className="p-3 border rounded bg-gray-100 resize-y" maxLength={250}></textarea>
                    {formik.touched.description && formik.errors.description && <p className="text-red-600 text-sm mt-1">{formik.errors.description}</p>}
                    <p className="text-gray-500 text-sm mt-1 text-right">{formik.values.description.length} / 250 characters</p>
                </div>

                {/* Image Upload */}

                <div>
                    <label className="block font-medium mb-1">Upload Images</label>
                    <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400" onClick={() => imageInputRef.current.click()}>
                        <FiUploadCloud className="text-4xl mx-auto text-gray-500" /><p className="text-gray-600">Click to upload or drag & drop images</p>
                        <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                    </div>
                    {images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((file, index) => (
                                <div key={index} className="relative group">
                                    <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="rounded-xl w-full h-32 object-cover" />
                                    <button type="button" onClick={() => removeFile("image", index)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Video Upload */}
                <div>
                    <label className="block font-medium mb-1">Upload Videos</label>
                    <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400" onClick={() => videoInputRef.current.click()}>
                        <FiUploadCloud className="text-4xl mx-auto text-gray-500" /><p className="text-gray-600">Click to upload or drag & drop videos</p>
                        <input type="file" multiple accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
                    </div>
                    {videos.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {videos.map((file, index) => (
                                <div key={index} className="relative group">
                                    <video src={URL.createObjectURL(file)} controls className="rounded-xl w-full h-32 object-cover" />
                                    <button type="button" onClick={() => removeFile("video", index)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" disabled={isSubmitting} className="bg-[#002B5B] text-white font-bold py-3 rounded-lg hover:bg-[#001f40] transition disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Add Property'}
                </button>
            </form>
            <AddCategoryModal isVisible={isCategoryModalVisible} onClose={() => setIsCategoryModalVisible(false)} onCategoryAdded={handleCategoryAdded} />
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}