const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  syncMissed
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);
router.get('/vapid-public-key', getVapidPublicKey);
router.post('/push-subscribe', protect, subscribePush);
router.post('/push-unsubscribe', protect, unsubscribePush);
router.get('/sync-missed', protect, syncMissed);

module.exports = router;
