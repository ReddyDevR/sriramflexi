const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({

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

  customerId: {
    type: String,
    required: true,
    index: true
  },

  customerName: String,

  customerEmail: String,

  customerPhone: String,

  serviceName: String,

  dimensions: mongoose.Schema.Types.Mixed,

  description: String,

  status: {
    type: String,
    default: 'PENDING'
  },

  adminResponse: String,

  assignedTo: String,

  completedAt: Date,

  attachments: [String],

  notes: String

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model('Request', requestSchema);
