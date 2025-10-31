const mongoose = require('mongoose');

const escortRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed'], default: 'pending' },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responseNotes: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('EscortRequest', escortRequestSchema);


