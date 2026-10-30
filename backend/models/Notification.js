const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  type: {
    type: String,
    required: true,
    index: true
  },

  priority: {
    type: String,
    default: 'NORMAL'
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  userId: {
    type: String,
    default: null,
    index: true
  },

  targetRole: {
    type: String,
    default: 'CUSTOMER'
  },

  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  channels: {
    type: [String],
    default: ['IN_APP']
  },

  read: {
    type: Boolean,
    default: false
  },

  acknowledged: {
    type: Boolean,
    default: false
  },

  isRead: {
    type: Boolean,
    default: false
  },

  readAt: Date,

  actionUrl: String,

  actionText: String

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model('Notification', notificationSchema);
