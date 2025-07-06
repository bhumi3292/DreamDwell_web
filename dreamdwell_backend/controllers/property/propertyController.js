// controllers/property/propertyController.js
const fs = require('fs').promises; // Use fs.promises for async file operations
const path = require('path');
const Property = require("../../models/Property");
const Category = require("../../models/Category");
const User = require('../../models/User');

// Helper to extract file paths from Multer's `req.files`
const extractFilePaths = (files) => {
    if (!files) return [];
    // The `path` property contains the full path from the root of the project
    return files.map(file => file.path);
};

// Helper to delete files from the filesystem
const deleteFiles = async (filePaths) => {
    const deletionPromises = filePaths.map(async (filePath) => {
        // Construct the full absolute path from the project root.
        const fullPath = path.join(__dirname, '..', '..', filePath);
        try {
            // Check if the file exists before deleting it to prevent errors.
            await fs.access(fullPath);
            await fs.unlink(fullPath);
            console.log(`Successfully deleted file: ${fullPath}`);
        } catch (err) {
            // Log a warning if the file isn't found (it might have been deleted already).
            if (err.code === 'ENOENT') {
                console.warn(`File not found, skipping deletion: ${fullPath}`);
            } else {
                console.error(`Error deleting file ${fullPath}:`, err);
            }
        }
    });
    // Wait for all deletion promises to complete
    await Promise.all(deletionPromises);
};

// --- CREATE PROPERTY ---
exports.createProperty = async (req, res) => {
    try {
        const { title, description, location, price, categoryId, bedrooms, bathrooms } = req.body;

        // Basic validation
        if (!title || !description || !location || !price || !categoryId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({ success: false, message: "Invalid category ID." });
        }

        // Extract file paths from the uploaded files
        const images = extractFilePaths(req.files?.images);
        const videos = extractFilePaths(req.files?.videos);

        // Create a new property document
        const property = new Property({
            title, description, location, price, categoryId, bedrooms, bathrooms,
            images, // Save the file paths
            videos, // Save the file paths
            landlord: req.user._id, // Assumes `req.user` is set by your authentication middleware
        });

        await property.save();

        res.status(201).json({ success: true, message: "Property created successfully!", data: property });
    } catch (err) {
        console.error("Create property error:", err.message);
        // Clean up uploaded files if something goes wrong before saving to DB
        if (req.files) {
            // Use optional chaining for safety
            await deleteFiles(extractFilePaths(req.files?.images));
            await deleteFiles(extractFilePaths(req.files?.videos));
        }
        res.status(500).json({ success: false, message: "Server error. Failed to create property." });
    }
};

// --- GET ALL PROPERTIES ---
exports.getAllProperties = async (req, res) => {
    try {
        // Populate category and landlord details, including phoneNumber for landlord
        const properties = await Property.find({})
            .populate("categoryId", "category_name")
            .populate("landlord", "fullName email phoneNumber"); // Added phoneNumber here

        res.status(200).json({
            success: true,
            message: "Properties fetched successfully.",
            data: properties,
        });
    } catch (err) {
        console.error("Get properties error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- GET SINGLE PROPERTY ---
exports.getOneProperty = async (req, res) => {
    try {
        // Populate category and landlord details, including phoneNumber for landlord
        const property = await Property.findById(req.params.id)
            .populate("categoryId", "category_name")
            .populate("landlord", "fullName email phoneNumber"); // <-- FIX APPLIED HERE

        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        res.status(200).json({ success: true, data: property });
    } catch (err) {
        console.error("Get property error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- UPDATE PROPERTY ---
exports.updateProperty = async (req, res) => {
    try {
        // Step 1: Find the property by ID
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found." });
        }

        // Step 2: VERIFY OWNERSHIP. This is the crucial security check.
        // req.user._id is set by the authenticateUser middleware.
        // We use .toString() to compare the ObjectId with the string representation.
        if (property.landlord.toString() !== req.user._id.toString()) {
            // If the user is not the landlord of this property, deny access.
            return res.status(403).json({ success: false, message: "Unauthorized access: You do not own this property." });
        }

        // Step 3: Destructure and parse data from the request body
        const {
            title, description, location, price, bedrooms, bathrooms, categoryId,
            existingImages, // JSON string of paths to KEEP
            existingVideos, // JSON string of paths to KEEP
        } = req.body;

        // Parse the JSON strings from the frontend
        let existingImagesToKeep = [];
        let existingVideosToKeep = [];
        try {
            existingImagesToKeep = existingImages ? JSON.parse(existingImages) : [];
            existingVideosToKeep = existingVideos ? JSON.parse(existingVideos) : [];
        } catch (parseError) {
            console.error("Failed to parse existing files array:", parseError.message);
            // Throw a specific error to be caught by the outer catch block
            throw new Error(`Invalid JSON format for existing media: ${parseError.message}`);
        }

        // Step 4: Identify and delete files that were removed by the user
        const filesToDelete = [];
        property.images.forEach(oldPath => {
            if (!existingImagesToKeep.includes(oldPath)) filesToDelete.push(oldPath);
        });
        property.videos.forEach(oldPath => {
            if (!existingVideosToKeep.includes(oldPath)) filesToDelete.push(oldPath);
        });
        await deleteFiles(filesToDelete);

        // Step 5: Combine retained files with newly uploaded ones
        const newImages = extractFilePaths(req.files?.images);
        const newVideos = extractFilePaths(req.files?.videos);

        const updatedImages = [...existingImagesToKeep, ...newImages];
        const updatedVideos = [...existingVideosToKeep, ...newVideos];

        // Step 6: Update the property document in the database
        const updateData = {
            title, description, location, price, bedrooms, bathrooms, categoryId,
            images: updatedImages,
            videos: updatedVideos,
        };

        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedProperty) {
            return res.status(404).json({ success: false, message: "Update failed." });
        }

        res.status(200).json({ success: true, message: "Property updated successfully!", data: updatedProperty });
    } catch (err) {
        console.error("Update property error:", err.message);
        // Clean up new uploaded files if the database update fails
        if (req.files) {
            await deleteFiles(extractFilePaths(req.files?.images));
            await deleteFiles(extractFilePaths(req.files?.videos));
        }
        res.status(500).json({ success: false, message: "Server error. Failed to update property." });
    }
};

// --- DELETE PROPERTY ---
exports.deleteProperty = async (req, res) => {
    try {
        // Step 1: Find the property to be deleted
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found." });
        }

        // Step 2: VERIFY OWNERSHIP. This is a critical security check.
        // It prevents any authenticated user from deleting a property they don't own.
        if (property.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access: You do not own this property." });
        }

        // Step 3: Get all file paths associated with the property before deletion
        const allFilesToDelete = [...property.images, ...property.videos];

        // Step 4: Delete the property from the database
        // We use property.deleteOne() after finding it, so we have access to the file paths.
        await property.deleteOne();

        // Step 5: Delete the corresponding files from the filesystem
        await deleteFiles(allFilesToDelete);

        res.status(200).json({ success: true, message: "Property deleted successfully!" });
    } catch (err) {
        console.error("Delete property error:", err.message);
        res.status(500).json({ success: false, message: "Server error. Failed to delete property." });
    }
};
