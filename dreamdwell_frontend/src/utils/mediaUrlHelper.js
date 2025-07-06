// src/utils/mediaUrlHelper.js
const MEDIA_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
export const getFullMediaUrl = (relativePath) => {
    if (!relativePath) {
        console.warn("getFullMediaUrl received an empty relativePath.");
        return '';
    }
    const cleanedRelativePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return `${MEDIA_BASE_URL}/${cleanedRelativePath}`;
};