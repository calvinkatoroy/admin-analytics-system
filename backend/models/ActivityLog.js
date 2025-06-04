const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'register',
      'view_product', 'add_to_cart', 'purchase',
      'search', 'profile_update', 'password_change',
      'admin_action', 'export_data'
    ]
  },
  resource: {
    type: String, // product_id, search_term, etc.
  },
  resourceType: {
    type: String,
    enum: ['product', 'user', 'order', 'search', 'system']
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Additional context
  },
  sessionId: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Time-series optimized indexes
activityLogSchema.index({ timestamp: -1, userId: 1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ sessionId: 1 });

// TTL index to automatically delete old logs after 90 days
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);