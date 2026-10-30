const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const Request = require('../models/Request');
const dispatcher = require('../services/notificationDispatcher');

// Generate Order ID
const generateOrderId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SRD-${num}`;
};

// Find order using Order ID or MongoDB document ID
const findOrder = async (id) => {
  let order = await Order.findOne({ orderId: id });

  if (!order) {
    order = await Order.findById(id);
  }

  return order;
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const userId = String(req.user._id);

    const {
      items,
      shippingAddress,
      customerNotes,
      customDescription,
      customPhotos,
      couponCode,
      paymentMode
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'At least one print item is required'
      });
    }

    let subtotal = 0;

    const processedItems = items.map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        throw new Error('Invalid item quantity or price');
      }

      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      return {
        productId: item.productId,
        name: item.name,
        category: item.category,
        quantity,
        unit: item.unit || 'sq.ft',
        unitPrice,
        dimensions: item.dimensions || null,
        options: item.options || {},
        artworkUrl: item.artworkUrl || null,
        lineTotal
      };
    });

    // Apply coupon
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: { $ne: false }
      });

      if (coupon) {
        const isExpired =
          coupon.validUntil &&
          new Date(coupon.validUntil) < new Date();

        const usageLimitReached =
          coupon.usageLimit &&
          coupon.usedCount >= coupon.usageLimit;

        if (
          !isExpired &&
          !usageLimitReached &&
          subtotal >= (coupon.minAmount || 0)
        ) {
          const percentageDiscount =
            (subtotal * coupon.discountPercent) / 100;

          discount = Math.min(
            percentageDiscount,
            coupon.maxDiscount > 0
              ? coupon.maxDiscount
              : percentageDiscount
          );

          appliedCoupon = coupon.code;

          await Coupon.findByIdAndUpdate(coupon._id, {
            $inc: { usedCount: 1 }
          });
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);

    const orderId = generateOrderId();
    const now = new Date();

    // Save order in MongoDB
    const orderDoc = await Order.create({
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

      shippingAddress:
        shippingAddress ||
        req.user.address ||
        'Pickup at Sri Ramu Press Counter',

      customerNotes: customerNotes || customDescription || '',
      customDescription: customDescription || customerNotes || '',

      customPhotos: Array.isArray(customPhotos)
        ? customPhotos
        : [],

      timeline: [
        {
          stage: 'ORDER_PLACED',
          title: 'Order Submitted',
          description:
            'Printing job submitted by customer. Prepress review queued.',
          timestamp: now
        }
      ]
    });

    // Notify Admin
    dispatcher.dispatch({
      type: 'ORDER_CREATED',
      priority: 'IMPORTANT',
      title: `New Order: #${orderId} (₹${totalAmount})`,
      message:
        `${req.user.name} placed a new order for ` +
        `${processedItems[0].name} (${processedItems.length} items).`,

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

    // Notify Customer
    dispatcher.dispatch({
      type: 'ORDER_CREATED',
      priority: 'NORMAL',
      title: `Order Placed: #${orderId}`,
      message:
        `Your print order #${orderId} has been confirmed. ` +
        `Total payable: ₹${totalAmount}.`,

      userId,
      customerEmail: req.user.email,
      customerName: req.user.name,
      targetRole: 'CUSTOMER',

      data: {
        orderId,
        orderDate: now.toLocaleString(),
        serviceName: processedItems.map(i => i.name).join(', '),
        quantity: processedItems.reduce(
          (acc, curr) => acc + curr.quantity,
          0
        ),
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

    return res.status(201).json({
      success: true,
      order: orderDoc
    });

  } catch (error) {
    console.error('Create order error:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};

// GET /api/orders/my-orders
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: String(req.user._id)
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Customer can only access their own order
    if (
      req.user.role !== 'ADMIN' &&
      String(order.customerId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: 'Forbidden: Access to this order denied'
      });
    }

    const notifications = await Notification.find({
      'data.orderId': order.orderId
    }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      order,
      notifications
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// GET /api/orders/admin/all
const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// PUT /api/orders/admin/:id/status
const updateOrderStatusAdmin = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    const {
      status,
      statusNotes,
      expectedCompletion
    } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status is required'
      });
    }

    const now = new Date();

    const updatedTimeline = [
      ...(order.timeline || []),
      {
        stage: status,
        title: status.replace(/_/g, ' '),
        description:
          statusNotes ||
          `Order progressed to ${status.replace(/_/g, ' ')}.`,
        timestamp: now
      }
    ];

    order.status = status;
    order.statusNotes = statusNotes || order.statusNotes;
    order.expectedCompletion =
      expectedCompletion || order.expectedCompletion;
    order.timeline = updatedTimeline;

    await order.save();

    // Determine notification type
    let notifType = 'ORDER_UPDATED';

    if (status === 'ORDER_ACCEPTED') notifType = 'ORDER_ACCEPTED';
    else if (status === 'PRINTING_STARTED') notifType = 'PRINTING_STARTED';
    else if (status === 'PRINTING_COMPLETED') notifType = 'PRINTING_COMPLETED';
    else if (status === 'READY_FOR_PICKUP') notifType = 'READY_FOR_PICKUP';
    else if (status === 'OUT_FOR_DELIVERY') notifType = 'OUT_FOR_DELIVERY';
    else if (status === 'DELIVERED') notifType = 'DELIVERED';
    else if (status === 'ORDER_COMPLETED') notifType = 'ORDER_COMPLETED';
    else if (status === 'ORDER_CANCELLED') notifType = 'ORDER_CANCELLED';

    // Notify Customer
    dispatcher.dispatch({
      type: notifType,

      priority:
        status === 'READY_FOR_PICKUP' ||
        status === 'OUT_FOR_DELIVERY'
          ? 'IMPORTANT'
          : 'NORMAL',

      title: `Order #${order.orderId}: ${status.replace(/_/g, ' ')}`,

      message:
        statusNotes ||
        `Your printing job #${order.orderId} is now at stage: ` +
        `${status.replace(/_/g, ' ')}.`,

      userId: String(order.customerId),
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

      idempotencyKey:
        `status_change_${order.orderId}_${status}_${Date.now()}`
    });

    return res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};

// POST /api/orders/:id/cancel-request
const requestCancellation = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (
      String(order.customerId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: 'Unauthorized'
      });
    }

    const { reason } = req.body;

    // Save cancellation request in MongoDB
    const requestDoc = await Request.create({
      type: 'CANCELLATION',
      priority: 'URGENT',
      orderId: order.orderId,

      customerId: String(req.user._id),
      customerName: req.user.name,
      customerEmail: req.user.email,

      reason:
        reason ||
        'Customer requested order cancellation',

      status: 'PENDING'
    });

    // Notify Admin
    dispatcher.dispatch({
      type: 'ORDER_CANCELLED',
      priority: 'URGENT',

      title: `Cancellation Request: Order #${order.orderId}`,

      message:
        `${req.user.name} submitted a cancellation request ` +
        `for Order #${order.orderId}. Reason: ${reason || 'Not specified'}`,

      targetRole: 'ADMIN',

      data: {
        orderId: order.orderId,
        requestId: requestDoc._id,
        actionUrl: '/admin/requests',
        actionText: 'Review Request'
      },

      idempotencyKey: `cancel_req_${requestDoc._id}`
    });

    return res.json({
      success: true,
      message: 'Cancellation request submitted to Admin',
      request: requestDoc
    });

  } catch (error) {
    console.error('Cancellation request error:', error);

    return res.status(500).json({
      message: error.message
    });
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
