const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  discountPercent: {
    type: Number,
    default: 0
  },

  maxDiscount: {
    type: Number,
    default: 0
  },

  minAmount: {
    type: Number,
    default: 0
  },

  description: String,

  validUntil: Date,

  isActive: {
    type: Boolean,
    default: true
  },

  usageLimit: Number,

  usedCount: {
    type: Number,
    default: 0
  },

  applicableProducts: [String]

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model('Coupon', couponSchema);
