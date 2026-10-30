const mongoose = require('mongoose');

const deliveryLogSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  notificationId: {
    type: String,
    index: true
  },

  eventType: {
    type: String,
    index: true
  },

  recipient: {
    type: String,
    index: true
  },

  channel: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: 'QUEUED'
  },

  retryCount: {
    type: Number,
    default: 0
  },

  timestamp: {
    type: Date,
    default: Date.now
  },

  errorMessage: String,

  providerResponse: mongoose.Schema.Types.Mixed

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model(
  'NotificationDeliveryLog',
  deliveryLogSchema
);
