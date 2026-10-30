const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },

    price: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isUsed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model('Product', productSchema);
