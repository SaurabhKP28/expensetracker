const express = require('express');
const { createOrder, updateOrderStatus, getPaymentStatus } = require('../controllers/paymentController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Create a new payment order
router.post('/pay', authenticateToken, createOrder);

// Update order status
router.post('/order/:orderId', authenticateToken, updateOrderStatus);

// Get payment status
router.get('/payment-status/:orderId', authenticateToken, getPaymentStatus);

module.exports = router;