// routes/propertyRoutes.js
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

const uploadPropertyMedia = require('../middlewares/property/propertyMediaUpload');

router.post(
    '/',
    authenticateUser,
    isLandlord,
    uploadPropertyMedia, // Middleware to handle file uploads
    createProperty
);

router.get('/', getAllProperties);
router.get('/:id', getOneProperty);

router.put(
    '/:id',
    authenticateUser,
    isLandlord,
    uploadPropertyMedia, // Middleware to handle new file uploads
    updateProperty
);

router.delete(
    '/:id',
    authenticateUser,
    isLandlord,
    deleteProperty // Delete logic is now in the controller
);

module.exports = router;