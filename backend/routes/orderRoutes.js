const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  requestCancellation
} = require('../controllers/orderController');
const { protect, requireAdmin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getCustomerOrders);
router.get('/admin/all', protect, requireAdmin, getAllOrdersAdmin);
router.get('/:id', protect, getOrderById);
router.put('/admin/:id/status', protect, requireAdmin, updateOrderStatusAdmin);
router.post('/:id/cancel-request', protect, requestCancellation);

module.exports = router;
