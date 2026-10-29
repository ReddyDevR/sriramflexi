const store = require('../config/store');
const brevoService = require('./brevoEmailService');
const pushService = require('./webPushService');
const { broadcastToAdmin, sendToUser, sendLiveCountersToAdmin } = require('./socketService');

// Map notification types to preference categories
const TYPE_TO_CATEGORY = {
  ORDER_CREATED: 'orders',
  ORDER_ACCEPTED: 'orders',
  ORDER_UPDATED: 'orders',
  ORDER_CANCELLED: 'orders',
  ORDER_REJECTED: 'orders',
  ORDER_COMPLETED: 'orders',
  DESIGN_UPDATE: 'orders',
  PRINTING_STARTED: 'orders',
  PRINTING_COMPLETED: 'orders',
  READY_FOR_PICKUP: 'orders',
  OUT_FOR_DELIVERY: 'orders',
  DELIVERED: 'orders',
  REFUND: 'orders',
  PAYMENT_SUBMITTED: 'payments',
  PAYMENT_VERIFIED: 'payments',
  PAYMENT_REJECTED: 'payments',
  QUOTATION_CREATED: 'requests',
  QUOTATION_UPDATED: 'requests',
  QUOTATION_ACCEPTED: 'requests',
  CUSTOMER_REQUEST: 'requests',
  SUPPORT: 'requests',
  COUPON: 'offers',
  OFFER: 'offers',
  WELCOME: 'system',
  SYSTEM: 'system',
  ADMIN_ALERT: 'system'
};

// Essential transactional types that cannot be disabled by user preferences
const ESSENTIAL_TYPES = [
  'PAYMENT_VERIFIED',
  'PAYMENT_REJECTED',
  'ORDER_CREATED',
  'ORDER_ACCEPTED',
  'ORDER_CANCELLED',
  'REFUND'
];

class NotificationDispatcher {
  constructor() {
    this.processedEvents = new Set();
  }

  /**
   * Main dispatch function
   * Executes asynchronously without blocking the caller
   */
  dispatch(event) {
    // Non-blocking asynchronous queue execution
    setImmediate(() => {
      this.processEvent(event).catch(err => {
        console.error('[NotificationDispatcher Error]', err);
      });
    });
  }

  async processEvent(event) {
    const {
      type,
      priority = 'NORMAL',
      title,
      message,
      userId = null,
      customerEmail = null,
      customerName = null,
      targetRole = 'CUSTOMER', // 'CUSTOMER' or 'ADMIN'
      data = {},
      idempotencyKey = null,
      channelsOverride = null
    } = event;

    // 1. Duplicate Prevention / Idempotency Check
    if (idempotencyKey) {
      if (this.processedEvents.has(idempotencyKey)) {
        console.log(`[NotificationDispatcher] Duplicate event suppressed: ${idempotencyKey}`);
        return { duplicate: true };
      }
      this.processedEvents.add(idempotencyKey);
      // Keep set from growing infinitely
      if (this.processedEvents.size > 20000) {
        const firstKey = this.processedEvents.values().next().value;
        this.processedEvents.delete(firstKey);
      }
    }

    // 2. Fetch Admin settings for this event type
    const adminSettings = store.getSettings()[type] || {
      inApp: true,
      push: true,
      email: true,
      adminSound: true,
      adminEmail: false
    };

    // Determine channels
    const channels = channelsOverride || [];
    if (!channelsOverride) {
      if (adminSettings.inApp) channels.push('IN_APP');
      if (adminSettings.push) channels.push('WEB_PUSH');
      if (adminSettings.email) channels.push('EMAIL');
      if (targetRole === 'ADMIN' && adminSettings.adminSound) channels.push('SOUND_ALERT_FOR_ADMIN');
      if (targetRole === 'ADMIN') channels.push('REAL_TIME_ADMIN');
    }

    // 3. User Preference Check (for Customers)
    const category = TYPE_TO_CATEGORY[type] || 'system';
    const isEssential = ESSENTIAL_TYPES.includes(type);

    let allowEmail = true;
    let allowPush = true;
    let allowInApp = true;

    if (userId && targetRole === 'CUSTOMER' && !isEssential) {
      const prefs = store.findOne('notificationPreferences', { userId });
      if (prefs) {
        if (prefs.email && prefs.email[category] === false) allowEmail = false;
        if (prefs.push && prefs.push[category] === false) allowPush = false;
        if (prefs.inApp && prefs.inApp[category] === false) allowInApp = false;
      }
    }

    // 4. Create In-App Notification Record in Database
    let notifRecord = null;
    if (channels.includes('IN_APP') && allowInApp) {
      notifRecord = store.create('notifications', {
        type,
        priority,
        title,
        message,
        userId: userId || null,
        targetRole,
        data: {
          orderId: data.orderId || null,
          paymentId: data.paymentId || null,
          requestId: data.requestId || null,
          actionUrl: data.actionUrl || (data.orderId ? `/orders/${data.orderId}` : null),
          actionText: data.actionText || 'View Details',
          ...data
        },
        channels,
        read: false,
        acknowledged: false,
        createdAt: new Date().toISOString()
      });

      // Log delivery status
      store.create('notificationDeliveryLogs', {
        notificationId: notifRecord._id,
        eventType: type,
        recipient: userId || targetRole,
        channel: 'IN_APP',
        status: 'DELIVERED',
        retryCount: 0,
        timestamp: new Date().toISOString()
      });

      // Real-time deliver via Socket
      if (targetRole === 'ADMIN') {
        broadcastToAdmin('admin:notification', notifRecord);
      } else if (userId) {
        sendToUser(userId, 'notification:received', notifRecord);
      }
    }

    // 5. Admin Real-Time Events & Sound Alerts
    if (targetRole === 'ADMIN' || channels.includes('REAL_TIME_ADMIN')) {
      sendLiveCountersToAdmin();

      if (type === 'ORDER_CREATED') {
        broadcastToAdmin('admin:new-order', {
          orderId: data.orderId,
          customerName: customerName || data.customerName,
          amount: data.totalAmount || data.amount,
          sound: channels.includes('SOUND_ALERT_FOR_ADMIN') ? 'ORDER' : null,
          notification: notifRecord,
          priority: 'IMPORTANT'
        });
      } else if (type === 'PAYMENT_SUBMITTED') {
        broadcastToAdmin('admin:payment-submitted', {
          orderId: data.orderId,
          customerName: customerName || data.customerName,
          amount: data.amount || data.paymentAmount,
          paymentMode: data.paymentMode,
          sound: channels.includes('SOUND_ALERT_FOR_ADMIN') ? 'PAYMENT' : null,
          notification: notifRecord,
          priority: 'IMPORTANT'
        });
      } else if (type === 'CUSTOMER_REQUEST' || type === 'ORDER_CANCELLED' || type === 'QUOTATION_CREATED') {
        broadcastToAdmin('admin:request-alert', {
          requestId: data.requestId || data.orderId,
          type,
          sound: channels.includes('SOUND_ALERT_FOR_ADMIN') ? 'REQUEST' : null,
          notification: notifRecord,
          priority: priority === 'URGENT' ? 'URGENT' : 'IMPORTANT'
        });
      }
    }

    // 6. Web Push Delivery
    if (channels.includes('WEB_PUSH') && allowPush && userId) {
      store.create('notificationDeliveryLogs', {
        notificationId: notifRecord ? notifRecord._id : null,
        eventType: type,
        recipient: userId,
        channel: 'WEB_PUSH',
        status: 'QUEUED',
        retryCount: 0,
        timestamp: new Date().toISOString()
      });

      pushService.sendPushNotification({
        userId,
        title,
        body: message,
        data: {
          type,
          priority,
          orderId: data.orderId || null,
          actionUrl: data.actionUrl || (data.orderId ? `/orders/${data.orderId}` : '/notifications')
        },
        priority
      }).then(res => {
        store.create('notificationDeliveryLogs', {
          notificationId: notifRecord ? notifRecord._id : null,
          eventType: type,
          recipient: userId,
          channel: 'WEB_PUSH',
          status: res.sentCount > 0 ? 'DELIVERED' : 'SENT',
          details: res,
          retryCount: 0,
          timestamp: new Date().toISOString()
        });
      }).catch(err => {
        store.create('notificationDeliveryLogs', {
          notificationId: notifRecord ? notifRecord._id : null,
          eventType: type,
          recipient: userId,
          channel: 'WEB_PUSH',
          status: 'FAILED',
          error: err.message,
          retryCount: 0,
          timestamp: new Date().toISOString()
        });
      });
    }

    // 7. Brevo Email Delivery
    const recipientEmail = customerEmail || (userId ? this.getUserEmail(userId) : null);
    if (channels.includes('EMAIL') && allowEmail && recipientEmail) {
      brevoService.sendEmail({
        to: recipientEmail,
        toName: customerName || 'Valued Customer',
        templateType: type,
        variables: {
          customerName: customerName || 'Valued Customer',
          title,
          message,
          ...data
        },
        relatedOrderId: data.orderId || null,
        relatedCustomerId: userId || null
      }).then(emailResult => {
        store.create('notificationDeliveryLogs', {
          notificationId: notifRecord ? notifRecord._id : null,
          eventType: type,
          recipient: recipientEmail,
          channel: 'EMAIL',
          status: emailResult.success ? 'DELIVERED' : 'FAILED',
          details: emailResult,
          error: emailResult.error || null,
          retryCount: 0,
          timestamp: new Date().toISOString()
        });
      }).catch(err => {
        console.error('[Brevo Dispatch Error]', err);
      });
    }

    // 8. Admin Email (if configured)
    if (targetRole === 'ADMIN' && adminSettings.adminEmail) {
      const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@sriramuprinting.com';
      brevoService.sendEmail({
        to: adminEmail,
        toName: 'Admin Team',
        templateType: type,
        customSubject: `[Admin Alert] ${title}`,
        variables: {
          customerName: customerName || 'Customer',
          title,
          message,
          ...data
        },
        relatedOrderId: data.orderId || null
      }).catch(err => console.error('[Admin Email Error]', err));
    }

    return { success: true, notifId: notifRecord ? notifRecord._id : null };
  }

  getUserEmail(userId) {
    const user = store.findById('users', userId);
    return user ? user.email : null;
  }
}

const dispatcher = new NotificationDispatcher();
module.exports = dispatcher;
