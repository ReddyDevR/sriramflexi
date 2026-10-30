const Payment = require('../models/Payment');
const Order = require('../models/Order');
const dispatcher = require('../services/notificationDispatcher');
const findOrder = async (id) => (await Order.findOne({ orderId: id })) || (await Order.findById(id));

// POST /api/payments/submit
const submitPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMode, transactionId, screenshotUrl, paymentProof, notes } = req.body;
    if (!orderId || amount === undefined || amount === null || amount === '') return res.status(400).json({ message: 'Order ID and amount are required' });
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return res.status(400).json({ message: 'Amount must be greater than zero' });
    const order = await findOrder(orderId);
    if (!order) return res.status(404).json({ message: 'Associated order not found' });
    if (req.user.role !== 'ADMIN' && String(order.customerId) !== String(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    const reference = transactionId || `UPI-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
    const payment = await Payment.create({ orderId: order.orderId, customerId: String(req.user._id), customerName: req.user.name, customerEmail: req.user.email, amount: numericAmount, paymentMode: paymentMode || 'UPI_QR', transactionId: reference, paymentProof: paymentProof || screenshotUrl || null, screenshotUrl: screenshotUrl || paymentProof || null, notes: notes || '', status: 'PENDING', submittedAt: new Date() });
    order.paymentStatus = 'VERIFICATION_PENDING';
    order.timeline = [...(order.timeline || []), { stage: 'PAYMENT_SUBMITTED', title: 'Payment Details Submitted', description: `Customer submitted ₹${numericAmount} via ${paymentMode || 'UPI'}. UTR/Ref: ${reference}. Verification queued.`, timestamp: new Date() }];
    await order.save();
    dispatcher.dispatch({ type: 'PAYMENT_SUBMITTED', priority: 'IMPORTANT', title: `Payment Submitted: ₹${numericAmount} for #${order.orderId}`, message: `${req.user.name} submitted payment verification request. UTR: ${reference}`, targetRole: 'ADMIN', data: { orderId: order.orderId, paymentId: payment._id, amount: numericAmount, customerName: req.user.name, paymentMode: paymentMode || 'UPI', transactionId: reference, actionUrl: `/admin/payments?id=${payment._id}`, actionText: 'View Payment' }, idempotencyKey: `admin_pay_${payment._id}` });
    dispatcher.dispatch({ type: 'PAYMENT_SUBMITTED', priority: 'NORMAL', title: `Payment Received: Order #${order.orderId}`, message: `Your payment information (₹${numericAmount}, Ref: ${reference}) has been received and is waiting for Admin verification.`, userId: String(req.user._id), customerEmail: req.user.email, customerName: req.user.name, targetRole: 'CUSTOMER', data: { orderId: order.orderId, paymentAmount: numericAmount, paymentMode: paymentMode || 'UPI', transactionId: reference, actionUrl: `/orders/${order.orderId}`, actionText: 'View Payment Status' }, idempotencyKey: `customer_pay_${payment._id}` });
    return res.status(201).json({ success: true, payment });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// PUT /api/payments/admin/:id/verify
const verifyPaymentAdmin = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });
    if (payment.status === 'VERIFIED') return res.status(409).json({ message: 'Payment is already verified' });
    payment.status = 'VERIFIED'; payment.verifiedAt = new Date(); payment.verifiedBy = req.user.name;
    await payment.save();
    const order = await Order.findOne({ orderId: payment.orderId });
    if (order) { order.paymentStatus = 'PAID'; if (order.status === 'ORDER_PLACED') order.status = 'PAYMENT_VERIFIED'; order.timeline = [...(order.timeline || []), { stage: 'PAYMENT_VERIFIED', title: 'Payment Verified & Accepted', description: `Payment of ₹${payment.amount} confirmed by Admin (${req.user.name}). Order advanced to production queue.`, timestamp: new Date() }]; await order.save(); }
    dispatcher.dispatch({ type: 'PAYMENT_VERIFIED', priority: 'IMPORTANT', title: `Payment Verified: ₹${payment.amount} for Order #${payment.orderId}`, message: `Your payment of ₹${payment.amount} has been verified by Sri Ramu Digital. Your order is now in active production.`, userId: payment.customerId, customerEmail: payment.customerEmail, customerName: payment.customerName, targetRole: 'CUSTOMER', data: { orderId: payment.orderId, paymentAmount: payment.amount, paymentMode: payment.paymentMode, transactionId: payment.transactionId, orderStatus: 'PAYMENT_VERIFIED', actionUrl: `/orders/${payment.orderId}`, actionText: 'View Order' }, idempotencyKey: `verify_pay_${payment._id}` });
    return res.json({ success: true, payment });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// PUT /api/payments/admin/:id/reject
const rejectPaymentAdmin = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });
    const reason = rejectionReason || 'Transaction reference mismatch or uncredited funds.';
    payment.status = 'REJECTED'; payment.rejectionReason = reason; payment.rejectedAt = new Date(); payment.rejectedBy = req.user.name;
    await payment.save();
    const order = await Order.findOne({ orderId: payment.orderId });
    if (order) { order.paymentStatus = 'PAYMENT_FAILED'; order.timeline = [...(order.timeline || []), { stage: 'PAYMENT_REJECTED', title: 'Payment Verification Failed', description: `Payment rejected by Admin. Reason: ${reason}. Waiting for resubmission.`, timestamp: new Date() }]; await order.save(); }
    dispatcher.dispatch({ type: 'PAYMENT_REJECTED', priority: 'URGENT', title: `Payment Verification Issue: Order #${payment.orderId}`, message: `We could not verify your payment. Reason: ${reason}. Please resubmit transaction details.`, userId: payment.customerId, customerEmail: payment.customerEmail, customerName: payment.customerName, targetRole: 'CUSTOMER', data: { orderId: payment.orderId, paymentAmount: payment.amount, rejectionReason: reason, actionUrl: `/orders/${payment.orderId}?retry=true`, actionText: 'Retry / Resubmit Payment' }, idempotencyKey: `reject_pay_${payment._id}` });
    return res.json({ success: true, payment });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

const getPendingPaymentsAdmin = async (req, res) => {
  try { const payments = await Payment.find({ status: 'PENDING' }).sort({ createdAt: -1 }); return res.json({ success: true, payments }); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};
const getAllPaymentsAdmin = async (req, res) => {
  try { const payments = await Payment.find({}).sort({ createdAt: -1 }); return res.json({ success: true, payments }); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

module.exports = { submitPayment, verifyPaymentAdmin, rejectPaymentAdmin, getPendingPaymentsAdmin, getAllPaymentsAdmin };
