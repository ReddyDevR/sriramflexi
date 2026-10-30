const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  target: {
    type: String,
    default: 'ALL'
  },

  targetUsers: {
    type: [String],
    default: []
  },

  priority: {
    type: String,
    default: 'NORMAL'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  startDate: Date,

  endDate: Date,

  createdBy: String

}, {
  timestamps: true,
  strict: false
});


module.exports = mongoose.model(
  'Announcement',
  announcementSchema
);
