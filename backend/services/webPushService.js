const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

class WebPushService {
  constructor() {
    this.configured = false;
    this.init();
  }

  init() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:support@sriramuprinting.com';
    if (publicKey && privateKey) {
      try {
        webpush.setVapidDetails(subject, publicKey, privateKey);
        this.configured = true;
        console.log('✅ Web Push Service initialized with VAPID configuration');
      } catch (err) {
        console.warn('⚠️ Web Push VAPID configuration warning:', err.message);
      }
    } else {
      console.warn('⚠️ VAPID keys missing in environment variables. Web Push running in simulation mode.');
    }
  }

  getPublicKey() {
    return process.env.VAPID_PUBLIC_KEY || '';
  }

  async sendPushNotification({ userId, title, body, data = {}, priority = 'NORMAL' }) {
    if (!this.configured) {
      console.log(`[WebPush Mock] Push notification logged for user ${userId}: "${title}" - ${body}`);
      return { success: true, simulated: true, sentCount: 0, failedCount: 0, count: 0 };
    }

    const subscriptions = await PushSubscription.find({ userId, isActive: { $ne: false } });
    if (!subscriptions.length) {
      return { success: true, message: 'No push subscriptions found for this user', sentCount: 0, failedCount: 0 };
    }

    const payload = JSON.stringify({
      title, body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        url: data.actionUrl || data.url || '/orders',
        orderId: data.orderId || null,
        type: data.type || 'SYSTEM', priority, timestamp: Date.now(), ...data
      }
    });

    const results = [];
    for (const sub of subscriptions) {
      const storedSubscription = sub.subscription || {};
      const pushSubscription = {
        endpoint: storedSubscription.endpoint,
        keys: storedSubscription.keys
      };
      try {
        await webpush.sendNotification(pushSubscription, payload, {
          TTL: 60 * 60 * 24,
          urgency: priority === 'URGENT' ? 'high' : 'normal'
        });
        sub.lastUsedAt = new Date();
        await sub.save();
        results.push({ subscriptionId: sub._id, status: 'DELIVERED' });
      } catch (error) {
        console.error(`[WebPush Error] Endpoint ${(storedSubscription.endpoint || '').slice(0, 30)}...:`, error.statusCode, error.message);
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`[WebPush] Removing expired subscription ${sub._id}`);
          await PushSubscription.deleteOne({ _id: sub._id });
        }
        results.push({ subscriptionId: sub._id, status: 'FAILED', error: error.message });
      }
    }
    return {
      success: true,
      sentCount: results.filter(r => r.status === 'DELIVERED').length,
      failedCount: results.filter(r => r.status === 'FAILED').length,
      details: results
    };
  }
}

const pushService = new WebPushService();
module.exports = pushService;
