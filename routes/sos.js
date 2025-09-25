const express = require('express');
const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { sosLimiter } = require('../middleware/rateLimiter');
const { validateLocation } = require('../middleware/validation');
const loggingService = require('../services/loggingService');
const guardianService = require('../services/guardianService');

const router = express.Router();

// POST /sos - Create SOS alert (students only)
router.post('/', 
  authenticateToken, 
  checkRole(['student']), 
  sosLimiter, 
  validateLocation, 
  async (req, res) => {
    try {
      const { lat, lng } = req.body;
      const userId = req.user._id;

      // Check for recent SOS alerts (additional throttling beyond rate limiter)
      const recentAlert = await SOSAlert.findOne({
        userId,
        status: 'active',
        timestamp: { $gte: new Date(Date.now() - 30 * 1000) } // 30 seconds
      });

      if (recentAlert) {
        return res.status(429).json({
          success: false,
          message: 'SOS alert already sent recently. Please wait 30 seconds before sending another alert.'
        });
      }

      // Create new SOS alert
      const sosAlert = new SOSAlert({
        userId,
        location: { lat, lng }
      });

      await sosAlert.save();

      // Populate user data for response
      await sosAlert.populate('userId', 'name email role');

      // Find nearest Guardian Angels using location-based matching
      const nearestGuardians = await guardianService.findNearestGuardians(lat, lng, 3);
      
      // Log the SOS trigger
      await loggingService.log(
        req.user._id,
        'sos_triggered',
        sosAlert._id,
        'sos',
        { location: { lat, lng }, nearestGuardians: nearestGuardians.length },
        req
      );

      // Emit real-time event to nearest Guardian Angels only
      const io = req.app.get('io');
      if (io) {
        // Emit to nearest Guardian Angels
        nearestGuardians.forEach(guardian => {
          io.to(`guardian-${guardian._id}`).emit('newSOS', {
            alert: sosAlert,
            user: {
              id: req.user._id,
              name: req.user.name,
              email: req.user.email,
              role: req.user.role
            },
            guardian: guardian
          });
        });

        // Set up escalation timer (60 seconds)
        setTimeout(async () => {
          const updatedAlert = await SOSAlert.findById(sosAlert._id);
          if (updatedAlert && updatedAlert.status === 'active') {
            // Escalate the alert
            updatedAlert.status = 'escalated';
            updatedAlert.escalatedAt = new Date();
            await updatedAlert.save();

            // Notify all staff and security users
            const allGuardians = await guardianService.getAllActiveGuardians();
            allGuardians.forEach(guardian => {
              io.to(`guardian-${guardian._id}`).emit('sosEscalated', {
                alert: updatedAlert,
                user: {
                  id: req.user._id,
                  name: req.user.name,
                  email: req.user.email,
                  role: req.user.role
                }
              });
            });

            // Log escalation
            await loggingService.log(
              req.user._id,
              'sos_escalated',
              sosAlert._id,
              'sos',
              { escalatedAt: new Date() },
              req
            );
          }
        }, 60000); // 60 seconds
      }

      res.status(201).json({
        success: true,
        message: 'SOS alert sent successfully. Security has been notified.',
        data: { alert: sosAlert }
      });

    } catch (error) {
      console.error('SOS alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send SOS alert'
      });
    }
  }
);

// GET /alerts - Get all active SOS alerts (security only)
router.get('/', authenticateToken, checkRole(['security']), async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const alerts = await SOSAlert.find(query)
      .populate('userId', 'name email role')
      .populate('resolvedBy', 'name role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SOSAlert.countDocuments(query);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alerts'
    });
  }
});

// PATCH /:id/acknowledge - Acknowledge SOS alert (staff/security only)
router.patch('/:id/acknowledge', 
  authenticateToken, 
  checkRole(['staff', 'security']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const acknowledgedBy = req.user._id;

      const alert = await SOSAlert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'SOS alert not found'
        });
      }

      if (alert.status === 'resolved') {
        return res.status(400).json({
          success: false,
          message: 'SOS alert is already resolved'
        });
      }

      if (alert.status === 'acknowledged' && alert.acknowledgedBy.toString() === acknowledgedBy.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You have already acknowledged this alert'
        });
      }

      // Update alert
      alert.status = 'acknowledged';
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();

      await alert.save();

      // Log the acknowledgment
      await loggingService.log(
        req.user._id,
        'sos_acknowledged',
        alert._id,
        'sos',
        { acknowledgedAt: new Date() },
        req
      );

      // Populate data for response
      await alert.populate('userId', 'name email role');
      await alert.populate('acknowledgedBy', 'name role');

      // Emit acknowledgment event
      const io = req.app.get('io');
      if (io) {
        io.emit('sosAcknowledged', {
          alert,
          acknowledgedBy: req.user
        });
      }

      res.json({
        success: true,
        message: 'SOS alert acknowledged successfully',
        data: { alert }
      });

    } catch (error) {
      console.error('Acknowledge alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to acknowledge alert'
      });
    }
  }
);

// PATCH /:id/resolve - Resolve SOS alert (security only)
router.patch('/:id/resolve', 
  authenticateToken, 
  checkRole(['security']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const resolvedBy = req.user._id;

      const alert = await SOSAlert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'SOS alert not found'
        });
      }

      if (alert.status === 'resolved') {
        return res.status(400).json({
          success: false,
          message: 'SOS alert is already resolved'
        });
      }

      // Update alert
      alert.status = 'resolved';
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date();
      if (notes) {
        alert.notes = notes;
      }

      await alert.save();

      // Log the resolution
      await loggingService.log(
        req.user._id,
        'sos_resolved',
        alert._id,
        'sos',
        { resolvedAt: new Date(), notes },
        req
      );

      // Populate data for response
      await alert.populate('userId', 'name email role');
      await alert.populate('resolvedBy', 'name role');

      // Emit resolution event
      const io = req.app.get('io');
      if (io) {
        io.emit('sosResolved', {
          alert,
          resolvedBy: req.user
        });
      }

      res.json({
        success: true,
        message: 'SOS alert resolved successfully',
        data: { alert }
      });

    } catch (error) {
      console.error('Resolve alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve alert'
      });
    }
  }
);

// GET /my-alerts - Get user's own SOS alerts
router.get('/my-alerts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const alerts = await SOSAlert.find({ userId })
      .populate('resolvedBy', 'name role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SOSAlert.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user alerts'
    });
  }
});

module.exports = router;
