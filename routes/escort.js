const express = require('express');
const EscortRequest = require('../models/EscortRequest');
const { authenticateToken, checkRole } = require('../middleware/auth');
const loggingService = require('../services/loggingService');

const router = express.Router();

// POST /escort/request - Student creates escort request
router.post('/request', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const { destination, location } = req.body;
    if (!destination || !location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({ success: false, message: 'Destination and valid location are required' });
    }

    const request = new EscortRequest({
      studentId: req.user._id,
      destination,
      location
    });
    await request.save();

    // Log
    await loggingService.log(
      req.user._id,
      'escort_request_created',
      request._id,
      'escort',
      { destination, location },
      req
    );

    // Emit to staff/security
    const io = req.app.get('io');
    if (io) {
      io.emit('escort:new', { request });
    }

    res.status(201).json({ success: true, data: { request } });
  } catch (error) {
    console.error('Create escort request error:', error);
    res.status(500).json({ success: false, message: 'Failed to create escort request' });
  }
});

// GET /escort/requests - List pending requests (staff/security/students)
router.get('/requests', authenticateToken, checkRole(['staff', 'security', 'student']), async (req, res) => {
  try {
    const { status = 'pending', limit = 20 } = req.query;
    const query = status === 'all' ? {} : { status };

    const requests = await EscortRequest.find(query)
      .populate('studentId', 'name email')
      .populate('handledBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: { requests } });
  } catch (error) {
    console.error('List escort requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch escort requests' });
  }
});

// PATCH /escort/requests/:id/accept - Accept request (staff/security/students)
router.patch('/requests/:id/accept', authenticateToken, checkRole(['staff', 'security', 'student']), async (req, res) => {
  try {
    const { id } = req.params;
    const request = await EscortRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Escort request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is not pending' });
    }

    request.status = 'accepted';
    request.handledBy = req.user._id;
    await request.save();

    await loggingService.log(req.user._id, 'escort_request_accepted', request._id, 'escort', {}, req);

    const io = req.app.get('io');
    if (io) io.emit('escort:updated', { request });

    res.json({ success: true, data: { request } });
  } catch (error) {
    console.error('Accept escort request error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept escort request' });
  }
});

// PATCH /escort/requests/:id/decline - Decline request (staff/security/students)
router.patch('/requests/:id/decline', authenticateToken, checkRole(['staff', 'security', 'student']), async (req, res) => {
  try {
    const { id } = req.params;
    const request = await EscortRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Escort request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is not pending' });
    }

    request.status = 'declined';
    request.handledBy = req.user._id;
    await request.save();

    await loggingService.log(req.user._id, 'escort_request_declined', request._id, 'escort', {}, req);

    const io = req.app.get('io');
    if (io) io.emit('escort:updated', { request });

    res.json({ success: true, data: { request } });
  } catch (error) {
    console.error('Decline escort request error:', error);
    res.status(500).json({ success: false, message: 'Failed to decline escort request' });
  }
});

module.exports = router;


