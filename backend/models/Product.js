const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    unit: {
      type: String,
      default: 'sq.ft'
    },

    minQuantity: {
      type: Number,
      default: 1
    },

    description: {
      type: String,
      default: ''
    },

    features: {
      type: [String],
      default: []
    },

    badge: {
      type: String,
      default: 'New'
    },

    leadTimeDays: {
      type: Number,
      default: 1
    },

    image: {
      type: String,
      default: ''
    },

    isUsed: {
      type: Boolean,
      default: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
