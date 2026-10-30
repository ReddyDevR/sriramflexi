const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  orderId: {
    type: String,
    required: true,
    index: true
  },

  customerId: {
    type: String,
    required: true,
    index: true
  },

  customerName: String,

  customerEmail: String,

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  paymentMode: {
    type: String,
    default: 'UPI_QR'
  },

  transactionId: String,

  status: {
    type: String,
    default: 'PENDING'
  },

  submittedAt: Date,

  verifiedAt: Date,

  rejectedAt: Date,

  rejectionReason: String,

  paymentProof: String,

  notes: String

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model('Payment', paymentSchema);
