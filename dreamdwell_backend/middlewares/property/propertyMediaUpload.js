const multer = require("multer");
const path = require("path");

// Configure the storage destination and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this 'uploads/' directory exists in your project root or is created by your setup.
        // It's relative to where your Node.js process is started.
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Create a unique filename to prevent conflicts
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        // file.fieldname will be 'images' or 'videos' as configured in upload.fields()
        cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
    },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime", "video/webm"];

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error("Unsupported file type!"), false); // Reject the file
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024, // Set a file size limit (e.g., 100MB)
    },
});

// ⭐ CRITICAL: These are the EXPECTED FIELD NAMES for file uploads from the client ⭐
const uploadPropertyMedia = upload.fields([
    { name: "images", maxCount: 10 }, // Client must send files under the field name "images"
    { name: "videos", maxCount: 3 }, // Client must send files under the field name "videos"
]);

module.exports = uploadPropertyMedia;