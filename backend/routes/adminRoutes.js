const express = require('express');
const router = express.Router();
const {
  getDeliveryLogs,
  getEmailLogs,
  retryFailedNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationAnalytics,
  createAnnouncement,
  triggerSimulationScenario
} = require('../controllers/adminNotificationController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect, requireAdmin);

router.get('/notifications/delivery-logs', getDeliveryLogs);
router.get('/notifications/email-logs', getEmailLogs);
router.post('/notifications/retry/:logId', retryFailedNotification);
router.get('/notifications/settings', getNotificationSettings);
router.put('/notifications/settings', updateNotificationSettings);
router.get('/notifications/analytics', getNotificationAnalytics);
router.post('/announcements', createAnnouncement);
router.post('/test-scenario', triggerSimulationScenario);

module.exports = router;
