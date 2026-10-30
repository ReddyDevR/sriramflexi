const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const pushService = require('../services/webPushService');
const { getLiveCounters } = require('../services/socketService');

const visibleFilter = (user) => user.role === 'ADMIN'
  ? { $or: [{ targetRole: 'ADMIN' }, { userId: String(user._id) }] }
  : { userId: String(user._id) };

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const { category, unreadOnly, limit = 50 } = req.query;
    const filter = visibleFilter(req.user);
    if (unreadOnly === 'true') filter.read = false;
    if (category && category !== 'ALL') {
      const categoryMap = {
        ORDERS: { $or: [{ type: /^ORDER_/ }, { type: /PRINTING/ }, { type: /DELIVERY/ }] },
        PAYMENTS: { type: /^PAYMENT_/ },
        REQUESTS: { $or: [{ type: /^QUOTATION_/ }, { type: { $in: ['CUSTOMER_REQUEST', 'SUPPORT'] } }] },
        OFFERS: { type: { $in: ['OFFER', 'COUPON'] } },
        SYSTEM: { type: { $in: ['WELCOME', 'SYSTEM', 'ADMIN_ALERT'] } },
        IMPORTANT: { priority: { $in: ['IMPORTANT', 'URGENT'] } }
      };
      if (categoryMap[category]) Object.assign(filter, categoryMap[category]);
    }
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));
    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(safeLimit),
      Notification.countDocuments({ ...visibleFilter(req.user), read: false })
    ]);
    return res.json({ success: true, unreadCount, notifications });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    if (req.user.role !== 'ADMIN' && String(notif.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    if (req.user.role === 'ADMIN' && notif.targetRole !== 'ADMIN' && String(notif.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    notif.read = true; notif.isRead = true; notif.readAt = new Date();
    await notif.save();
    return res.json({ success: true, notification: notif });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// PUT /api/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
  try { await Notification.updateMany(visibleFilter(req.user), { $set: { read: true, isRead: true, readAt: new Date() } }); return res.json({ success: true, message: 'All notifications marked as read' }); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    if (req.user.role !== 'ADMIN' && String(notif.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    if (req.user.role === 'ADMIN' && notif.targetRole !== 'ADMIN' && String(notif.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    await Notification.deleteOne({ _id: notif._id });
    return res.json({ success: true, message: 'Notification removed' });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// GET /api/notifications/vapid-public-key
const getVapidPublicKey = (req, res) => res.json({ success: true, publicKey: pushService.getPublicKey() });

// POST /api/notifications/push-subscribe
const subscribePush = async (req, res) => {
  try {
    const { subscription, userAgent, deviceName } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) return res.status(400).json({ message: 'Invalid push subscription object' });
    await PushSubscription.findOneAndUpdate(
      { 'subscription.endpoint': subscription.endpoint },
      { $set: { userId: String(req.user._id), subscription, deviceType: deviceName || userAgent || 'BROWSER', isActive: true, lastUsedAt: new Date(), userAgent: userAgent || 'Browser', deviceName: deviceName || 'Device' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, message: 'Push notification subscription registered successfully' });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// POST /api/notifications/push-unsubscribe
const unsubscribePush = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      const filter = { 'subscription.endpoint': endpoint };
      if (req.user.role !== 'ADMIN') filter.userId = String(req.user._id);
      await PushSubscription.deleteOne(filter);
    }
    return res.json({ success: true, message: 'Push subscription removed' });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// GET /api/notifications/sync-missed
const syncMissed = async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 3600000);
    if (Number.isNaN(since.getTime())) return res.status(400).json({ message: 'Invalid since date' });
    const missed = await Notification.find({ ...visibleFilter(req.user), createdAt: { $gt: since } }).sort({ createdAt: 1 }).limit(200);
    return res.json({ success: true, missed, counters: getLiveCounters() });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, getVapidPublicKey, subscribePush, unsubscribePush, syncMissed };
