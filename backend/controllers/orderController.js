const store = require('../config/store');
const dispatcher = require('../services/notificationDispatcher');

// Helper to generate professional Order ID: SRD-YYYY-XXXX
const generateOrderId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SRD-${num}`;
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, shippingAddress, customerNotes, customDescription, customPhotos, couponCode, paymentMode } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'At least one print item is required' });
    }

    let subtotal = 0;
    const processedItems = items.map(item => {
      const lineTotal = (item.unitPrice || 0) * (item.quantity || 1);
      subtotal += lineTotal;
      return {
        productId: item.productId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || 'sq.ft',
        unitPrice: item.unitPrice,
        dimensions: item.dimensions || null, // e.g. { width: 10, height: 4, sqft: 40 }
        options: item.options || {}, // e.g. { gsm: '340 GSM', lamination: 'Matte', eyelets: true }
        artworkUrl: item.artworkUrl || null,
        lineTotal
      };
    });

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = store.findOne('coupons', { code: couponCode.toUpperCase().trim() });
      if (coupon && subtotal >= (coupon.minAmount || 0)) {
        discount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount || Infinity);
        appliedCoupon = coupon.code;
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);
    const orderId = generateOrderId();
    const now = new Date().toISOString();

    const orderDoc = store.create('orders', {
      orderId,
      customerId: userId,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || '',
      items: processedItems,
      subtotal,
      discount,
      couponCode: appliedCoupon,
      totalAmount,
      paymentMode: paymentMode || 'UPI_QR',
      paymentStatus: 'PENDING',
      status: 'ORDER_PLACED',
      shippingAddress: shippingAddress || req.user.address || 'Pickup at Sri Ramu Press Counter',
      customerNotes: customerNotes || customDescription || '',
      customDescription: customDescription || customerNotes || '',
      customPhotos: Array.isArray(customPhotos) ? customPhotos : [],
      timeline: [
        {
          stage: 'ORDER_PLACED',
          title: 'Order Submitted',
          description: 'Printing job submitted by customer. Prepress review queued.',
          timestamp: now
        }
      ]
    });

    // Communication Flow 1: Order Submitted -> Admin Real-Time Alert + Sound + Customer Order Confirmation In-App + Push + Brevo Email
    // Dispatch to Admin
    dispatcher.dispatch({
      type: 'ORDER_CREATED',
      priority: 'IMPORTANT',
      title: `New Order: #${orderId} (₹${totalAmount})`,
      message: `${req.user.name} placed a new order for ${processedItems[0].name} (${processedItems.length} items).`,
      targetRole: 'ADMIN',
      data: {
        orderId,
        customerName: req.user.name,
        totalAmount,
        actionUrl: `/admin/orders?id=${orderId}`,
        actionText: 'View Order'
      },
      idempotencyKey: `admin_order_${orderId}`
    });

    // Dispatch to Customer
    dispatcher.dispatch({
      type: 'ORDER_CREATED',
      priority: 'NORMAL',
      title: `Order Placed: #${orderId}`,
      message: `Your print order #${orderId} has been confirmed. Total payable: ₹${totalAmount}.`,
      userId,
      customerEmail: req.user.email,
      customerName: req.user.name,
      targetRole: 'CUSTOMER',
      data: {
        orderId,
        orderDate: new Date().toLocaleString(),
        serviceName: processedItems.map(i => i.name).join(', '),
        quantity: processedItems.reduce((acc, curr) => acc + curr.quantity, 0),
        subtotal,
        discount,
        couponCode: appliedCoupon,
        totalAmount,
        paymentMode: paymentMode || 'UPI_QR',
        paymentStatus: 'PENDING',
        customerNotes: customerNotes || '',
        actionUrl: `/orders/${orderId}`,
        actionText: 'View Order'
      },
      idempotencyKey: `customer_order_${orderId}`
    });

    res.status(201).json({ success: true, order: orderDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/my-orders
const getCustomerOrders = async (req, res) => {
  try {
    const orders = store.find('orders', { customerId: req.user._id });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    let order = store.findOne('orders', { orderId });
    if (!order) {
      order = store.findById('orders', orderId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security check
    if (req.user.role !== 'ADMIN' && order.customerId !== req.user._id) {
      return res.status(403).json({ message: 'Forbidden: Access to this order denied' });
    }

    // Fetch chronological notifications linked to this order
    const notifications = store.find('notifications', { 'data.orderId': order.orderId });

    res.json({ success: true, order, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/admin/all
const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    let orders = store.getCollection('orders');

    if (status && status !== 'ALL') {
      orders = orders.filter(o => o.status === status);
    }

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/orders/admin/:id/status
const updateOrderStatusAdmin = async (req, res) => {
  try {
    const orderParam = req.params.id;
    let order = store.findOne('orders', { orderId: orderParam }) || store.findById('orders', orderParam);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status, statusNotes, expectedCompletion } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const now = new Date().toISOString();
    const updatedTimeline = [
      ...(order.timeline || []),
      {
        stage: status,
        title: status.replace(/_/g, ' '),
        description: statusNotes || `Order progressed to ${status.replace(/_/g, ' ')}.`,
        timestamp: now
      }
    ];

    const updatedOrder = store.findByIdAndUpdate('orders', order._id, {
      status,
      statusNotes: statusNotes || order.statusNotes,
      expectedCompletion: expectedCompletion || order.expectedCompletion,
      timeline: updatedTimeline
    });

    // Determine type for notification
    let notifType = 'ORDER_UPDATED';
    if (status === 'ORDER_ACCEPTED') notifType = 'ORDER_ACCEPTED';
    else if (status === 'PRINTING_STARTED') notifType = 'PRINTING_STARTED';
    else if (status === 'PRINTING_COMPLETED') notifType = 'PRINTING_COMPLETED';
    else if (status === 'READY_FOR_PICKUP') notifType = 'READY_FOR_PICKUP';
    else if (status === 'OUT_FOR_DELIVERY') notifType = 'OUT_FOR_DELIVERY';
    else if (status === 'DELIVERED') notifType = 'DELIVERED';
    else if (status === 'ORDER_COMPLETED') notifType = 'ORDER_COMPLETED';
    else if (status === 'ORDER_CANCELLED') notifType = 'ORDER_CANCELLED';

    // Dispatch update notification to customer
    dispatcher.dispatch({
      type: notifType,
      priority: (status === 'READY_FOR_PICKUP' || status === 'OUT_FOR_DELIVERY') ? 'IMPORTANT' : 'NORMAL',
      title: `Order #${order.orderId}: ${status.replace(/_/g, ' ')}`,
      message: statusNotes || `Your printing job #${order.orderId} is now at stage: ${status.replace(/_/g, ' ')}.`,
      userId: order.customerId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      targetRole: 'CUSTOMER',
      data: {
        orderId: order.orderId,
        orderStatus: status,
        statusNotes: statusNotes || '',
        actionUrl: `/orders/${order.orderId}`,
        actionText: 'View Order Timeline'
      },
      idempotencyKey: `status_change_${order.orderId}_${status}_${Date.now()}`
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/orders/:id/cancel-request
const requestCancellation = async (req, res) => {
  try {
    const orderParam = req.params.id;
    let order = store.findOne('orders', { orderId: orderParam }) || store.findById('orders', orderParam);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customerId !== req.user._id) return res.status(403).json({ message: 'Unauthorized' });

    const { reason } = req.body;

    const requestDoc = store.create('requests', {
      type: 'CANCELLATION',
      priority: 'URGENT',
      orderId: order.orderId,
      customerId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      reason: reason || 'Customer requested order cancellation',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    // Notify Admin with Sound Alert
    dispatcher.dispatch({
      type: 'ORDER_CANCELLED',
      priority: 'URGENT',
      title: `Cancellation Request: Order #${order.orderId}`,
      message: `${req.user.name} submitted a cancellation request for Order #${order.orderId}. Reason: ${reason || 'Not specified'}`,
      targetRole: 'ADMIN',
      data: {
        orderId: order.orderId,
        requestId: requestDoc._id,
        actionUrl: `/admin/requests`,
        actionText: 'Review Request'
      },
      idempotencyKey: `cancel_req_${requestDoc._id}`
    });

    res.json({ success: true, message: 'Cancellation request submitted to Admin', request: requestDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  requestCancellation
};
