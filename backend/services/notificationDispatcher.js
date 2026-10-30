const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const NotificationDeliveryLog = require('../models/NotificationDeliveryLog');
const NotificationSetting = require('../models/NotificationSetting');
const User = require('../models/User');
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

  dispatch(event) {
    setImmediate(() => {
      this.processEvent(event).catch(err => {
        console.error('[NotificationDispatcher Error]', err);
      });
    });
  }

  async processEvent(event) {
    const {
      type, priority = 'NORMAL', title, message, userId = null,
      customerEmail = null, customerName = null, targetRole = 'CUSTOMER',
      data = {}, idempotencyKey = null, channelsOverride = null
    } = event;

    if (idempotencyKey) {
      if (this.processedEvents.has(idempotencyKey)) {
        console.log(`[NotificationDispatcher] Duplicate event suppressed: ${idempotencyKey}`);
        return { duplicate: true };
      }
      this.processedEvents.add(idempotencyKey);
      if (this.processedEvents.size > 20000) {
        this.processedEvents.delete(this.processedEvents.values().next().value);
      }
    }

    const savedSettings = await NotificationSetting.findOne({ eventType: type }).lean();
    const adminSettings = savedSettings || {
      inApp: true, push: true, email: true, adminSound: true, adminEmail: false
    };
    const channels = channelsOverride ? [...channelsOverride] : [];
    if (!channelsOverride) {
      if (adminSettings.inApp !== false) channels.push('IN_APP');
      if (adminSettings.push !== false) channels.push('WEB_PUSH');
      if (adminSettings.email !== false) channels.push('EMAIL');
      if (targetRole === 'ADMIN' && adminSettings.adminSound) channels.push('SOUND_ALERT_FOR_ADMIN');
      if (targetRole === 'ADMIN') channels.push('REAL_TIME_ADMIN');
    }

    const category = TYPE_TO_CATEGORY[type] || 'system';
    const isEssential = ESSENTIAL_TYPES.includes(type);
    let allowEmail = true, allowPush = true, allowInApp = true;

    if (userId && targetRole === 'CUSTOMER' && !isEssential) {
      const prefs = await NotificationPreference.findOne({ userId }).lean();
      if (prefs) {
        if (prefs.email?.[category] === false) allowEmail = false;
        if (prefs.push?.[category] === false) allowPush = false;
        if (prefs.inApp?.[category] === false) allowInApp = false;
      }
    }

    let notifRecord = null;
    if (channels.includes('IN_APP') && allowInApp) {
      notifRecord = await Notification.create({
        type, priority, title, message, userId: userId || null, targetRole,
        data: {
          orderId: data.orderId || null, paymentId: data.paymentId || null,
          requestId: data.requestId || null,
          actionUrl: data.actionUrl || (data.orderId ? `/orders/${data.orderId}` : null),
          actionText: data.actionText || 'View Details', ...data
        },
        channels, read: false, acknowledged: false
      });
      await NotificationDeliveryLog.create({
        notificationId: notifRecord._id, eventType: type,
        recipient: userId || targetRole, channel: 'IN_APP',
        status: 'DELIVERED', retryCount: 0, timestamp: new Date()
      });
      if (targetRole === 'ADMIN') broadcastToAdmin('admin:notification', notifRecord);
      else if (userId) sendToUser(userId, 'notification:received', notifRecord);
    }

    if (targetRole === 'ADMIN' || channels.includes('REAL_TIME_ADMIN')) {
      sendLiveCountersToAdmin();
      if (type === 'ORDER_CREATED') {
        broadcastToAdmin('admin:new-order', {
          orderId: data.orderId, customerName: customerName || data.customerName,
          amount: data.totalAmount || data.amount,
          sound: channels.includes('SOUND_ALERT_FOR_ADMIN') ? 'ORDER' : null,
          notification: notifRecord, priority: 'IMPORTANT'
        });
      } else if (type === 'PAYMENT_SUBMITTED') {
        broadcastToAdmin('admin:payment-submitted', {
          orderId: data.orderId, customerName: customerName || data.customerName,
          amount: data.amount || data.paymentAmount, paymentMode: data.paymentMode,
          sound: channels.includes('SOUND_ALERT_FOR_ADMIN') ? 'PAYMENT' : null,
          notification: notifRecord, priority: 'IMPORTANT'
        });
      } else if (['CUSTOMER_REQUEST', 'ORDER_CANCELLED', 'QUOTATION_CREATED'].includes(type)) {
        broadcastToAdmin('admin:request-alert', {
          requestId: data.requestId || data.orderId, type,
          sound: channels.includes('SOUND_ALERT_FOR_ADMIN') ? 'REQUEST' : null,
          notification: notifRecord, priority: priority === 'URGENT' ? 'URGENT' : 'IMPORTANT'
        });
      }
    }

    if (channels.includes('WEB_PUSH') && allowPush && userId) {
      await NotificationDeliveryLog.create({
        notificationId: notifRecord?._id || null, eventType: type,
        recipient: userId, channel: 'WEB_PUSH', status: 'QUEUED', retryCount: 0
      });
      try {
        const result = await pushService.sendPushNotification({
          userId, title, body: message,
          data: {
            type, priority, orderId: data.orderId || null,
            actionUrl: data.actionUrl || (data.orderId ? `/orders/${data.orderId}` : '/notifications')
          }, priority
        });
        await NotificationDeliveryLog.create({
          notificationId: notifRecord?._id || null, eventType: type,
          recipient: userId, channel: 'WEB_PUSH',
          status: result.sentCount > 0 ? 'DELIVERED' : (result.simulated ? 'SIMULATED' : 'SENT'),
          details: result, retryCount: 0
        });
      } catch (err) {
        await NotificationDeliveryLog.create({
          notificationId: notifRecord?._id || null, eventType: type,
          recipient: userId, channel: 'WEB_PUSH', status: 'FAILED',
          error: err.message, retryCount: 0
        });
      }
    }

    const recipientEmail = customerEmail || (userId ? await this.getUserEmail(userId) : null);
    if (channels.includes('EMAIL') && allowEmail && recipientEmail) {
      try {
        const emailResult = await brevoService.sendEmail({
          to: recipientEmail, toName: customerName || 'Valued Customer',
          templateType: type,
          variables: { customerName: customerName || 'Valued Customer', title, message, ...data },
          relatedOrderId: data.orderId || null, relatedCustomerId: userId || null
        });
        await NotificationDeliveryLog.create({
          notificationId: notifRecord?._id || null, eventType: type,
          recipient: recipientEmail, channel: 'EMAIL',
          status: emailResult.success ? 'DELIVERED' : 'FAILED',
          details: emailResult, error: emailResult.error || null, retryCount: 0
        });
      } catch (err) {
        console.error('[Brevo Dispatch Error]', err);
      }
    }

    if (targetRole === 'ADMIN' && adminSettings.adminEmail) {
      const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@sriramuprinting.com';
      await brevoService.sendEmail({
        to: adminEmail, toName: 'Admin Team', templateType: type,
        customSubject: `[Admin Alert] ${title}`,
        variables: { customerName: customerName || 'Customer', title, message, ...data },
        relatedOrderId: data.orderId || null
      }).catch(err => console.error('[Admin Email Error]', err));
    }

    return { success: true, notifId: notifRecord ? notifRecord._id : null };
  }

  async getUserEmail(userId) {
    const user = await User.findById(userId).select('email').lean();
    return user?.email || null;
  }
}

const dispatcher = new NotificationDispatcher();
module.exports = dispatcher;
