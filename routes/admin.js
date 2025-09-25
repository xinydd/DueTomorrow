const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const loggingService = require('../services/loggingService');
const simulationService = require('../services/simulationService');
const mongoose = require('mongoose');

// Apply rate limiting to all admin routes
router.use(generalLimiter);

// All admin routes require security role
router.use(authenticateToken, checkRole(['security']));

// Get all users with roles - security only
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Log the admin action
    await loggingService.log(
      req.user.userId,
      'admin_users_viewed',
      null,
      null,
      { page, limit, role },
      req
    );

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get system status - security only
router.get('/system-status', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const mongoStatus = isMongoConnected ? 'connected' : 'disconnected';
    
    // Get active socket connections count (if using Socket.IO)
    const activeSockets = req.app.get('io') ? 
      req.app.get('io').engine.clientsCount : 0;

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    // Get recent activity
    const recentLogs = await loggingService.getSystemLogs(10);

    // Log the admin action
    await loggingService.log(
      req.user.userId,
      'admin_system_status_viewed',
      null,
      null,
      { mongoStatus, activeSockets },
      req
    );

    res.json({
      success: true,
      data: {
        database: {
          status: mongoStatus,
          connected: isMongoConnected
        },
        sockets: {
          active: activeSockets
        },
        users: userStats,
        recentActivity: recentLogs
      }
    });
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system status'
    });
  }
});

// Get audit logs - security only
router.get('/audit-logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const action = req.query.action;
    const userId = req.query.userId;

    let query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await loggingService.getSystemLogs(limit);
    const filteredLogs = logs.filter(log => {
      if (action && log.action !== action) return false;
      if (userId && log.userId._id.toString() !== userId) return false;
      return true;
    });

    // Log the admin action
    await loggingService.log(
      req.user.userId,
      'admin_audit_logs_viewed',
      null,
      null,
      { page, limit, action, userId },
      req
    );

    res.json({
      success: true,
      data: {
        logs: filteredLogs,
        pagination: {
          page,
          limit,
          total: filteredLogs.length
        }
      }
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// Deactivate user - security only
router.patch('/users/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: req.user.userId,
        deactivationReason: reason
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log the admin action
    await loggingService.log(
      req.user.userId,
      'user_deactivated',
      userId,
      'user',
      { reason, deactivatedUser: user.email },
      req
    );

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    console.error('User deactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
});

// Reactivate user - security only
router.patch('/users/:userId/reactivate', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: true,
        reactivatedAt: new Date(),
        reactivatedBy: req.user.userId
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log the admin action
    await loggingService.log(
      req.user.userId,
      'user_reactivated',
      userId,
      'user',
      { reactivatedUser: user.email },
      req
    );

    res.json({
      success: true,
      message: 'User reactivated successfully',
      data: user
    });
  } catch (error) {
    console.error('User reactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate user'
    });
  }
});

// Get simulation status - security only
router.get('/simulation/status', async (req, res) => {
  try {
    const status = simulationService.getStatus();
    
    // Log the admin action
    await loggingService.log(
      req.user.userId,
      'admin_simulation_status_viewed',
      null,
      null,
      { status },
      req
    );

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Simulation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get simulation status'
    });
  }
});

// Start simulation - security only
router.post('/simulation/start', async (req, res) => {
  try {
    if (simulationService.getStatus().running) {
      return res.status(400).json({
        success: false,
        message: 'Simulation is already running'
      });
    }

    simulationService.startSimulation();
    
    // Log the admin action
    await loggingService.log(
      req.user.userId,
      'admin_simulation_started',
      null,
      null,
      { timestamp: new Date() },
      req
    );

    res.json({
      success: true,
      message: 'Simulation started successfully',
      data: simulationService.getStatus()
    });
  } catch (error) {
    console.error('Start simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start simulation'
    });
  }
});

// Stop simulation - security only
router.post('/simulation/stop', async (req, res) => {
  try {
    if (!simulationService.getStatus().running) {
      return res.status(400).json({
        success: false,
        message: 'Simulation is not running'
      });
    }

    simulationService.stopSimulation();
    
    // Log the admin action
    await loggingService.log(
      req.user.userId,
      'admin_simulation_stopped',
      null,
      null,
      { timestamp: new Date() },
      req
    );

    res.json({
      success: true,
      message: 'Simulation stopped successfully',
      data: simulationService.getStatus()
    });
  } catch (error) {
    console.error('Stop simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop simulation'
    });
  }
});

module.exports = router;
