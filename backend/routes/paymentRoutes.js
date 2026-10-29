const express = require('express');
const router = express.Router();
const {
  submitPayment,
  verifyPaymentAdmin,
  rejectPaymentAdmin,
  getPendingPaymentsAdmin,
  getAllPaymentsAdmin
} = require('../controllers/paymentController');
const { protect, requireAdmin } = require('../middleware/auth');

router.post('/submit', protect, submitPayment);
router.get('/admin/pending', protect, requireAdmin, getPendingPaymentsAdmin);
router.get('/admin/all', protect, requireAdmin, getAllPaymentsAdmin);
router.put('/admin/:id/verify', protect, requireAdmin, verifyPaymentAdmin);
router.put('/admin/:id/reject', protect, requireAdmin, rejectPaymentAdmin);

module.exports = router;
