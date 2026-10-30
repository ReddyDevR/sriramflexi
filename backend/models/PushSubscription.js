const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  userId: {
    type: String,
    required: true,
    index: true
  },

  deviceType: {
    type: String,
    default: 'UNKNOWN'
  },

  subscription: {
    endpoint: {
      type: String,
      required: true
    },

    expirationTime: {
      type: Number,
      default: null
    },

    keys: {
      p256dh: String,
      auth: String
    }
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastUsedAt: Date

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model(
  'PushSubscription',
  pushSubscriptionSchema
);
