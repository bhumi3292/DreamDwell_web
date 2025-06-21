const express = require('express');
const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/category/categoryController');

const { authenticateUser } = require('../middlewares/authorizedUser');
// If you have an isAdmin middleware, use it like: authenticateUser, isAdmin

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes (consider adding isAdmin if needed)
router.post('/', authenticateUser, createCategory);
router.put('/:id', authenticateUser, updateCategory);
router.delete('/:id', authenticateUser, deleteCategory);

module.exports = router;
