const express = require('express');
const router = express.Router();

const {
    createProperty,
    getAllProperties,
    getOneProperty,
    updateProperty,
    deleteProperty
} = require('../controllers/property/propertyController');

const {
    authenticateUser,
    isLandlord,
    isPropertyOwner
} = require('../middlewares/authorizedUser');

const { uploadPropertyMedia } = require('../middlewares/property/propertyMediaUpload');

// Create Property (Landlord only)
router.post(
    '/',
    authenticateUser,
    isLandlord,
    uploadPropertyMedia,
    createProperty
);

// Get all properties (public)
router.get('/', getAllProperties);

// Get single property (public)
router.get('/:id', getOneProperty);

// Update property (Landlord + owner)
router.put(
    '/:id',
    authenticateUser,
    isLandlord,
    isPropertyOwner,
    uploadPropertyMedia,
    updateProperty
);

// Delete property (Landlord + owner)
router.delete(
    '/:id',
    authenticateUser,
    isLandlord,
    isPropertyOwner,
    deleteProperty
);

module.exports = router;
