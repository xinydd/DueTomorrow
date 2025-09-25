const express = require('express');
const IncidentReport = require('../models/IncidentReport');
const User = require('../models/User');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { validateIncidentReport, validateLocation } = require('../middleware/validation');
const loggingService = require('../services/loggingService');

const router = express.Router();

// POST /report - Create incident report (students only)
router.post('/report', 
  authenticateToken, 
  checkRole(['student']), 
  validateIncidentReport, 
  validateLocation, 
  async (req, res) => {
    try {
      const { type, description, lat, lng, priority = 'medium' } = req.body;
      const userId = req.user._id;

      // Create new incident report
      const report = new IncidentReport({
        userId,
        type,
        description,
        location: { lat, lng },
        priority
      });

      await report.save();

      // Populate user data for response
      await report.populate('userId', 'name email role');

      // Log the incident report submission
      await loggingService.log(
        req.user._id,
        'report_submitted',
        report._id,
        'report',
        { type, priority, location: { lat, lng } },
        req
      );

      // Priority-based notifications
      const io = req.app.get('io');
      if (io) {
        if (priority === 'urgent') {
          // Notify Security role immediately
          const securityUsers = await User.find({
            role: 'security',
            isActive: true
          }).select('_id name email');

          securityUsers.forEach(securityUser => {
            io.to(`guardian-${securityUser._id}`).emit('urgentIncidentReport', {
              report,
              user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
              },
              priority: 'urgent'
            });
          });
        } else {
          // Notify Staff role for medium/low priority
          const staffUsers = await User.find({
            role: 'staff',
            isActive: true
          }).select('_id name email');

          staffUsers.forEach(staffUser => {
            io.to(`guardian-${staffUser._id}`).emit('newIncidentReport', {
              report,
              user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
              },
              priority
            });
          });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Incident report submitted successfully',
        data: { report }
      });

    } catch (error) {
      console.error('Incident report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit incident report'
      });
    }
  }
);

// GET /reports - Get all incident reports (staff + security)
router.get('/reports', authenticateToken, checkRole(['staff', 'security']), async (req, res) => {
  try {
    const { 
      status = 'all', 
      type = 'all', 
      priority = 'all',
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (type !== 'all') {
      query.type = type;
    }
    
    if (priority !== 'all') {
      query.priority = priority;
    }

    const reports = await IncidentReport.find(query)
      .populate('userId', 'name email role')
      .populate('handledBy', 'name role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await IncidentReport.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve incident reports'
    });
  }
});

// PATCH /reports/:id/close - Close incident report (staff + security)
router.patch('/reports/:id/close', 
  authenticateToken, 
  checkRole(['staff', 'security']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { responseNotes } = req.body;
      const handledBy = req.user._id;

      const report = await IncidentReport.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Incident report not found'
        });
      }

      if (report.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Incident report is already closed'
        });
      }

      // Update report
      report.status = 'closed';
      report.handledBy = handledBy;
      report.closedAt = new Date();
      if (responseNotes) {
        report.responseNotes = responseNotes;
      }

      await report.save();

      // Log the report closure
      await loggingService.log(
        req.user._id,
        'report_closed',
        report._id,
        'report',
        { closedAt: new Date(), responseNotes },
        req
      );

      // Populate data for response
      await report.populate('userId', 'name email role');
      await report.populate('handledBy', 'name role');

      // Emit closure event
      const io = req.app.get('io');
      if (io) {
        io.emit('incidentReportClosed', {
          report,
          handledBy: req.user
        });
      }

      res.json({
        success: true,
        message: 'Incident report closed successfully',
        data: { report }
      });

    } catch (error) {
      console.error('Close report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to close incident report'
      });
    }
  }
);

// GET /my-reports - Get user's own incident reports
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const reports = await IncidentReport.find({ userId })
      .populate('handledBy', 'name role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await IncidentReport.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user reports'
    });
  }
});

// GET /reports/:id - Get specific incident report details
router.get('/reports/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await IncidentReport.findById(id)
      .populate('userId', 'name email role')
      .populate('handledBy', 'name role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Incident report not found'
      });
    }

    // Check if user can access this report
    const canAccess = report.userId._id.toString() === userId.toString() || 
                     ['staff', 'security'].includes(req.user.role);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this incident report'
      });
    }

    res.json({
      success: true,
      data: { report }
    });

  } catch (error) {
    console.error('Get report details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report details'
    });
  }
});

// GET /stats - Get incident statistics (staff + security)
router.get('/stats', authenticateToken, checkRole(['staff', 'security']), async (req, res) => {
  try {
    const totalReports = await IncidentReport.countDocuments();
    const openReports = await IncidentReport.countDocuments({ status: 'open' });
    const closedReports = await IncidentReport.countDocuments({ status: 'closed' });

    // Reports by type
    const reportsByType = await IncidentReport.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Reports by priority
    const reportsByPriority = await IncidentReport.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent reports (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReports = await IncidentReport.countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalReports,
        openReports,
        closedReports,
        reportsByType,
        reportsByPriority,
        recentReports
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

module.exports = router;
