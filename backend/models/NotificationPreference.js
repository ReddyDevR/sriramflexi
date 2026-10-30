const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  email: {
    orders: {
      type: Boolean,
      default: true
    },

    payments: {
      type: Boolean,
      default: true
    },

    offers: {
      type: Boolean,
      default: true
    },

    system: {
      type: Boolean,
      default: true
    }
  },

  push: {
    orders: {
      type: Boolean,
      default: true
    },

    payments: {
      type: Boolean,
      default: true
    },

    offers: {
      type: Boolean,
      default: true
    },

    system: {
      type: Boolean,
      default: true
    }
  },

  inApp: {
    orders: {
      type: Boolean,
      default: true
    },

    payments: {
      type: Boolean,
      default: true
    },

    offers: {
      type: Boolean,
      default: true
    },

    system: {
      type: Boolean,
      default: true
    }
  }

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model(
  'NotificationPreference',
  preferenceSchema
);
