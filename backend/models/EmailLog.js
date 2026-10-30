const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  eventType: {
    type: String,
    index: true
  },

  recipient: {
    type: String,
    required: true,
    index: true
  },

  recipientName: String,

  subject: String,

  relatedOrderId: String,

  relatedCustomerId: String,

  provider: {
    type: String,
    default: 'BREVO'
  },

  providerStatus: {
    type: String,
    default: 'PENDING'
  },

  htmlPreview: String,

  retryCount: {
    type: Number,
    default: 0
  },

  timestamp: {
    type: Date,
    default: Date.now
  },

  notes: String,

  errorMessage: String,

  providerMessageId: String

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model('EmailLog', emailLogSchema);
