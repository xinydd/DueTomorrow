const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'signup',
      'login',
      'logout',
      'sos_triggered',
      'sos_acknowledged',
      'sos_resolved',
      'sos_escalated',
      'report_submitted',
      'report_closed',
      'user_created',
      'user_updated',
      'user_deactivated'
    ]
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Not all actions have a target
  },
  targetType: {
    type: String,
    enum: ['sos', 'report', 'user'],
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ action: 1, timestamp: -1 });
logSchema.index({ targetId: 1, targetType: 1 });

module.exports = mongoose.model('Log', logSchema);
