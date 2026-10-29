const store = require('../config/store');
const pushService = require('../services/webPushService');
const { getLiveCounters } = require('../services/socketService');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const { category, unreadOnly, limit = 50 } = req.query;

    let notifs = store.getCollection('notifications');

    // Security check: customers see only their own; Admins see ADMIN notifications (and can view their personal if any)
    if (user.role === 'ADMIN') {
      notifs = notifs.filter(n => n.targetRole === 'ADMIN' || n.userId === user._id);
    } else {
      notifs = notifs.filter(n => n.userId === user._id);
    }

    if (unreadOnly === 'true') {
      notifs = notifs.filter(n => !n.read);
    }

    if (category && category !== 'ALL') {
      notifs = notifs.filter(n => {
        if (category === 'ORDERS') return n.type.startsWith('ORDER_') || n.type.includes('PRINTING') || n.type.includes('DELIVERY');
        if (category === 'PAYMENTS') return n.type.startsWith('PAYMENT_');
        if (category === 'REQUESTS') return n.type.startsWith('QUOTATION_') || n.type === 'CUSTOMER_REQUEST' || n.type === 'SUPPORT';
        if (category === 'OFFERS') return n.type === 'OFFER' || n.type === 'COUPON';
        if (category === 'SYSTEM') return n.type === 'WELCOME' || n.type === 'SYSTEM' || n.type === 'ADMIN_ALERT';
        if (category === 'IMPORTANT') return n.priority === 'IMPORTANT' || n.priority === 'URGENT';
        return true;
      });
    }

    const unreadCount = notifs.filter(n => !n.read).length;
    const paginated = notifs.slice(0, Number(limit));

    res.json({
      success: true,
      unreadCount,
      notifications: paginated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notifId = req.params.id;
    const notif = store.findById('notifications', notifId);

    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Security: customer can only mark their own notification as read
    if (req.user.role !== 'ADMIN' && notif.userId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updated = store.findByIdAndUpdate('notifications', notifId, {
      read: true,
      readAt: new Date().toISOString()
    });

    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
  try {
    const user = req.user;
    const allNotifs = store.getCollection('notifications');
    const now = new Date().toISOString();

    allNotifs.forEach(n => {
      const isTarget = user.role === 'ADMIN' ? (n.targetRole === 'ADMIN' || n.userId === user._id) : (n.userId === user._id);
      if (isTarget && !n.read) {
        n.read = true;
        n.readAt = now;
      }
    });

    store.save();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const notifId = req.params.id;
    const notif = store.findById('notifications', notifId);

    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    if (req.user.role !== 'ADMIN' && notif.userId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    store.deleteById('notifications', notifId);
    res.json({ success: true, message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/notifications/vapid-public-key
const getVapidPublicKey = (req, res) => {
  const key = pushService.getPublicKey();
  res.json({ success: true, publicKey: key });
};

// POST /api/notifications/push-subscribe
const subscribePush = async (req, res) => {
  try {
    const { subscription, userAgent, deviceName } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid push subscription object' });
    }

    const userId = req.user._id;

    // Remove duplicates for same endpoint
    const existing = store.findOne('pushSubscriptions', { endpoint: subscription.endpoint });
    if (existing) {
      store.findByIdAndUpdate('pushSubscriptions', existing._id, {
        userId,
        keys: subscription.keys,
        userAgent: userAgent || 'Browser',
        deviceName: deviceName || 'Device',
        updatedAt: new Date().toISOString()
      });
    } else {
      store.create('pushSubscriptions', {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: userAgent || 'Browser',
        deviceName: deviceName || 'Device',
        createdAt: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Push notification subscription registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/notifications/push-unsubscribe
const unsubscribePush = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      const sub = store.findOne('pushSubscriptions', { endpoint });
      if (sub && (req.user.role === 'ADMIN' || sub.userId === req.user._id)) {
        store.deleteById('pushSubscriptions', sub._id);
      }
    }
    res.json({ success: true, message: 'Push subscription removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/notifications/sync-missed
const syncMissed = (req, res) => {
  try {
    const { since } = req.query;
    const user = req.user;
    const sinceTime = since || new Date(Date.now() - 3600000).toISOString();

    const allNotifs = store.getCollection('notifications');
    const missed = allNotifs.filter(n => {
      const isTarget = user.role === 'ADMIN' ? (n.targetRole === 'ADMIN' || n.userId === user._id) : (n.userId === user._id);
      return isTarget && n.createdAt > sinceTime;
    });

    res.json({
      success: true,
      missed,
      counters: getLiveCounters()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  syncMissed
};
