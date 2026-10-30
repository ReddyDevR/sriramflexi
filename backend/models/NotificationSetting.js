const mongoose = require('mongoose');

const notificationSettingSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  eventType: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  inApp: {
    type: Boolean,
    default: true
  },

  push: {
    type: Boolean,
    default: true
  },

  email: {
    type: Boolean,
    default: true
  },

  adminSound: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model(
  'NotificationSetting',
  notificationSettingSchema
);
