const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  category: String,
  quantity: Number,
  unit: String,
  unitPrice: Number,

  dimensions: {
    width: Number,
    height: Number,
    sqft: Number
  },

  lineTotal: Number
}, { _id: false, strict: false });


const timelineSchema = new mongoose.Schema({
  stage: String,
  title: String,
  description: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false, strict: false });


const orderSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  orderId: {
    type: String,
    unique: true,
    index: true
  },

  customerId: {
    type: String,
    required: true,
    index: true
  },

  customerName: String,
  customerEmail: String,
  customerPhone: String,

  items: [orderItemSchema],

  subtotal: {
    type: Number,
    default: 0
  },

  discount: {
    type: Number,
    default: 0
  },

  couponCode: String,

  totalAmount: {
    type: Number,
    default: 0
  },

  paymentMode: String,

  paymentStatus: {
    type: String,
    default: 'PENDING'
  },

  status: {
    type: String,
    default: 'PENDING'
  },

  timeline: [timelineSchema],

  deliveryAddress: mongoose.Schema.Types.Mixed,

  notes: String,

  cancellationReason: String,

  completedAt: Date

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model('Order', orderSchema);
