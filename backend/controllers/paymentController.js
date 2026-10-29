const store = require('../config/store');
const dispatcher = require('../services/notificationDispatcher');

// POST /api/payments/submit
const submitPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMode, transactionId, screenshotUrl, notes } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Order ID and amount are required' });
    }

    let order = store.findOne('orders', { orderId });
    if (!order) {
      order = store.findById('orders', orderId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Associated order not found' });
    }

    const paymentDoc = store.create('payments', {
      orderId: order.orderId,
      customerId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      amount: Number(amount),
      paymentMode: paymentMode || 'UPI_QR',
      transactionId: transactionId || 'UPI-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      screenshotUrl: screenshotUrl || null,
      notes: notes || '',
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    });

    // Update order status
    store.findByIdAndUpdate('orders', order._id, {
      paymentStatus: 'VERIFICATION_PENDING',
      timeline: [
        ...(order.timeline || []),
        {
          stage: 'PAYMENT_SUBMITTED',
          title: 'Payment Details Submitted',
          description: `Customer submitted ₹${amount} via ${paymentMode || 'UPI'}. UTR/Ref: ${paymentDoc.transactionId}. Verification queued.`,
          timestamp: new Date().toISOString()
        }
      ]
    });

    // 1. Admin Real-Time Alert + Cash Register Sound
    dispatcher.dispatch({
      type: 'PAYMENT_SUBMITTED',
      priority: 'IMPORTANT',
      title: `Payment Submitted: ₹${amount} for #${order.orderId}`,
      message: `${req.user.name} submitted payment verification request. UTR: ${paymentDoc.transactionId}`,
      targetRole: 'ADMIN',
      data: {
        orderId: order.orderId,
        paymentId: paymentDoc._id,
        amount: Number(amount),
        customerName: req.user.name,
        paymentMode: paymentMode || 'UPI',
        transactionId: paymentDoc.transactionId,
        actionUrl: `/admin/payments?id=${paymentDoc._id}`,
        actionText: 'View Payment'
      },
      idempotencyKey: `admin_pay_${paymentDoc._id}`
    });

    // 2. Customer In-App + Push + Brevo Email
    dispatcher.dispatch({
      type: 'PAYMENT_SUBMITTED',
      priority: 'NORMAL',
      title: `Payment Received: Order #${order.orderId}`,
      message: `Your payment information (₹${amount}, Ref: ${paymentDoc.transactionId}) has been received and is waiting for Admin verification.`,
      userId: req.user._id,
      customerEmail: req.user.email,
      customerName: req.user.name,
      targetRole: 'CUSTOMER',
      data: {
        orderId: order.orderId,
        paymentAmount: amount,
        paymentMode: paymentMode || 'UPI',
        transactionId: paymentDoc.transactionId,
        actionUrl: `/orders/${order.orderId}`,
        actionText: 'View Payment Status'
      },
      idempotencyKey: `customer_pay_${paymentDoc._id}`
    });

    res.status(201).json({ success: true, payment: paymentDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/payments/admin/:id/verify
const verifyPaymentAdmin = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = store.findById('payments', paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const updatedPayment = store.findByIdAndUpdate('payments', paymentId, {
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      verifiedBy: req.user.name
    });

    const order = store.findOne('orders', { orderId: payment.orderId });
    if (order) {
      store.findByIdAndUpdate('orders', order._id, {
        paymentStatus: 'PAID',
        status: order.status === 'ORDER_PLACED' ? 'PAYMENT_VERIFIED' : order.status,
        timeline: [
          ...(order.timeline || []),
          {
            stage: 'PAYMENT_VERIFIED',
            title: 'Payment Verified & Accepted',
            description: `Payment of ₹${payment.amount} confirmed by Admin (${req.user.name}). Order advanced to production queue.`,
            timestamp: new Date().toISOString()
          }
        ]
      });
    }

    // Customer In-App + Push + Brevo Email
    dispatcher.dispatch({
      type: 'PAYMENT_VERIFIED',
      priority: 'IMPORTANT',
      title: `Payment Verified: ₹${payment.amount} for Order #${payment.orderId}`,
      message: `Your payment of ₹${payment.amount} has been verified by Sri Ramu Digital. Your order is now in active production.`,
      userId: payment.customerId,
      customerEmail: payment.customerEmail,
      customerName: payment.customerName,
      targetRole: 'CUSTOMER',
      data: {
        orderId: payment.orderId,
        paymentAmount: payment.amount,
        paymentMode: payment.paymentMode,
        transactionId: payment.transactionId,
        orderStatus: 'PAYMENT_VERIFIED',
        actionUrl: `/orders/${payment.orderId}`,
        actionText: 'View Order'
      },
      idempotencyKey: `verify_pay_${payment._id}`
    });

    res.json({ success: true, payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/payments/admin/:id/reject
const rejectPaymentAdmin = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { rejectionReason } = req.body;

    const payment = store.findById('payments', paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const reason = rejectionReason || 'Transaction reference mismatch or uncredited funds.';

    const updatedPayment = store.findByIdAndUpdate('payments', paymentId, {
      status: 'REJECTED',
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: req.user.name
    });

    const order = store.findOne('orders', { orderId: payment.orderId });
    if (order) {
      store.findByIdAndUpdate('orders', order._id, {
        paymentStatus: 'PAYMENT_FAILED',
        timeline: [
          ...(order.timeline || []),
          {
            stage: 'PAYMENT_REJECTED',
            title: 'Payment Verification Failed',
            description: `Payment rejected by Admin. Reason: ${reason}. Waiting for resubmission.`,
            timestamp: new Date().toISOString()
          }
        ]
      });
    }

    // Customer In-App + Push + Brevo Email
    dispatcher.dispatch({
      type: 'PAYMENT_REJECTED',
      priority: 'URGENT',
      title: `Payment Verification Issue: Order #${payment.orderId}`,
      message: `We could not verify your payment. Reason: ${reason}. Please resubmit transaction details.`,
      userId: payment.customerId,
      customerEmail: payment.customerEmail,
      customerName: payment.customerName,
      targetRole: 'CUSTOMER',
      data: {
        orderId: payment.orderId,
        paymentAmount: payment.amount,
        rejectionReason: reason,
        actionUrl: `/orders/${payment.orderId}?retry=true`,
        actionText: 'Retry / Resubmit Payment'
      },
      idempotencyKey: `reject_pay_${payment._id}`
    });

    res.json({ success: true, payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/payments/admin/pending
const getPendingPaymentsAdmin = async (req, res) => {
  try {
    const payments = store.find('payments', { status: 'PENDING' });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/payments/admin/all
const getAllPaymentsAdmin = async (req, res) => {
  try {
    const payments = store.getCollection('payments');
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitPayment,
  verifyPaymentAdmin,
  rejectPaymentAdmin,
  getPendingPaymentsAdmin,
  getAllPaymentsAdmin
};
