const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Incident type is required'],
    enum: [
      'harassment',
      'theft',
      'suspicious_activity',
      'vandalism',
      'assault',
      'cyber_bullying',
      'drug_activity',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  responseNotes: {
    type: String,
    maxlength: [500, 'Response notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
incidentReportSchema.index({ userId: 1, timestamp: -1 });
incidentReportSchema.index({ status: 1, timestamp: -1 });
incidentReportSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('IncidentReport', incidentReportSchema);
