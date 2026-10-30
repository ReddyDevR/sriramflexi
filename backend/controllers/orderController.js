const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const Request = require('../models/Request');
const dispatcher = require('../services/notificationDispatcher');

const generateOrderId = () => `SRD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
const findOrder = async (id) => (await Order.findOne({ orderId: id })) || (await Order.findById(id));

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const { items, shippingAddress, customerNotes, customDescription, customPhotos, couponCode, paymentMode } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'At least one print item is required' });
    let subtotal = 0;
    const processedItems = items.map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);
      if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Invalid item quantity or price');
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      return { productId: item.productId, name: item.name, category: item.category, quantity, unit: item.unit || 'sq.ft', unitPrice, dimensions: item.dimensions || null, options: item.options || {}, artworkUrl: item.artworkUrl || null, lineTotal };
    });
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase().trim(), isActive: { $ne: false } });
      if (coupon && subtotal >= Number(coupon.minAmount || 0) && (!coupon.validUntil || new Date(coupon.validUntil) >= new Date()) && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        const percentage = subtotal * Number(coupon.discountPercent || 0) / 100;
        discount = Math.min(percentage, Number(coupon.maxDiscount) > 0 ? Number(coupon.maxDiscount) : percentage);
        appliedCoupon = coupon.code;
        await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
      }
    }
    const totalAmount = Math.max(0, subtotal - discount);
    const orderId = generateOrderId();
    const order = await Order.create({ orderId, customerId: userId, customerName: req.user.name, customerEmail: req.user.email, customerPhone: req.user.phone || '', items: processedItems, subtotal, discount, couponCode: appliedCoupon, totalAmount, paymentMode: paymentMode || 'UPI_QR', paymentStatus: 'PENDING', status: 'ORDER_PLACED', shippingAddress: shippingAddress || req.user.address || 'Pickup at Sri Ramu Press Counter', customerNotes: customerNotes || customDescription || '', customDescription: customDescription || customerNotes || '', customPhotos: Array.isArray(customPhotos) ? customPhotos : [], timeline: [{ stage: 'ORDER_PLACED', title: 'Order Submitted', description: 'Printing job submitted by customer. Prepress review queued.', timestamp: new Date() }] });
    dispatcher.dispatch({ type: 'ORDER_CREATED', priority: 'IMPORTANT', title: `New Order: #${orderId} (₹${totalAmount})`, message: `${req.user.name} placed a new order for ${processedItems[0].name} (${processedItems.length} items).`, targetRole: 'ADMIN', data: { orderId, customerName: req.user.name, totalAmount, actionUrl: `/admin/orders?id=${orderId}`, actionText: 'View Order' }, idempotencyKey: `admin_order_${orderId}` });
    dispatcher.dispatch({ type: 'ORDER_CREATED', priority: 'NORMAL', title: `Order Placed: #${orderId}`, message: `Your print order #${orderId} has been confirmed. Total payable: ₹${totalAmount}.`, userId, customerEmail: req.user.email, customerName: req.user.name, targetRole: 'CUSTOMER', data: { orderId, orderDate: new Date().toLocaleString(), serviceName: processedItems.map(i => i.name).join(', '), quantity: processedItems.reduce((sum, item) => sum + item.quantity, 0), subtotal, discount, couponCode: appliedCoupon, totalAmount, paymentMode: paymentMode || 'UPI_QR', paymentStatus: 'PENDING', customerNotes: customerNotes || '', actionUrl: `/orders/${orderId}`, actionText: 'View Order' }, idempotencyKey: `customer_order_${orderId}` });
    return res.status(201).json({ success: true, order });
  } catch (error) { console.error('Create order error:', error); return res.status(500).json({ message: error.message }); }
};

// GET /api/orders/my-orders
const getCustomerOrders = async (req, res) => {
  try { const orders = await Order.find({ customerId: String(req.user._id) }).sort({ createdAt: -1 }); return res.json({ success: true, orders }); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'ADMIN' && String(order.customerId) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden: Access to this order denied' });
    const notifications = await Notification.find({ 'data.orderId': order.orderId }).sort({ createdAt: 1 });
    return res.json({ success: true, order, notifications });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// GET /api/orders/admin/all
const getAllOrdersAdmin = async (req, res) => {
  try { const filter = {}; if (req.query.status && req.query.status !== 'ALL') filter.status = req.query.status; const orders = await Order.find(filter).sort({ createdAt: -1 }); return res.json({ success: true, orders }); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

// PUT /api/orders/admin/:id/status
const updateOrderStatusAdmin = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const { status, statusNotes, expectedCompletion } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });
    order.status = status;
    order.statusNotes = statusNotes || order.statusNotes;
    order.expectedCompletion = expectedCompletion || order.expectedCompletion;
    order.timeline = [...(order.timeline || []), { stage: status, title: status.replace(/_/g, ' '), description: statusNotes || `Order progressed to ${status.replace(/_/g, ' ')}.`, timestamp: new Date() }];
    await order.save();
    let notifType = 'ORDER_UPDATED';
    if (['ORDER_ACCEPTED','PRINTING_STARTED','PRINTING_COMPLETED','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED','ORDER_COMPLETED','ORDER_CANCELLED'].includes(status)) notifType = status;
    dispatcher.dispatch({ type: notifType, priority: ['READY_FOR_PICKUP','OUT_FOR_DELIVERY'].includes(status) ? 'IMPORTANT' : 'NORMAL', title: `Order #${order.orderId}: ${status.replace(/_/g, ' ')}`, message: statusNotes || `Your printing job #${order.orderId} is now at stage: ${status.replace(/_/g, ' ')}.`, userId: String(order.customerId), customerEmail: order.customerEmail, customerName: order.customerName, targetRole: 'CUSTOMER', data: { orderId: order.orderId, orderStatus: status, statusNotes: statusNotes || '', actionUrl: `/orders/${order.orderId}`, actionText: 'View Order Timeline' }, idempotencyKey: `status_change_${order.orderId}_${status}_${Date.now()}` });
    return res.json({ success: true, order });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// POST /api/orders/:id/cancel-request
const requestCancellation = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.customerId) !== String(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    const { reason } = req.body;
    const request = await Request.create({ type: 'CANCELLATION', priority: 'URGENT', orderId: order.orderId, customerId: String(req.user._id), customerName: req.user.name, customerEmail: req.user.email, reason: reason || 'Customer requested order cancellation', status: 'PENDING' });
    dispatcher.dispatch({ type: 'ORDER_CANCELLED', priority: 'URGENT', title: `Cancellation Request: Order #${order.orderId}`, message: `${req.user.name} submitted a cancellation request for Order #${order.orderId}. Reason: ${reason || 'Not specified'}`, targetRole: 'ADMIN', data: { orderId: order.orderId, requestId: request._id, actionUrl: '/admin/requests', actionText: 'Review Request' }, idempotencyKey: `cancel_req_${request._id}` });
    return res.json({ success: true, message: 'Cancellation request submitted to Admin', request });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

module.exports = { createOrder, getCustomerOrders, getOrderById, getAllOrdersAdmin, updateOrderStatusAdmin, requestCancellation };
