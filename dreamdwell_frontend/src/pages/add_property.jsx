import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUploadCloud } from 'react-icons/fi';
import { useCreateProperty } from "../hooks/propertyHook/useaddProperty.js";

function AddProperty() {
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);

    const { mutate: createProperty, isLoading } = useCreateProperty();

    const formik = useFormik({
        initialValues: {
            title: '',
            location: '',
            price: '',
            type: '',
            description: '',
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            location: Yup.string().required('Location is required'),
            price: Yup.number().positive('Price must be positive').required('Price is required'),
            type: Yup.string().required('Property type is required'),
            description: Yup.string()
                .max(250, 'Description must be 250 characters or less')
                .required('Description is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            const formData = new FormData();

            Object.entries(values).forEach(([key, val]) => {
                formData.append(key, val);
            });

            images.forEach((img) => {
                formData.append("images", img);
            });

            videos.forEach((vid) => {
                formData.append("videos", vid);
            });

            createProperty(formData, {
                onSuccess: () => {
                    toast.success('Property added successfully!');
                    resetForm();
                    setImages([]);
                    setVideos([]);
                },
                onError: (error) => {
                    toast.error('Failed to add property. Please try again.');
                    console.error(error);
                },
            });
        },
    });

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files).filter((file) =>
            file.type.startsWith('image/')
        );
        setImages((prev) => [...prev, ...selectedFiles]);
    };

    const handleVideoChange = (e) => {
        const selectedFiles = Array.from(e.target.files).filter((file) =>
            file.type.startsWith('video/')
        );
        setVideos((prev) => [...prev, ...selectedFiles]);
    };

    const removeFile = (type, index) => {
        if (type === 'image') {
            setImages(images.filter((_, i) => i !== index));
        } else {
            setVideos(videos.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-6 flex items-center justify-center">
            <div className="bg-white w-full max-w-5xl p-10 rounded-2xl shadow-xl">
                <h2 className="text-4xl font-bold text-[#002B5B] mb-8 text-left">Add New Property</h2>

                <form onSubmit={formik.handleSubmit} className="space-y-8 text-left" noValidate>
                    <InputField formik={formik} id="title" label="Title" placeholder="Property title" />
                    <InputField formik={formik} id="location" label="Location" placeholder="Property location" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField formik={formik} id="price" label="Price Per Month" type="number" />
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
                                <option value="room">Room</option>
                                <option value="Paying Guest">Paying Guest</option>
                                <option value="House">House</option>
                            </select>
                            {formik.touched.type && formik.errors.type && (
                                <p className="text-red-600 text-sm mt-1">{formik.errors.type}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold mb-2">
                            Description (Max 250 characters)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe your property..."
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            rows={5}
                            maxLength={250}
                            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                        {formik.touched.description && formik.errors.description && (
                            <p className="text-red-600 text-sm mt-1">{formik.errors.description}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1 text-right">
                            {formik.values.description.length} / 250 characters
                        </p>
                    </div>

                    <UploadSection
                        title="Upload Images"
                        icon={<FiUploadCloud className="text-4xl mx-auto text-gray-500 mb-2" />}
                        inputRef={imageInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        files={images}
                        removeFile={(index) => removeFile('image', index)}
                        isImage
                    />

                    <UploadSection
                        title="Upload Videos"
                        icon={<FiUploadCloud className="text-4xl mx-auto text-gray-500 mb-2" />}
                        inputRef={videoInputRef}
                        accept="video/*"
                        onChange={handleVideoChange}
                        files={videos}
                        removeFile={(index) => removeFile('video', index)}
                        isImage={false}
                    />

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#002B5B] text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {isLoading ? 'Submitting...' : 'Add Property'}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

const InputField = ({ formik, id, label, type = 'text', placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold mb-2">{label}</label>
        <input
            type={type}
            id={id}
            name={id}
            placeholder={placeholder || label}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values[id]}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formik.touched[id] && formik.errors[id] && (
            <p className="text-red-600 text-sm mt-1">{formik.errors[id]}</p>
        )}
    </div>
);

const UploadSection = ({ title, icon, inputRef, accept, onChange, files, removeFile, isImage }) => (
    <div>
        <label className="block text-sm font-semibold mb-2">{title}</label>
        <div
            className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400 transition"
            onClick={() => inputRef.current.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRef.current.click();
                }
            }}
        >
            {icon}
            <p className="text-gray-600">Click to upload or drag & drop</p>
            <input
                type="file"
                multiple
                accept={accept}
                ref={inputRef}
                onChange={onChange}
                className="hidden"
            />
        </div>

        {files.length > 0 && (
            <div className={`mt-4 grid ${isImage ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                {files.map((file, index) => (
                    <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm">
                        {isImage ? (
                            <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="w-full h-32 object-cover" />
                        ) : (
                            <video src={URL.createObjectURL(file)} controls className="w-full h-40 object-cover" />
                        )}
                        <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default AddProperty;
