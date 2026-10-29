const express = require('express');
const router = express.Router();
const {
  createQuotationRequest,
  getCustomerRequests,
  getAllRequestsAdmin,
  adminRespondRequest,
  customerAcceptQuotation
} = require('../controllers/requestController');
const { protect, requireAdmin } = require('../middleware/auth');

router.post('/quotation', protect, createQuotationRequest);
router.get('/my-requests', protect, getCustomerRequests);
router.get('/admin/all', protect, requireAdmin, getAllRequestsAdmin);
router.put('/admin/:id/respond', protect, requireAdmin, adminRespondRequest);
router.put('/:id/accept-quotation', protect, customerAcceptQuotation);

module.exports = router;
