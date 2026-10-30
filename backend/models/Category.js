const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
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

    slug: {
      type: String,
      trim: true
    },

    icon: {
      type: String,
      default: '📁'
    },

    description: {
      type: String,
      default: ''
    },

    image: {
      type: String,
      default: ''
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

module.exports = mongoose.model('Category', categorySchema);
