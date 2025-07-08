const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateUser } = require('../middlewares/authorizedUser'); // Corrected path


router.use(authenticateUser);
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart); // <--- This is POST /api/cart/add

router.delete('/remove/:propertyId', cartController.removeFromCart);

router.delete('/clear', cartController.clearCart);

module.exports = router;