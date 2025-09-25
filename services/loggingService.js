const Log = require('../models/Log');
const mongoose = require('mongoose');

class LoggingService {
  // Check if MongoDB is connected
  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  // Create a log entry
  async log(userId, action, targetId = null, targetType = null, metadata = {}, req = null) {
    try {
      const logData = {
        userId,
        action,
        targetId,
        targetType,
        metadata,
        timestamp: new Date()
      };

      // Add request info if available
      if (req) {
        logData.ipAddress = req.ip || req.connection.remoteAddress;
        logData.userAgent = req.get('User-Agent');
      }

      if (this.isMongoConnected()) {
        const log = new Log(logData);
        await log.save();
        return log;
      } else {
        // For demo mode, just log to console
        console.log(`📝 [LOG] ${action} by user ${userId}:`, {
          targetId,
          targetType,
          metadata,
          timestamp: logData.timestamp
        });
        return logData;
      }
    } catch (error) {
      console.error('Error creating log entry:', error);
      return null;
    }
  }

  // Get logs for a specific user
  async getUserLogs(userId, limit = 50) {
    try {
      if (this.isMongoConnected()) {
        return await Log.find({ userId })
          .sort({ timestamp: -1 })
          .limit(limit)
          .populate('userId', 'name email role');
      }
      return [];
    } catch (error) {
      console.error('Error fetching user logs:', error);
      return [];
    }
  }

  // Get logs by action
  async getLogsByAction(action, limit = 100) {
    try {
      if (this.isMongoConnected()) {
        return await Log.find({ action })
          .sort({ timestamp: -1 })
          .limit(limit)
          .populate('userId', 'name email role');
      }
      return [];
    } catch (error) {
      console.error('Error fetching logs by action:', error);
      return [];
    }
  }

  // Get system activity logs
  async getSystemLogs(limit = 200) {
    try {
      if (this.isMongoConnected()) {
        return await Log.find()
          .sort({ timestamp: -1 })
          .limit(limit)
          .populate('userId', 'name email role');
      }
      return [];
    } catch (error) {
      console.error('Error fetching system logs:', error);
      return [];
    }
  }

  // Get audit trail for a specific target
  async getAuditTrail(targetId, targetType) {
    try {
      if (this.isMongoConnected()) {
        return await Log.find({ targetId, targetType })
          .sort({ timestamp: -1 })
          .populate('userId', 'name email role');
      }
      return [];
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return [];
    }
  }
}

module.exports = new LoggingService();
